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
                meetingPoint: true,
                rescheduleRequests: {
                    orderBy: { createdAt: 'desc' },
                },
                alternativeOffers: {
                    include: { property: true },
                    orderBy: { createdAt: 'desc' },
                },
                disputes: {
                    orderBy: { createdAt: 'desc' },
                },
                reviews: true,
            },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Authorization check
        if (booking.tenantId !== userId && booking.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        if (booking.property) {
            const p = booking.property;
            p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
            p.location = typeof p.location === 'string' ? JSON.parse(p.location) : p.location;
            p.amenities = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities;
            p.videos = typeof p.videos === 'string' ? JSON.parse(p.videos) : p.videos;
            // p.utilities = typeof p.utilities === 'string' ? JSON.parse(p.utilities) : p.utilities;
        }

        if (booking.meetingPoint) {
            booking.meetingPoint.location = typeof booking.meetingPoint.location === 'string'
                ? JSON.parse(booking.meetingPoint.location)
                : booking.meetingPoint.location;
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
            ? { hunterId: userId, hunterVisible: true }
            : { tenantId: userId, tenantVisible: true };

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
                meetingPoint: true,
                reviews: true,
                viewingRequest: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const processedBookings = bookings.map(b => {
            if (b.property) {
                const p = b.property;
                p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                p.location = typeof p.location === 'string' ? JSON.parse(p.location) : p.location;
            }
            if (b.meetingPoint) {
                b.meetingPoint.location = typeof b.meetingPoint.location === 'string'
                    ? JSON.parse(b.meetingPoint.location)
                    : b.meetingPoint.location;
            }
            return b;
        });

        res.json(processedBookings);
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

        // Create or update meeting point - now sets status to PENDING
        const meetingPoint = await prisma.meetingPoint.upsert({
            where: { bookingId },
            create: {
                bookingId,
                type,
                location: JSON.stringify(location),
                sharedBy: userId,
                status: 'PENDING',
            },
            update: {
                type,
                location: JSON.stringify(location),
                status: 'PENDING',
                tenantViewed: false,
            },
        });

        // Notify tenant
        await NotificationService.sendNotification(
            booking.tenantId,
            'Meeting Point Updated',
            `The hunter has proposed a ${type === 'PROPERTY' ? 'property location' : 'landmark'} as the meeting point. Please accept or reject it.`,
            'MEETING_POINT_UPDATED',
            `/bookings/${bookingId}`
        );

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

// Confirm physical meeting occurred (both parties must confirm)
export const confirmPhysicalMeeting = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
            return res.status(400).json({ message: 'Can only confirm meeting for confirmed or in-progress bookings' });
        }

        // Check if today is the scheduled day
        const today = new Date().toISOString().split('T')[0];
        const scheduledDateStr = booking.scheduledDate.includes('T') ? booking.scheduledDate.split('T')[0] : booking.scheduledDate;

        console.log(`DEBUG: confirmPhysicalMeeting date check:`, {
            bookingScheduledRaw: booking.scheduledDate,
            scheduledDateStr,
            today
        });

        if (scheduledDateStr !== today) {
            return res.status(400).json({
                message: 'Meeting can only be confirmed on the scheduled day',
                debug: { today, scheduledDate: booking.scheduledDate, normalized: scheduledDateStr }
            });
        }

        const updateData: any = {};
        if (role === 'HUNTER' && booking.hunterId === userId) {
            updateData.hunterMetConfirmed = true;
        } else if (role === 'TENANT' && booking.tenantId === userId) {
            updateData.tenantMetConfirmed = true;
        } else {
            return res.status(403).json({ message: 'Not authorized to confirm meeting' });
        }

        // Set status to IN_PROGRESS on first confirmation
        if (booking.status === 'CONFIRMED') {
            updateData.status = 'IN_PROGRESS';
        }

        // If this confirmation makes both true, set physicalMeetingConfirmed to true
        const isBothConfirmed = (updateData.hunterMetConfirmed || booking.hunterMetConfirmed) &&
            (updateData.tenantMetConfirmed || booking.tenantMetConfirmed);

        if (isBothConfirmed) {
            updateData.physicalMeetingConfirmed = true;
            updateData.actualStartTime = new Date();
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
        });

        // Notify other party
        const recipientId = role === 'HUNTER' ? booking.tenantId : booking.hunterId;
        await NotificationService.sendNotification(
            recipientId,
            'Meeting Confirmed',
            `${role === 'HUNTER' ? 'The hunter' : 'The tenant'} has confirmed that you have met.`,
            'MEETING_CONFIRMED',
            `/bookings/${bookingId}`
        );

        res.json({
            success: true,
            message: isBothConfirmed ? 'Both parties confirmed meeting!' : 'Meeting confirmation recorded.',
            booking: updatedBooking,
        });
    } catch (error: any) {
        console.error('Confirm meeting error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Tenant submits the outcome of the viewing
export const submitViewingOutcome = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const { outcome, feedback, evidenceUrls, evidenceDescription } = req.body;

        if (role !== 'TENANT') {
            return res.status(403).json({ message: 'Only tenants can submit viewing outcomes' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true }
        });

        if (!booking || booking.tenantId !== userId) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!booking.physicalMeetingConfirmed) {
            return res.status(400).json({ message: 'Meeting must be confirmed by both parties before submitting outcome' });
        }

        if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
            return res.status(400).json({ message: 'Outcome already submitted or booking cancelled' });
        }

        if (outcome === 'COMPLETED_SATISFIED') {
            // Mark as completed and release payment
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'COMPLETED',
                    tenantConfirmed: true,
                    viewingOutcome: 'COMPLETED_SATISFIED',
                    outcomeSubmittedAt: new Date(),
                    completedAt: new Date(),
                    paymentStatus: 'RELEASED',
                    tenantFeedback: feedback,
                },
            });

            // Mark ViewingRequest as COMPLETED
            await prisma.viewingRequest.updateMany({
                where: { bookingId },
                data: { status: 'COMPLETED' as any }
            });

            // Create hunter earnings
            const hunterAmount = booking.amount * 0.85;
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

            await NotificationService.notifyPaymentReleased(booking.hunterId, hunterAmount);

            return res.json({ success: true, message: 'Viewing marked as completed. Payment released.' });
        } else if (outcome === 'ISSUE_REPORTED') {
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    viewingOutcome: 'ISSUE_REPORTED',
                    outcomeSubmittedAt: new Date(),
                    tenantFeedback: feedback,
                    issueEvidence: evidenceUrls ? JSON.stringify(evidenceUrls) : undefined,
                    issueCreated: true,
                    issueReporterId: userId,
                    issueStatus: 'PENDING',
                }
            });

            // Notify hunter
            await NotificationService.sendNotification(
                booking.hunterId,
                'Issue Reported',
                `An issue has been reported with the viewing for ${booking.property.title}. Please review it.`,
                'VIEWING_ISSUE_REPORTED',
                `/bookings/${bookingId}`
            );

            return res.json({ success: true, message: 'Issue reported. Waiting for hunter response.' });
        }

        res.status(400).json({ message: 'Invalid outcome' });
    } catch (error: any) {
        console.error('Submit outcome error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Respond to an issue (Hunter)
export const respondToIssue = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { action } = req.body; // 'ACCEPT' or 'DENY'

        if (!['ACCEPT', 'DENY'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action. Must be ACCEPT or DENY' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Only the house hunter can respond to issues' });
        }

        if (action === 'ACCEPT') {
            // Cancel everything and refund
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CANCELLED',
                    issueStatus: 'ACCEPTED',
                    paymentStatus: 'REFUNDED',
                }
            });

            await prisma.viewingRequest.updateMany({
                where: { bookingId },
                data: { status: 'CANCELLED' as any }
            });

            // Unlock property
            await prisma.property.update({
                where: { id: booking.propertyId },
                data: { isLocked: false },
            });

            await NotificationService.sendNotification(
                booking.tenantId,
                'Issue Accepted',
                `The hunter has accepted the reported issue for ${booking.property.title}. Your viewing has been cancelled and a refund initiated.`,
                'VIEWING_ISSUE_ACCEPTED',
                `/bookings/${bookingId}`
            );

            return res.json({ success: true, message: 'Issue accepted. Viewing cancelled and refund initiated.' });
        } else {
            // Deny -> Goes to admin (DISPUTED)
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'DISPUTED',
                    issueStatus: 'DENIED',
                }
            });

            // Create a formal dispute for admin
            await prisma.dispute.create({
                data: {
                    title: `Disputed Issue: ${booking.property.title}`,
                    description: booking.tenantFeedback || 'Issue denied by hunter',
                    category: 'VIEWING_ISSUE',
                    reporterId: booking.issueReporterId || booking.tenantId,
                    againstId: booking.hunterId,
                    bookingId: booking.id,
                    propertyId: booking.propertyId,
                    status: 'OPEN',
                }
            });

            await NotificationService.sendNotification(
                booking.tenantId,
                'Issue Denied',
                `The hunter has denied the reported issue for ${booking.property.title}. An admin will now review the dispute.`,
                'VIEWING_ISSUE_DENIED',
                `/bookings/${bookingId}`
            );

            return res.json({ success: true, message: 'Issue denied. A dispute has been opened for admin review.' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Withdraw/Cancel an issue (Reporter)
export const cancelIssue = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.issueReporterId !== userId) {
            return res.status(403).json({ message: 'Only the person who reported the issue can withdraw it' });
        }

        if (booking.issueStatus !== 'PENDING') {
            return res.status(400).json({ message: 'Cannot withdraw an issue that has already been responded to' });
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                issueCreated: false,
                issueStatus: null,
                issueReporterId: null,
                viewingOutcome: null,
            }
        });

        return res.json({ success: true, message: 'Issue withdrawn successfully.' });
    } catch (error: any) {
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
                paymentStatus: 'RELEASED',
            },
        });

        // Create hunter earnings (85% to hunter, 15% platform fee)
        const hunterAmount = booking.amount * 0.85;
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
            ? { hunterId: userId, status: 'CONFIRMED', hunterVisible: true }
            : { tenantId: userId, status: 'CONFIRMED', tenantVisible: true };

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
                meetingPoint: true,
            },
        });

        res.json(bookings);
    } catch (error: any) {
        console.error('Get active bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const hideBooking = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data: any = {};
        if (role === 'HUNTER') {
            data.hunterVisible = false;
        } else {
            data.tenantVisible = false;
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data
        });

        res.json({ success: true, message: 'Booking hidden successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelBooking = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const { reason } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tenantId !== userId && booking.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
            return res.status(400).json({ message: 'Only confirmed or in-progress bookings can be cancelled' });
        }

        // POST-MEETUP RESTRICTION: Only Hunter or Admin can cancel after meetup confirmed
        if (booking.physicalMeetingConfirmed && role === 'TENANT') {
            return res.status(403).json({ message: 'Tenants cannot cancel after the meetup has been confirmed. You can only Mark Done or Report Issue.' });
        }

        // Update booking status
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                paymentStatus: 'REFUNDED'
            },
        });

        // Cascade status to ViewingRequest
        await prisma.viewingRequest.updateMany({
            where: { bookingId },
            data: { status: 'CANCELLED' as any }
        });

        // Unlock property
        await prisma.property.update({
            where: { id: booking.propertyId },
            data: { isLocked: false },
        });

        // Notify other party
        const recipientId = userId === booking.tenantId ? booking.hunterId : booking.tenantId;
        await NotificationService.sendNotification(
            recipientId,
            'Booking Cancelled',
            `The booking for ${booking.property.title} has been cancelled. Reason: ${reason || 'No reason provided'}`,
            'BOOKING_CANCELLED',
            `/bookings/${bookingId}`
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
        });
    } catch (error: any) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const respondToMeetingPoint = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { action } = req.body; // 'accept' or 'reject'

        const meetingPoint = await prisma.meetingPoint.findUnique({
            where: { bookingId },
            include: { booking: true },
        });

        if (!meetingPoint) {
            return res.status(404).json({ message: 'Meeting point not found' });
        }

        if (meetingPoint.booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Only the tenant can respond to the meeting point' });
        }

        const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

        await prisma.meetingPoint.update({
            where: { bookingId },
            data: {
                status,
                tenantViewed: true,
                tenantViewedAt: new Date(),
            },
        });

        // Notify hunter
        await NotificationService.sendNotification(
            meetingPoint.booking.hunterId,
            `Meeting Point ${status}`,
            `The tenant has ${status.toLowerCase()} the proposed meeting point.`,
            'MEETING_POINT_RESPONSE',
            `/bookings/${bookingId}`
        );

        res.json({
            success: true,
            message: `Meeting point ${status.toLowerCase()}ed`,
        });
    } catch (error: any) {
        console.error('Respond to meeting point error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mark booking as done (both parties must confirm)
export const markBookingDone = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
            return res.status(400).json({ message: 'Can only mark confirmed or in-progress bookings as done' });
        }

        const updateData: any = {};
        if (role === 'HUNTER' && booking.hunterId === userId) {
            updateData.hunterDone = true;
        } else if (role === 'TENANT' && booking.tenantId === userId) {
            updateData.tenantDone = true;
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If both confirmed done, complete the booking
        const isBothDone = (updateData.hunterDone || booking.hunterDone) &&
            (updateData.tenantDone || booking.tenantDone);

        if (isBothDone) {
            updateData.status = 'COMPLETED';
            updateData.completedAt = new Date();
            updateData.paymentStatus = 'RELEASED';
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
        });

        if (isBothDone) {
            // Mark property as RENTED (or similar)
            await prisma.property.update({
                where: { id: booking.propertyId },
                data: { status: 'RENTED', isLocked: false },
            });

            // Create hunter earnings
            const hunterAmount = booking.amount * 0.85;
            await prisma.hunterEarnings.create({
                data: {
                    hunterId: booking.hunterId,
                    amount: hunterAmount,
                    bookingId: booking.id,
                    status: 'PENDING',
                },
            });

            await NotificationService.notifyPaymentReleased(booking.hunterId, hunterAmount);

            // Mark ViewingRequest as COMPLETED
            await prisma.viewingRequest.updateMany({
                where: { bookingId },
                data: { status: 'COMPLETED' as any }
            });
        }

        res.json({
            success: true,
            message: isBothDone ? 'Booking completed and property marked as rented!' : 'Confirmation recorded.',
            booking: updatedBooking,
        });
    } catch (error: any) {
        console.error('Mark done error:', error);
        res.status(500).json({ message: error.message });
    }
};

