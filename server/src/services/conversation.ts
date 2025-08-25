import redisClient from './redis';

import { UserPayload, AgentResponse, AgentWorkflow } from '@src/types/agents';

async function storeUserPayload(message:string, conversation_id:string, user_id:string):Promise<void> {
    const key = `conversation:${conversation_id}:${user_id}`;
    const payload: UserPayload = {
        message,
        conversation_id,
        user_id
    };

    // Push payload to Redis list
    await redisClient.rPush(key, JSON.stringify(payload));

    // Keep only last 50 payloads (purpose: limit memory usage)
    await redisClient.lTrim(key, -50, -1);

    // Track conversation IDs per user
    await redisClient.sAdd(`user_conversations:${user_id}`, conversation_id);
}

async function storeBotPayload(
    response: string,
    source_agent_response:string,
    agent_workflow:AgentWorkflow[],
    conversation_id:string,
    user_id:string
) {
    const key = `conversation:${conversation_id}:${user_id}`;
    const payload:AgentResponse = {
        response,
        source_agent_response,
        agent_workflow
    };

    // Push payload to Redis list
    await redisClient.rPush(key, JSON.stringify(payload));

    // Keep only last 50 payloads (purpose: limit memory usage)
    await redisClient.lTrim(key, -50, -1);

    // Track conversation IDs per user
    await redisClient.sAdd(`user_conversations:${user_id}`, conversation_id);
}

async function getConversationHistory(conversation_id:string, user_id:string):Promise<(UserPayload | AgentResponse)[]> {
    const key = `conversation:${conversation_id}:${user_id}`;
    const payloads = await redisClient.lRange(key, 0, -1);
    return payloads.map(p => JSON.parse(p) as UserPayload | AgentResponse);
}

async function getAllUserConversations(user_id:string):Promise<{
    conversation_id: string;
    messages: (UserPayload | AgentResponse)[] 
}[]> {
    const conversationIds = await redisClient.sMembers(`user_conversations:${user_id}`);
    const allConversations = [];

    for (const conversationId of conversationIds) {
        const messages = await getConversationHistory(conversationId, user_id);
        allConversations.push({ conversation_id: conversationId, messages });
    }

    return allConversations;
}

export {
    storeUserPayload,
    storeBotPayload,
    getAllUserConversations
};