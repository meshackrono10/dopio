import { Response } from 'express';
import { prisma } from '../index';

// Update user profile
export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { idFrontUrl, idBackUrl, selfieUrl, verificationStatus, avatarUrl, name, phone } = req.body;

        const updateData: any = {};

        if (idFrontUrl) updateData.idFrontUrl = idFrontUrl;
        if (idBackUrl) updateData.idBackUrl = idBackUrl;
        if (selfieUrl) updateData.selfieUrl = selfieUrl;
        if (verificationStatus) updateData.verificationStatus = verificationStatus;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                verificationStatus: user.verificationStatus,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                isVerified: user.isVerified,
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

// Get current user profile
export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
};
// Get public hunter profile
export const getHunterProfile = async (req: any, res: Response) => {
    try {
        const hunterId = req.params.id;

        const hunter = await prisma.user.findUnique({
            where: { id: hunterId },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
                isVerified: true,
                role: true,
            },
        });

        if (!hunter || hunter.role !== 'HUNTER') {
            return res.status(404).json({ message: 'Hunter not found' });
        }

        // Get active listings
        const properties = await prisma.property.findMany({
            where: {
                hunterId: hunterId,
                status: 'AVAILABLE',
            },
            select: {
                id: true,
                title: true,
                location: true,
                rent: true,
                images: true,
                // layout: true, // Removed as it doesn't exist in schema
                // bathrooms: true, // Removed as it doesn't exist in schema (checked schema)
                amenities: true,
            },
        });

        // Get reviews from all bookings
        const reviews = await prisma.review.findMany({
            where: {
                booking: {
                    hunterId: hunterId,
                },
                type: 'TENANT_TO_HUNTER',
            },
            include: {
                booking: {
                    include: {
                        tenant: {
                            select: {
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
            : 0;

        res.json({
            hunter,
            properties,
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                tenantName: r.booking.tenant.name,
                tenantAvatar: r.booking.tenant.avatarUrl,
            })),
            rating: parseFloat(averageRating.toFixed(1)),
            reviewCount,
        });
    } catch (error: any) {
        console.error('Get hunter profile error:', error);
        res.status(500).json({ message: 'Failed to get hunter profile', error: error.message });
    }
};

// Toggle saved property
export const toggleSavedProperty = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const propertyId = req.params.propertyId;

        const existingSave = await prisma.savedProperty.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });

        if (existingSave) {
            await prisma.savedProperty.delete({
                where: {
                    id: existingSave.id,
                },
            });
            res.json({ message: 'Property removed from saved', isSaved: false });
        } else {
            await prisma.savedProperty.create({
                data: {
                    userId,
                    propertyId,
                },
            });
            res.json({ message: 'Property saved', isSaved: true });
        }
    } catch (error: any) {
        console.error('Toggle saved property error:', error);
        res.status(500).json({ message: 'Failed to toggle saved property', error: error.message });
    }
};

// Get saved properties
export const getSavedProperties = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        const savedProperties = await prisma.savedProperty.findMany({
            where: {
                userId,
            },
            include: {
                property: {
                    include: {
                        hunter: {
                            select: {
                                name: true,
                                phone: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(savedProperties);
    } catch (error: any) {
        console.error('Get saved properties error:', error);
        res.status(500).json({ message: 'Failed to get saved properties', error: error.message });
    }
};
