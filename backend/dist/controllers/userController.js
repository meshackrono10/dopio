"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedProperties = exports.toggleSavedProperty = exports.getHunterProfile = exports.getProfile = exports.updateProfile = void 0;
const index_1 = require("../index");
// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { idFrontUrl, idBackUrl, selfieUrl, verificationStatus, avatarUrl, name, phone, description, workLocation } = req.body;
        const updateData = {};
        if (idFrontUrl)
            updateData.idFrontUrl = idFrontUrl;
        if (idBackUrl)
            updateData.idBackUrl = idBackUrl;
        if (selfieUrl)
            updateData.selfieUrl = selfieUrl;
        if (verificationStatus)
            updateData.verificationStatus = verificationStatus;
        if (avatarUrl)
            updateData.avatarUrl = avatarUrl;
        if (name)
            updateData.name = name;
        if (phone)
            updateData.phone = phone;
        if (description)
            updateData.description = description;
        if (workLocation)
            updateData.workLocation = workLocation;
        const user = await index_1.prisma.user.update({
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};
exports.updateProfile = updateProfile;
// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await index_1.prisma.user.findUnique({
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
                description: true,
                workLocation: true,
                averageRating: true,
                reviewCount: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
};
exports.getProfile = getProfile;
// Get public hunter profile
const getHunterProfile = async (req, res) => {
    try {
        const hunterId = req.params.id;
        const hunter = await index_1.prisma.user.findUnique({
            where: { id: hunterId },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
                isVerified: true,
                role: true,
                description: true,
                workLocation: true,
                averageRating: true,
                reviewCount: true,
            },
        });
        if (!hunter || hunter.role !== 'HUNTER') {
            return res.status(404).json({ message: 'Hunter not found' });
        }
        // Get active listings
        const properties = await index_1.prisma.property.findMany({
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
        const reviews = await index_1.prisma.review.findMany({
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
            properties: properties.map(p => ({
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
                location: typeof p.location === 'string' ? JSON.parse(p.location) : p.location,
                amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities,
            })),
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                tenantName: r.booking.tenant.name,
                tenantAvatar: r.booking.tenant.avatarUrl,
            })),
            rating: hunter.averageRating,
            reviewCount: hunter.reviewCount,
        });
    }
    catch (error) {
        console.error('Get hunter profile error:', error);
        res.status(500).json({ message: 'Failed to get hunter profile', error: error.message });
    }
};
exports.getHunterProfile = getHunterProfile;
// Toggle saved property
const toggleSavedProperty = async (req, res) => {
    try {
        const userId = req.user.userId;
        const propertyId = req.params.propertyId;
        const existingSave = await index_1.prisma.savedProperty.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });
        if (existingSave) {
            await index_1.prisma.savedProperty.delete({
                where: {
                    id: existingSave.id,
                },
            });
            res.json({ message: 'Property removed from saved', isSaved: false });
        }
        else {
            await index_1.prisma.savedProperty.create({
                data: {
                    userId,
                    propertyId,
                },
            });
            res.json({ message: 'Property saved', isSaved: true });
        }
    }
    catch (error) {
        console.error('Toggle saved property error:', error);
        res.status(500).json({ message: 'Failed to toggle saved property', error: error.message });
    }
};
exports.toggleSavedProperty = toggleSavedProperty;
// Get saved properties
const getSavedProperties = async (req, res) => {
    try {
        const userId = req.user.userId;
        const savedProperties = await index_1.prisma.savedProperty.findMany({
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
    }
    catch (error) {
        console.error('Get saved properties error:', error);
        res.status(500).json({ message: 'Failed to get saved properties', error: error.message });
    }
};
exports.getSavedProperties = getSavedProperties;
