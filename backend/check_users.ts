
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users: ${userCount}`);

        const users = await prisma.user.findMany({
            take: 5,
            select: { id: true, email: true, name: true, role: true }
        });
        console.log('Sample users:', users);
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
