"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDisputeWithEvidence = exports.rejectProperty = exports.approveProperty = exports.getPendingProperties = exports.rejectHunter = exports.approveHunter = exports.getPendingHunters = void 0;
const index_1 = require("../index");
// ... (existing admin controller functions remain unchanged)
// Get pending hunters awaiting approval
const getPendingHunters = async (req, res) => {
    try {
        const hunters = await index_1.prisma.user.findMany({
            where: {
                role: 'HUNTER',
                verificationStatus: { in: ['PENDING', 'UNVERIFIED'] },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                verificationStatus: true,
                idFrontUrl: true,
                idBackUrl: true,
                selfieUrl: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(hunters);
    }
    catch (error) {
        console.error('Get pending hunters error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPendingHunters = getPendingHunters;
// Approve hunter
const approveHunter = async (req, res) => {
    try {
        const { hunterId } = req.params;
        const { userId: adminId } = req.user;
        const hunter = await index_1.prisma.user.update({
            where: { id: hunterId },
            data: {
                verificationStatus: 'APPROVED',
                isVerified: true,
            },
        });
        res.json({
            success: true,
            message: 'Hunter approved successfully',
            hunter,
        });
    }
    catch (error) {
        console.error('Approve hunter error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.approveHunter = approveHunter;
// Reject hunter
const rejectHunter = async (req, res) => {
    try {
        const { hunterId } = req.params;
        const { reason } = req.body;
        const hunter = await index_1.prisma.user.update({
            where: { id: hunterId },
            data: {
                verificationStatus: 'REJECTED',
                isVerified: false,
            },
        });
        res.json({
            success: true,
            message: 'Hunter application rejected',
            hunter,
        });
    }
    catch (error) {
        console.error('Reject hunter error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.rejectHunter = rejectHunter;
// Get pending properties awaiting approval
const getPendingProperties = async (req, res) => {
    try {
        const properties = await index_1.prisma.property.findMany({
            where: {
                status: 'PENDING_APPROVAL',
            },
            include: {
                hunter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        isVerified: true,
                    },
                },
                packages: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(properties);
    }
    catch (error) {
        console.error('Get pending properties error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPendingProperties = getPendingProperties;
// Approve property
const approveProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId: adminId } = req.user;
        const property = await index_1.prisma.property.update({
            where: { id: propertyId },
            data: {
                status: 'AVAILABLE',
                adminApprovedBy: adminId,
                adminApprovedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: 'Property approved and is now live',
            property,
        });
    }
    catch (error) {
        console.error('Approve property error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.approveProperty = approveProperty;
// Reject property
const rejectProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { reason } = req.body;
        const property = await index_1.prisma.property.update({
            where: { id: propertyId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
            },
        });
        res.json({
            success: true,
            message: 'Property listing rejected',
            property,
        });
    }
    catch (error) {
        console.error('Reject property error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.rejectProperty = rejectProperty;
// Resolve dispute with evidence review
const resolveDisputeWithEvidence = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, refundAmount } = req.body;
        const { userId: adminId } = req.user;
        const dispute = await index_1.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: {
                booking: true,
            },
        });
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }
        // Update dispute
        await index_1.prisma.dispute.update({
            where: { id: disputeId },
            data: {
                status: 'RESOLVED',
                resolution,
                resolvedBy: adminId,
                resolvedAt: new Date(),
            },
        });
        // If refund approved, update booking
        if (refundAmount && dispute.booking) {
            await index_1.prisma.booking.update({
                where: { id: dispute.booking.id },
                data: { paymentStatus: 'REFUNDED' },
            });
        }
        res.json({
            success: true,
            message: 'Dispute resolved successfully',
        });
    }
    catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.resolveDisputeWithEvidence = resolveDisputeWithEvidence;
// Export all existing functions from the original file
__exportStar(require("../controllers/adminController"), exports);
