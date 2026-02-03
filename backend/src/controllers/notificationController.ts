import { Response } from 'express';
import { prisma } from '../index';

// Get all notifications for the current user
export const getNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(notifications);
    } catch (error: any) {
        console.error('[NotificationController] Get error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Mark a single notification as read
export const markAsRead = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        res.json(updatedNotification);
    } catch (error: any) {
        console.error('[NotificationController] Mark as read error:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};

// Mark all notifications as read for the current user
export const markAllAsRead = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('[NotificationController] Mark all read error:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

// Delete a notification
export const deleteNotification = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.notification.delete({
            where: { id },
        });

        res.json({ message: 'Notification deleted' });
    } catch (error: any) {
        console.error('[NotificationController] Delete error:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};

// Delete all notifications for the current user
export const deleteAllNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        await prisma.notification.deleteMany({
            where: { userId },
        });

        res.json({ message: 'All notifications deleted' });
    } catch (error: any) {
        console.error('[NotificationController] Delete all error:', error);
        res.status(500).json({ message: 'Failed to delete notifications' });
    }
};
