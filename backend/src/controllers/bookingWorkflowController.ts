import { Response } from 'express';
import { prisma } from '../index';
import { NotificationService } from '../services/notificationService';

// Confirm arrival at viewing location
export const confirmArrival = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;

        const booking = await prisma.booking.findUnique({
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
        const updateData: any = {};

        if (isTenant) {
            updateData.tenantConfirmed = true;
        } else {
            updateData.hunterConfirmed = true;
        }

        // If both have confirmed, mark physical meeting as confirmed
        if ((isTenant && booking.hunterConfirmed) || (!isTenant && booking.tenantConfirmed)) {
            updateData.physicalMeetingConfirmed = true;
            updateData.actualStartTime = new Date();
        }

        const updated = await prisma.booking.update({
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
        await NotificationService.sendNotification(
            recipientId,
            'Arrival Confirmed',
            `${isTenant ? booking.tenant.name : booking.hunter.name} has confirmed arrival at the viewing location.`,
            'ARRIVAL_CONFIRMED',
            `/bookings/${updated.id}`
        );

        res.json({
            success: true,
            message: 'Arrival confirmed',
            booking: updated,
            physicalMeetingConfirmed: updated.physicalMeetingConfirmed,
        });
    } catch (error: any) {
        console.error('Confirm arrival error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Complete viewing with outcome
export const completeViewing = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { outcome, feedback, evidence } = req.body;

        const booking = await prisma.booking.findUnique({
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

        const updateData: any = {
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
            await prisma.hunterEarnings.create({
                data: {
                    hunterId: booking.hunterId,
                    bookingId: booking.id,
                    amount: hunterEarnings,
                    status: 'PENDING',
                },
            });

            // Unlock the property
            await prisma.property.update({
                where: { id: booking.propertyId },
                data: { isLocked: false },
            });

            // Notify hunter of payment
            await NotificationService.sendNotification(
                booking.hunterId,
                'Payment Released',
                `Payment of KES ${hunterEarnings.toLocaleString()} has been released for viewing at ${booking.property.title}.`,
                'PAYMENT_RELEASED',
                `/wallet`
            );
        } else if (outcome === 'ISSUE_REPORTED') {
            // Create dispute
            await prisma.dispute.create({
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
            await NotificationService.sendNotification(
                'ADMIN',
                'New Dispute',
                `A viewing issue has been reported for ${booking.property.title}.`,
                'DISPUTE_CREATED',
                `/admin/disputes`
            );
        }

        const updated = await prisma.booking.update({
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
    } catch (error: any) {
        console.error('Complete viewing error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Report no-show
export const reportNoShow = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const bookingId = req.params.id;
        const { reason } = req.body;

        const booking = await prisma.booking.findUnique({
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
        await prisma.dispute.create({
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
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                viewingOutcome: 'ISSUE_REPORTED',
            },
        });

        // Notify admin
        await NotificationService.sendNotification(
            'ADMIN',
            'No-Show Reported',
            `A no-show has been reported for viewing at ${booking.property.title}.`,
            'NO_SHOW_REPORTED',
            `/admin/disputes`
        );

        res.json({
            success: true,
            message: 'No-show reported. Admin will review and process refund if applicable.',
        });
    } catch (error: any) {
        console.error('Report no-show error:', error);
        res.status(500).json({ message: error.message });
    }
};
