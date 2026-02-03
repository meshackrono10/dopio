"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideRequest = exports.updateRequestStatus = exports.counterViewingRequest = exports.rejectViewingRequest = exports.acceptViewingRequest = exports.getRequestById = exports.getRequests = exports.createRequest = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
const notificationService_1 = require("../services/notificationService");
const viewingRequestSchema = zod_1.z.object({
    propertyId: zod_1.z.string(),
    proposedDates: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string(),
        timeSlot: zod_1.z.string(),
    })),
    message: zod_1.z.string().optional(),
    packageId: zod_1.z.string(),
    proposedLocation: zod_1.z.string().optional(),
});
const createRequest = async (req, res) => {
    try {
        const validatedData = viewingRequestSchema.parse(req.body);
        const { propertyId, proposedDates, message, packageId, proposedLocation } = validatedData;
        const property = await index_1.prisma.property.findUnique({
            where: { id: propertyId },
            include: { packages: true },
        });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.status === 'RENTED') {
            return res.status(400).json({ message: 'This property has already been booked and is no longer available for viewing.' });
        }
        const selectedPackage = property.packages.find((p) => p.id === packageId);
        if (!selectedPackage) {
            return res.status(400).json({ message: 'Invalid package selected' });
        }
        // PREVENT DUPLICATES: Check for existing pending requests
        const existingRequest = await index_1.prisma.viewingRequest.findFirst({
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
        const viewingRequest = await index_1.prisma.viewingRequest.create({
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
        await notificationService_1.NotificationService.sendNotification(viewingRequest.property.hunterId, 'New Viewing Request', `A tenant has requested to view ${viewingRequest.property.title}.`, 'NEW_VIEWING_REQUEST', `/viewing-requests/${viewingRequest.id}`);
        res.status(201).json(viewingRequest);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('[ViewingRequest] Create error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createRequest = createRequest;
const getRequests = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const requests = await index_1.prisma.viewingRequest.findMany({
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
                property.images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
                property.location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;
                property.amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities;
                property.videos = typeof property.videos === 'string' ? JSON.parse(property.videos) : property.videos;
            }
            return {
                ...req,
                proposedDates: typeof req.proposedDates === 'string' ? JSON.parse(req.proposedDates) : req.proposedDates,
                counterLocation: typeof req.counterLocation === 'string' ? JSON.parse(req.counterLocation) : req.counterLocation,
                proposedLocation: typeof req.proposedLocation === 'string' ? JSON.parse(req.proposedLocation) : req.proposedLocation,
            };
        });
        res.json(processedRequests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRequests = getRequests;
const getRequestById = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const request = await index_1.prisma.viewingRequest.findUnique({
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
                booking: {
                    include: {
                        reviews: true
                    }
                },
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
            property.images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
            property.location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;
            property.amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities;
            property.videos = typeof property.videos === 'string' ? JSON.parse(property.videos) : property.videos;
        }
        const responseData = {
            ...request,
            proposedDates: typeof request.proposedDates === 'string' ? JSON.parse(request.proposedDates) : request.proposedDates,
            counterLocation: typeof request.counterLocation === 'string' ? JSON.parse(request.counterLocation) : request.counterLocation,
            proposedLocation: typeof request.proposedLocation === 'string' ? JSON.parse(request.proposedLocation) : request.proposedLocation,
        };
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRequestById = getRequestById;
// HUNTER OR TENANT ACCEPTS VIEWING REQUEST - Creates the booking
const acceptViewingRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { scheduledDate, scheduledTime, location } = req.body;
        const viewingRequest = await index_1.prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: {
                property: true,
            },
        });
        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }
        // Only the person who DID NOT counter can accept
        if (viewingRequest.counteredBy === userId) {
            return res.status(403).json({ message: 'You cannot accept your own counter-offer' });
        }
        if (viewingRequest.paymentStatus !== 'ESCROW') {
            return res.status(400).json({ message: 'Payment must be in escrow before acceptance' });
        }
        const proposedDatesArr = typeof viewingRequest.proposedDates === 'string'
            ? JSON.parse(viewingRequest.proposedDates)
            : viewingRequest.proposedDates;
        const finalDate = scheduledDate || viewingRequest.counterDate || proposedDatesArr[0]?.date;
        const finalTime = scheduledTime || viewingRequest.counterTime || proposedDatesArr[0]?.timeSlot;
        const finalLocation = location || viewingRequest.counterLocation;
        if (!finalDate || !finalTime) {
            return res.status(400).json({ message: 'Scheduled date and time are required' });
        }
        // Calculate end time (1 hour viewing window)
        const [hours, minutes] = finalTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        const scheduledEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        // Calculate auto-release timestamp (scheduled time + 1 hour + 10 minutes grace period)
        const autoReleaseDate = new Date(finalDate);
        autoReleaseDate.setHours(hours + 1, minutes + 10, 0, 0);
        // Lock the property
        await index_1.prisma.property.update({
            where: { id: viewingRequest.propertyId },
            data: { isLocked: true },
        });
        // Parse location if it's a JSON string
        let locationData = null;
        if (finalLocation) {
            try {
                locationData = typeof finalLocation === 'string'
                    ? JSON.parse(finalLocation)
                    : finalLocation;
            }
            catch (error) {
                console.error('Error parsing location:', error);
                locationData = { name: finalLocation, location: finalLocation };
            }
        }
        const booking = await index_1.prisma.booking.create({
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
        await index_1.prisma.viewingRequest.update({
            where: { id: requestId },
            data: {
                status: 'ACCEPTED',
                bookingId: booking.id
            }
        });
        // Notify both parties
        await notificationService_1.NotificationService.sendNotification(viewingRequest.tenantId, 'Viewing Confirmed!', `Your viewing for ${viewingRequest.property.title} is confirmed for ${finalDate} at ${finalTime}.`, 'VIEWING_CONFIRMED', `/bookings/${booking.id}`);
        res.json({
            success: true,
            message: 'Viewing confirmed! Booking created.',
            booking,
        });
    }
    catch (error) {
        console.error('Accept viewing request error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.acceptViewingRequest = acceptViewingRequest;
const rejectViewingRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { reason } = req.body;
        const viewingRequest = await index_1.prisma.viewingRequest.findUnique({
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
            const booking = await index_1.prisma.booking.findUnique({
                where: { id: viewingRequest.bookingId }
            });
            if (booking?.physicalMeetingConfirmed && isTenant) {
                return res.status(403).json({ message: 'Tenants cannot cancel after the meetup has been confirmed' });
            }
        }
        await index_1.prisma.viewingRequest.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                message: reason || (isTenant ? 'Request cancelled by tenant' : 'Request rejected by hunter')
            }
        });
        // If a booking exists, cancel it too
        if (viewingRequest.bookingId) {
            await index_1.prisma.booking.update({
                where: { id: viewingRequest.bookingId },
                data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' }
            });
            // Unlock property
            await index_1.prisma.property.update({
                where: { id: viewingRequest.propertyId },
                data: { isLocked: false },
            });
        }
        // If payment was made but no booking yet (unlikely in current flow but safe), mark for refund
        if (!viewingRequest.bookingId && (viewingRequest.paymentStatus === 'ESCROW' || viewingRequest.paymentStatus === 'PAID')) {
            await index_1.prisma.viewingRequest.update({
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
        await notificationService_1.NotificationService.sendNotification(recipientId, notificationTitle, notificationBody, isTenant ? 'VIEWING_REQUEST_CANCELLED' : 'VIEWING_REQUEST_REJECTED', `/viewing-requests/${viewingRequest.id}`);
        res.json({
            success: true,
            message: `Viewing request ${isTenant ? 'cancelled' : 'rejected'}.`,
        });
    }
    catch (error) {
        console.error('Reject viewing request error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.rejectViewingRequest = rejectViewingRequest;
const counterViewingRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const requestId = req.params.id;
        const { date, time, location, message } = req.body;
        const viewingRequest = await index_1.prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: { property: true },
        });
        if (!viewingRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (viewingRequest.property.hunterId !== userId && viewingRequest.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const updated = await index_1.prisma.viewingRequest.update({
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
        await notificationService_1.NotificationService.sendNotification(recipientId, 'New Counter-Offer', `A counter-offer has been proposed for ${viewingRequest.property.title}.`, 'VIEWING_REQUEST_COUNTERED', `/viewing-requests/${updated.id}`);
        res.json({
            success: true,
            message: 'Counter-proposal sent',
            viewingRequest: updated
        });
    }
    catch (error) {
        console.error('Counter viewing request error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.counterViewingRequest = counterViewingRequest;
const updateRequestStatus = async (req, res) => {
    try {
        const { userId } = req.user;
        const { status } = req.body;
        if (!['ACCEPTED', 'REJECTED', 'COUNTERED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const request = await index_1.prisma.viewingRequest.findUnique({
            where: { id: req.params.id },
            include: { property: true },
        });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Only hunters can update request status' });
        }
        const updatedRequest = await index_1.prisma.viewingRequest.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(updatedRequest);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateRequestStatus = updateRequestStatus;
const hideRequest = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const requestId = req.params.id;
        const request = await index_1.prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: { property: true }
        });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.tenantId !== userId && request.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const data = {};
        if (role === 'HUNTER') {
            data.hunterVisible = false;
        }
        else {
            data.tenantVisible = false;
        }
        await index_1.prisma.viewingRequest.update({
            where: { id: requestId },
            data
        });
        res.json({ success: true, message: 'Request hidden successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.hideRequest = hideRequest;
