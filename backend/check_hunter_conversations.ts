
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function main() {
    try {
        // 3. Check DB directly
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const hunterEmail = 'meshackrono05@gmail.com';
        const hunter = await prisma.user.findUnique({ where: { email: hunterEmail } });

        if (!hunter) {
            console.log(`Hunter ${hunterEmail} not found in DB`);
            return;
        }

        console.log('Hunter ID:', hunter.id);

        const dbConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { tenantId: hunter.id },
                    { hunterId: hunter.id },
                ],
            },
            include: {
                messages: true
            }
        });
        console.log('Conversations in DB:', JSON.stringify(dbConversations, null, 2));
        await prisma.$disconnect();

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();
