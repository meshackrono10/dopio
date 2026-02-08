import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(['TENANT', 'HUNTER']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { email, password, name, phone, role } = validatedData;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: role || 'TENANT',
                verificationStatus: role === 'HUNTER' ? 'UNVERIFIED' : 'PENDING',
            },
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

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
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await prisma.user.findFirst({
            where: { email, isDeleted: false }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or account deactivated' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

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
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

// Soft delete account with transaction and safety checks
export const deleteAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        await prisma.$transaction(async (tx) => {
            // 1. Check for active escrow funds or confirmed bookings
            const activeBookings = await tx.booking.findMany({
                where: {
                    OR: [
                        { tenantId: userId },
                        { hunterId: userId }
                    ],
                    status: { in: ['CONFIRMED', 'IN_PROGRESS', 'DISPUTED'] },
                    paymentStatus: 'ESCROW'
                }
            });

            if (activeBookings.length > 0) {
                throw new Error('Cannot delete account with active bookings or funds in escrow. Please complete or dispute these first.');
            }

            // 2. Clear sensitive PII but keep the record for audit/ledger
            await tx.user.update({
                where: { id: userId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    email: `deleted_${userId}@dapio.com`, // Avoid email reuse/conflicts and protect PII
                    phone: null,
                    password: 'DELETED',
                    name: 'Deleted User',
                    avatarUrl: null,
                    idFrontUrl: null,
                    idBackUrl: null,
                    selfieUrl: null,
                },
            });

            // 3. Deactivate their properties
            await tx.property.updateMany({
                where: { hunterId: userId },
                data: {
                    status: 'RENTED', //effectively hides it
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            // Note: We DO NOT delete messages, reviews, or earnings. 
            // These must remain for the other party's history and legal compliance.
        });

        res.json({ message: 'Account deactivated successfully. Your data has been anonymized.' });
    } catch (error: any) {
        console.error('Delete account error:', error);
        res.status(400).json({ message: error.message || 'Failed to delete account' });
    }
};
// Change password
export const changePassword = async (req: any, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};
// Reset password (without code)
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Please provide both email and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

// Validate session and return user profile
export const validateSession = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findFirst({
            where: { id: userId, isDeleted: false },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                phone: true,
                isVerified: true,
                verificationStatus: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        console.error('Validate session error:', error);
        res.status(500).json({ message: 'Failed to validate session', error: error.message });
    }
};
