
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const properties = await prisma.property.findMany({
        select: {
            id: true,
            title: true,
            hunterId: true,
            hunter: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
    });

    console.log('Properties:', JSON.stringify(properties, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
