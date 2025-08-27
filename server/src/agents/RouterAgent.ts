import MathAgent from "./MathAgent";
import KnowledgeAgent from "./KnowledgeAgent";

import {
    UserPayload,
    AgentResponse,
    AgentWorkflow,
    HandleMessageResponse
} from "@src/types/agents";
import RouterAgentHelpers from "@src/utils/agents";

import {
    storeUserPayload,
    storeBotPayload
} from "@src/services/conversation";

/*
 * Agent that receives user message and decides between KnowledgeAgent or MathAgent 
 */
class RouterAgent {
    static async handleMessage(payload: UserPayload):Promise<AgentResponse | undefined> {
        const workflow:AgentWorkflow[] = [];
        const initialTime = Date.now();

        try {
            if (payload.initialBotMessage) {
                await storeBotPayload(
                    payload.message,
                    payload.message,
                    [],
                    payload.conversation_id,
                    payload.user_id
                );
                return;
            }

            // 1. Store user payload in Redis
            await storeUserPayload(payload.message, payload.conversation_id, payload.user_id);

            // 2. Decide which Agent to use based on isMathQuery helper
            const isMath = RouterAgentHelpers.isMathQuery(payload.message);
            const chosenAgent = isMath ? "MathAgent" : "KnowledgeAgent";

            // 3. Record RouterAgent's decision in workflow
            workflow.push({ agent: "RouterAgent", decision: chosenAgent });

            // 4. Call the chosen Agent with user message and retrieve answer
            const answer = isMath ?
                await MathAgent.handleMessage(payload.message)
            : 
                await KnowledgeAgent.handleMessage(payload.message);
            
            let { message, success } = answer as HandleMessageResponse;

            // 5. Add personality to the LLM answer depending on the chosen Agent
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

            // 6. Record the Agent that processed the message in workflow
            workflow.push({ agent: chosenAgent });

            // 7. Store bot payload in Redis
            await storeBotPayload(
                messageWithPersonality,
                message,
                workflow,
                payload.conversation_id,
                payload.user_id
            );

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
            workflow.push({ agent: workflow[workflow.length - 1]?.agent || "Unknown", error: error.message ?? error });

            console.error(JSON.stringify({
				utc_timestamp: new Date().toISOString(),
				level: "ERROR",
				agent: "RouterAgent",
				event: "handle_user_message",
                conversation_id: payload.conversation_id,
                user_id: payload.user_id,
				message: "Error on handling incoming user message",
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