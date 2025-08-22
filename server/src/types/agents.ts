/* 
 * Typing structure for chatbot Agents
 */

export interface AgentPayload {
    message: string;
    user_id: string;
    conversation_id: string;
}

export interface AgentWorkflow {
    agent: string;
    decision?: string;
}

export interface AgentResponse {
    response: string;
    source_agent_response: string;
    agent_workflow: AgentWorkflow[];
}