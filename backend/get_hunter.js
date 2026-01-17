const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hunter = await prisma.user.findFirst({
        where: { role: 'HUNTER' }
    });
    console.log('HUNTER:', JSON.stringify(hunter, null, 2));
    await prisma.$disconnect();
}

main();
