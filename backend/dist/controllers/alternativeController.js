"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineAlternative = exports.acceptAlternative = exports.offerAlternative = exports.requestAlternative = void 0;
const index_1 = require("../index");
const notificationService_1 = require("../services/notificationService");
// Request alternative property
const requestAlternative = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { preferences, reason } = req.body;
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
        // Only tenant can request alternative
        if (booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Only tenant can request alternative property' });
        }
        // Check if viewing outcome is ALTERNATIVE_REQUESTED
        if (booking.viewingOutcome !== 'ALTERNATIVE_REQUESTED') {
            return res.status(400).json({ message: 'Viewing outcome must be set to ALTERNATIVE_REQUESTED first' });
        }
        // Update booking with alternative request details
        await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                tenantFeedback: JSON.stringify({
                    type: 'ALTERNATIVE_REQUEST',
                    preferences: preferences || 'Looking for alternative property',
                    reason: reason || 'Property did not meet expectations',
                }),
            },
        });
        // Notify hunter
        await notificationService_1.NotificationService.sendNotification(booking.hunterId, 'Alternative Property Requested', `${booking.tenant.name} would like to see an alternative property. Original payment remains in escrow.`, 'ALTERNATIVE_REQUESTED', `/bookings/${bookingId}`);
        res.json({
            success: true,
            message: 'Alternative property request sent to hunter',
        });
    }
    catch (error) {
        console.error('Request alternative error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.requestAlternative = requestAlternative;
// Offer alternative property
const offerAlternative = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { propertyId, message } = req.body;
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
        // Only hunter can offer alternative
        if (booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Only hunter can offer alternative property' });
        }
        if (!propertyId) {
            return res.status(400).json({ message: 'Property ID is required' });
        }
        // Verify the property exists and belongs to the hunter
        const property = await index_1.prisma.property.findUnique({
            where: { id: propertyId },
        });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.hunterId !== userId) {
            return res.status(403).json({ message: 'You can only offer your own properties' });
        }
        // Create a new viewing request for the alternative property
        const viewingRequest = await index_1.prisma.viewingRequest.create({
            data: {
                propertyId,
                tenantId: booking.tenantId,
                proposedDates: JSON.stringify([{
                        date: new Date().toISOString().split('T')[0],
                        timeSlot: '10:00',
                    }]),
                message: message || 'Alternative property offered by hunter',
                status: 'PENDING',
            },
        });
        // Create AlternativeOffer record
        await index_1.prisma.alternativeOffer.create({
            data: {
                bookingId,
                propertyId,
                viewingRequestId: viewingRequest.id,
                message: message || 'Alternative property offered by hunter',
                status: 'PENDING',
            },
        });
        // Update original booking status
        await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'COMPLETED',
            },
        });
        // Notify tenant
        await notificationService_1.NotificationService.sendNotification(booking.tenantId, 'Alternative Property Offered', `${booking.hunter.name} has offered you an alternative property to view.`, 'ALTERNATIVE_OFFERED', `/viewing-requests/${viewingRequest.id}`);
        res.json({
            success: true,
            message: 'Alternative property offered',
            viewingRequest,
        });
    }
    catch (error) {
        console.error('Offer alternative error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.offerAlternative = offerAlternative;
// Accept alternative and transfer escrow
const acceptAlternative = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { viewingRequestId } = req.body;
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
        // Only tenant can accept alternative
        if (booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Only tenant can accept alternative' });
        }
        // Verify viewing request exists
        const viewingRequest = await index_1.prisma.viewingRequest.findUnique({
            where: { id: viewingRequestId },
            include: {
                property: true,
            },
        });
        if (!viewingRequest) {
            return res.status(404).json({ message: 'Viewing request not found' });
        }
        // Accept the viewing request and create new booking with same amount
        await index_1.prisma.viewingRequest.update({
            where: { id: viewingRequestId },
            data: { status: 'ACCEPTED' },
        });
        // Parse proposed dates to get the first one
        const proposedDates = JSON.parse(viewingRequest.proposedDates);
        const firstProposed = proposedDates[0] || { date: new Date().toISOString().split('T')[0], timeSlot: '10:00' };
        // Create new booking with transferred escrow
        const newBooking = await index_1.prisma.booking.create({
            data: {
                propertyId: viewingRequest.propertyId,
                tenantId: booking.tenantId,
                hunterId: booking.hunterId,
                amount: booking.amount, // Transfer same amount
                paymentStatus: 'ESCROW', // Keep in escrow
                scheduledDate: firstProposed.date,
                scheduledTime: firstProposed.timeSlot,
                scheduledEndTime: firstProposed.timeSlot, // Will be calculated
                status: 'CONFIRMED',
                chatEnabled: true,
            },
        });
        // Update original booking
        await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'COMPLETED',
                paymentStatus: 'RELEASED', // Mark as released (transferred)
            },
        });
        // Update AlternativeOffer status
        await index_1.prisma.alternativeOffer.update({
            where: { viewingRequestId },
            data: { status: 'ACCEPTED' },
        });
        // Lock the new property
        await index_1.prisma.property.update({
            where: { id: viewingRequest.propertyId },
            data: { isLocked: true },
        });
        // Unlock the old property
        await index_1.prisma.property.update({
            where: { id: booking.propertyId },
            data: { isLocked: false },
        });
        // Notify hunter
        await notificationService_1.NotificationService.sendNotification(booking.hunterId, 'Alternative Accepted', `${booking.tenant.name} has accepted the alternative property. Escrow transferred to new booking.`, 'ALTERNATIVE_ACCEPTED', `/bookings/${newBooking.id}`);
        res.json({
            success: true,
            message: 'Alternative property accepted. Escrow transferred to new booking.',
            newBooking,
        });
    }
    catch (error) {
        console.error('Accept alternative error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.acceptAlternative = acceptAlternative;
// Decline alternative and request refund
const declineAlternative = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { reason } = req.body;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                property: true,
                tenant: true,
                hunter: true,
                alternativeOffers: {
                    where: { status: 'PENDING' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Only tenant can decline alternative
        if (booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Only tenant can decline alternative' });
        }
        // Update AlternativeOffer status if exists
        if (booking.alternativeOffers.length > 0) {
            await index_1.prisma.alternativeOffer.update({
                where: { id: booking.alternativeOffers[0].id },
                data: { status: 'DECLINED' },
            });
        }
        // Create dispute for refund
        await index_1.prisma.dispute.create({
            data: {
                title: `Refund Request - Alternative Declined`,
                description: reason || 'Tenant declined alternative property and requests refund',
                category: 'MISREPRESENTATION',
                reporterId: booking.tenantId,
                againstId: booking.hunterId,
                bookingId: booking.id,
                propertyId: booking.propertyId,
                status: 'OPEN',
            },
        });
        // Update booking
        await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
            },
        });
        // Notify admin
        await notificationService_1.NotificationService.sendNotification('ADMIN', 'Refund Request', `Tenant declined alternative property and requests refund for booking ${bookingId}`, 'REFUND_REQUESTED', `/admin/disputes`);
        res.json({
            success: true,
            message: 'Alternative declined. Refund request submitted for admin review.',
        });
    }
    catch (error) {
        console.error('Decline alternative error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.declineAlternative = declineAlternative;
