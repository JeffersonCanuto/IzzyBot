import type { Answer as AnswerType, SendMessagePayload } from "@/types";

const host = import.meta.env.VITE_API_URL;
const port = import.meta.env.VITE_API_PORT;

async function sendMessageToServer(payload: SendMessagePayload):Promise<AnswerType> {
    const response = await fetch(`http://${host}:${port}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Failed to send message to the server: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export default sendMessageToServer;