import React from "react";
import type { Message as MessageType } from "@/types";

interface MessageProps {
    message: MessageType;
}

const Message:React.FC<MessageProps> = ({ message }) => {
    const isUser = message.sender === "user";

    return (
        <div
            className={`relative font-sans p-2 rounded-md max-w-[70%] break-all ${
                isUser ?
                    "self-end user-bubble"
                :
                    "self-start agent-bubble"
            }`}
        >
            {!isUser && (
                <div className="text-xs text-gray-500 mb-1">{message.agent}</div>
            )}
            <div className="inline-flex flex-wrap justify-end items-end gap-3">
                <span
                    dangerouslySetInnerHTML={{
                        __html: message.text
                    }}
                />
                <span className="text-[10px] text-gray-600 mr-1">{message.createdAt}</span>
            </div>
        </div>
    );
}

export default Message;