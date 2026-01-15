import { prisma } from '../index';

export class NotificationService {
    /**
     * Sends a notification to a user.
     * For now, this just logs to console and creates a notification record if we had one.
     */
    static async sendNotification(userId: string, title: string, message: string, type: string, data?: any) {
        console.log(`[NotificationService] Sending ${type} to user ${userId}: ${title} - ${message}`);

        // In a real app, this would send a push notification (FCM), email, or SMS.
        // For now, we could also store it in a Notifications table if we had one.
    }

    static async notifyHunterOfNewBid(hunterId: string, searchRequestId: string) {
        await this.sendNotification(
            hunterId,
            'New Bid Opportunity',
            'A tenant has posted a search request that matches your area.',
            'BID_OPPORTUNITY',
            { searchRequestId }
        );
    }

    static async notifyTenantOfBid(tenantId: string, bidId: string) {
        await this.sendNotification(
            tenantId,
            'New Bid Received',
            'A hunter has submitted a bid for your search request.',
            'NEW_BID',
            { bidId }
        );
    }

    static async notifyRescheduleRequest(userId: string, bookingId: string, requesterName: string) {
        await this.sendNotification(
            userId,
            'Reschedule Requested',
            `${requesterName} has requested to reschedule your viewing.`,
            'RESCHEDULE_REQUEST',
            { bookingId }
        );
    }

    static async notifyBookingReminder(userId: string, bookingId: string, time: string) {
        await this.sendNotification(
            userId,
            'Viewing Reminder',
            `Reminder: You have a viewing scheduled for ${time}.`,
            'BOOKING_REMINDER',
            { bookingId }
        );
    }

    static async notifyPaymentReleased(hunterId: string, amount: number) {
        await this.sendNotification(
            hunterId,
            'Payment Released',
            `Payment of KES ${amount} has been released to your wallet.`,
            'PAYMENT_RELEASED',
            { amount }
        );
    }
}
