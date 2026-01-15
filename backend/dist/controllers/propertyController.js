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
    packages: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        price: zod_1.z.number().positive(),
        description: zod_1.z.string().optional(),
    })).optional(),
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
        const property = await index_1.prisma.property.findUnique({
            where: { id: req.params.id },
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
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        const location = property.location;
        const isOwner = userId && property.hunterId === userId;
        const hasPaid = userId && property.bookings?.length > 0;
        if (isOwner || hasPaid || property.isExactLocation) {
            return res.json(property);
        }
        // Fuzz location
        const fuzzLat = (Math.random() - 0.5) * 0.01;
        const fuzzLng = (Math.random() - 0.5) * 0.01;
        res.json({
            ...property,
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
        const validatedData = propertySchema.parse(req.body);
        const { title, description, rent, location, amenities, images, packages } = validatedData;
        const property = await index_1.prisma.property.create({
            data: {
                title,
                description,
                rent,
                location,
                amenities,
                images,
                hunterId: req.user.userId,
                packages: {
                    create: packages || [],
                },
            },
            include: {
                packages: true,
            },
        });
        res.status(201).json(property);
    }
    catch (error) {
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
        const updatedProperty = await index_1.prisma.property.update({
            where: { id: propertyId },
            data: validatedData, // Simplified for now
            include: {
                packages: true,
            },
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
