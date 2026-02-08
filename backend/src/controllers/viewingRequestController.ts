import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { NotificationService } from '../services/notificationService';
import { validatePackageAvailability } from '../services/packageAvailabilityService';

// Safe JSON parse helper - returns value as-is if it's not valid JSON
const safeParse = (value: any) => {
    if (!value) return value;
    if (typeof value !== 'string') return value;

    try {
        return JSON.parse(value);
    } catch (error) {
        // If it's not valid JSON, return the string as-is
        return value;
    }
};

const viewingRequestSchema = z.object({
    propertyId: z.string(),
    proposedDates: z.array(z.object({
        date: z.string(),
        timeSlot: z.string(),
    })),
    message: z.string().optional(),
    packageId: z.string(),
    proposedLocation: z.string().optional(),
});

export const createRequest = async (req: any, res: Response) => {
    try {
        const validatedData = viewingRequestSchema.parse(req.body);
        const { propertyId, proposedDates, message, packageId, proposedLocation } = validatedData;

        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { packages: true },
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.status === 'RENTED') {
            return res.status(400).json({ message: 'This property has already been booked and is no longer available for viewing.' });
        }

        const selectedPackage = property.packages.find((p: any) => p.id === packageId);
        if (!selectedPackage) {
            return res.status(400).json({ message: 'Invalid package selected' });
        }

        // Validate that the package is actually available
        const validation = await validatePackageAvailability(propertyId, packageId);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.reason || 'This package is no longer available' });
        }

        // PREVENT DUPLICATES: Check for existing pending requests
        const existingRequest = await prisma.viewingRequest.findFirst({
            where: {
                propertyId,
                tenantId: req.user.userId,
                status: { in: ['PENDING', 'COUNTERED'] }
            }
        });

        if (existingRequest && existingRequest.paymentStatus !== 'PAID' && existingRequest.paymentStatus !== 'ESCROW') {
            return res.status(400).json({
                message: 'You already have a pending viewing request for this property.',
                existingRequest
            });
        }

        const viewingRequest = await prisma.viewingRequest.create({
            data: {
                propertyId,
                tenantId: req.user.userId,
                proposedDates: JSON.stringify(proposedDates),
                proposedLocation,
                message,
                amount: selectedPackage.price,
                packageId,
                paymentStatus: 'UNPAID', // Will be updated by payment controller
            },
            include: {
                property: {
                    include: {
                        hunter: true,
                    }
                },
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

        console.log('[ViewingRequest] Created:', viewingRequest.id, 'Amount:', viewingRequest.amount);

        // Notify hunter
        await NotificationService.sendNotification(
            viewingRequest.property.hunterId,
            'New Viewing Request',
            `A tenant has requested to view ${viewingRequest.property.title}.`,
            'NEW_VIEWING_REQUEST',
            `/viewing-requests/${viewingRequest.id}`
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
                ? { property: { hunterId: userId }, hunterVisible: true }
                : { tenantId: userId, tenantVisible: true },
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
                        packageMembers: true,
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
                booking: {
                    include: {
                        reviews: true
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const processedRequests = requests.map(req => {
            const property = req.property;
            if (property) {
                property.images = safeParse(property.images);
                property.location = safeParse(property.location);
                property.amenities = safeParse(property.amenities);
                property.videos = safeParse(property.videos);

                if (Array.isArray(property.packageMembers)) {
                    property.packageMembers = property.packageMembers.map((member: any) => ({
                        ...member,
                        images: safeParse(member.images),
                        location: safeParse(member.location)
                    }));
                }
            }
            return {
                ...req,
                proposedDates: safeParse(req.proposedDates),
                counterLocation: safeParse(req.counterLocation),
                proposedLocation: safeParse(req.proposedLocation),
            };
        });

        res.json(processedRequests);
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
                        packageMembers: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                booking: true,
            },
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.tenantId !== userId && request.property.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const property = request.property;
        if (property) {
            property.images = safeParse(property.images);
            property.location = safeParse(property.location);
            property.amenities = safeParse(property.amenities);
            property.videos = safeParse(property.videos);

            if (Array.isArray(property.packageMembers)) {
                property.packageMembers = property.packageMembers.map((member: any) => ({
                    ...member,
                    images: safeParse(member.images),
                    location: safeParse(member.location)
                }));
            }
        }

        const responseData = {
            ...request,
            proposedDates: safeParse(request.proposedDates),
            counterLocation: safeParse(request.counterLocation),
            proposedLocation: safeParse(request.proposedLocation),
        };

        res.json(responseData);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// HUNTER OR TENANT ACCEPTS VIEWING REQUEST - Creates the booking
export const acceptViewingRequest = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { scheduledDate, scheduledTime, location } = req.body;

        console.log(`[ViewingRequest] Accept attempt for ID: ${requestId} by user: ${userId}`, { scheduledDate, scheduledTime, location });

        const viewingRequest = await prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: {
                property: true,
            },
        });

        if (!viewingRequest) {
            console.error(`[ViewingRequest] Request ${requestId} not found`);
            return res.status(404).json({ message: 'Request not found' });
        }

        // Only the person who DID NOT counter can accept
        if (viewingRequest.counteredBy === userId) {
            return res.status(403).json({ message: 'You cannot accept your own counter-offer' });
        }

        if (viewingRequest.paymentStatus !== 'ESCROW' && viewingRequest.paymentStatus !== 'PAID') {
            return res.status(400).json({ message: 'Payment must be in escrow or paid before acceptance' });
        }

        const proposedDatesArr = safeParse(viewingRequest.proposedDates) || [];
        const firstProposed = proposedDatesArr[0] || {};

        // Robust date/time selection: Priority Body > Counter > Proposed
        const finalDate = scheduledDate || viewingRequest.counterDate || firstProposed.date;
        const finalTime = scheduledTime || viewingRequest.counterTime || firstProposed.timeSlot;
        const finalLocation = location || viewingRequest.counterLocation || viewingRequest.proposedLocation;

        console.log(`[ViewingRequest] Resolved schedule for ${requestId}:`, { finalDate, finalTime, finalLocation });

        if (!finalDate || !finalTime) {
            console.error(`[ViewingRequest] Missing schedule for ${requestId}. Proposed:`, viewingRequest.proposedDates);
            return res.status(400).json({ message: 'Valid date and time are required to accept the request' });
        }

        // Calculate end time (1 hour viewing window)
        const [hours, minutes] = finalTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        const scheduledEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Calculate auto-release timestamp (scheduled time + 1 hour + 10 minutes grace period)
        const autoReleaseDate = new Date(finalDate);
        autoReleaseDate.setHours(hours + 1, minutes + 10, 0, 0);

        // Lock the property
        await prisma.property.update({
            where: { id: viewingRequest.propertyId },
            data: { isLocked: true },
        });

        // Parse location if it's a JSON string
        let locationData: any = null;
        if (finalLocation) {
            try {
                locationData = typeof finalLocation === 'string'
                    ? JSON.parse(finalLocation)
                    : finalLocation;
            } catch (error) {
                console.error('Error parsing location:', error);
                locationData = { name: finalLocation, location: finalLocation };
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: {
                    propertyId: viewingRequest.propertyId,
                    tenantId: viewingRequest.tenantId,
                    hunterId: viewingRequest.property.hunterId,
                    amount: viewingRequest.amount || 0,
                    paymentStatus: 'ESCROW',
                    scheduledDate: finalDate,
                    scheduledTime: finalTime,
                    scheduledEndTime,
                    autoReleaseAt: autoReleaseDate,
                    status: 'CONFIRMED',
                    chatEnabled: true,
                    meetingPoint: locationData ? {
                        create: {
                            type: locationData.type || 'LANDMARK',
                            location: JSON.stringify(locationData.location || locationData),
                            sharedBy: viewingRequest.property.hunterId,
                        }
                    } : undefined,
                },
                include: {
                    property: true,
                    tenant: true,
                    hunter: true,
                }
            });

            console.log(`[ViewingRequest] Booking created: ${booking.id} for request: ${requestId}`);

            const updatedRequest = await tx.viewingRequest.update({
                where: { id: requestId },
                data: {
                    status: 'ACCEPTED',
                    bookingId: booking.id
                }
            });

            return { booking, updatedRequest };
        });

        console.log(`[ViewingRequest] ✅ Transaction SUCCESS: Booking ${result.booking.id} created with status "${result.booking.status}" for request ${requestId}`);

        // Notify both parties
        await NotificationService.sendNotification(
            viewingRequest.tenantId,
            'Viewing Confirmed!',
            `Your viewing for ${viewingRequest.property.title} is confirmed for ${finalDate} at ${finalTime}.`,
            'VIEWING_CONFIRMED',
            `/bookings/${result.booking.id}`
        );

        res.json({
            success: true,
            message: 'Viewing confirmed! Booking created.',
            booking: result.booking,
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
            },
        });

        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (viewingRequest.property.hunterId !== userId && viewingRequest.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const isTenant = viewingRequest.tenantId === userId;
        const newStatus = isTenant ? 'CANCELLED' : 'REJECTED';

        // POST-MEETUP RESTRICTION for rejectViewingRequest (fallback)
        if (viewingRequest.bookingId) {
            const booking = await prisma.booking.findUnique({
                where: { id: viewingRequest.bookingId }
            });
            if (booking?.physicalMeetingConfirmed && isTenant) {
                return res.status(403).json({ message: 'Tenants cannot cancel after the meetup has been confirmed' });
            }
        }

        await prisma.viewingRequest.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                message: reason || (isTenant ? 'Request cancelled by tenant' : 'Request rejected by hunter')
            }
        });

        // If a booking exists, cancel it too
        if (viewingRequest.bookingId) {
            await prisma.booking.update({
                where: { id: viewingRequest.bookingId },
                data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' }
            });

            // Unlock property
            await prisma.property.update({
                where: { id: viewingRequest.propertyId },
                data: { isLocked: false },
            });
        }

        // If payment was made but no booking yet (unlikely in current flow but safe), mark for refund
        if (!viewingRequest.bookingId && (viewingRequest.paymentStatus === 'ESCROW' || viewingRequest.paymentStatus === 'PAID')) {
            await prisma.viewingRequest.update({
                where: { id: requestId },
                data: { paymentStatus: 'REFUNDED' }
            });
        }

        // Notify other party
        const recipientId = isTenant ? viewingRequest.property.hunterId : viewingRequest.tenantId;
        const notificationTitle = isTenant ? 'Viewing Request Cancelled' : 'Viewing Request Rejected';
        const notificationBody = isTenant
            ? `The tenant has cancelled the request for ${viewingRequest.property.title}.`
            : `The request for ${viewingRequest.property.title} was rejected by the hunter.`;

        await NotificationService.sendNotification(
            recipientId,
            notificationTitle,
            notificationBody,
            isTenant ? 'VIEWING_REQUEST_CANCELLED' : 'VIEWING_REQUEST_REJECTED',
            `/viewing-requests/${viewingRequest.id}`
        );

        res.json({
            success: true,
            message: `Viewing request ${isTenant ? 'cancelled' : 'rejected'}.`,
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
        const { date, time, location, message } = req.body;

        const viewingRequest = await prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: { property: true },
        });

        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (viewingRequest.property.hunterId !== userId && viewingRequest.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await prisma.viewingRequest.update({
            where: { id: requestId },
            data: {
                status: 'COUNTERED',
                counterDate: date,
                counterTime: time,
                counterLocation: typeof location === 'object' ? JSON.stringify(location) : location,
                counteredBy: userId,
                message: message || 'Alternative proposed'
            },
            include: {
                property: true,
                tenant: true,
            }
        });

        // Notify other party
        const recipientId = userId === viewingRequest.tenantId ? viewingRequest.property.hunterId : viewingRequest.tenantId;
        await NotificationService.sendNotification(
            recipientId,
            'New Counter-Offer',
            `A counter-offer has been proposed for ${viewingRequest.property.title}.`,
            'VIEWING_REQUEST_COUNTERED',
            `/viewing-requests/${updated.id}`
        );

        res.json({
            success: true,
            message: 'Counter-proposal sent',
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

        if (!['ACCEPTED', 'REJECTED', 'COUNTERED', 'CANCELLED'].includes(status)) {
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
        });

        res.json(updatedRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const hideRequest = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const requestId = req.params.id;

        const request = await prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: { property: true }
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.tenantId !== userId && request.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data: any = {};
        if (role === 'HUNTER') {
            data.hunterVisible = false;
        } else {
            data.tenantVisible = false;
        }

        await prisma.viewingRequest.update({
            where: { id: requestId },
            data
        });

        // Also hide linked booking if it exists
        if (request.bookingId) {
            await prisma.booking.update({
                where: { id: request.bookingId },
                data
            });
        }

        res.json({ success: true, message: 'Request hidden successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
