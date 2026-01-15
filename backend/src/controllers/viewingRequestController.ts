import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { NotificationService } from '../services/notificationService';

const viewingRequestSchema = z.object({
    propertyId: z.string(),
    proposedDates: z.array(z.object({
        date: z.string(),
        timeSlot: z.string(),
    })),
    message: z.string().optional(),
    packageId: z.string(),
});

export const createRequest = async (req: any, res: Response) => {
    try {
        const validatedData = viewingRequestSchema.parse(req.body);
        const { propertyId, proposedDates, message, packageId } = validatedData;

        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { packages: true },
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const selectedPackage = property.packages.find((p: any) => p.id === packageId);
        if (!selectedPackage) {
            return res.status(400).json({ message: 'Invalid package selected' });
        }

        // PREVENT DUPLICATES: Check for existing pending requests
        const existingRequest = await prisma.viewingRequest.findFirst({
            where: {
                propertyId,
                tenantId: req.user.userId,
                status: { in: ['PENDING', 'COUNTERED'] }
            },
            include: { invoice: true }
        });

        if (existingRequest && existingRequest.invoice && existingRequest.invoice.status !== 'PAID') {
            return res.status(400).json({
                message: 'You already have a pending viewing request for this property.',
                existingRequest
            });
        }

        const viewingRequest = await prisma.viewingRequest.create({
            data: {
                propertyId,
                tenantId: req.user.userId,
                proposedDates,
                message,
                invoice: {
                    create: {
                        amount: selectedPackage.price,
                        status: 'UNPAID',
                    },
                },
            },
            include: {
                property: {
                    include: {
                        hunter: true,
                        packages: true
                    }
                },
                invoice: true, // CRITICAL: Must include invoice
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatarUrl: true
                    }
                }
            },
        });

        console.log('[ViewingRequest] Created:', viewingRequest.id, 'with Invoice:', viewingRequest.invoice?.id);

        // Notify hunter
        await NotificationService.sendNotification(
            viewingRequest.property.hunterId,
            'New Viewing Request',
            `A tenant has requested to view ${viewingRequest.property.title}.`,
            'NEW_VIEWING_REQUEST',
            { requestId: viewingRequest.id }
        );

        res.status(201).json(viewingRequest);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('[ViewingRequest] Create error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getRequests = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;

        const requests = await prisma.viewingRequest.findMany({
            where: role === 'HUNTER'
                ? { property: { hunterId: userId } }
                : { tenantId: userId },
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
                        phone: true,
                    },
                },
                invoice: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRequestById = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const request = await prisma.viewingRequest.findUnique({
            where: { id: req.params.id },
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
            },
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.tenantId !== userId && request.property.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// HUNTER ACCEPTS VIEWING REQUEST - Creates the booking
export const acceptViewingRequest = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { scheduledDate, scheduledTime } = req.body;

        const viewingRequest = await prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: {
                property: true,
                invoice: true,
            },
        });

        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (viewingRequest.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Only the assigned hunter can accept this request' });
        }

        if (!viewingRequest.invoice || viewingRequest.invoice.status !== 'ESCROW') {
            return res.status(400).json({ message: 'Payment must be completed  before acceptance' });
        }

        const proposedDates = viewingRequest.proposedDates as any[];
        const firstDate = proposedDates[0] || {};
        const finalDate = scheduledDate || firstDate.date || new Date().toISOString();
        const finalTime = scheduledTime || firstDate.timeSlot || '10:00';

        // Calculate end time (1 hour viewing window)
        const [hours, minutes] = finalTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        const scheduledEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Calculate auto-release timestamp (scheduled time + 1 hour + 10 minutes grace period)
        const autoReleaseDate = new Date(finalDate);
        autoReleaseDate.setHours(hours + 1, minutes + 10, 0, 0);

        // Lock the property (cannot be edited during active booking)
        await prisma.property.update({
            where: { id: viewingRequest.propertyId },
            data: { isLocked: true },
        });

        const booking = await prisma.booking.create({
            data: {
                propertyId: viewingRequest.propertyId,
                tenantId: viewingRequest.tenantId,
                hunterId: viewingRequest.property.hunterId,
                invoiceId: viewingRequest.invoice!.id,
                scheduledDate: finalDate,
                scheduledTime: finalTime,
                scheduledEndTime,
                autoReleaseAt: autoReleaseDate,
                status: 'CONFIRMED',
                chatEnabled: true,
            },
            include: {
                property: true,
                tenant: true,
                hunter: true,
            }
        });

        await prisma.viewingRequest.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });

        // NOTE: Hunter earnings are NOT created here!
        // They are created only when tenant confirms viewing completion
        // This ensures hunters are paid after service delivery

        // Notify tenant
        await NotificationService.sendNotification(
            viewingRequest.tenantId,
            'Viewing Request Accepted!',
            `Your request for ${viewingRequest.property.title} has been accepted for ${finalDate} at ${finalTime}.`,
            'VIEWING_REQUEST_ACCEPTED',
            { bookingId: booking.id }
        );

        res.json({
            success: true,
            message: 'Viewing request accepted! Booking created.',
            booking,
            viewingRequest: { ...viewingRequest, status: 'ACCEPTED' }
        });
    } catch (error: any) {
        console.error('Accept viewing request error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const rejectViewingRequest = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { reason } = req.body;

        const viewingRequest = await prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: {
                property: true,
                invoice: true,
            },
        });

        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (viewingRequest.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Only the assigned hunter can reject this request' });
        }

        await prisma.viewingRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                message: reason || 'Request rejected by hunter'
            }
        });

        await prisma.invoice.update({
            where: { id: viewingRequest.invoice?.id || '' },
            data: { status: 'REFUNDED' }
        });

        // Notify tenant
        await NotificationService.sendNotification(
            viewingRequest.tenantId,
            'Viewing Request Rejected',
            `Your request for ${viewingRequest.property.title} was rejected. Reason: ${reason || 'None provided'}`,
            'VIEWING_REQUEST_REJECTED',
            { requestId: viewingRequest.id }
        );

        res.json({
            success: true,
            message: 'Viewing request rejected. Tenant will be refunded.',
        });
    } catch (error: any) {
        console.error('Reject viewing request error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const counterViewingRequest = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { proposedDates, message } = req.body;

        const viewingRequest = await prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: { property: true },
        });

        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (viewingRequest.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Only the assigned hunter can counter this request' });
        }

        const updated = await prisma.viewingRequest.update({
            where: { id: requestId },
            data: {
                status: 'COUNTERED',
                proposedDates,
                message: message || 'Hunter proposed alternative date/time'
            },
            include: {
                property: true,
                tenant: true,
                invoice: true,
            }
        });

        res.json({
            success: true,
            message: 'Counter-proposal sent to tenant',
            viewingRequest: updated
        });
    } catch (error: any) {
        console.error('Counter viewing request error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateRequestStatus = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const { status } = req.body;

        if (!['ACCEPTED', 'REJECTED', 'COUNTERED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await prisma.viewingRequest.findUnique({
            where: { id: req.params.id },
            include: { property: true },
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Only hunters can update request status' });
        }

        const updatedRequest = await prisma.viewingRequest.update({
            where: { id: req.params.id },
            data: { status },
            include: { invoice: true },
        });

        res.json(updatedRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
