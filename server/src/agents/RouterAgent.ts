import MathAgent from "./MathAgent";
import KnowledgeAgent from "./KnowledgeAgent";

import {
    UserPayload,
    AgentResponse,
    AgentWorkflow,
    HandleMessageResponse
} from "@src/types/agents";
import RouterAgentHelpers from "@src/utils/agents";

/*
 * Agent that receives user message and decides between KnowledgeAgent or MathAgent 
 */
class RouterAgent {
    static async handleMessage(payload: UserPayload):Promise<AgentResponse> {
        const workflow:AgentWorkflow[] = [];

        // Choose Agent based on isMathQuery helper
        const isMath = RouterAgentHelpers.isMathQuery(payload.message);
        const chosenAgent = isMath ? "MathAgent" : "KnowledgeAgent";

        // Create workflow from the selected Agent
        workflow.push({ agent: "RouterAgent", decision: chosenAgent });
        
        const initialTime = Date.now();

        try {
            // Dispatch user message to the selected Agent and retrieve answer
            const answer = isMath ?
                await MathAgent.handleMessage(payload.message)
            : 
                await KnowledgeAgent.handleMessage(payload.message);
            
            // Add personality to the LLM answer depending on the target Agent
            let { message, success } = answer as HandleMessageResponse;
            let messageWithPersonality:string;

            if (isMath) {
                messageWithPersonality =
                    success ? 
                        `The answer is: ${message}. Easy peasy! 😎`
                    :
                        `Well, ${message}. I'm sorry! 😔`;
            } else {
                messageWithPersonality =
                    success ?
                        `Here's what I found in InfinitePay's Help Center articles: ${message} I hope this information can clear things up for you! 😊`
                    :
                        `Well, ${message}. I'm sorry! 😔`;
            }

            // Increment existing workflow based on chosenAgent
            workflow.push({ agent: chosenAgent });

            console.info(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "INFO",
				agent: "RouterAgent",
				event: "handle_user_message",
				conversation_id: payload.conversation_id,
                user_id: payload.user_id,
                decision: chosenAgent,
                response: messageWithPersonality,
				execution_time: Date.now() - initialTime
			}));

            return {
                response: messageWithPersonality,
                source_agent_response: message,
                agent_workflow: workflow
            }
        } catch(error:any) {
            workflow.push({ agent: chosenAgent, error: error.message ?? error });

            console.error(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "ERROR",
				agent: "RouterAgent",
				event: "handle_user_message",
                conversation_id: payload.conversation_id,
                user_id: payload.user_id,
				message: "Error handling incoming user message",
				error: error?.message ?? error,
				execution_time: Date.now() - initialTime
			}));

            return {
                response: "Sorry, something went wrong while processing your request",
                source_agent_response: "",
                agent_workflow: workflow
            }
        }
    }
}

export default RouterAgent;