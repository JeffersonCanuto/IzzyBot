import OpenAI from "openai";

import ENV from '@src/configs/ENV';

const client = new OpenAI({
    apiKey: ENV.OpenAiApiKey
});

/*
 * LLM Agent used to interpret and answer simple mathematical expressions
 */
class MathAgent {
    static async handleMessage(message:string):Promise<string>  {
        const initialTime = Date.now();
        
        try {
            // Build prompt message that is gonna be served to the LLM (OpenAI)
            const prompt = `
                You are a calculator.
                The user will provide a mathematical expression.
                Your task is to calculate it and return ONLY the result as a short text message.
                Do not include explanations or extra unnecessary text, other than it was required above.

                User message: ${message}
            `;

            // Serve prompt including user message to OpenAPI
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0   // Set a deterministic answer
            });

            // Extract OpenAI LLM response text
            const answer:(string | undefined) = response.choices[0]?.message?.content?.trim(); 

            if (!answer) return "I couldn't compute the mathematical expression";

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
            
            return "I couldn't compute the mathematical expression";
        }
    }
}

export default MathAgent;