import { Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { NotificationService } from '../services/notificationService';

const searchRequestSchema = z.object({
    preferredAreas: z.array(z.string()),
    minRent: z.number(),
    maxRent: z.number(),
    propertyType: z.string(),
    bathrooms: z.number(),
    furnished: z.string(),
    petFriendly: z.boolean(),
    parkingRequired: z.boolean(),
    amenities: z.array(z.string()),
    serviceTier: z.enum(['STANDARD', 'PREMIUM', 'URGENT']),
    numberOfOptions: z.number(),
    depositAmount: z.number(),
});

const bidSchema = z.object({
    amount: z.number().positive(),
    message: z.string().optional(),
    timeframe: z.number().positive(), // hours
    bonuses: z.array(z.string()).optional(),
});

// Create search request
export const createSearchRequest = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const validatedData = searchRequestSchema.parse(req.body);

        const searchRequest = await prisma.searchRequest.create({
            data: {
                ...validatedData,
                tenantId: userId,
                status: 'DRAFT',
                // Default required fields not in form
                leaseDuration: 'monthly',
                securityFeatures: [],
                utilitiesIncluded: [],
                mustHaveFeatures: [],
                niceToHaveFeatures: [],
                dealBreakers: [],
            } as any,
        });

        res.status(201).json(searchRequest);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Create search request error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all search requests
export const getSearchRequests = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;

        const where: any = role === 'HUNTER'
            ? { status: 'PENDING_BIDS' } // Hunters see available requests
            : { tenantId: userId }; // Tenants see their own

        const requests = await prisma.searchRequest.findMany({
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Hunter submits bid
export const submitBid = async (req: any, res: Response) => {
    try {
        const { userId, role } = req.user;
        const { searchRequestId } = req.params;
        const validatedData = bidSchema.parse(req.body);

        if (role !== 'HUNTER') {
            return res.status(403).json({ message: 'Only hunters can submit bids' });
        }

        const bid = await prisma.bid.create({
            data: {
                searchRequestId,
                haunterId: userId,
                ...validatedData,
                bonuses: validatedData.bonuses || [],
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
        await NotificationService.notifyTenantOfBid(bid.searchRequest.tenantId, bid.id);

        res.status(201).json({
            success: true,
            message: 'Bid submitted successfully',
            bid,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error('Submit bid error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Tenant accepts bid
export const acceptBid = async (req: any, res: Response) => {
    try {
        const { userId } = req.user;
        const { bidId } = req.params;

        const bid = await prisma.bid.findUnique({
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
        await prisma.bid.update({
            where: { id: bidId },
            data: { status: 'ACCEPTED' },
        });

        // Reject other bids
        await prisma.bid.updateMany({
            where: {
                searchRequestId: bid.searchRequestId,
                id: { not: bidId },
            },
            data: { status: 'REJECTED' },
        });

        // Update search request
        await prisma.searchRequest.update({
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
    } catch (error: any) {
        console.error('Accept bid error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get bid details
export const getBidsForRequest = async (req: any, res: Response) => {
    try {
        const { searchRequestId } = req.params;

        const bids = await prisma.bid.findMany({
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
