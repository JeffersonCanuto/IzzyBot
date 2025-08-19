import React, { 
    useState, 
    useRef,
    useCallback
} from "react";

import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import type { Message as MessageType } from "@/types";

import { sanitizeInput } from "@/utils/helpers";

const ChatPage:React.FC = () => {
    const [ messages, setMessages ] = useState<MessageType[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = useCallback(() => {
        // Get input element from refs
        const input = inputRef.current;
        if (!input) return;

        // Get sanitized input value via DOMPurify and trim it
        const text = sanitizeInput(input.value).trim();
        if (!text) return;
        
        // Add new user message
        setMessages(prevMessages => [
            ...prevMessages,
            {
                id: crypto.randomUUID(),
                text,
                sender: "user"
            }
        ]);

        // Clear input value
        input.value = "";

        // TO-DO: Send to backend and add bot response
    }, []);

    return (
        <div className="max-w-md mx-auto mt-10 flex flex-col">
            <ChatWindow messages={messages} />
            <ChatInput ref={inputRef} handleSend={handleSend} />
        </div>
    );
}

export default ChatPage;