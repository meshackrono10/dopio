import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const sendMessageSchema = z.object({
    receiverId: z.string(),
    propertyId: z.string().optional(),
    content: z.string().optional(),
    type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE_CALL', 'VIDEO_CALL']).default('TEXT'),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    callDuration: z.number().optional(),
});

// Send a new message
export const sendMessage = async (req: any, res: Response) => {
    try {
        const validatedData = sendMessageSchema.parse(req.body);
        const senderId = req.user.userId;
        const receiverId = validatedData.receiverId;

        // Find or create conversation
        // We need to check both directions because conversation ID is unique for a pair + property
        // Actually, our schema has tenantId and hunterId. We need to know who is who.
        // But for simplicity, let's try to find an existing conversation first.

        // Determine tenant and hunter roles based on sender/receiver roles
        // This assumes we have role info. If not, we might need to fetch users.
        // For now, let's search for an existing conversation between these two users.

        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { tenantId: senderId, hunterId: receiverId },
                    { tenantId: receiverId, hunterId: senderId },
                ],
                propertyId: validatedData.propertyId || null,
            },
        });

        if (!conversation) {
            // If no conversation exists, we need to create one.
            // We need to know who is the tenant and who is the hunter.
            const sender = await prisma.user.findUnique({ where: { id: senderId } });
            const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

            if (!sender || !receiver) {
                return res.status(404).json({ message: 'User not found' });
            }

            let tenantId, hunterId;
            if (sender.role === 'TENANT') {
                tenantId = senderId;
                hunterId = receiverId;
            } else {
                tenantId = receiverId;
                hunterId = senderId;
            }

            conversation = await prisma.conversation.create({
                data: {
                    tenantId,
                    hunterId,
                    propertyId: validatedData.propertyId,
                },
            });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                conversationId: conversation.id,
                propertyId: validatedData.propertyId,
                content: validatedData.content,
                type: validatedData.type as any,
                fileUrl: validatedData.fileUrl,
                fileName: validatedData.fileName,
                fileSize: validatedData.fileSize,
                callDuration: validatedData.callDuration,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        // Update conversation last message
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessage: validatedData.content || (validatedData.type === 'IMAGE' ? 'Sent an image' : 'Sent a file'),
                lastMessageAt: new Date(),
                unreadCount: {
                    increment: 1,
                },
            },
        });

        res.status(201).json(message);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get all conversations for a user
export const getConversations = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { tenantId: userId },
                    { hunterId: userId },
                ],
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
                hunter: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                lastMessageAt: 'desc',
            },
        });

        // Format for frontend
        const formattedConversations = conversations.map(conv => {
            const partner = conv.tenantId === userId ? conv.hunter : conv.tenant;
            return {
                id: conv.id,
                partnerId: partner.id,
                partner,
                lastMessage: {
                    content: conv.lastMessage,
                    createdAt: conv.lastMessageAt,
                },
                unreadCount: conv.unreadCount, // Note: This unread count is total for conversation, logic might need refinement for per-user unread
                propertyId: conv.propertyId,
            };
        });

        res.json(formattedConversations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get messages for a specific conversation
export const getConversationMessages = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { partnerId } = req.params; // This might be conversationId or partnerId. Let's assume conversationId for now or keep partnerId logic.
        // If partnerId is passed, we need to find the conversation first.

        // Let's support getting by conversationId if possible, but the route says /conversation/:partnerId
        // Let's stick to partnerId to minimize frontend changes for now, or fetch by conversationId if it looks like a UUID.

        // Actually, let's find the conversation between these two users.
        const conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { tenantId: userId, hunterId: partnerId },
                    { tenantId: partnerId, hunterId: userId },
                ],
            },
        });

        if (!conversation) {
            return res.json([]);
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversation.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId: conversation.id,
                receiverId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        // Reset unread count on conversation if I am the receiver of the last message?
        // Unread count on conversation model is simplistic. It doesn't track who it is unread for.
        // Ideally we should have ConversationParticipant model.
        // For now, let's just reset it if we are reading it.
        // But wait, if I sent the last message, unread count is for the other person.
        // If I am reading, it means I am the receiver.
        // So we should check if there were unread messages for me.

        // A better approach for unreadCount in Conversation model:
        // It's hard to maintain for two users with one field.
        // Let's ignore conversation.unreadCount for now and calculate it from messages if needed, 
        // or assume the unreadCount field is for the "other" person? No that's ambiguous.
        // Let's just rely on message.isRead for accuracy.

        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
export const markAsRead = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.body; // Changed from partnerId to conversationId if available, or keep partnerId

        // If we receive partnerId
        const { partnerId } = req.body;

        if (partnerId) {
            await prisma.message.updateMany({
                where: {
                    senderId: partnerId,
                    receiverId: userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });
        } else if (conversationId) {
            await prisma.message.updateMany({
                where: {
                    conversationId: conversationId,
                    receiverId: userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread count
export const getUnreadCount = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;

        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });

        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
