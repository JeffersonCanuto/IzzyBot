import React from "react";
import type { Message as MessageType } from "@/types";

interface MessageProps {
    message: MessageType;
}

const Message:React.FC<MessageProps> = ({ message }) => {
    const isUser = message.sender === "user";
    
    return (
        <div
            className={`p-2 rounded-md max-w-[80%] ${isUser ? "bg-blue-500 text-white self-end" : "bg-gray-200 self-start"}`}
        >
            {!isUser && (
                <div className="text-xs text-gray-500 mb-1">{message.agent}</div>
            )}
            {message.text}
        </div>
    );
}

export default Message;