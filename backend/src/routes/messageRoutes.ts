import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All message routes require authentication
router.post('/', authMiddleware, messageController.sendMessage);
router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/conversation/:partnerId', authMiddleware, messageController.getConversationMessages);
router.post('/mark-read', authMiddleware, messageController.markAsRead);
router.get('/unread-count', authMiddleware, messageController.getUnreadCount);

export default router;
