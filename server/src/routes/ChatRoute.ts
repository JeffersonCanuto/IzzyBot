
import { Router } from 'express';

import Paths from '@src/constants/Paths';
import ChatController from '@src/controllers/ChatController';

// Init API router
const ChatRouter = Router();

// Register API routes
ChatRouter.post(Paths.Chat.Create, ChatController.createPayload);

export default ChatRouter;