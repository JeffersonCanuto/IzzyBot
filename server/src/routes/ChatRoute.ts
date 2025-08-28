
import { Router } from 'express';
import ChatController from '@src/controllers/ChatController';

// Init API router
const ChatRouter = Router();

// Register API routes
ChatRouter.post('/', ChatController.createPayload);
ChatRouter.get('/conversations', ChatController.getConversations);
ChatRouter.delete('/conversations', ChatController.deleteConversation);
ChatRouter.patch('/labels', ChatController.saveConversationLabel);
ChatRouter.get('/labels', ChatController.getConversationLabels);

export default ChatRouter;