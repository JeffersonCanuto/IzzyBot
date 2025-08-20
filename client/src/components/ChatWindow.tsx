import React from "react";
import type { Message as MessageType } from "@/types";
import Message from "./Message";

import BackgroundImage from "@/assets/chat-background.jpg";

interface ChatWindowProps {
    messages: MessageType[];
}

const ChatWindow:React.FC<ChatWindowProps> = ({ messages }) => {
    return (
        <div
            className="flex flex-col gap-2 p-4 h-[500px] overflow-y-auto border rounded-md bg-white"
            style={{
                backgroundImage: `url(${BackgroundImage})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            }}
        >
            {messages.map(msg => (
                <Message key={msg.id} message={msg} />
            ))}
        </div>
    );
}

export default ChatWindow;