// RouterAgent helpers
class RouterAgentHelpers {
    static isMathQuery(message: string):boolean {
        // Normalize message to lowercase
        const lowerMessage = message.toLowerCase();

        // Check for at least one digit
        const hasDigit = /\d/.test(lowerMessage);

        // Check for common symbols or word-based operators
        const hasOperator = /[+\-*/^%()]/.test(lowerMessage) ||
            /\b(times|divided by|plus|minus|mod|power of)\b/.test(lowerMessage);
        
        return hasDigit && hasOperator;
    }
}

export default RouterAgentHelpers;