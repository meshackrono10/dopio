import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGoldPackageOwner() {
    console.log('🔍 Checking Gold Package ownership...\n');

    // Get all properties in the Gold package
    const goldProperties = await prisma.property.findMany({
        where: {
            packageGroupId: 'b5e91c8a-47dc-436d-a388-4f181c19c1da'
        },
        include: {
            hunter: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            packagePosition: 'asc'
        }
    });

    if (goldProperties.length === 0) {
        console.log('❌ No Gold package properties found');
        return;
    }

    console.log('🏆 Gold Package Properties:\n');
    goldProperties.forEach((prop, idx) => {
        console.log(`Property ${prop.packagePosition}:`);
        console.log(`  Title: ${prop.title}`);
        console.log(`  Owner: ${prop.hunter.name} (${prop.hunter.email})`);
        console.log(`  Property ID: ${prop.id}`);
        console.log('');
    });

    // Check if all properties have the same owner
    const uniqueOwners = [...new Set(goldProperties.map(p => p.hunter.email))];

    if (uniqueOwners.length === 1) {
        console.log(`✅ All 3 properties owned by: ${goldProperties[0].hunter.name}`);
    } else {
        console.log(`⚠️  Properties owned by ${uniqueOwners.length} different hunters:`);
        uniqueOwners.forEach(email => console.log(`   - ${email}`));
    }
}

checkGoldPackageOwner()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
