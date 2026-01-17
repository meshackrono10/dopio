"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToDispute = exports.updateDispute = exports.getDisputes = void 0;
const index_1 = require("../index");
// Get all disputes with filters
const getDisputes = async (req, res) => {
    try {
        const { status, category } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        const disputes = await index_1.prisma.dispute.findMany({
            where,
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        avatarUrl: true,
                    },
                },
                against: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        avatarUrl: true,
                    },
                },
                booking: {
                    select: {
                        id: true,
                        property: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(disputes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDisputes = getDisputes;
// Update dispute status or resolve
const updateDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { status, resolution } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (resolution) {
            updateData.resolution = resolution;
            updateData.resolvedBy = req.user.userId;
            updateData.resolvedAt = new Date();
            if (!status)
                updateData.status = 'RESOLVED';
        }
        updateData.updatedAt = new Date();
        const dispute = await index_1.prisma.dispute.update({
            where: { id: disputeId },
            data: updateData,
        });
        res.json(dispute);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateDispute = updateDispute;
// Hunter responds to a dispute
const respondToDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { response, evidenceUrl } = req.body;
        const { userId, role } = req.user;
        if (role !== 'HUNTER') {
            return res.status(403).json({ message: 'Only hunters can respond to disputes' });
        }
        const dispute = await index_1.prisma.dispute.findUnique({
            where: { id: disputeId },
        });
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }
        if (dispute.againstId !== userId) {
            return res.status(403).json({ message: 'Not authorized to respond to this dispute' });
        }
        const updatedDispute = await index_1.prisma.dispute.update({
            where: { id: disputeId },
            data: {
                hunterResponse: response,
                hunterEvidenceUrl: evidenceUrl ? JSON.stringify(evidenceUrl) : undefined,
                status: 'IN_PROGRESS',
                updatedAt: new Date(),
            },
        });
        res.json(updatedDispute);
    }
    catch (error) {
        console.error('Respond to dispute error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.respondToDispute = respondToDispute;
