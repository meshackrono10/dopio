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

        // Revenue calculation (sum of paid invoices)
        const paidInvoices = await prisma.invoice.findMany({
            where: { status: 'PAID' }
        });
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

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
