import express from 'express';
import { getMessages, getUserForSidebar, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', protectRoute, getUserForSidebar);
router.post('/send/:receiverId', protectRoute, sendMessage);
router.get('/chat/:chatId', protectRoute, getMessages);

export default router;