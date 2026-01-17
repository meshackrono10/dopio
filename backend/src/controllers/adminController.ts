import { Request, Response } from 'express';
import { prisma } from '../index';

// Get dashboard statistics
export const getDashboardStats = async (req: any, res: Response) => {
    try {
        // Count totals
        const totalUsers = await prisma.user.count();
        const totalHunters = await prisma.user.count({ where: { role: 'HUNTER' } });
        const totalTenants = await prisma.user.count({ where: { role: 'TENANT' } });
        const totalProperties = await prisma.property.count();
        const totalBookings = await prisma.booking.count();
        const totalMessages = await prisma.message.count();

        // Pending verifications
        const pendingVerifications = await prisma.user.count({
            where: {
                role: 'HUNTER',
                verificationStatus: 'PENDING'
            }
        });

        // Active listings
        const activeListings = await prisma.property.count({
            where: { status: 'AVAILABLE' }
        });

        // Revenue calculation (sum of paid bookings)
        const paidBookings = await prisma.booking.findMany({
            where: { paymentStatus: 'RELEASED' }
        });
        const totalRevenue = paidBookings.reduce((sum, booking) => sum + booking.amount, 0);

        // Recent activity
        const recentBookings = await prisma.booking.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        });

        res.json({
            totalUsers,
            totalHunters,
            totalTenants,
            totalProperties,
            activeListings,
            totalBookings,
            recentBookings,
            totalMessages,
            pendingVerifications,
            totalRevenue,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users with filters
export const getUsers = async (req: any, res: Response) => {
    try {
        const { role, status, search } = req.query;

        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (status) {
            where.verificationStatus = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
                avatarUrl: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all hunters
export const getHunters = async (req: any, res: Response) => {
    try {
        const { status } = req.query;

        const where: any = { role: 'HUNTER' };

        if (status) {
            where.verificationStatus = status;
        }

        const hunters = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isVerified: true,
                verificationStatus: true,
                avatarUrl: true,
                idFrontUrl: true,
                idBackUrl: true,
                selfieUrl: true,
                createdAt: true,
                properties: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    }
                },
                hunterBookings: {
                    select: {
                        id: true,
                        status: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Add computed fields
        const huntersWithStats = hunters.map(hunter => ({
            ...hunter,
            listingsCount: hunter.properties.length,
            activeListings: hunter.properties.filter(p => p.status === 'AVAILABLE').length,
            bookingsCount: hunter.hunterBookings.length,
            completedBookings: hunter.hunterBookings.filter(b => b.status === 'COMPLETED').length,
        }));

        res.json(huntersWithStats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tenants
export const getTenants = async (req: any, res: Response) => {
    try {
        const tenants = await prisma.user.findMany({
            where: { role: 'TENANT' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                bookings: {
                    select: {
                        id: true,
                        status: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Add computed fields
        const tenantsWithStats = tenants.map(tenant => ({
            ...tenant,
            bookingsCount: tenant.bookings.length,
            activeBookings: tenant.bookings.filter(b => b.status === 'CONFIRMED').length,
        }));

        res.json(tenantsWithStats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Approve/Reject hunter verification
export const updateHunterVerification = async (req: any, res: Response) => {
    try {
        const { hunterId } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const hunter = await prisma.user.update({
            where: { id: hunterId },
            data: {
                verificationStatus: status,
                isVerified: status === 'APPROVED',
            }
        });

        res.json(hunter);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Suspend/Activate user
export const updateUserStatus = async (req: any, res: Response) => {
    try {
        const { userId } = req.params;
        const { verificationStatus } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                verificationStatus,
            }
        });

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all properties with filters
export const getAllProperties = async (req: any, res: Response) => {
    try {
        const { status } = req.query;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        const properties = await prisma.property.findMany({
            where,
            include: {
                hunter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    }
                },
                bookings: {
                    select: {
                        id: true,
                        status: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all disputes
export const getDisputes = async (req: any, res: Response) => {
    try {
        const { status, category } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const disputes = await prisma.dispute.findMany({
            where,
            include: {
                reporter: {
                    select: { id: true, name: true, email: true, avatarUrl: true }
                },
                against: {
                    select: { id: true, name: true, email: true, avatarUrl: true }
                },
                booking: {
                    include: { property: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(disputes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Resolve dispute
export const resolveDispute = async (req: any, res: Response) => {
    try {
        const { disputeId } = req.params;
        const { resolution, action } = req.body; // action: 'REFUND' or 'RELEASE_PAYMENT' or 'NONE'
        const adminId = req.user.userId;

        const dispute = await prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { booking: true }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        const updateData: any = {
            status: 'RESOLVED',
            resolution,
            resolvedBy: adminId,
            resolvedAt: new Date(),
        };

        // Handle financial actions if linked to a booking
        if (dispute.bookingId && dispute.booking && action !== 'NONE') {
            if (action === 'REFUND') {
                await prisma.booking.update({
                    where: { id: dispute.bookingId },
                    data: { paymentStatus: 'REFUNDED', status: 'CANCELLED' }
                });
                // In a real app, trigger actual refund via payment gateway
            } else if (action === 'RELEASE_PAYMENT') {
                await prisma.booking.update({
                    where: { id: dispute.bookingId },
                    data: { paymentStatus: 'RELEASED', status: 'COMPLETED' }
                });

                // Create hunter earnings
                const hunterAmount = dispute.booking.amount * 0.85;
                await prisma.hunterEarnings.create({
                    data: {
                        hunterId: dispute.booking.hunterId,
                        amount: hunterAmount,
                        bookingId: dispute.booking.id,
                        status: 'PENDING',
                    },
                });
            }
        }

        const updatedDispute = await prisma.dispute.update({
            where: { id: disputeId },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Dispute resolved successfully',
            dispute: updatedDispute
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
