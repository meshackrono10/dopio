"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getPropertyById = exports.getAllProperties = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
const propertySchema = zod_1.z.object({
    title: zod_1.z.string().min(5),
    description: zod_1.z.string().min(20),
    rent: zod_1.z.number().positive(),
    location: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
        address: zod_1.z.string(),
        generalArea: zod_1.z.string(),
    }),
    amenities: zod_1.z.array(zod_1.z.string()),
    images: zod_1.z.array(zod_1.z.string()),
    videos: zod_1.z.array(zod_1.z.string()).optional(),
    packages: zod_1.z.array(zod_1.z.object({
        tier: zod_1.z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
        name: zod_1.z.string(),
        price: zod_1.z.number().positive(),
        propertiesIncluded: zod_1.z.number().positive(),
        features: zod_1.z.array(zod_1.z.string()),
        description: zod_1.z.string().optional(),
    })).min(1, "At least one viewing package is required"),
});
const getAllProperties = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const properties = await index_1.prisma.property.findMany({
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
            const location = prop.location;
            const isOwner = userId && prop.hunterId === userId;
            const hasPaid = userId && prop.bookings?.length > 0;
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllProperties = getAllProperties;
const getPropertyById = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const propertyId = req.params.id;
        const property = await index_1.prisma.property.findUnique({
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
        const reviews = await index_1.prisma.review.findMany({
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
        const location = property.location;
        const isOwner = userId && property.hunterId === userId;
        const hasPaid = userId && property.bookings?.length > 0;
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPropertyById = getPropertyById;
const createProperty = async (req, res) => {
    try {
        console.log('[PropertyController] User from token:', req.user);
        // Validate user exists and is a HUNTER
        const user = await index_1.prisma.user.findUnique({
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
        const property = await index_1.prisma.property.create({
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
                    })),
                },
            },
            include: {
                packages: true,
            },
        });
        res.status(201).json(property);
    }
    catch (error) {
        console.error('[PropertyController] Create error:', error.message);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.createProperty = createProperty;
const updateProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await index_1.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.hunterId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }
        const validatedData = propertySchema.partial().parse(req.body);
        const { packages, location, amenities, images, videos, ...otherData } = validatedData;
        const updateData = { ...otherData };
        if (location)
            updateData.location = JSON.stringify(location);
        if (amenities)
            updateData.amenities = JSON.stringify(amenities);
        if (images)
            updateData.images = JSON.stringify(images);
        if (videos)
            updateData.videos = JSON.stringify(videos);
        const updatedProperty = await index_1.prisma.$transaction(async (tx) => {
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
                            })),
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await index_1.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.hunterId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }
        await index_1.prisma.property.delete({ where: { id: propertyId } });
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProperty = deleteProperty;
