const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const requests = await prisma.viewingRequest.groupBy({
        by: ['propertyId', 'tenantId'],
        _count: {
            id: true
        },
        having: {
            id: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    if (requests.length > 0) {
        console.log('Found duplicates:', requests);
        for (const req of requests) {
            const details = await prisma.viewingRequest.findMany({
                where: {
                    propertyId: req.propertyId,
                    tenantId: req.tenantId
                }
            });
            console.log('Details for duplicate:', JSON.stringify(details, null, 2));
        }
    } else {
        console.log('No duplicates found.');
    }

    await prisma.$disconnect();
}

main();
