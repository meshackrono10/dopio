"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToMeetingPoint = exports.cancelBooking = exports.getActiveBookings = exports.respondToReschedule = exports.requestReschedule = exports.confirmViewingCompleted = exports.submitViewingOutcome = exports.confirmPhysicalMeeting = exports.shareMeetingPoint = exports.getAllBookings = exports.getBookingById = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
const notificationService_1 = require("../services/notificationService");
// Calculate end time (1 hour from start)
const calculateEndTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = (hours + 1) % 24;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
// Calculate auto-release timestamp (scheduled date + time + 1 hour + 10 minutes grace)
const calculateAutoRelease = (date, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const releaseDate = new Date(date);
    releaseDate.setHours(hours + 1, minutes + 10, 0, 0); // 1 hour viewing + 10 min grace
    return releaseDate;
};
const getBookingById = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const booking = await index_1.prisma.booking.findUnique({
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
    }
    catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getBookingById = getBookingById;
const getAllBookings = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { status } = req.query;
        const where = role === 'HUNTER'
            ? { hunterId: userId }
            : { tenantId: userId };
        if (status) {
            where.status = status;
        }
        const bookings = await index_1.prisma.booking.findMany({
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
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllBookings = getAllBookings;
// Hunter shares meeting point
const shareMeetingPoint = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const { type, location } = req.body;
        if (role !== 'HUNTER') {
            return res.status(403).json({ message: 'Only hunters can share meeting points' });
        }
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Create or update meeting point - now sets status to PENDING
        const meetingPoint = await index_1.prisma.meetingPoint.upsert({
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
        await notificationService_1.NotificationService.sendNotification(booking.tenantId, 'Meeting Point Updated', `The hunter has proposed a ${type === 'PROPERTY' ? 'property location' : 'landmark'} as the meeting point. Please accept or reject it.`, 'MEETING_POINT_UPDATED', { bookingId });
        res.json({
            success: true,
            message: 'Meeting point shared successfully',
            meetingPoint,
        });
    }
    catch (error) {
        console.error('Share meeting point error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.shareMeetingPoint = shareMeetingPoint;
// Confirm physical meeting occurred (both parties must confirm)
const confirmPhysicalMeeting = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'CONFIRMED') {
            return res.status(400).json({ message: 'Can only confirm meeting for confirmed bookings' });
        }
        const updateData = {};
        if (role === 'HUNTER' && booking.hunterId === userId) {
            updateData.hunterMetConfirmed = true;
        }
        else if (role === 'TENANT' && booking.tenantId === userId) {
            updateData.tenantMetConfirmed = true;
        }
        else {
            return res.status(403).json({ message: 'Not authorized to confirm meeting' });
        }
        // If this confirmation makes both true, set physicalMeetingConfirmed to true
        const isBothConfirmed = (updateData.hunterMetConfirmed || booking.hunterMetConfirmed) &&
            (updateData.tenantMetConfirmed || booking.tenantMetConfirmed);
        if (isBothConfirmed) {
            updateData.physicalMeetingConfirmed = true;
            updateData.actualStartTime = new Date();
        }
        const updatedBooking = await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
        });
        // Notify other party
        const recipientId = role === 'HUNTER' ? booking.tenantId : booking.hunterId;
        await notificationService_1.NotificationService.sendNotification(recipientId, 'Meeting Confirmed', `${role === 'HUNTER' ? 'The hunter' : 'The tenant'} has confirmed that you have met.`, 'MEETING_CONFIRMED', { bookingId });
        res.json({
            success: true,
            message: isBothConfirmed ? 'Both parties confirmed meeting!' : 'Meeting confirmation recorded.',
            booking: updatedBooking,
        });
    }
    catch (error) {
        console.error('Confirm meeting error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.confirmPhysicalMeeting = confirmPhysicalMeeting;
// Tenant submits the outcome of the viewing
const submitViewingOutcome = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const { outcome, feedback, evidenceUrls, evidenceDescription } = req.body;
        if (role !== 'TENANT') {
            return res.status(403).json({ message: 'Only tenants can submit viewing outcomes' });
        }
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true }
        });
        if (!booking || booking.tenantId !== userId) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!booking.physicalMeetingConfirmed) {
            return res.status(400).json({ message: 'Meeting must be confirmed by both parties before submitting outcome' });
        }
        if (booking.status !== 'CONFIRMED') {
            return res.status(400).json({ message: 'Outcome already submitted or booking cancelled' });
        }
        if (outcome === 'COMPLETED_SATISFIED') {
            // Mark as completed and release payment
            await index_1.prisma.booking.update({
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
            // Create hunter earnings
            const hunterAmount = booking.amount * 0.85;
            await index_1.prisma.hunterEarnings.create({
                data: {
                    hunterId: booking.hunterId,
                    amount: hunterAmount,
                    bookingId: booking.id,
                    status: 'PENDING',
                },
            });
            // Unlock property
            await index_1.prisma.property.update({
                where: { id: booking.propertyId },
                data: { isLocked: false },
            });
            await notificationService_1.NotificationService.notifyPaymentReleased(booking.hunterId, hunterAmount);
            return res.json({ success: true, message: 'Viewing marked as completed. Payment released.' });
        }
        else if (outcome === 'ISSUE_REPORTED') {
            // Create a dispute
            const dispute = await index_1.prisma.dispute.create({
                data: {
                    title: `Issue reported for viewing: ${booking.property.title}`,
                    description: feedback || 'No description provided',
                    category: 'VIEWING_ISSUE',
                    reporterId: userId,
                    againstId: booking.hunterId,
                    bookingId: booking.id,
                    propertyId: booking.propertyId,
                    evidenceUrls: evidenceUrls ? JSON.stringify(evidenceUrls) : undefined,
                    evidenceDescription,
                    status: 'OPEN',
                }
            });
            await index_1.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    viewingOutcome: 'ISSUE_REPORTED',
                    outcomeSubmittedAt: new Date(),
                    tenantFeedback: feedback,
                    issueEvidence: evidenceUrls ? JSON.stringify(evidenceUrls) : undefined,
                }
            });
            // Notify hunter and admin
            await notificationService_1.NotificationService.sendNotification(booking.hunterId, 'Issue Reported', `The tenant has reported an issue with the viewing for ${booking.property.title}.`, 'VIEWING_ISSUE_REPORTED', { bookingId, disputeId: dispute.id });
            return res.json({ success: true, message: 'Issue reported. A dispute has been opened.', dispute });
        }
        res.status(400).json({ message: 'Invalid outcome' });
    }
    catch (error) {
        console.error('Submit outcome error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.submitViewingOutcome = submitViewingOutcome;
// CRITICAL: Tenant confirms viewing completed - releases payment
const confirmViewingCompleted = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        if (role !== 'TENANT') {
            return res.status(403).json({ message: 'Only tenants can confirm viewing completion' });
        }
        const booking = await index_1.prisma.booking.findUnique({
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
        await index_1.prisma.booking.update({
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
        await index_1.prisma.hunterEarnings.create({
            data: {
                hunterId: booking.hunterId,
                amount: hunterAmount,
                bookingId: booking.id,
                status: 'PENDING',
            },
        });
        // Unlock property
        await index_1.prisma.property.update({
            where: { id: booking.propertyId },
            data: { isLocked: false },
        });
        // Notify hunter of payment
        await notificationService_1.NotificationService.notifyPaymentReleased(booking.hunterId, hunterAmount);
        res.json({
            success: true,
            message: 'Viewing confirmed! Payment released to hunter.',
        });
    }
    catch (error) {
        console.error('Confirm viewing error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.confirmViewingCompleted = confirmViewingCompleted;
// Request reschedule
const rescheduleSchema = zod_1.z.object({
    proposedDate: zod_1.z.string(),
    proposedTime: zod_1.z.string(),
    reason: zod_1.z.string().optional(),
});
const requestReschedule = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const validatedData = rescheduleSchema.parse(req.body);
        const { proposedDate, proposedTime, reason } = validatedData;
        const booking = await index_1.prisma.booking.findUnique({
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
        const rescheduleRequest = await index_1.prisma.rescheduleRequest.create({
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
        await notificationService_1.NotificationService.notifyRescheduleRequest(recipientId, bookingId, requesterName);
        res.json({
            success: true,
            message: 'Reschedule request sent',
            rescheduleRequest,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Request reschedule error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.requestReschedule = requestReschedule;
// Respond to reschedule (accept/reject/counter)
const respondToReschedule = async (req, res) => {
    try {
        const { userId } = req.user;
        const { rescheduleId } = req.params;
        const { action, counterDate, counterTime, counterReason } = req.body;
        if (!['accept', 'reject', 'counter'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action. Must be accept, reject, or counter' });
        }
        const reschedule = await index_1.prisma.rescheduleRequest.findUnique({
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
            await index_1.prisma.rescheduleRequest.update({
                where: { id: rescheduleId },
                data: {
                    status: 'ACCEPTED',
                    respondedBy: userId,
                    respondedAt: new Date(),
                },
            });
            // Update booking with new schedule
            const newAutoRelease = calculateAutoRelease(reschedule.proposedDate, reschedule.proposedTime);
            await index_1.prisma.booking.update({
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
        }
        else if (action === 'reject') {
            await index_1.prisma.rescheduleRequest.update({
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
        }
        else if (action === 'counter') {
            if (!counterDate || !counterTime) {
                return res.status(400).json({ message: 'Counter date and time required' });
            }
            const counterEndTime = calculateEndTime(counterTime);
            await index_1.prisma.rescheduleRequest.update({
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
    }
    catch (error) {
        console.error('Respond to reschedule error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.respondToReschedule = respondToReschedule;
const getActiveBookings = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const where = role === 'HUNTER'
            ? { hunterId: userId, status: 'CONFIRMED' }
            : { tenantId: userId, status: 'CONFIRMED' };
        const bookings = await index_1.prisma.booking.findMany({
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
    }
    catch (error) {
        console.error('Get active bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getActiveBookings = getActiveBookings;
const cancelBooking = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const bookingId = req.params.id;
        const { reason } = req.body;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.tenantId !== userId && booking.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'CONFIRMED') {
            return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
        }
        // Update booking status
        await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
            },
        });
        // Unlock property
        await index_1.prisma.property.update({
            where: { id: booking.propertyId },
            data: { isLocked: false },
        });
        // Handle refund logic here (simplified)
        // In a real app, you'd trigger a refund via the payment gateway
        // Notify other party
        const recipientId = userId === booking.tenantId ? booking.hunterId : booking.tenantId;
        await notificationService_1.NotificationService.sendNotification(recipientId, 'Booking Cancelled', `The booking for ${booking.property.title} has been cancelled. Reason: ${reason || 'No reason provided'}`, 'BOOKING_CANCELLED', { bookingId });
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
        });
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.cancelBooking = cancelBooking;
const respondToMeetingPoint = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { action } = req.body; // 'accept' or 'reject'
        const meetingPoint = await index_1.prisma.meetingPoint.findUnique({
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
        await index_1.prisma.meetingPoint.update({
            where: { bookingId },
            data: {
                status,
                tenantViewed: true,
                tenantViewedAt: new Date(),
            },
        });
        // Notify hunter
        await notificationService_1.NotificationService.sendNotification(meetingPoint.booking.hunterId, `Meeting Point ${status}`, `The tenant has ${status.toLowerCase()} the proposed meeting point.`, 'MEETING_POINT_RESPONSE', { bookingId });
        res.json({
            success: true,
            message: `Meeting point ${status.toLowerCase()}ed`,
        });
    }
    catch (error) {
        console.error('Respond to meeting point error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.respondToMeetingPoint = respondToMeetingPoint;
