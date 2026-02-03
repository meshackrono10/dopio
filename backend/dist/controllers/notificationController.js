"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const index_1 = require("../index");
// Get all notifications for the current user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await index_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('[NotificationController] Get error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
// Mark a single notification as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const notification = await index_1.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const updatedNotification = await index_1.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
        res.json(updatedNotification);
    }
    catch (error) {
        console.error('[NotificationController] Mark as read error:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};
exports.markAsRead = markAsRead;
// Mark all notifications as read for the current user
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        await index_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('[NotificationController] Mark all read error:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};
exports.markAllAsRead = markAllAsRead;
// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const notification = await index_1.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await index_1.prisma.notification.delete({
            where: { id },
        });
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('[NotificationController] Delete error:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};
exports.deleteNotification = deleteNotification;
// Delete all notifications for the current user
const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        await index_1.prisma.notification.deleteMany({
            where: { userId },
        });
        res.json({ message: 'All notifications deleted' });
    }
    catch (error) {
        console.error('[NotificationController] Delete all error:', error);
        res.status(500).json({ message: 'Failed to delete notifications' });
    }
};
exports.deleteAllNotifications = deleteAllNotifications;
