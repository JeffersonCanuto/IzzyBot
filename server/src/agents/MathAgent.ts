import OpenAI from "openai";

import ENV from '@src/configs/ENV';

const client = new OpenAI({
    apiKey: ENV.OpenAiApiKey
});

/*
 * LLM Agent used to interpret and answer simple mathematical expressions
 */
class MathAgent {
    static async handleMessage(message:string):Promise<string> {
        const initialTime = Date.now();
        
        try {
            // Build prompt message that is gonna be served to the LLM (OpenAI)
            const prompt = `
                Você é uma calculadora.
                O usuário irá te fornecer uma equação matemática.
                Sua tarefa é realizar o cálculo e retornar apenas o resultado como uma mensagem
                de texto curta e com um ponto final, por exemplo: Quanto é 8 + 8? Você deve responser "16.".
                A expressão matemática pode conter operadores baseados em palavras (mais, menos, etc), e não só operadores literais.
                Não inclua explicações ou texto extra desnecessário. Somente o que foi requisitado acima.
                Para todo e qualquer erro de cálculo, incluindo divisão por 0, números desconhecidos, números que tendem a infinito,
                números indefinidos, etc, retorne exatamente: "Não consegui resolver a expressão matemática!".
                Para outros tipos de erro não relacionados a cálculo, como mencionado acima, retorne exatamente: "Expressão matemática inválida!".

                Mensagem do usuário: ${message}
            `;

            // Serve prompt including user message to OpenAPI
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0   // Set a deterministic answer
            });

            // Extract OpenAI LLM response text
            const answer:(string | undefined) = response.choices[0]?.message?.content?.toString().trim(); 

            if (!answer) return "Ops... Algo deu errado ao processar sua solicitação!";

            console.info(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "INFO",
				agent: "MathAgent",
				event: "handle_user_message",
				response: answer,
				execution_time: Date.now() - initialTime
			}));

            return answer;
        } catch(error:any) {
            console.error(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "ERROR",
				agent: "MathAgent",
				event: "handle_user_message",
				message: "Error handling incoming user message",
				error: error?.message ?? error,
				execution_time: Date.now() - initialTime
			}));

            return "Ops... Algo deu errado ao processar sua solicitação!";
        }
    }
}

export default MathAgent;