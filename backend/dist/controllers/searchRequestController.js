"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBidsForRequest = exports.acceptBid = exports.submitBid = exports.getSearchRequests = exports.createSearchRequest = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
const notificationService_1 = require("../services/notificationService");
const searchRequestSchema = zod_1.z.object({
    preferredAreas: zod_1.z.array(zod_1.z.string()),
    minRent: zod_1.z.number(),
    maxRent: zod_1.z.number(),
    propertyType: zod_1.z.string(),
    bathrooms: zod_1.z.number(),
    furnished: zod_1.z.string(),
    petFriendly: zod_1.z.boolean(),
    parkingRequired: zod_1.z.boolean(),
    amenities: zod_1.z.array(zod_1.z.string()),
    serviceTier: zod_1.z.enum(['STANDARD', 'PREMIUM', 'URGENT']),
    numberOfOptions: zod_1.z.number(),
    depositAmount: zod_1.z.number(),
});
const bidSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    message: zod_1.z.string().optional(),
    timeframe: zod_1.z.number().positive(), // hours
    bonuses: zod_1.z.array(zod_1.z.string()).optional(),
});
// Create search request
const createSearchRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const validatedData = searchRequestSchema.parse(req.body);
        const searchRequest = await index_1.prisma.searchRequest.create({
            data: {
                ...validatedData,
                preferredAreas: JSON.stringify(validatedData.preferredAreas),
                amenities: JSON.stringify(validatedData.amenities),
                tenantId: userId,
                status: 'DRAFT',
                // Default required fields not in form
                leaseDuration: 'monthly',
                securityFeatures: JSON.stringify([]),
                utilitiesIncluded: JSON.stringify([]),
                mustHaveFeatures: JSON.stringify([]),
                niceToHaveFeatures: JSON.stringify([]),
                dealBreakers: JSON.stringify([]),
            },
        });
        res.status(201).json(searchRequest);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Create search request error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createSearchRequest = createSearchRequest;
// Get all search requests
const getSearchRequests = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const where = role === 'HUNTER'
            ? { status: 'PENDING_BIDS' } // Hunters see available requests
            : { tenantId: userId }; // Tenants see their own
        const requests = await index_1.prisma.searchRequest.findMany({
            where,
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                bids: {
                    include: {
                        haunter: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSearchRequests = getSearchRequests;
// Hunter submits bid
const submitBid = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { searchRequestId } = req.params;
        const validatedData = bidSchema.parse(req.body);
        if (role !== 'HUNTER') {
            return res.status(403).json({ message: 'Only hunters can submit bids' });
        }
        const bid = await index_1.prisma.bid.create({
            data: {
                searchRequestId,
                haunterId: req.user.userId,
                amount: validatedData.amount,
                message: validatedData.message,
                timeframe: validatedData.timeframe,
                bonuses: JSON.stringify(validatedData.bonuses || []),
            },
            include: {
                haunter: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                searchRequest: true,
            },
        });
        // Notify tenant
        await notificationService_1.NotificationService.notifyTenantOfBid(bid.searchRequest.tenantId, bid.id);
        res.status(201).json({
            success: true,
            message: 'Bid submitted successfully',
            bid,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Submit bid error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.submitBid = submitBid;
// Tenant accepts bid
const acceptBid = async (req, res) => {
    try {
        const { userId } = req.user;
        const { bidId } = req.params;
        const bid = await index_1.prisma.bid.findUnique({
            where: { id: bidId },
            include: {
                searchRequest: true,
            },
        });
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        if (bid.searchRequest.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Accept bid and assign hunter
        await index_1.prisma.bid.update({
            where: { id: bidId },
            data: { status: 'ACCEPTED' },
        });
        // Reject other bids
        await index_1.prisma.bid.updateMany({
            where: {
                searchRequestId: bid.searchRequestId,
                id: { not: bidId },
            },
            data: { status: 'REJECTED' },
        });
        // Update search request
        await index_1.prisma.searchRequest.update({
            where: { id: bid.searchRequestId },
            data: {
                status: 'IN_PROGRESS',
                haunterId: bid.haunterId,
                selectedBidId: bidId,
            },
        });
        res.json({
            success: true,
            message: 'Bid accepted! Hunter assigned to your search request.',
        });
    }
    catch (error) {
        console.error('Accept bid error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.acceptBid = acceptBid;
// Get bid details
const getBidsForRequest = async (req, res) => {
    try {
        const { searchRequestId } = req.params;
        const bids = await index_1.prisma.bid.findMany({
            where: { searchRequestId },
            include: {
                haunter: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: [
                { amount: 'asc' }, // Cheapest first
                { timeframe: 'asc' }, // Fastest first
            ],
        });
        res.json(bids);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getBidsForRequest = getBidsForRequest;
