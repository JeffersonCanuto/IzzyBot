import MathAgent from "./MathAgent";
import KnowledgeAgent from "./KnowledgeAgent";

import { AgentPayload, AgentResponse, AgentWorkflow } from "@src/types/agents";
import RouterAgentHelpers from "@src/utils/agents";

/*
 * Agent that receives user message and decides between KnowledgeAgent or MathAgent 
 */
class RouterAgent {
    static async handleMessage(payload: AgentPayload):Promise<AgentResponse> {
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
            
            workflow.push({ agent: chosenAgent });

            console.info(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "INFO",
				agent: "RouterAgent",
				event: "handle_user_message",
				conversation_id: payload.conversation_id,
                user_id: payload.user_id,
                decision: chosenAgent,
                response: answer,
				execution_time: Date.now() - initialTime
			}));

            return {
                response: answer,
                source_agent_response: answer,
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