import React from "react";
import type { Message as MessageType } from "@/types";
import Message from "./Message";

import IzzyBot from "@/assets/izzybot.png";
import BackgroundImage from "@/assets/chat-background.jpg";

interface ChatWindowProps {
    messages: MessageType[];
}

const ChatWindow:React.FC<ChatWindowProps> = ({ messages }) => {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-5 items-center bg-gray-50 border border-gray-300 rounded-md py-4 px-5">
                <div className="w-14 h-14 rounded-full border-2 overflow-hidden flex items-center justify-center">
                    <img src={IzzyBot} alt="IzzyBot" className="w-10 h-10 object-cover" />
                </div>
                <div>
                    <p className="text-gray-500 font-bold">IzzyBot</p>
                    <p className="text-[11px] text-gray-600">Online | 23:59</p>
                </div>
            </div>
            <div
                className="flex flex-col gap-2 p-4 h-[410px] overflow-y-auto border rounded-md bg-white"
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
        </div>
    );
}

export default ChatWindow;