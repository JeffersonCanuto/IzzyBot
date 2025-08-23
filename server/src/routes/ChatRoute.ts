
import { Router } from 'express';
import ChatController from '@src/controllers/ChatController';

// Init API router
const ChatRouter = Router();

// Register API routes
ChatRouter.post('/', ChatController.createPayload);

export default ChatRouter;