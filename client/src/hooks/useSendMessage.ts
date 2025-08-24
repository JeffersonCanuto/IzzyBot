import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
    Message as MessageType,
    Conversation as ConversationType
} from "@/types";

interface SendMessagePayload {
    message: MessageType;
    userId: string;
    conversationId: string | null;
}

async function sendMessageToServer(payload: SendMessagePayload):Promise<MessageType> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Failed to send message to the server: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation<MessageType, Error, SendMessagePayload>({
        mutationFn: sendMessageToServer,
        onSuccess: (newMessage:MessageType, variables:SendMessagePayload) => {
            queryClient.setQueryData<ConversationType | undefined>(
                ["conversations", variables.conversationId],
                (oldConversation:ConversationType | undefined) => {
                    if (!oldConversation) return oldConversation;

                    return {
                        ...oldConversation,
                        messages: [...oldConversation.messages, newMessage]
                    }
                }
            );
        },
        onError: (error:Error) => {
            console.error("Error sending message: ", error.message);
        }
    });
}