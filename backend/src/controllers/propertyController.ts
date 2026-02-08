import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import crypto from 'crypto';
import { getAvailablePackagesForProperty } from '../services/packageAvailabilityService';

const propertySchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    rent: z.number().positive(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string(),
        generalArea: z.string(),
        county: z.string().optional(),
    }),
    amenities: z.array(z.string()),
    images: z.array(z.string()),
    videos: z.array(z.string()).optional(),
    packages: z.array(z.object({
        tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
        name: z.string(),
        price: z.number().positive(),
        propertiesIncluded: z.number().positive(),
        features: z.array(z.string()),
        description: z.string().optional(),
    })).min(1, "At least one viewing package is required"),
    utilities: z.object({
        waterIncluded: z.boolean(),
        waterCost: z.string().optional(),
        electricityType: z.enum(['prepaid', 'postpaid', 'included', 'shared']),
        electricityCost: z.string().optional(),
        garbageIncluded: z.boolean().optional(),
        garbageCost: z.string().optional(),
        securityIncluded: z.boolean().optional(),
        securityCost: z.string().optional(),
        otherUtilities: z.array(z.string()).optional(),
    }).optional(),
    packageProperties: z.array(z.any()).optional(),
    listingPackage: z.enum(['BRONZE', 'SILVER', 'GOLD']).optional(),
    targetPackageGroupId: z.string().uuid().optional(),
}).refine((data) => {
    if (data.packageProperties && data.packageProperties.length > 0 && data.location) {
        const { generalArea, county } = data.location;
        return data.packageProperties.every((prop: any) => {
            const propArea = prop.areaName || prop.location?.generalArea || prop.generalArea;
            const propCounty = prop.county || prop.location?.county;

            const areaMatch = !propArea || propArea === generalArea;
            const countyMatch = !propCounty || !county || propCounty === county;

            return areaMatch && countyMatch;
        });
    }
    return true;
}, {
    message: "All properties in a package must be in the same location (area and county).",
    path: ["packageProperties"]
});



export const getAllProperties = async (req: any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const where: any = userId ? {
            OR: [
                { status: 'AVAILABLE' as const, isDeleted: false, hunter: { isDeleted: false } },
                { hunterId: userId, isDeleted: false }
            ]
        } : {
            status: 'AVAILABLE' as const,
            isDeleted: false,
            hunter: { isDeleted: false }
        };

        const [properties, totalCount] = await Promise.all([
            prisma.property.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    hunter: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                        },
                    },
                    packages: true,
                    bookings: userId ? {
                        where: { tenantId: userId },
                    } : false,
                },
            }),
            prisma.property.count({ where })
        ]);

        const processedProperties = properties.map(prop => {
            const location = typeof prop.location === 'string' ? JSON.parse(prop.location) : prop.location;
            const amenities = typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : prop.amenities;
            const images = typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images;
            const videos = typeof prop.videos === 'string' ? JSON.parse(prop.videos) : prop.videos;
            const utilities = typeof prop.utilities === 'string' ? JSON.parse(prop.utilities) : prop.utilities;
            const packageProperties = typeof prop.packageProperties === 'string' ? JSON.parse(prop.packageProperties) : prop.packageProperties;

            const isOwner = userId && prop.hunterId === userId;
            const hasPaid = userId && (prop as any).bookings?.length > 0;

            const responseData = {
                ...prop,
                location,
                amenities,
                images,
                videos,
                utilities,
                packageProperties
            };

            if (isOwner || hasPaid || prop.isExactLocation) {
                return responseData;
            }

            // Deterministic fuzzing based on property ID
            const seed = prop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const fuzzLat = (((seed % 100) / 100) - 0.5) * 0.01;
            const fuzzLng = ((((seed * 13) % 100) / 100) - 0.5) * 0.01;

            return {
                ...responseData,
                location: {
                    ...location,
                    lat: (location?.lat || 0) + fuzzLat,
                    lng: (location?.lng || 0) + fuzzLng,
                    address: 'Address hidden until booking',
                },
                isExactLocation: false,
            };
        });

        res.json({
            properties: processedProperties,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPropertyById = async (req: any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const propertyId = req.params.id;

        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                hunter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                        isVerified: true,
                        verificationStatus: true,
                        averageRating: true,
                        reviewCount: true,
                        createdAt: true,
                    },
                },
                packages: true,
                bookings: userId ? {
                    where: { tenantId: userId },
                } : false,
            },
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const reviewCount = property.hunter.reviewCount || 0;
        const averageRating = property.hunter.averageRating || 0;

        const location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;
        const amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities;
        const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
        const videos = typeof property.videos === 'string' ? JSON.parse(property.videos) : property.videos;
        const utilities = typeof property.utilities === 'string' ? JSON.parse(property.utilities) : property.utilities;
        const packageProperties = typeof property.packageProperties === 'string' ? JSON.parse(property.packageProperties) : property.packageProperties;

        const isOwner = userId && property.hunterId === userId;
        const hasPaid = userId && (property as any).bookings?.length > 0;

        // Filter packages based on availability
        const availablePackages = await getAvailablePackagesForProperty(propertyId);

        const responseData = {
            ...property,
            location,
            amenities,
            images,
            videos,
            utilities,
            packageProperties,
            packages: availablePackages,
            viewingPackages: availablePackages, // For compatibility
            rating: parseFloat(averageRating.toFixed(1)),
            reviewCount,
        };

        if (isOwner || hasPaid || property.isExactLocation) {
            return res.json(responseData);
        }

        // Deterministic fuzzing
        const seed = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const fuzzLat = (((seed % 100) / 100) - 0.5) * 0.01;
        const fuzzLng = ((((seed * 13) % 100) / 100) - 0.5) * 0.01;

        res.json({
            ...responseData,
            location: {
                ...location,
                lat: (location.lat || 0) + fuzzLat,
                lng: (location.lng || 0) + fuzzLng,
                address: 'Address hidden until booking',
            },
            isExactLocation: false,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProperty = async (req: any, res: Response) => {
    try {
        console.log('[PropertyController] User from token:', req.user);

        // Validate user exists and is a HUNTER
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found. Please log in again.'
            });
        }

        if (user.role !== 'HUNTER') {
            return res.status(403).json({
                message: 'Only hunters can create property listings.'
            });
        }

        console.log('[PropertyController] Creating property for hunter:', user.name);
        const validatedData = propertySchema.parse(req.body);
        const { title, description, rent, location, amenities, images, videos, packages, utilities, packageProperties, targetPackageGroupId } = validatedData;
        const hunterId = req.user.userId;

        // Create the property and its packages in a transaction
        const property = await prisma.$transaction(async (tx) => {
            const hasBronze = (packages || []).some(pkg => pkg.tier === 'BRONZE');
            const hasSilver = (packages || []).some(pkg => pkg.tier === 'SILVER');
            const hasGold = (packages || []).some(pkg => pkg.tier === 'GOLD');

            let bronzeGroupId = crypto.randomUUID();
            let silverGroupId = (hasSilver && targetPackageGroupId) ? targetPackageGroupId : (hasSilver ? crypto.randomUUID() : null);
            let goldGroupId = (hasGold && targetPackageGroupId) ? targetPackageGroupId : (hasGold ? crypto.randomUUID() : null);

            // Determine positions if targeting existing groups
            let silverPosition = 1;
            let goldPosition = 1;

            if (silverGroupId && targetPackageGroupId === silverGroupId) {
                const silverMembers = await tx.viewingPackage.findMany({ where: { packageGroupId: silverGroupId } });
                silverPosition = silverMembers.length + 1;
            }
            if (goldGroupId && targetPackageGroupId === goldGroupId) {
                const goldMembers = await tx.viewingPackage.findMany({ where: { packageGroupId: goldGroupId } });
                goldPosition = goldMembers.length + 1;
            }

            // 1. Create the master property
            const createdMaster = await tx.property.create({
                data: {
                    title,
                    description,
                    rent,
                    location: JSON.stringify(location),
                    amenities: JSON.stringify(amenities),
                    images: JSON.stringify(images),
                    videos: videos ? JSON.stringify(videos) : null,
                    utilities: utilities ? JSON.stringify(utilities) : null,
                    hunterId,
                    status: 'PENDING_APPROVAL',
                }
            });

            const masterId = createdMaster.id;

            // 2. Create ViewingPackages for master
            for (const pkg of (packages || [])) {
                let groupId: string | null = null;
                let position = 1;
                if (pkg.tier === 'BRONZE') groupId = bronzeGroupId;
                if (pkg.tier === 'SILVER') { groupId = silverGroupId; position = silverPosition; }
                if (pkg.tier === 'GOLD') { groupId = goldGroupId; position = goldPosition; }

                await tx.viewingPackage.create({
                    data: {
                        name: pkg.name,
                        price: pkg.price,
                        tier: pkg.tier,
                        propertiesIncluded: pkg.propertiesIncluded,
                        features: JSON.stringify(pkg.features),
                        propertyId: masterId,
                        packageGroupId: groupId,
                        packagePosition: position,
                        packageMasterId: (position > 1 && groupId === targetPackageGroupId) ? undefined : undefined
                    }
                });
            }

            // 3. Create bonus properties if any
            if (packageProperties && packageProperties.length > 0) {
                for (let i = 0; i < packageProperties.length; i++) {
                    const bonusProp = packageProperties[i];
                    const createdBonus = await tx.property.create({
                        data: {
                            title: bonusProp.propertyName || `${title} (Unit ${i + 2})`,
                            description: bonusProp.description || description,
                            rent: Number(bonusProp.monthlyRent) || rent,
                            location: JSON.stringify(bonusProp.location || location),
                            amenities: JSON.stringify(bonusProp.amenities || amenities),
                            images: JSON.stringify(bonusProp.photos || images),
                            videos: bonusProp.videos ? JSON.stringify(bonusProp.videos) : null,
                            utilities: bonusProp.utilities ? JSON.stringify(bonusProp.utilities) : null,
                            hunterId,
                            status: 'PENDING_APPROVAL',
                        }
                    });

                    // Bronze viewing for every unit
                    await tx.viewingPackage.create({
                        data: {
                            name: 'Bronze Viewing Package',
                            price: 1000,
                            tier: 'BRONZE',
                            propertiesIncluded: 1,
                            features: JSON.stringify(['View this property', 'Standard showing', 'Professional agent']),
                            propertyId: createdBonus.id,
                            packageGroupId: crypto.randomUUID(),
                            packagePosition: 1
                        }
                    });

                    // Silver viewing if applicable
                    if (hasSilver && silverGroupId) {
                        const pos = silverPosition + i + (targetPackageGroupId === silverGroupId ? 0 : 1);
                        await tx.viewingPackage.create({
                            data: {
                                name: 'Silver Viewing Package',
                                price: 2000,
                                tier: 'SILVER',
                                propertiesIncluded: 3,
                                features: JSON.stringify(['Up to 3 property viewings', 'Photos + videos', 'Priority response']),
                                propertyId: createdBonus.id,
                                packageGroupId: silverGroupId,
                                packagePosition: pos,
                                packageMasterId: masterId
                            }
                        });
                    }

                    // Gold viewing if applicable
                    if (hasGold && goldGroupId) {
                        const pos = goldPosition + i + (targetPackageGroupId === goldGroupId ? 0 : 1);
                        await tx.viewingPackage.create({
                            data: {
                                name: 'Gold Viewing Package',
                                price: 3500,
                                tier: 'GOLD',
                                propertiesIncluded: 5,
                                features: JSON.stringify(['Up to 5 property viewings', ' inspection report', 'Immediate response']),
                                propertyId: createdBonus.id,
                                packageGroupId: goldGroupId,
                                packagePosition: pos,
                                packageMasterId: masterId
                            }
                        });
                    }
                }
            }

            // 4. Sync property counts for targeting groups
            if (targetPackageGroupId) {
                const members = await tx.viewingPackage.findMany({ where: { packageGroupId: targetPackageGroupId } });
                await tx.viewingPackage.updateMany({
                    where: { packageGroupId: targetPackageGroupId },
                    data: { propertiesIncluded: members.length }
                });
            }

            return createdMaster;
        });

        res.status(201).json(property);
    } catch (error: any) {
        console.error('[PropertyController] Create error:', error.message);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

export const updateProperty = async (req: any, res: Response) => {
    try {
        const propertyId = req.params.id;
        const property = await prisma.property.findUnique({ where: { id: propertyId } });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.hunterId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        if (property.status === 'RENTED') {
            return res.status(400).json({ message: 'Cannot update a rented property' });
        }

        const validatedData = propertySchema.partial().parse(req.body);
        const { packages, location, amenities, images, videos, utilities, packageProperties, ...otherData } = validatedData;

        const updateData: any = { ...otherData };
        if (location) updateData.location = JSON.stringify(location);
        if (amenities) updateData.amenities = JSON.stringify(amenities);
        if (images) updateData.images = JSON.stringify(images);
        if (videos) updateData.videos = JSON.stringify(videos);
        if (utilities) updateData.utilities = JSON.stringify(utilities);
        if (packageProperties) updateData.packageProperties = JSON.stringify(packageProperties);

        const updatedProperty = await prisma.$transaction(async (tx) => {
            // Update basic property data
            const updated = await tx.property.update({
                where: { id: propertyId },
                data: updateData,
                include: { packages: true },
            });

            // If packages are provided, update them selectively
            if (packages) {
                const existingPackages = await tx.viewingPackage.findMany({
                    where: { propertyId },
                });

                for (const pkg of packages) {
                    const existing = existingPackages.find(p => p.tier === pkg.tier);
                    if (existing) {
                        await tx.viewingPackage.update({
                            where: { id: existing.id },
                            data: {
                                name: pkg.name,
                                price: pkg.price,
                                propertiesIncluded: pkg.propertiesIncluded,
                                features: JSON.stringify(pkg.features),
                            },
                        });
                    } else {
                        await tx.viewingPackage.create({
                            data: {
                                ...pkg,
                                features: JSON.stringify(pkg.features),
                                propertyId,
                            },
                        });
                    }
                }
            }

            return tx.property.findUnique({
                where: { id: propertyId },
                include: { packages: true },
            });
        });

        res.json(updatedProperty);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

// Soft delete property to preserve audit trails
export const deleteProperty = async (req: any, res: Response) => {
    try {
        const propertyId = req.params.id;
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'IN_PROGRESS', 'DISPUTED'] },
                        paymentStatus: 'ESCROW'
                    }
                }
            }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.hunterId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }

        // Prevent deletion if there are active bookings with money in escrow
        if (property.bookings.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete property with active escrow bookings. Please complete or refund them first.'
            });
        }

        // Perform soft delete
        await prisma.property.update({
            where: { id: propertyId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: 'RENTED', // Hide from search
            }
        });

        res.json({ message: 'Property archived successfully. Historical records preserved.' });
    } catch (error: any) {
        console.error('[PropertyController] Delete error:', error);
        res.status(500).json({ message: error.message });
    }
};
