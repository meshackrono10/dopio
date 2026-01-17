"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportNoShow = exports.completeViewing = exports.confirmArrival = void 0;
const index_1 = require("../index");
const notificationService_1 = require("../services/notificationService");
// Confirm arrival at viewing location
const confirmArrival = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
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
        // Determine which party is confirming
        const isTenant = booking.tenantId === userId;
        const updateData = {};
        if (isTenant) {
            updateData.tenantConfirmed = true;
        }
        else {
            updateData.hunterConfirmed = true;
        }
        // If both have confirmed, mark physical meeting as confirmed
        if ((isTenant && booking.hunterConfirmed) || (!isTenant && booking.tenantConfirmed)) {
            updateData.physicalMeetingConfirmed = true;
            updateData.actualStartTime = new Date();
        }
        const updated = await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
            include: {
                property: true,
                tenant: true,
                hunter: true,
            },
        });
        // Notify the other party
        const recipientId = isTenant ? booking.hunterId : booking.tenantId;
        await notificationService_1.NotificationService.sendNotification(recipientId, 'Arrival Confirmed', `${isTenant ? booking.tenant.name : booking.hunter.name} has confirmed arrival at the viewing location.`, 'ARRIVAL_CONFIRMED', { bookingId: updated.id });
        res.json({
            success: true,
            message: 'Arrival confirmed',
            booking: updated,
            physicalMeetingConfirmed: updated.physicalMeetingConfirmed,
        });
    }
    catch (error) {
        console.error('Confirm arrival error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.confirmArrival = confirmArrival;
// Complete viewing with outcome
const completeViewing = async (req, res) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { outcome, feedback, evidence } = req.body;
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
        // Only tenant can submit viewing outcome
        if (booking.tenantId !== userId) {
            return res.status(403).json({ message: 'Only tenant can submit viewing outcome' });
        }
        // Validate outcome
        if (!['COMPLETED_SATISFIED', 'ISSUE_REPORTED', 'ALTERNATIVE_REQUESTED'].includes(outcome)) {
            return res.status(400).json({ message: 'Invalid outcome' });
        }
        const updateData = {
            viewingOutcome: outcome,
            outcomeSubmittedAt: new Date(),
            actualEndTime: new Date(),
            status: 'COMPLETED',
        };
        if (feedback) {
            updateData.tenantFeedback = feedback;
        }
        if (evidence && outcome === 'ISSUE_REPORTED') {
            updateData.issueEvidence = JSON.stringify(evidence);
        }
        // Handle payment based on outcome
        if (outcome === 'COMPLETED_SATISFIED') {
            // Release payment to hunter
            updateData.paymentStatus = 'RELEASED';
            // Calculate commission (15%)
            const commission = booking.amount * 0.15;
            const hunterEarnings = booking.amount * 0.85;
            // Create hunter earnings record
            await index_1.prisma.hunterEarnings.create({
                data: {
                    hunterId: booking.hunterId,
                    bookingId: booking.id,
                    amount: hunterEarnings,
                    status: 'PENDING',
                },
            });
            // Unlock the property
            await index_1.prisma.property.update({
                where: { id: booking.propertyId },
                data: { isLocked: false },
            });
            // Notify hunter of payment
            await notificationService_1.NotificationService.sendNotification(booking.hunterId, 'Payment Released', `Payment of KES ${hunterEarnings.toLocaleString()} has been released for viewing at ${booking.property.title}.`, 'PAYMENT_RELEASED', { bookingId: booking.id });
        }
        else if (outcome === 'ISSUE_REPORTED') {
            // Create dispute
            await index_1.prisma.dispute.create({
                data: {
                    title: `Viewing Issue - ${booking.property.title}`,
                    description: feedback || 'Issue reported with viewing',
                    category: 'MISREPRESENTATION',
                    reporterId: booking.tenantId,
                    againstId: booking.hunterId,
                    bookingId: booking.id,
                    propertyId: booking.propertyId,
                    evidenceUrls: evidence ? JSON.stringify(evidence) : null,
                    status: 'OPEN',
                },
            });
            // Notify admin
            await notificationService_1.NotificationService.sendNotification('ADMIN', 'New Dispute', `A viewing issue has been reported for ${booking.property.title}.`, 'DISPUTE_CREATED', { bookingId: booking.id });
        }
        const updated = await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
            include: {
                property: true,
                tenant: true,
                hunter: true,
            },
        });
        res.json({
            success: true,
            message: 'Viewing outcome submitted',
            booking: updated,
        });
    }
    catch (error) {
        console.error('Complete viewing error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.completeViewing = completeViewing;
// Report no-show
const reportNoShow = async (req, res) => {
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
            },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Check if user is part of this booking
        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const isTenant = booking.tenantId === userId;
        const noShowParty = isTenant ? 'HUNTER' : 'TENANT';
        // Create dispute for no-show
        await index_1.prisma.dispute.create({
            data: {
                title: `No-Show Report - ${booking.property.title}`,
                description: reason || `${noShowParty} did not show up for scheduled viewing`,
                category: noShowParty === 'HUNTER' ? 'NO_SHOW_HUNTER' : 'NO_SHOW_TENANT',
                reporterId: userId,
                againstId: isTenant ? booking.hunterId : booking.tenantId,
                bookingId: booking.id,
                propertyId: booking.propertyId,
                status: 'OPEN',
            },
        });
        // Update booking status
        await index_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                viewingOutcome: 'ISSUE_REPORTED',
            },
        });
        // Notify admin
        await notificationService_1.NotificationService.sendNotification('ADMIN', 'No-Show Reported', `A no-show has been reported for viewing at ${booking.property.title}.`, 'NO_SHOW_REPORTED', { bookingId: booking.id });
        res.json({
            success: true,
            message: 'No-show reported. Admin will review and process refund if applicable.',
        });
    }
    catch (error) {
        console.error('Report no-show error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.reportNoShow = reportNoShow;
