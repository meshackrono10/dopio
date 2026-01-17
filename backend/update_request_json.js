const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const requestId = '9afb59a3-25fa-4ec1-8485-c75ff393e9a4';
    const updated = await prisma.viewingRequest.update({
        where: { id: requestId },
        data: {
            status: 'COUNTERED',
            counteredBy: 'f06c99be-a57e-4ea8-9953-ff4042f4d3af',
            counterDate: new Date('2026-02-01').toISOString(),
            counterTime: '14:00',
            counterLocation: JSON.stringify({ name: 'Test Location', location: 'Test Location' })
        }
    });
    console.log('UPDATED REQUEST:', JSON.stringify(updated, null, 2));
    await prisma.$disconnect();
}

main();
