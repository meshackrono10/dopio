import { prisma } from '../index';
import { NotificationService } from './notificationService';

export class TimeControlService {
    /**
     * Checks for bookings that have passed their auto-release time
     * and releases payment if not already confirmed or disputed.
     */
    static async processAutoReleases() {
        console.log('[TimeControlService] Checking for auto-releases...');
        const now = new Date();

        try {
            // Find bookings that:
            // 1. Have passed autoReleaseAt
            // 2. Are still in CONFIRMED status (not COMPLETED/CANCELLED)
            // 3. Haven't been tenant-confirmed yet
            const pendingAutoReleases = await prisma.booking.findMany({
                where: {
                    status: 'CONFIRMED',
                    tenantConfirmed: false,
                    autoReleaseAt: {
                        lte: now,
                    },
                    invoice: {
                        status: 'ESCROW',
                    },
                },
                include: {
                    invoice: true,
                    property: true,
                },
            });

            console.log(`[TimeControlService] Found ${pendingAutoReleases.length} bookings for auto-release.`);

            for (const booking of pendingAutoReleases) {
                await this.releaseBookingPayment(booking);
            }
        } catch (error) {
            console.error('[TimeControlService] Error processing auto-releases:', error);
        }
    }

    private static async releaseBookingPayment(booking: any) {
        console.log(`[TimeControlService] Auto-releasing payment for booking: ${booking.id}`);

        try {
            await prisma.$transaction(async (tx) => {
                // 1. Update Invoice status
                await tx.invoice.update({
                    where: { id: booking.invoiceId },
                    data: { status: 'PAID' },
                });

                // 2. Update Booking status
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: 'COMPLETED',
                        actualEndTime: new Date(),
                    },
                });

                // 3. Unlock Property
                await tx.property.update({
                    where: { id: booking.propertyId },
                    data: { isLocked: false },
                });

                // 4. Create Hunter Earnings (85% split)
                const amount = booking.invoice.amount;
                const hunterEarnings = amount * 0.85;

                await tx.hunterEarnings.create({
                    data: {
                        hunterId: booking.hunterId,
                        bookingId: booking.id,
                        amount: hunterEarnings,
                        status: 'PENDING', // Available for withdrawal later
                    },
                });
            });

            console.log(`[TimeControlService] Successfully auto-released booking: ${booking.id}`);
        } catch (error) {
            console.error(`[TimeControlService] Failed to auto-release booking ${booking.id}:`, error);
        }
    }

    /**
     * Checks for bookings scheduled for today and sends a reschedule prompt at 7 AM.
     */
    static async sendMorningReschedulePrompts() {
        console.log('[TimeControlService] Sending morning reschedule prompts...');
        const today = new Date().toISOString().split('T')[0];

        try {
            const todaysBookings = await prisma.booking.findMany({
                where: {
                    scheduledDate: today,
                    status: 'CONFIRMED',
                },
                include: {
                    tenant: true,
                    hunter: true,
                },
            });

            console.log(`[TimeControlService] Found ${todaysBookings.length} bookings for today.`);

            for (const booking of todaysBookings) {
                // Notify both parties
                await NotificationService.sendNotification(
                    booking.tenantId,
                    'Viewing Today!',
                    `You have a viewing scheduled for today at ${booking.scheduledTime}. Still good to go?`,
                    'MORNING_PROMPT',
                    { bookingId: booking.id }
                );

                await NotificationService.sendNotification(
                    booking.hunterId,
                    'Viewing Today!',
                    `You have a viewing scheduled for today at ${booking.scheduledTime}. Still good to go?`,
                    'MORNING_PROMPT',
                    { bookingId: booking.id }
                );
            }
        } catch (error) {
            console.error('[TimeControlService] Error sending morning prompts:', error);
        }
    }

    /**
     * Checks for expired search requests or bids if needed.
     */
    static async checkExpirations() {
        console.log('[TimeControlService] Checking for expirations...');
        // Add logic for expired search requests (e.g., older than 7 days)
    }
}
