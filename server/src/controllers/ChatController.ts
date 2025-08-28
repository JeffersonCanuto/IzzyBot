import RouterAgent from "@src/agents/RouterAgent";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";

import { IReq, IRes } from "@src/types";
import { UserPayload } from "@src/types/agents";

import {
	getAllUserConversations,
	deleteUserConversation,
	storeConversationLabel,
	retrieveConversationLabels
} from "@src/services/conversation";

/**
 * Receives client payload and forwards it to RouterAgent
 */
class ChatController {
	static async createPayload(req:IReq, res:IRes) {
		try {
			const payload = req.body as unknown as UserPayload;

			if (!payload.message || !payload.user_id || !payload.conversation_id) {
				return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Invalid request payload" });
			}

			const response = await RouterAgent.handleMessage(payload);
			return res.status(HttpStatusCodes.OK).json(response);
		} catch(error:any) {
			console.error("ChatController error: ", error);
			return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
		}
	}
	static async getConversations(req:IReq, res:IRes) {
		try {
			const { user_id } = req.query;
			
			if (!user_id) {
				return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "user_id is required" });
			}

			const conversations = await getAllUserConversations(user_id.toString());
			return res.status(HttpStatusCodes.OK).json({ conversations });
		} catch(error:any) {
			console.error("Error fetching user conversations: ", error);
			return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
		}
	}
	static async deleteConversation(req:IReq, res:IRes) {
		try {
			const { conversation_id, user_id } = req.body;

			if (!conversation_id || !user_id) {
				return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "conversation_id and user_id are required" });
			}

			await deleteUserConversation(user_id.toString(), conversation_id.toString());
			return res.status(HttpStatusCodes.NO_CONTENT).end();
		} catch(error:any) {
			console.error("Error deleting conversation: ", error);
			return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error"});
		}
	}
	static async saveConversationLabel(req:IReq, res:IRes) {
		try {
			const { user_id, conversation_id, label } = req.body;

			if (!user_id || !conversation_id) {
				return res.status(HttpStatusCodes.BAD_REQUEST).json({ error : "user_id and conversation_id are required" });
			}

			await storeConversationLabel(user_id.toString(), conversation_id.toString(), typeof label === "string" ? label : "");
			return res.status(HttpStatusCodes.NO_CONTENT).end();
		} catch(error:any) {
			console.error("Failed to store conversation label: ", error);
			return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
		}
	}
	static async getConversationLabels(req:IReq, res:IRes) {
		try {
			const { user_id } = req.query;

			if (!user_id) {
				return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "user_id is required" });
			}

			const labels = await retrieveConversationLabels(user_id.toString());
			return res.status(HttpStatusCodes.OK).json({ labels });
		} catch(error:any) {
			console.error("Failed to retrieve conversation labels: ", error);
			return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" })
		}
	}
}

export default ChatController;