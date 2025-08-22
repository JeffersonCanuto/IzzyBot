import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class MathAgent {
    static async handleMessage(message:string):Promise<string>  {
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

            if (!answer) return "❌ Could not compute the mathematical expression.";

            return answer;
        } catch(error:any) {
            console.error("MathAgent error: ", error);
            return "❌ Could not compute the mathematical expression.";
        }
    }
}

export default MathAgent;