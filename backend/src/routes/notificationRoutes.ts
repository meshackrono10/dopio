import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.patch('/mark-all-read', authMiddleware, notificationController.markAllAsRead);
router.patch('/:id/mark-read', authMiddleware, notificationController.markAsRead);
router.delete('/delete-all', authMiddleware, notificationController.deleteAllNotifications);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

export default router;
