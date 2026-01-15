"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStatus = exports.getRequestById = exports.getRequests = exports.createRequest = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
const viewingRequestSchema = zod_1.z.object({
    propertyId: zod_1.z.string(),
    proposedDates: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string(),
        timeSlot: zod_1.z.string(),
    })),
    message: zod_1.z.string().optional(),
    packageId: zod_1.z.string(),
});
const createRequest = async (req, res) => {
    try {
        const validatedData = viewingRequestSchema.parse(req.body);
        const { propertyId, proposedDates, message, packageId } = validatedData;
        const property = await index_1.prisma.property.findUnique({
            where: { id: propertyId },
            include: { packages: true },
        });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        const selectedPackage = property.packages.find((p) => p.id === packageId);
        if (!selectedPackage) {
            return res.status(400).json({ message: 'Invalid package selected' });
        }
        const viewingRequest = await index_1.prisma.viewingRequest.create({
            data: {
                propertyId,
                tenantId: req.user.userId,
                proposedDates,
                message,
                invoice: {
                    create: {
                        amount: selectedPackage.price,
                        status: 'UNPAID',
                    },
                },
            },
            include: {
                property: true,
                invoice: true,
            },
        });
        res.status(201).json(viewingRequest);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.createRequest = createRequest;
const getRequests = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const requests = await index_1.prisma.viewingRequest.findMany({
            where: role === 'HUNTER'
                ? { property: { hunterId: userId } }
                : { tenantId: userId },
            include: {
                property: {
                    include: {
                        hunter: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                invoice: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRequests = getRequests;
const getRequestById = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const request = await index_1.prisma.viewingRequest.findUnique({
            where: { id: req.params.id },
            include: {
                property: {
                    include: {
                        hunter: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                invoice: true,
            },
        });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        // Check authorization
        if (request.tenantId !== userId && request.property.hunterId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(request);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRequestById = getRequestById;
const updateRequestStatus = async (req, res) => {
    try {
        const { userId } = req.user;
        const { status } = req.body;
        if (!['ACCEPTED', 'REJECTED', 'COUNTERED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const request = await index_1.prisma.viewingRequest.findUnique({
            where: { id: req.params.id },
            include: { property: true },
        });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.property.hunterId !== userId) {
            return res.status(403).json({ message: 'Only hunters can update request status' });
        }
        const updatedRequest = await index_1.prisma.viewingRequest.update({
            where: { id: req.params.id },
            data: { status },
            include: { invoice: true },
        });
        res.json(updatedRequest);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateRequestStatus = updateRequestStatus;
