export interface Conversation {
    id: string;
    messages: Message[];
    title?: string;
}

export interface Message {
    id: string;
    text: string;
    sender: "user" | "agent";
    agent?: "KnowledgeAgent" | "MathAgent";
    createdAt?: string;
}

export interface Answer {
    response: string;
    source_agent_response: string;
    agent_workflow: {agent: string; decision:string;}[]
}

export interface SendMessagePayload {
    message: string;
    user_id: string;
    conversation_id: string | null;
    initialBotMessage?: boolean;
}