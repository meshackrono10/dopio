const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const booking = await prisma.booking.findFirst();
    console.log('BOOKING_ID:', booking ? booking.id : 'NONE');
    await prisma.$disconnect();
}

main();
