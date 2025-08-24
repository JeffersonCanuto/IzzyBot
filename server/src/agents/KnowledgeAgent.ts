import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { Document } from "@langchain/core/documents";
import { formatDocumentsAsString } from "langchain/util/document";

import ENV from '@src/configs/ENV';
import { HandleMessageResponse } from "@src/types/agents";

type SourceItem = { source ?: string; url?: string; title?: string }

/*
 * LLM Agent that uses RAG to provide answers based on InfinitePay's help center content
 */
class KnowledgeAgent {
	static vectorStore:(HNSWLib | null) = null;
	static retrieverInitialized:boolean = false;

	// Load the retriever to get the six most relevant document chunks
	static async getRetriever() {
		if (!this.retrieverInitialized) {
			const INDEX_DIR = ENV.InfinitePayIndexDir.trim() ?? "data/infinitepay_index";

			this.vectorStore = await HNSWLib.load(INDEX_DIR, new OpenAIEmbeddings({ apiKey: ENV.OpenAiApiKey }));
			this.retrieverInitialized = true;
		}

		return this.vectorStore!.asRetriever(6);
	}

	// Build the prompt message that is gonna be served to the LLM (OpenAI)
	static buildPrompt(context:string, question:string):string {
		return `
			Você é um assistente de suporte da InfinitePay.
			Responda de forma curta, direta e com base exclusivamente no CONTEXTO fornecido.
			Se não encontrar informação ou se o CONTEXTO fornecido for insuficiente, responda SEMPRE
			SOMENTE com a seguinte sentença: I couldn't find an answer in InfinitePay's Help Center articles
			É importante destacar que todas as respostas sempre devem ser fornecidas em en-US, nunca em pt-BR.

			### CONTEXTO: ${context}
			### PERGUNTA: ${question}
			### RESPOSTA (em en-US):
		`;
	}

	// Extract source info from retrieved docs for logging purposes
	static extractSources(docs: Document[]):SourceItem[] {
		return docs.map(doc => {
			const meta = (doc.metadata ?? {}) as Record<string, any>;

			return {
				source: meta.source ?? meta.path ?? undefined,
				url: meta.url ?? meta.source ?? undefined,
				title: meta.title ?? meta.heading ?? undefined
			}
		});
	}

	// Handle incoming user message based on RAG content 
	static async handleMessage(question:string):Promise<HandleMessageResponse> {
		const initialTime = Date.now();

		try {
			const retriever = await this.getRetriever();

			// Retrieve relevant document chunks
			const docs = await retriever.invoke(question);
			const context = formatDocumentsAsString(docs);

			// Set OpenAI LLM
			const response = new ChatOpenAI({
				modelName: "gpt-4o-mini",
				temperature: 0,
				apiKey: ENV.OpenAiApiKey
			});

			// Build prompt, ask the model and collect answer
			const finalPrompt = this.buildPrompt(context, question).trim();
			const llmResponse = await response.invoke(finalPrompt);
			const answer =
				(llmResponse?.content as string)?.trim() ||
				"I couldn't find an answer in InfinitePay's Help Center articles";
			
			console.info(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "INFO",
				agent: "KnowledgeAgent",
				event: "handle_user_message",
				response: answer,
				execution_time: Date.now() - initialTime
			}));

			return {
				message: answer,
				success: answer !== "I couldn't find an answer in InfinitePay's Help Center articles" ? true : false
			}
		} catch(error:any) {
			console.error(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "ERROR",
				agent: "KnowledgeAgent",
				event: "handle_user_message",
				message: "Error handling incoming user message",
				error: error?.message ?? error,
				execution_time: Date.now() - initialTime
			}));

			return {
				message: "I couldn't find an answer in InfinitePay's Help Center articles",
				success: false
			}
		}
	}
}

export default KnowledgeAgent;