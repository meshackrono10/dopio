
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting messaging reproduction...');

    // 1. Create Tenant and Hunter
    const tenantEmail = `tenant_${Date.now()}@test.com`;
    const hunterEmail = `hunter_${Date.now()}@test.com`;

    const tenant = await prisma.user.create({
        data: {
            email: tenantEmail,
            password: 'password',
            name: 'Test Tenant',
            role: Role.TENANT,
            phone: `07${Math.floor(Math.random() * 100000000)}`,
        },
    });

    const hunter = await prisma.user.create({
        data: {
            email: hunterEmail,
            password: 'password',
            name: 'Test Hunter',
            role: Role.HUNTER,
            phone: `07${Math.floor(Math.random() * 100000000)}`,
        },
    });

    console.log(`Created Tenant: ${tenant.id} (${tenant.role})`);
    console.log(`Created Hunter: ${hunter.id} (${hunter.role})`);

    // 2. Tenant sends message to Hunter
    // Logic from messageController.sendMessage
    let conversation = await prisma.conversation.findFirst({
        where: {
            OR: [
                { tenantId: tenant.id, hunterId: hunter.id },
                { tenantId: hunter.id, hunterId: tenant.id },
            ],
        },
    });

    if (!conversation) {
        console.log('Creating new conversation...');
        conversation = await prisma.conversation.create({
            data: {
                tenantId: tenant.id,
                hunterId: hunter.id,
            },
        });
    }

    const message = await prisma.message.create({
        data: {
            senderId: tenant.id,
            receiverId: hunter.id,
            conversationId: conversation.id,
            content: 'Hello Hunter, can you see me?',
            type: 'TEXT',
        },
    });

    console.log(`Message sent: ${message.id}`);

    // Update conversation
    await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
            lastMessage: 'Hello Hunter, can you see me?',
            lastMessageAt: new Date(),
            unreadCount: { increment: 1 },
        },
    });

    // 3. Hunter fetches conversations
    // Logic from messageController.getConversations
    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { tenantId: hunter.id },
                { hunterId: hunter.id },
            ],
        },
        include: {
            tenant: true,
            hunter: true,
        },
    });

    console.log(`Hunter found ${conversations.length} conversations.`);

    const foundConv = conversations.find(c => c.id === conversation?.id);
    if (foundConv) {
        console.log('SUCCESS: Hunter found the conversation.');
        console.log('Conversation details:', foundConv);
    } else {
        console.error('FAILURE: Hunter did NOT find the conversation.');
    }

    // 4. Hunter fetches messages
    const messages = await prisma.message.findMany({
        where: {
            conversationId: conversation.id,
        },
    });
    console.log(`Hunter found ${messages.length} messages in conversation.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
