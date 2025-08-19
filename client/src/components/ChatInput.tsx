import { forwardRef } from "react";

interface ChatInputProps {
    handleSend: () => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({ handleSend }, ref) => {
    return (
        <div className="flex gap-2 mt-2">
            <input
                ref={ref}
                type="text"
                className="flex-1 border rounded-md p-2"
                placeholder="Type your message..."
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault();

                        handleSend();
                    }
                }}
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleSend}
            >
                Send
            </button>
        </div>
    );
})

export default ChatInput;