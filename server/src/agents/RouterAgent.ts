import MathAgent from "./MathAgent";
import KnowledgeAgent from "./KnowledgeAgent";

import {
    UserPayload,
    AgentResponse,
    AgentWorkflow
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
    static async handleMessage(payload: UserPayload):Promise<AgentResponse | {}> {
        const workflow:AgentWorkflow[] = [];
        const initialTime = Date.now();

        try {
            // 1. Store initial bot message
            if (payload.initialBotMessage) {
                await storeBotPayload(
                    payload.message,
                    payload.message,
                    [],
                    payload.conversation_id,
                    payload.user_id
                );
                return {};
            }

            // 2. Store user payload in Redis
            await storeUserPayload(payload.message, payload.conversation_id, payload.user_id);

            // 3. Decide which Agent to use based on isMathQuery helper
            const isMath = RouterAgentHelpers.isMathQuery(payload.message);
            const chosenAgent = isMath ? "MathAgent" : "KnowledgeAgent";

            // 4. Record RouterAgent's decision in workflow
            workflow.push({ agent: "RouterAgent", decision: chosenAgent });

            // 5. Call the chosen Agent with user message and retrieve answer
            const answer = isMath ?
                await MathAgent.handleMessage(payload.message)
            : 
                await KnowledgeAgent.handleMessage(payload.message);
            
            // 6. Add personality to the LLM answer depending on the chosen Agent
            let messageWithPersonality:string;
            if (isMath) {
                messageWithPersonality =
                    Number(answer) || answer === "0." ? 
                        `A resposta é: ${answer} Fácil! 😎`
                    :
                        `${answer} Me perdoe! 😔`;
            } else {
                const errors = [
                    "Não consegui encontrar uma resposta nos artigos da Central de Ajuda da InfinitePay.",
                    "Ops! Algo deu errado ao processar sua solicitação."
                ];

                messageWithPersonality =
                    !(errors.includes(answer)) ?
                        `Aqui está o que encontrei nos artigos da Central de Ajuda da InfinitePay: ${answer} Espero ter sido útil! 😊`
                    :
                        `${answer} Me perdoe! 😔`;
            }

            // 7. Record the Agent that processed the message in workflow
            workflow.push({ agent: chosenAgent });

            // 8. Store bot payload in Redis
            await storeBotPayload(
                messageWithPersonality,
                answer,
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
                source_agent_response: answer,
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
                response: "Ops! Algo deu errado ao processar sua solicitação. Tente novamente",
                source_agent_response: "",
                agent_workflow: workflow
            }
        }
    }
}

export default RouterAgent;