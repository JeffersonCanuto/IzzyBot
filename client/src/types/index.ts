export interface Message {
    id: string;
    text: string;
    sender: "user" | "agent";
    agent?: "KnowledgeAgent" | "MathAgent";
    timestamp?: string;
}

export interface Conversation {
    id: string;
    messages: Message[];
}