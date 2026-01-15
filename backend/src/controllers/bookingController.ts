import { Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { NotificationService } from '../services/notificationService';

// Calculate end time (1 hour from start)
const calculateEndTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = (hours + 1) % 24;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate auto-release timestamp (scheduled date + time + 1 hour + 10 minutes grace)
const calculateAutoRelease = (date: string, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const releaseDate = new Date(date);
    releaseDate.setHours(hours + 1, minutes + 10, 0, 0); // 1 hour viewing + 10 min grace
    return releaseDate;
};

export const getBookingById = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                property: {
                    include: {
                        hunter: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatarUrl: true,
                    },
                },
                invoice: true,
                meetingPoint: true,
                rescheduleRequests: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Authorization check
        if (booking.tenantId !== userId && booking.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error: any) {
        console.error('Get booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllBookings = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const { status } = req.query;

        const where: any = role === 'HUNTER'
            ? { hunterId: userId }
            : { tenantId: userId };

        if (status) {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                property: {
                    include: {
                        hunter: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                invoice: true,
                meetingPoint: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(bookings);
    } catch (error: any) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Hunter shares meeting point
export const shareMeetingPoint = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const { type, location } = req.body;

        if (role !== 'HUNTER') {
            return res.status(403).json({ message: 'Only hunters can share meeting points' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Create or update meeting point
        const meetingPoint = await prisma.meetingPoint.upsert({
            where: { bookingId },
            create: {
                bookingId,
                type,
                location,
                sharedBy: userId,
            },
            update: {
                type,
                location,
            },
        });

        res.json({
            success: true,
            message: 'Meeting point shared successfully',
            meetingPoint,
        });
    } catch (error: any) {
        console.error('Share meeting point error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Confirm physical meeting occurred
export const confirmPhysicalMeeting = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Only the hunter can confirm physical meeting' });
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                physicalMeetingConfirmed: true,
                actualStartTime: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Physical meeting confirmed',
        });
    } catch (error: any) {
        console.error('Confirm meeting error:', error);
        res.status(500).json({ message: error.message });
    }
};

// CRITICAL: Tenant confirms viewing completed - releases payment
export const confirmViewingCompleted = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;

        if (role !== 'TENANT') {
            return res.status(403).json({ message: 'Only tenants can confirm viewing completion' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                invoice: true,
                property: true,
            },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.tenantConfirmed) {
            return res.status(400).json({ message: 'Viewing already confirmed' });
        }

        // Update booking
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                tenantConfirmed: true,
                actualEndTime: new Date(),
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });

        // Release payment from ESCROW
        await prisma.invoice.update({
            where: { id: booking.invoiceId },
            data: { status: 'RELEASED' },
        });

        // Create hunter earnings (85% to hunter, 15% platform fee)
        const hunterAmount = booking.invoice!.amount * 0.85;
        await prisma.hunterEarnings.create({
            data: {
                hunterId: booking.hunterId,
                amount: hunterAmount,
                bookingId: booking.id,
                status: 'PENDING',
            },
        });

        // Unlock property
        await prisma.property.update({
            where: { id: booking.propertyId },
            data: { isLocked: false },
        });

        // Notify hunter of payment
        await NotificationService.notifyPaymentReleased(booking.hunterId, hunterAmount);

        res.json({
            success: true,
            message: 'Viewing confirmed! Payment released to hunter.',
        });
    } catch (error: any) {
        console.error('Confirm viewing error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Request reschedule
const rescheduleSchema = z.object({
    proposedDate: z.string(),
    proposedTime: z.string(),
    reason: z.string().optional(),
});

export const requestReschedule = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const validatedData = rescheduleSchema.parse(req.body);
        const { proposedDate, proposedTime, reason } = validatedData;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status === 'COMPLETED') {
            return res.status(400).json({ message: 'Cannot reschedule completed booking' });
        }

        const proposedEndTime = calculateEndTime(proposedTime);

        const rescheduleRequest = await prisma.rescheduleRequest.create({
            data: {
                bookingId,
                requestedBy: userId,
                proposedDate,
                proposedTime,
                proposedEndTime,
                reason,
            },
            include: {
                booking: {
                    include: {
                        property: true,
                        tenant: true,
                        hunter: true,
                    },
                },
            },
        });

        // Notify the other party
        const recipientId = userId === rescheduleRequest.booking.tenantId
            ? rescheduleRequest.booking.hunterId
            : rescheduleRequest.booking.tenantId;

        const requesterName = userId === rescheduleRequest.booking.tenantId
            ? rescheduleRequest.booking.tenant.name
            : rescheduleRequest.booking.hunter.name;

        await NotificationService.notifyRescheduleRequest(recipientId, bookingId, requesterName);

        res.json({
            success: true,
            message: 'Reschedule request sent',
            rescheduleRequest,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Request reschedule error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Respond to reschedule (accept/reject/counter)
export const respondToReschedule = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const { rescheduleId } = req.params;
        const { action, counterDate, counterTime, counterReason } = req.body;

        if (!['accept', 'reject', 'counter'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action. Must be accept, reject, or counter' });
        }

        const reschedule = await prisma.rescheduleRequest.findUnique({
            where: { id: rescheduleId },
            include: {
                booking: true,
            },
        });

        if (!reschedule) {
            return res.status(404).json({ message: 'Reschedule request not found' });
        }

        const booking = reschedule.booking;

        // Only the other party can respond
        if (reschedule.requestedBy === userId) {
            return res.status(403).json({ message: 'Cannot respond to your own reschedule request' });
        }

        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (action === 'accept') {
            // Accept the reschedule
            await prisma.rescheduleRequest.update({
                where: { id: rescheduleId },
                data: {
                    status: 'ACCEPTED',
                    respondedBy: userId,
                    respondedAt: new Date(),
                },
            });

            // Update booking with new schedule
            const newAutoRelease = calculateAutoRelease(reschedule.proposedDate, reschedule.proposedTime);

            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    scheduledDate: reschedule.proposedDate,
                    scheduledTime: reschedule.proposedTime,
                    scheduledEndTime: reschedule.proposedEndTime,
                    autoReleaseAt: newAutoRelease,
                },
            });

            res.json({
                success: true,
                message: 'Reschedule accepted',
            });
        } else if (action === 'reject') {
            await prisma.rescheduleRequest.update({
                where: { id: rescheduleId },
                data: {
                    status: 'REJECTED',
                    respondedBy: userId,
                    respondedAt: new Date(),
                },
            });

            res.json({
                success: true,
                message: 'Reschedule rejected',
            });
        } else if (action === 'counter') {
            if (!counterDate || !counterTime) {
                return res.status(400).json({ message: 'Counter date and time required' });
            }

            const counterEndTime = calculateEndTime(counterTime);

            await prisma.rescheduleRequest.update({
                where: { id: rescheduleId },
                data: {
                    status: 'COUNTERED',
                    counterDate,
                    counterTime,
                    counterEndTime,
                    counterReason,
                    respondedBy: userId,
                    respondedAt: new Date(),
                },
            });

            res.json({
                success: true,
                message: 'Counter-offer sent',
            });
        }
    } catch (error: any) {
        console.error('Respond to reschedule error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getActiveBookings = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;

        const where: any = role === 'HUNTER'
            ? { hunterId: userId, status: 'CONFIRMED' }
            : { tenantId: userId, status: 'CONFIRMED' };

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                property: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatarUrl: true,
                    },
                },
                hunter: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatarUrl: true,
                    },
                },
                invoice: true,
                meetingPoint: true,
            },
        });

        res.json(bookings);
    } catch (error: any) {
        console.error('Get active bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};
