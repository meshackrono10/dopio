const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hunterId = "258b3c5a-e5e4-4b0a-9270-f85c46365dfe";
    const requests = await prisma.viewingRequest.findMany({
        where: {
            property: { hunterId: hunterId },
            status: { in: ['PENDING', 'COUNTERED'] }
        },
        include: { property: true }
    });
    console.log('PENDING REQUESTS:', JSON.stringify(requests, null, 2));
    await prisma.$disconnect();
}

main();
