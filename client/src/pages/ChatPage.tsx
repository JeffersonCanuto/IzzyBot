import React, { 
    useState, 
    useRef,
    useCallback,
    useEffect
} from "react";

import ChatInput from "@/components/ChatInput";
import ChatWindow from "@/components/ChatWindow";
import ConversationList from "@/components/ConversationList";

import type {
    Message as MessageType,
    Conversation as ConversationType
} from "@/types";

import { sanitizeInput } from "@/utils/helpers";

import IzzyBot from "@/assets/izzybot.png";

const ChatPage:React.FC = () => {
    const [ conversations, setConversations ] = useState<ConversationType[]>([]);
    const [ activeConversationId, setActiveConversationId ] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const inputCache = useRef<Record<string, string>>({});
    const previousConversationId = useRef<string | null>(null);

    const activeConversation = conversations.find(conv => conv.id === activeConversationId);

    /*
        Save current input value for previous conversation and reset input value
        for the newly active conversation whenever 'activeConversationId' changes
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

    const handleSend = useCallback(() => {
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

        if (!activeConversationId) {
            // Create new conversation if there is no active conversation
            const newConversation:ConversationType = {
                id: crypto.randomUUID(),
                messages: [newMessage]
            };
            setConversations(prevConversations => [...prevConversations, newConversation ]);
            setActiveConversationId(newConversation.id);
        } else {
            // Add to existing conversation
            setConversations(prevConversations =>
                prevConversations.map(conv =>
                    conv.id === activeConversationId ?
                        { ...conv, messages: [...conv.messages, newMessage] }
                    :
                        conv
                )
            );
        }

        // Clear input value
        input.value = "";

        // TO-DO: Send to backend and add bot response
    }, [activeConversationId, conversations]);

    return (
        <div className="w-full flex flex-col">
            <div className="w-[865px] border rounded-md bg-gray-50 border-gray-300 max-w-4xl mx-auto mt-8 py-4 px-4 flex items-center">
                <img src={IzzyBot} width={70} height={70} alt="IzzyBot" className="ml-5"/>
                <div className="w-full flex justify-center items-center">
                    <span className="inline-block text-center text-xl font-bold opacity-80
                        bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600
                        bg-clip-text text-transparent
                        overflow-hidden whitespace-nowrap
                        animate-[typing_3s_steps(52,end)]">Welcome to IzzyBot — an easy peasy chat-squeezy bot!</span>
                </div>
            </div>
            <div className="w-full flex max-w-4xl mx-auto px-4">
                <ConversationList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    setConversations={setConversations}
                    setActiveConversationId={setActiveConversationId}
                    handleSelect={(id:string) => setActiveConversationId(id)}
                />
                <div className="flex-1 flex flex-col">
                    <ChatWindow messages={activeConversation?.messages ?? []} />
                    <ChatInput ref={inputRef} handleSend={handleSend} />
                </div>
            </div>
        </div>
    );
}

export default ChatPage;