import type { Answer as AnswerType, SendMessagePayload } from "@/types";

class ApiRequests {
    static readonly host = import.meta.env.VITE_API_URL;
    static readonly port = import.meta.env.VITE_API_PORT;

    static async sendMessageToServer(payload: SendMessagePayload):Promise<AnswerType> {
        const response = await fetch(`http://${this.host}:${this.port}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to send message to the server: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}

export default ApiRequests;