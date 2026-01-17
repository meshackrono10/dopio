import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const propertySchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    rent: z.number().positive(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string(),
        generalArea: z.string(),
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
});

export const getAllProperties = async (req: any, res: Response) => {
    try {
        const userId = req.user?.userId;
        const properties = await prisma.property.findMany({
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
        });

        const processedProperties = properties.map(prop => {
            const location = prop.location as any;
            const isOwner = userId && prop.hunterId === userId;
            const hasPaid = userId && (prop as any).bookings?.length > 0;

            if (isOwner || hasPaid || prop.isExactLocation) {
                return prop;
            }

            // Fuzz location (approx 500m-1km offset)
            const fuzzLat = (Math.random() - 0.5) * 0.01;
            const fuzzLng = (Math.random() - 0.5) * 0.01;

            return {
                ...prop,
                location: {
                    ...location,
                    lat: location.lat + fuzzLat,
                    lng: location.lng + fuzzLng,
                    address: 'Address hidden until booking',
                },
                isExactLocation: false,
            };
        });

        res.json(processedProperties);
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

        // Calculate average rating and review count for the HUNTER
        const reviews = await prisma.review.findMany({
            where: {
                booking: {
                    hunterId: property.hunterId,
                },
            },
            select: {
                rating: true,
            },
        });

        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
            : 0;

        const location = property.location as any;
        const isOwner = userId && property.hunterId === userId;
        const hasPaid = userId && (property as any).bookings?.length > 0;

        const responseData = {
            ...property,
            rating: parseFloat(averageRating.toFixed(1)),
            reviewCount,
        };

        if (isOwner || hasPaid || property.isExactLocation) {
            return res.json(responseData);
        }

        // Fuzz location
        const fuzzLat = (Math.random() - 0.5) * 0.01;
        const fuzzLng = (Math.random() - 0.5) * 0.01;

        res.json({
            ...responseData,
            location: {
                ...location,
                lat: location.lat + fuzzLat,
                lng: location.lng + fuzzLng,
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
        const { title, description, rent, location, amenities, images, videos, packages } = validatedData;

        const property = await prisma.property.create({
            data: {
                title,
                description,
                rent,
                location: JSON.stringify(location),
                amenities: JSON.stringify(amenities),
                images: JSON.stringify(images),
                videos: videos ? JSON.stringify(videos) : null,
                hunterId: req.user.userId,
                status: 'PENDING_APPROVAL', // Requires admin approval
                packages: {
                    create: (packages || []).map(pkg => ({
                        ...pkg,
                        features: JSON.stringify(pkg.features)
                    })) as any,
                },
            },
            include: {
                packages: true,
            },
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

        const validatedData = propertySchema.partial().parse(req.body);
        const { packages, location, amenities, images, videos, ...otherData } = validatedData;

        const updateData: any = { ...otherData };
        if (location) updateData.location = JSON.stringify(location);
        if (amenities) updateData.amenities = JSON.stringify(amenities);
        if (images) updateData.images = JSON.stringify(images);
        if (videos) updateData.videos = JSON.stringify(videos);

        const updatedProperty = await prisma.$transaction(async (tx) => {
            // Update basic property data
            const updated = await tx.property.update({
                where: { id: propertyId },
                data: updateData,
                include: { packages: true },
            });

            // If packages are provided, update them
            if (packages) {
                // Delete existing packages
                await tx.viewingPackage.deleteMany({
                    where: { propertyId },
                });

                // Create new packages
                await tx.property.update({
                    where: { id: propertyId },
                    data: {
                        packages: {
                            create: packages.map(pkg => ({
                                ...pkg,
                                features: JSON.stringify(pkg.features)
                            })) as any,
                        },
                    },
                });
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

export const deleteProperty = async (req: any, res: Response) => {
    try {
        const propertyId = req.params.id;
        const property = await prisma.property.findUnique({ where: { id: propertyId } });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.hunterId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }

        await prisma.property.delete({ where: { id: propertyId } });

        res.json({ message: 'Property deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
