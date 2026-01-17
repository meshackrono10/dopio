"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDispute = exports.getDisputes = exports.getAllProperties = exports.updateUserStatus = exports.updateHunterVerification = exports.getTenants = exports.getHunters = exports.getUsers = exports.getDashboardStats = void 0;
const index_1 = require("../index");
// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Count totals
        const totalUsers = await index_1.prisma.user.count();
        const totalHunters = await index_1.prisma.user.count({ where: { role: 'HUNTER' } });
        const totalTenants = await index_1.prisma.user.count({ where: { role: 'TENANT' } });
        const totalProperties = await index_1.prisma.property.count();
        const totalBookings = await index_1.prisma.booking.count();
        const totalMessages = await index_1.prisma.message.count();
        // Pending verifications
        const pendingVerifications = await index_1.prisma.user.count({
            where: {
                role: 'HUNTER',
                verificationStatus: 'PENDING'
            }
        });
        // Active listings
        const activeListings = await index_1.prisma.property.count({
            where: { status: 'AVAILABLE' }
        });
        // Revenue calculation (sum of paid bookings)
        const paidBookings = await index_1.prisma.booking.findMany({
            where: { paymentStatus: 'RELEASED' }
        });
        const totalRevenue = paidBookings.reduce((sum, booking) => sum + booking.amount, 0);
        // Recent activity
        const recentBookings = await index_1.prisma.booking.count({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
// Get all users with filters
const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        const where = {};
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
        const users = await index_1.prisma.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUsers = getUsers;
// Get all hunters
const getHunters = async (req, res) => {
    try {
        const { status } = req.query;
        const where = { role: 'HUNTER' };
        if (status) {
            where.verificationStatus = status;
        }
        const hunters = await index_1.prisma.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getHunters = getHunters;
// Get all tenants
const getTenants = async (req, res) => {
    try {
        const tenants = await index_1.prisma.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTenants = getTenants;
// Approve/Reject hunter verification
const updateHunterVerification = async (req, res) => {
    try {
        const { hunterId } = req.params;
        const { status } = req.body; // APPROVED or REJECTED
        const hunter = await index_1.prisma.user.update({
            where: { id: hunterId },
            data: {
                verificationStatus: status,
                isVerified: status === 'APPROVED',
            }
        });
        res.json(hunter);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateHunterVerification = updateHunterVerification;
// Suspend/Activate user
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { verificationStatus } = req.body;
        const user = await index_1.prisma.user.update({
            where: { id: userId },
            data: {
                verificationStatus,
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUserStatus = updateUserStatus;
// Get all properties with filters
const getAllProperties = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const properties = await index_1.prisma.property.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllProperties = getAllProperties;
// Get all disputes
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDisputes = getDisputes;
// Resolve dispute
const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, action } = req.body; // action: 'REFUND' or 'RELEASE_PAYMENT' or 'NONE'
        const adminId = req.user.userId;
        const dispute = await index_1.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { booking: true }
        });
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }
        const updateData = {
            status: 'RESOLVED',
            resolution,
            resolvedBy: adminId,
            resolvedAt: new Date(),
        };
        // Handle financial actions if linked to a booking
        if (dispute.bookingId && dispute.booking && action !== 'NONE') {
            if (action === 'REFUND') {
                await index_1.prisma.booking.update({
                    where: { id: dispute.bookingId },
                    data: { paymentStatus: 'REFUNDED', status: 'CANCELLED' }
                });
                // In a real app, trigger actual refund via payment gateway
            }
            else if (action === 'RELEASE_PAYMENT') {
                await index_1.prisma.booking.update({
                    where: { id: dispute.bookingId },
                    data: { paymentStatus: 'RELEASED', status: 'COMPLETED' }
                });
                // Create hunter earnings
                const hunterAmount = dispute.booking.amount * 0.85;
                await index_1.prisma.hunterEarnings.create({
                    data: {
                        hunterId: dispute.booking.hunterId,
                        amount: hunterAmount,
                        bookingId: dispute.booking.id,
                        status: 'PENDING',
                    },
                });
            }
        }
        const updatedDispute = await index_1.prisma.dispute.update({
            where: { id: disputeId },
            data: updateData
        });
        res.json({
            success: true,
            message: 'Dispute resolved successfully',
            dispute: updatedDispute
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.resolveDispute = resolveDispute;
