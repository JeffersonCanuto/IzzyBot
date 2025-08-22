// RouterAgent helpers
class RouterAgentHelpers {
    static isMathQuery(message: string):boolean {
        const hasDigit = /\d/.test(message);
        const hasOperator = /[+\-*/]/.test(message);
        
        return hasDigit && hasOperator;
    }
}

export default RouterAgentHelpers;