
import { Router } from 'express';
import ChatController from '@src/controllers/ChatController';

// Init API router
const ChatRouter = Router();

// Register API routes
ChatRouter.post('/', ChatController.createPayload);
ChatRouter.get('/conversations', ChatController.getConversations);

export default ChatRouter;