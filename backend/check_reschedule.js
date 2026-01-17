const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const request = await prisma.rescheduleRequest.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    console.log('REQUEST:', JSON.stringify(request, null, 2));
    await prisma.$disconnect();
}

main();
