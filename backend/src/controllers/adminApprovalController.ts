import { Request, Response } from 'express';
import { prisma } from '../index';

// ... (existing admin controller functions remain unchanged)

// Get pending hunters awaiting approval
export const getPendingHunters = async (req: any, res: Response) => {
    try {
        const hunters = await prisma.user.findMany({
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
    } catch (error: any) {
        console.error('Get pending hunters error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Approve hunter
export const approveHunter = async (req: any, res: Response) => {
    try {
        const { hunterId } = req.params;
        const { userId: adminId } = req.user;

        const hunter = await prisma.user.update({
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
    } catch (error: any) {
        console.error('Approve hunter error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reject hunter
export const rejectHunter = async (req: any, res: Response) => {
    try {
        const { hunterId } = req.params;
        const { reason } = req.body;

        const hunter = await prisma.user.update({
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
    } catch (error: any) {
        console.error('Reject hunter error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get pending properties awaiting approval
export const getPendingProperties = async (req: any, res: Response) => {
    try {
        const properties = await prisma.property.findMany({
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
    } catch (error: any) {
        console.error('Get pending properties error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Approve property
export const approveProperty = async (req: any, res: Response) => {
    try {
        const { propertyId } = req.params;
        const { userId: adminId } = req.user;

        const property = await prisma.property.update({
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
    } catch (error: any) {
        console.error('Approve property error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reject property
export const rejectProperty = async (req: any, res: Response) => {
    try {
        const { propertyId } = req.params;
        const { reason } = req.body;

        const property = await prisma.property.update({
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
    } catch (error: any) {
        console.error('Reject property error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Resolve dispute with evidence review
export const resolveDisputeWithEvidence = async (req: any, res: Response) => {
    try {
        const { disputeId } = req.params;
        const { resolution, refundAmount } = req.body;
        const { userId: adminId } = req.user;

        const dispute = await prisma.dispute.findUnique({
            where: { id: disputeId },
            include: {
                booking: true,
            },
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        // Update dispute
        await prisma.dispute.update({
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
            await prisma.booking.update({
                where: { id: dispute.booking.id },
                data: { paymentStatus: 'REFUNDED' },
            });
        }

        res.json({
            success: true,
            message: 'Dispute resolved successfully',
        });
    } catch (error: any) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Export all existing functions from the original file
export * from '../controllers/adminController';
