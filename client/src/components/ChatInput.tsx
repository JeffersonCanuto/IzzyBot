import { forwardRef } from "react";
import { IoSend } from "react-icons/io5";

interface ChatInputProps {
    handleSend: () => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({ handleSend }, ref) => {
    return (
        <div className="flex gap-2 mt-2">
            <input
                ref={ref}
                type="text"
                className="flex-1 font-sans border rounded-md p-2 outline-none focus:border-gray-400"
                placeholder="Type your message..."
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault();

                        handleSend();
                    }
                }}
                autoFocus
            />
            <button
                className="bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-600 hover:scale-105 transition-all duration-200"
                onClick={handleSend}
            >
                <IoSend />
            </button>
        </div>
    );
})

export default ChatInput;