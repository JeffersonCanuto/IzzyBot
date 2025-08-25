import type {
    Answer as AnswerType,
    SendMessagePayload
} from "@/types";

interface ConversationMessage {
    message?: string;
    response?: string;
    source_agent_response?: string;
    agent_workflow?: any[];
}

interface ConversationsResponse {
    id: string;
    conversations: {
        conversation_id: string;
        messages:ConversationMessage[]
    }[];
}

class ApiRequests {
    static readonly host = import.meta.env.VITE_API_URL;
    static readonly port = import.meta.env.VITE_API_PORT;

    static async sendMessageToServer(payload: SendMessagePayload):Promise<AnswerType | null> {
        try {
            const response = await fetch(`http://${this.host}:${this.port}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to send message to the server: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data as AnswerType;
        } catch(error:any) {
            console.error("Failed to send message to server: ", error);
            return null;
        }
    }

    static async fetchConversations(userId:string):Promise<ConversationsResponse | null> {
        try {
            const response = await fetch(`http://${this.host}:${this.port}/chat/conversations?user_id=${userId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data as ConversationsResponse;
        } catch(error:any) {
            console.error("Failed to fetch conversations: ", error);
            return null;
        }
    }
}

export default ApiRequests;