import { forwardRef } from "react";
import { IoSend } from "react-icons/io5";

interface ChatInputProps {
    isLoadingAnswer: boolean;
    handleSend: () => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({ isLoadingAnswer, handleSend }, ref) => {
    return (
        <div className="flex gap-2 mt-2 w-full min-w-[500px]">
            <input
                ref={ref}
                type="text"
                className="flex-1 font-sans border rounded-md p-2 outline-none focus:border-gray-400 w-full"
                placeholder="Escreva sua mensagem..."
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                autoFocus
                disabled={isLoadingAnswer ? true : false}
            />
            <button
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 hover:scale-105 transition-all duration-200 w-auto"
                onClick={handleSend}
            >
                <IoSend />
            </button>
        </div>
    );
})

export default ChatInput;