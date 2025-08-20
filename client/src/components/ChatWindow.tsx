import React from "react";
import type { Message as MessageType } from "@/types";
import Message from "./Message";

import IzzyBot from "@/assets/izzybot.png";
import BackgroundImage from "@/assets/chat-background.jpg";

interface ChatWindowProps {
    messages: MessageType[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
    return (
        <div className="flex flex-col w-full min-w-[500px]">
            <div className="flex flex-row gap-3 items-center bg-gray-50 border border-gray-300 rounded-md py-3 px-4 sm:px-5">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 overflow-hidden flex items-center justify-center">
                    <img src={IzzyBot} alt="IzzyBot" className="w-8 h-8 sm:w-10 sm:h-10 object-cover" />
                </div>
                <div>
                    <p className="text-gray-500 font-bold text-sm sm:text-base">IzzyBot</p>
                    <p className="text-[10px] sm:text-[11px] text-green-600">Online</p>
                </div>
            </div>
            <div
                className="flex flex-col gap-2 p-3 sm:p-4 h-[35vh] md:h-[418px] overflow-y-auto border rounded-md bg-white"
                style={{
                    backgroundImage: `url(${BackgroundImage})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
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