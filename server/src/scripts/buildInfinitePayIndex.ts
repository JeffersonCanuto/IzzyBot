import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/dist/document";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import fs from "fs";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import ENV from "@src/configs/ENV";

async function crawlInfinitePayHelpCenterLinks(startUrls:string[], maxPages:number):Promise<string[]> {
    const visited = new Set<string>();
    const queue = [ ...startUrls ];
    const result = [];

    while (queue.length > 0) {
        const url = queue.shift()!;

        if (visited.has(url)) continue;
        visited.add(url);

        if (result.length >= maxPages) break;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(JSON.stringify({
                    utc_timestamp: new Date().toISOString(),
                    level: "ERROR",
                    module: "buildInfinitePayIndex",
                    event: "crawl_links",
                    url,
                    status: response.status,
                    message: "Unsuccessful response from URL"
                }));
                continue;
            }

            const html = await response.text();
            result.push(url);

            // Parse links
            const dom = new JSDOM(html);
            const links = Array.from(dom.window.document.querySelectorAll("a"))
                .map((a:any) => new URL(a.href, url).toString())
                .filter((href:any) => href && href.includes("/pt-BR/") && !visited.has(href));

            queue.push(...links);

            // Wait 300ms before next request
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch(error:any) {
            console.error(JSON.stringify({
                utc_timestamp: new Date().toISOString(),
                level: "ERROR",
                module: "buildInfinitePayIndex",
                event: "crawl_links",
                message: "InfinitePay help center crawl failed",
                error: error?.message ?? error
            }));
        }
    }

    return result;
}

(async function main() {
    try {
        // 1. Validate OpenAI API Key
        if (!ENV.OpenAiApiKey) {
            console.error(JSON.stringify({
                utc_timestamp: new Date().toISOString(),
                level: "ERROR",
                module: "buildInfinitePayIndex",
                event: "index_build",
                message: "OpenAI API key is missing"
            }));
            process.exit(1);
        }

        // 2. Crawl URLs starting from InfinitePay Help center homepage 
        const startUrls = ["https://ajuda.infinitepay.io/pt-BR/"];
        const crawledUrls = await crawlInfinitePayHelpCenterLinks(startUrls, 50);
        const urlsToLoad = [
            ...crawledUrls,
            "https://www.infinitepay.io/maquininha",
            "https://www.infinitepay.io/tap",
            "https://app.infinitepay.io/"
        ];

        if (!urlsToLoad.length) {
            console.error(JSON.stringify({
                utc_timestamp: new Date().toISOString(),
                level: "ERROR",
                module: "buildInfinitePayIndex",
                event: "index_build",
                message: "No URLs found to crawl"
            }));
            process.exit(1);
        }

        // 3. Load pages with CheerioWebBaseLoader
        const rawDocs:Document[] = [];
        const batchSize = 5;

        for(let index = 0; index < urlsToLoad.length; index += batchSize) {
            const batchUrls = urlsToLoad.slice(index, index + batchSize);
            const loaders = batchUrls.map(url => new CheerioWebBaseLoader(url));
            const rawDocsArray = await Promise.all(loaders.map(loader => loader.load()));

            rawDocs.push(...rawDocsArray.flat());
        }

        if (!rawDocs.length) {
            console.error(JSON.stringify({
                utc_timestamp: new Date().toISOString(),
                level: "ERROR",
                module: "buildInfinitePayIndex",
                event: "index_build",
                message: "No documents loaded from URLs"
            }));
            process.exit(1);
        }

        // 4. Split documents into chunks
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
        const docs = await splitter.splitDocuments(rawDocs);

        // 5. Generate embeddings and build vector store
        const embeddings = new OpenAIEmbeddings({ apiKey: ENV.OpenAiApiKey });
        const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);

        // 6. Ensure the index folder exists
        const INDEX_DIR = ENV.InfinitePayIndexDir.trim() ?? "data/infinitepay_index";
        fs.mkdirSync(INDEX_DIR, { recursive: true });
        
        // 7. Save vector store to disk
        await vectorStore.save(INDEX_DIR);

        console.info(JSON.stringify({
            utc_timestamp: new Date().toISOString(),
            level: "INFO",
            module: "buildInfinitePayIndex",
            event: "index_build",
            indexDir: INDEX_DIR,
            totalChunks: docs.length,
            totalUrls: urlsToLoad.length
        }));
    } catch(error:any) {
        console.error(JSON.stringify({
            utc_timestamp: new Date().toISOString(),
            level: "ERROR",
            module: "buildInfinitePayIndex",
            event: "index_build",
            message: "Index build failed",
            error: error?.message ?? error
        }));
        process.exit(1);
    }
})();