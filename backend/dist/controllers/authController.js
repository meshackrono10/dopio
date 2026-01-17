"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.deleteAccount = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['TENANT', 'HUNTER']).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { email, password, name, phone, role } = validatedData;
        const existingUser = await index_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await index_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: role || 'TENANT',
                verificationStatus: role === 'HUNTER' ? 'UNVERIFIED' : 'PENDING',
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                verificationStatus: user.verificationStatus,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                verificationStatus: user.verificationStatus,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
// Delete account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Delete all related data first
        await index_1.prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });
        await index_1.prisma.review.deleteMany({ where: { booking: { OR: [{ tenantId: userId }, { hunterId: userId }] } } });
        await index_1.prisma.viewingRequest.deleteMany({ where: { OR: [{ tenantId: userId }, { property: { hunterId: userId } }] } });
        await index_1.prisma.booking.deleteMany({ where: { OR: [{ tenantId: userId }, { hunterId: userId }] } });
        await index_1.prisma.property.deleteMany({ where: { hunterId: userId } });
        await index_1.prisma.searchRequest.deleteMany({ where: { OR: [{ tenantId: userId }, { haunterId: userId }] } });
        // Finally delete the user
        await index_1.prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
};
exports.deleteAccount = deleteAccount;
// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        const user = await index_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await index_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};
exports.changePassword = changePassword;
