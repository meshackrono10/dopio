import { prisma } from '../index';

export class NotificationService {
    /**
     * Sends a notification to a user.
     * For now, this just logs to console and creates a notification record if we had one.
     */
    static async sendNotification(userId: string, title: string, message: string, type: string, actionUrl?: string) {
        console.log(`[NotificationService] Sending ${type} to user ${userId}: ${title} - ${message}`);

        try {
            await prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    actionUrl,
                },
            });
        } catch (error) {
            console.error('[NotificationService] Failed to persist notification:', error);
        }
    }


    static async notifyRescheduleRequest(userId: string, bookingId: string, requesterName: string) {
        await this.sendNotification(
            userId,
            'Reschedule Requested',
            `${requesterName} has requested to reschedule your viewing.`,
            'RESCHEDULE_REQUEST',
            `/bookings/${bookingId}`
        );
    }

    static async notifyBookingReminder(userId: string, bookingId: string, time: string) {
        await this.sendNotification(
            userId,
            'Viewing Reminder',
            `Reminder: You have a viewing scheduled for ${time}.`,
            'BOOKING_REMINDER',
            `/bookings/${bookingId}`
        );
    }

    static async notifyPaymentReleased(hunterId: string, amount: number) {
        await this.sendNotification(
            hunterId,
            'Payment Released',
            `Payment of KES ${amount} has been released to your wallet.`,
            'PAYMENT_RELEASED',
            '/wallet'
        );
    }

    static async notifyReviewPrompt(tenantId: string, bookingId: string, hunterName: string) {
        await this.sendNotification(
            tenantId,
            'Rate Your Experience',
            `Your viewing with ${hunterName} is complete. Please take a moment to rate them!`,
            'REVIEW_PROMPT',
            `/bookings/${bookingId}`
        );
    }
}
