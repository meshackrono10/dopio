"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReviews = exports.submitReview = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
const reviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
const submitReview = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const validatedData = reviewSchema.parse(req.body);
        const { bookingId, rating, comment } = validatedData;
        const booking = await index_1.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Verify user is part of the booking
        if (booking.tenantId !== userId && booking.hunterId !== userId) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }
        // Determine review type
        const type = role === 'TENANT' ? 'TENANT_TO_HUNTER' : 'HUNTER_TO_TENANT';
        // Check if review already exists from this user for this booking
        const existingReview = await index_1.prisma.review.findFirst({
            where: {
                bookingId,
                type,
            }
        });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already submitted a review for this viewing' });
        }
        const review = await index_1.prisma.review.create({
            data: {
                bookingId,
                rating,
                comment,
                type,
            },
        });
        // Update Hunter's average rating and review count if it's a tenant reviewing a hunter
        if (type === 'TENANT_TO_HUNTER') {
            const hunterId = booking.hunterId;
            const allHunterReviews = await index_1.prisma.review.findMany({
                where: {
                    booking: { hunterId },
                    type: 'TENANT_TO_HUNTER',
                },
                select: { rating: true },
            });
            const totalRatings = allHunterReviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings / allHunterReviews.length;
            await index_1.prisma.user.update({
                where: { id: hunterId },
                data: {
                    averageRating,
                    reviewCount: allHunterReviews.length,
                },
            });
        }
        // Update Tenant's rating if it's a hunter reviewing a tenant (optional but good for consistency)
        if (type === 'HUNTER_TO_TENANT') {
            const tenantId = booking.tenantId;
            const allTenantReviews = await index_1.prisma.review.findMany({
                where: {
                    booking: { tenantId },
                    type: 'HUNTER_TO_TENANT',
                },
                select: { rating: true },
            });
            const totalRatings = allTenantReviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings / allTenantReviews.length;
            await index_1.prisma.user.update({
                where: { id: tenantId },
                data: {
                    averageRating,
                    reviewCount: allTenantReviews.length,
                },
            });
        }
        res.status(201).json(review);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.submitReview = submitReview;
const getMyReviews = async (req, res) => {
    try {
        const { userId } = req.user;
        const reviews = await index_1.prisma.review.findMany({
            where: {
                booking: {
                    OR: [
                        { tenantId: userId },
                        { hunterId: userId }
                    ]
                }
            },
            include: {
                booking: {
                    include: {
                        property: true,
                        hunter: {
                            select: { name: true, avatarUrl: true }
                        },
                        tenant: {
                            select: { name: true, avatarUrl: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyReviews = getMyReviews;
