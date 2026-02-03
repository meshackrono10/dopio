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
        county: zod_1.z.string().optional(),
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
    utilities: zod_1.z.object({
        waterIncluded: zod_1.z.boolean(),
        waterCost: zod_1.z.string().optional(),
        electricityType: zod_1.z.enum(['prepaid', 'postpaid', 'included', 'shared']),
        electricityCost: zod_1.z.string().optional(),
        garbageIncluded: zod_1.z.boolean().optional(),
        garbageCost: zod_1.z.string().optional(),
        securityIncluded: zod_1.z.boolean().optional(),
        securityCost: zod_1.z.string().optional(),
        otherUtilities: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    packageProperties: zod_1.z.array(zod_1.z.any()).optional(),
    listingPackage: zod_1.z.enum(['BRONZE', 'SILVER', 'GOLD']).optional(),
}).refine((data) => {
    if (data.packageProperties && data.packageProperties.length > 0 && data.location) {
        const { generalArea, county } = data.location;
        return data.packageProperties.every((prop) => {
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
const getAllProperties = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const properties = await index_1.prisma.property.findMany({
            where: {
                status: 'AVAILABLE',
            },
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
            const location = typeof prop.location === 'string' ? JSON.parse(prop.location) : prop.location;
            const amenities = typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : prop.amenities;
            const images = typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images;
            const videos = typeof prop.videos === 'string' ? JSON.parse(prop.videos) : prop.videos;
            const utilities = typeof prop.utilities === 'string' ? JSON.parse(prop.utilities) : prop.utilities;
            const packageProperties = typeof prop.packageProperties === 'string' ? JSON.parse(prop.packageProperties) : prop.packageProperties;
            const isOwner = userId && prop.hunterId === userId;
            const hasPaid = userId && prop.bookings?.length > 0;
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
            // Fuzz location (approx 500m-1km offset)
            const fuzzLat = (Math.random() - 0.5) * 0.01;
            const fuzzLng = (Math.random() - 0.5) * 0.01;
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
        const location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;
        const amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities;
        const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
        const videos = typeof property.videos === 'string' ? JSON.parse(property.videos) : property.videos;
        const utilities = typeof property.utilities === 'string' ? JSON.parse(property.utilities) : property.utilities;
        const packageProperties = typeof property.packageProperties === 'string' ? JSON.parse(property.packageProperties) : property.packageProperties;
        const isOwner = userId && property.hunterId === userId;
        const hasPaid = userId && property.bookings?.length > 0;
        const responseData = {
            ...property,
            location,
            amenities,
            images,
            videos,
            utilities,
            packageProperties,
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
                lat: (location.lat || 0) + fuzzLat,
                lng: (location.lng || 0) + fuzzLng,
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
        const { title, description, rent, location, amenities, images, videos, packages, utilities, packageProperties, listingPackage } = validatedData;
        const property = await index_1.prisma.property.create({
            data: {
                title,
                description,
                rent,
                location: JSON.stringify(location),
                amenities: JSON.stringify(amenities),
                images: JSON.stringify(images),
                videos: videos ? JSON.stringify(videos) : null,
                utilities: utilities ? JSON.stringify(utilities) : null,
                packageProperties: packageProperties ? JSON.stringify(packageProperties) : null,
                listingPackage: listingPackage || null,
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
        if (property.status === 'RENTED') {
            return res.status(400).json({ message: 'Cannot update a rented property' });
        }
        const validatedData = propertySchema.partial().parse(req.body);
        const { packages, location, amenities, images, videos, utilities, packageProperties, ...otherData } = validatedData;
        const updateData = { ...otherData };
        if (location)
            updateData.location = JSON.stringify(location);
        if (amenities)
            updateData.amenities = JSON.stringify(amenities);
        if (images)
            updateData.images = JSON.stringify(images);
        if (videos)
            updateData.videos = JSON.stringify(videos);
        if (utilities)
            updateData.utilities = JSON.stringify(utilities);
        if (packageProperties)
            updateData.packageProperties = JSON.stringify(packageProperties);
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
        const property = await index_1.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED'] }
                    }
                },
                requests: {
                    where: {
                        paymentStatus: { in: ['PAID', 'ESCROW'] }
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
        if (property.status === 'RENTED') {
            return res.status(400).json({ message: 'Cannot delete a rented property' });
        }
        // Prevent deletion if there are active bookings or paid requests
        if (property.bookings.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete property with active bookings. Please complete or cancel them first.'
            });
        }
        if (property.requests.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete property with pending paid viewing requests. Please process or refund them first.'
            });
        }
        // Perform deletion in a transaction to handle all related records
        await index_1.prisma.$transaction(async (tx) => {
            // 1. Delete viewing packages
            await tx.viewingPackage.deleteMany({ where: { propertyId } });
            // 2. Delete saved property records
            await tx.savedProperty.deleteMany({ where: { propertyId } });
            // 3. Delete alternative offers
            await tx.alternativeOffer.deleteMany({ where: { propertyId } });
            // 5. Handle viewing requests (unpaid/cancelled)
            await tx.viewingRequest.deleteMany({ where: { propertyId } });
            // 6. Handle bookings (cancelled/completed)
            // Note: We already checked for CONFIRMED bookings above.
            // We need to handle related records for these bookings too.
            const bookingIds = (await tx.booking.findMany({
                where: { propertyId },
                select: { id: true }
            })).map(b => b.id);
            if (bookingIds.length > 0) {
                await tx.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
                await tx.message.deleteMany({ where: { bookingId: { in: bookingIds } } });
                await tx.rescheduleRequest.deleteMany({ where: { bookingId: { in: bookingIds } } });
                await tx.meetingPoint.deleteMany({ where: { bookingId: { in: bookingIds } } });
                await tx.hunterEarnings.deleteMany({ where: { bookingId: { in: bookingIds } } });
                await tx.dispute.deleteMany({ where: { bookingId: { in: bookingIds } } });
                await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
            }
            // 7. Handle disputes directly linked to property
            await tx.dispute.deleteMany({ where: { propertyId } });
            // 8. Update conversations and messages to remove property reference
            await tx.conversation.updateMany({
                where: { propertyId },
                data: { propertyId: null }
            });
            await tx.message.updateMany({
                where: { propertyId },
                data: { propertyId: null }
            });
            // 9. Finally delete the property
            await tx.property.delete({ where: { id: propertyId } });
        });
        res.json({ message: 'Property and all related records deleted successfully' });
    }
    catch (error) {
        console.error('[PropertyController] Delete error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProperty = deleteProperty;
