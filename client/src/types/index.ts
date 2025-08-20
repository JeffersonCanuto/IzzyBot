export interface Message {
    id: string;
    text: string;
    sender: "user" | "agent";
    agent?: "KnowledgeAgent" | "MathAgent";
    createdAt?: string;
}

export interface Conversation {
    id: string;
    messages: Message[];
    title?: string;
}