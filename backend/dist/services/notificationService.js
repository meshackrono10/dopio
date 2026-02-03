"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const index_1 = require("../index");
class NotificationService {
    /**
     * Sends a notification to a user.
     * For now, this just logs to console and creates a notification record if we had one.
     */
    static async sendNotification(userId, title, message, type, actionUrl) {
        console.log(`[NotificationService] Sending ${type} to user ${userId}: ${title} - ${message}`);
        try {
            await index_1.prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    actionUrl,
                },
            });
        }
        catch (error) {
            console.error('[NotificationService] Failed to persist notification:', error);
        }
    }
    static async notifyRescheduleRequest(userId, bookingId, requesterName) {
        await this.sendNotification(userId, 'Reschedule Requested', `${requesterName} has requested to reschedule your viewing.`, 'RESCHEDULE_REQUEST', `/bookings/${bookingId}`);
    }
    static async notifyBookingReminder(userId, bookingId, time) {
        await this.sendNotification(userId, 'Viewing Reminder', `Reminder: You have a viewing scheduled for ${time}.`, 'BOOKING_REMINDER', `/bookings/${bookingId}`);
    }
    static async notifyPaymentReleased(hunterId, amount) {
        await this.sendNotification(hunterId, 'Payment Released', `Payment of KES ${amount} has been released to your wallet.`, 'PAYMENT_RELEASED', '/wallet');
    }
}
exports.NotificationService = NotificationService;
