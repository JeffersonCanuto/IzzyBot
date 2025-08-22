import MathAgent from "./MathAgent";
import KnowledgeAgent from "./KnowledgeAgent";

import { AgentPayload, AgentResponse, AgentWorkflow } from "@src/types/agents";
import RouterAgentHelpers from "@src/utils/agents";

class RouterAgent {
    async handleMessage(payload: AgentPayload):Promise<AgentResponse> {
        const workflow:AgentWorkflow[] = [];

        // Choose Agent based on isMathQuery helper
        const isMath = RouterAgentHelpers.isMathQuery(payload.message);
        const chosenAgent = isMath ? "MathAgent" : "KnowledgeAgent";

        // Create workflow from the selected Agent
        workflow.push({ agent: "RouterAgent", decision: chosenAgent });

        // Dispatch user message to the selected Agent
        let message:string;

        if (isMath) {
            message = await MathAgent.handleMessage(payload.message);
            workflow.push({ agent: "MathAgent" });
        } else {
            message = await KnowledgeAgent.handleMessage(payload.message);
            workflow.push({ agent: "KnowledgeAgent" }); 
        }

        return {
            response: message,
            source_agent_response: message,
            agent_workflow: workflow
        }
    }
}

export default RouterAgent;