"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMeetingPointViewed = exports.updateMeetingPoint = exports.acceptCounterProposal = exports.respondToReschedule = exports.createRescheduleRequest = void 0;
const index_1 = require("../index");
const notificationService_1 = require("../services/notificationService");
// Create reschedule request
const createRescheduleRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { proposedDate, proposedTime, reason } = req.body;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                property: true,
                tenant: true,
                hunter: true,
            },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Check if user is part of this booking
        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Check if there's already a pending reschedule request
        const existingRequest = await index_1.prisma.rescheduleRequest.findFirst({
            where: {
                bookingId,
                status: 'PENDING',
            },
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'There is already a pending reschedule request' });
        }
        // Calculate end time (1 hour after start)
        const [hours, minutes] = proposedTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        const proposedEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const rescheduleRequest = await index_1.prisma.rescheduleRequest.create({
            data: {
                bookingId,
                requestedBy: userId,
                proposedDate,
                proposedTime,
                proposedEndTime,
                reason,
                status: 'PENDING',
            },
        });
        // Notify the other party
        const recipientId = userId === booking.tenantId ? booking.hunterId : booking.tenantId;
        await notificationService_1.NotificationService.sendNotification(recipientId, 'Reschedule Request', `${userId === booking.tenantId ? booking.tenant.name : booking.hunter.name} has requested to reschedule the viewing.`, 'RESCHEDULE_REQUESTED', { bookingId, rescheduleRequestId: rescheduleRequest.id });
        res.json({
            success: true,
            message: 'Reschedule request sent',
            rescheduleRequest,
        });
    }
    catch (error) {
        console.error('Create reschedule request error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createRescheduleRequest = createRescheduleRequest;
// Respond to reschedule request
const respondToReschedule = async (req, res) => {
    try {
        const { userId } = req.user;
        const rescheduleId = req.params.rescheduleId;
        const { action, counterDate, counterTime, counterReason } = req.body;
        const rescheduleRequest = await index_1.prisma.rescheduleRequest.findUnique({
            where: { id: rescheduleId },
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
        if (!rescheduleRequest) {
            return res.status(404).json({ message: 'Reschedule request not found' });
        }
        const { booking } = rescheduleRequest;
        // Check if user is the recipient (not the requester)
        if (rescheduleRequest.requestedBy === userId) {
            return res.status(403).json({ message: 'You cannot respond to your own request' });
        }
        // Check if user is part of this booking
        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }
        let updateData = {
            respondedBy: userId,
            respondedAt: new Date(),
        };
        if (action === 'ACCEPT') {
            updateData.status = 'ACCEPTED';
            // Update the booking with new schedule
            await index_1.prisma.booking.update({
                where: { id: booking.id },
                data: {
                    scheduledDate: rescheduleRequest.proposedDate,
                    scheduledTime: rescheduleRequest.proposedTime,
                    scheduledEndTime: rescheduleRequest.proposedEndTime,
                    // Reset confirmation statuses
                    tenantConfirmed: false,
                    hunterConfirmed: false,
                    physicalMeetingConfirmed: false,
                },
            });
            // Notify requester
            await notificationService_1.NotificationService.sendNotification(rescheduleRequest.requestedBy, 'Reschedule Accepted', `Your reschedule request has been accepted. New date: ${new Date(rescheduleRequest.proposedDate).toLocaleDateString()} at ${rescheduleRequest.proposedTime}`, 'RESCHEDULE_ACCEPTED', { bookingId: booking.id });
        }
        else if (action === 'REJECT') {
            updateData.status = 'REJECTED';
            await notificationService_1.NotificationService.sendNotification(rescheduleRequest.requestedBy, 'Reschedule Rejected', 'Your reschedule request has been rejected. The original schedule remains.', 'RESCHEDULE_REJECTED', { bookingId: booking.id });
        }
        else if (action === 'COUNTER') {
            if (!counterDate || !counterTime) {
                return res.status(400).json({ message: 'Counter date and time are required' });
            }
            const [hours, minutes] = counterTime.split(':').map(Number);
            const endHours = (hours + 1) % 24;
            const counterEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            updateData.status = 'COUNTERED';
            updateData.counterDate = counterDate;
            updateData.counterTime = counterTime;
            updateData.counterEndTime = counterEndTime;
            updateData.counterReason = counterReason;
            await notificationService_1.NotificationService.sendNotification(rescheduleRequest.requestedBy, 'Counter-Proposal', `A counter-proposal has been made for the reschedule request.`, 'RESCHEDULE_COUNTERED', { bookingId: booking.id, rescheduleRequestId: rescheduleId });
        }
        const updated = await index_1.prisma.rescheduleRequest.update({
            where: { id: rescheduleId },
            data: updateData,
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
        res.json({
            success: true,
            message: `Reschedule request ${action.toLowerCase()}ed`,
            rescheduleRequest: updated,
        });
    }
    catch (error) {
        console.error('Respond to reschedule error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.respondToReschedule = respondToReschedule;
// Accept counter-proposal
const acceptCounterProposal = async (req, res) => {
    try {
        const { userId } = req.user;
        const rescheduleId = req.params.rescheduleId;
        const rescheduleRequest = await index_1.prisma.rescheduleRequest.findUnique({
            where: { id: rescheduleId },
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
        if (!rescheduleRequest) {
            return res.status(404).json({ message: 'Reschedule request not found' });
        }
        // Only the original requester can accept the counter
        if (rescheduleRequest.requestedBy !== userId) {
            return res.status(403).json({ message: 'Only the original requester can accept the counter-proposal' });
        }
        if (rescheduleRequest.status !== 'COUNTERED') {
            return res.status(400).json({ message: 'No counter-proposal to accept' });
        }
        // Update reschedule request status
        await index_1.prisma.rescheduleRequest.update({
            where: { id: rescheduleId },
            data: { status: 'ACCEPTED' },
        });
        // Update booking with counter-proposed schedule
        await index_1.prisma.booking.update({
            where: { id: rescheduleRequest.bookingId },
            data: {
                scheduledDate: rescheduleRequest.counterDate,
                scheduledTime: rescheduleRequest.counterTime,
                scheduledEndTime: rescheduleRequest.counterEndTime,
                tenantConfirmed: false,
                hunterConfirmed: false,
                physicalMeetingConfirmed: false,
            },
        });
        // Notify the other party
        await notificationService_1.NotificationService.sendNotification(rescheduleRequest.respondedBy, 'Counter-Proposal Accepted', `Your counter-proposal has been accepted. New date: ${new Date(rescheduleRequest.counterDate).toLocaleDateString()} at ${rescheduleRequest.counterTime}`, 'COUNTER_ACCEPTED', { bookingId: rescheduleRequest.bookingId });
        res.json({
            success: true,
            message: 'Counter-proposal accepted. Booking rescheduled.',
        });
    }
    catch (error) {
        console.error('Accept counter-proposal error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.acceptCounterProposal = acceptCounterProposal;
// Update meeting point
const updateMeetingPoint = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { type, location } = req.body;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                property: true,
                tenant: true,
                hunter: true,
                meetingPoint: true,
            },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Only hunter can update meeting point
        if (booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Only the hunter can update the meeting point' });
        }
        const locationData = typeof location === 'string' ? location : JSON.stringify(location);
        let meetingPoint;
        if (booking.meetingPoint) {
            // Update existing meeting point
            meetingPoint = await index_1.prisma.meetingPoint.update({
                where: { bookingId },
                data: {
                    type: type || booking.meetingPoint.type,
                    location: locationData,
                    sharedBy: userId,
                    sharedAt: new Date(),
                },
            });
        }
        else {
            // Create new meeting point
            meetingPoint = await index_1.prisma.meetingPoint.create({
                data: {
                    bookingId,
                    type: type || 'LANDMARK',
                    location: locationData,
                    sharedBy: userId,
                },
            });
        }
        // Notify tenant
        await notificationService_1.NotificationService.sendNotification(booking.tenantId, 'Meeting Point Updated', `The meeting point for your viewing has been shared.`, 'MEETING_POINT_UPDATED', { bookingId });
        res.json({
            success: true,
            message: 'Meeting point updated',
            meetingPoint,
        });
    }
    catch (error) {
        console.error('Update meeting point error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateMeetingPoint = updateMeetingPoint;
// Mark meeting point as viewed by tenant
const markMeetingPointViewed = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { meetingPoint: true },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (!booking.meetingPoint) {
            return res.status(404).json({ message: 'No meeting point set' });
        }
        await index_1.prisma.meetingPoint.update({
            where: { bookingId },
            data: {
                tenantViewed: true,
                tenantViewedAt: new Date(),
            },
        });
        res.json({ success: true, message: 'Meeting point marked as viewed' });
    }
    catch (error) {
        console.error('Mark meeting point viewed error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.markMeetingPointViewed = markMeetingPointViewed;
