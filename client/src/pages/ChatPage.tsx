
import React, { 
    useState, 
    useRef,
    useCallback,
    useEffect
} from "react";

import ChatInput from "@/components/ChatInput";
import ChatWindow from "@/components/ChatWindow";
import ConversationList from "@/components/ConversationList";

import ApiRequests from "@/services/ApiRequests";

import type {
    Message as MessageType,
    Conversation as ConversationType
} from "@/types";

import { sanitizeInput, getOrCreateUserId } from "@/utils/helpers";

import IzzyBot from "@/assets/izzybot.png";

const ChatPage:React.FC = () => {
    const [ conversations, setConversations ] = useState<ConversationType[]>([
        {
            id: crypto.randomUUID(),
            messages: [{
                id: crypto.randomUUID(),
                text: "Hey, I'm IzzyBot. How can I help you? 😊",
                sender: "agent",
                createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            }]
        }
    ]);

    const [ activeConversationId, setActiveConversationId ] = useState<string | null>(conversations[0]?.id);
    const [ isLoadingAnswer, setIsLoadingAnswer ] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const inputCache = useRef<Record<string, string>>({});
    const previousConversationId = useRef<string | null>(null);

    const activeConversation = conversations.find(conv => conv.id === activeConversationId);

    /*
     * Save current input value for previous conversation and reset input value
     * for the newly active conversation whenever 'activeConversationId' changes 
     */
    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        if (previousConversationId.current && previousConversationId.current !== activeConversationId) {
            inputCache.current[previousConversationId.current] = input.value;
        }

        if (activeConversationId) {
            input.value = inputCache.current[activeConversationId] ?? "";
        } else {
            input.value = "";
        }

        previousConversationId.current = activeConversationId;
    }, [activeConversationId]);

    const handleSend = useCallback(async() => {
        // Get input element from refs
        const input = inputRef.current;
        if (!input) return;

        // Get sanitized input value via DOMPurify and trim it
        const text = sanitizeInput(input.value).trim();
        if (!text) return;

        // Add new user message
        const newMessage:MessageType = {
            id: crypto.randomUUID(),
            text,
            sender: "user",
            createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        };

        // Update loading answer state
        setIsLoadingAnswer(true);

        let conversationId = activeConversationId;
        if (!activeConversationId) {
            // Create new conversation if there is no active conversation
            const newConversation:ConversationType = {
                id: crypto.randomUUID(),
                messages: [newMessage]
            };
            setConversations(prevConversations => [...prevConversations, newConversation ]);
            setActiveConversationId(newConversation.id);
            conversationId = newConversation.id;
        } else {
            // Add to existing conversation
            setConversations(prevConversations => {
                const updated = prevConversations.map(conv =>
                    conv.id === activeConversationId ?
                        { ...conv, messages: [...conv.messages, newMessage] }
                    :
                        conv
                );

                return updated;
            });
        }

        // Clear input value
        input.value = "";

        // Add loading answer message
        const thinkingMessage: MessageType = {
            id: crypto.randomUUID(),
            text: "Thinking... 🤔",
            sender: "agent",
            createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        };

        setConversations(prev =>
            prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, messages: [...conv.messages, thinkingMessage] }
                    : conv
            )
        );

        try {
            // Send user message to the server and await response
            const answer = await ApiRequests.sendMessageToServer({
                message: newMessage.text,
                user_id: getOrCreateUserId(),
                conversation_id: activeConversationId ?? conversationId
            });

            // Create bot message from the received API response
            const botMessage:MessageType = {
                id: crypto.randomUUID(),
                text: answer.response,
                sender: "agent",
                createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            };

            // Remove thinking message and append bot message
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId
                        ? {
                            ...conv,
                            messages: [
                                ...conv.messages.filter(m => m.id !== thinkingMessage.id),
                                botMessage
                            ]
                        }
                        : conv
                )
            );
        } catch(error:any) {
            console.error("Failed to send message: ", error);

            const errorMessage:MessageType = {
                id: crypto.randomUUID(),
                text: "Oops! Message was not sent. Please try again.",
                sender: "agent",
                createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            };
            
            // Remove thinking message and append bot message
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId
                        ? {
                            ...conv,
                            messages: [
                                ...conv.messages.filter(m => m.id !== thinkingMessage.id),
                                errorMessage
                            ]
                        }
                        : conv
                )
            );
        } finally {
            setIsLoadingAnswer(false);
        }
    }, [activeConversationId]);

    return (
        <div className="w-full flex flex-col">
            <div className="md:w-[865px] w-full max-w-4xl min-w-[500px] lg:mx-auto md:mx-auto ml-2 border rounded-md bg-gray-50 border-gray-300 mt-8 py-4 px-4 flex md:flex-row flex-col items-center gap-4 x">
                <img src={IzzyBot} width={50} height={50} alt="IzzyBot" className="sm:ml-5 w-12 h-12 sm:w-[70px] sm:h-[70px]" />
                <div className="w-full flex justify-center items-center">
                    <span className="block text-center sm:text-lg md:text-xl font-bold opacity-80
                        bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600
                        bg-clip-text text-transparent
                        overflow-hidden whitespace-nowrap
                        animate-[typing_3s_steps(52,end)]">
                        Hi, there. Welcome to IzzyBot!
                    </span>
                </div>
            </div>
            <div className="md:w-[900px] w-full flex flex-col md:flex-row mx-auto px-2 md:px-4 mt-4 gap-3 md:gap-4">
                <ConversationList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    setConversations={setConversations}
                    setActiveConversationId={setActiveConversationId}
                    handleSelect={(id:string) => setActiveConversationId(id)}
                />
                <div className="flex-1 flex flex-col">
                    <ChatWindow messages={activeConversation?.messages ?? []} />
                    <ChatInput ref={inputRef} isLoadingAnswer={isLoadingAnswer} handleSend={handleSend} />
                </div>
            </div>
        </div>
    );
}

export default ChatPage;