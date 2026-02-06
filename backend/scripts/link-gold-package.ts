import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkGoldPackage() {
    console.log('🔗 Linking first 3 properties as Gold Package...');

    // Get first 3 properties
    const properties = await prisma.property.findMany({
        take: 3,
        orderBy: { createdAt: 'asc' }
    });

    if (properties.length < 3) {
        console.error('❌ Not enough properties found');
        return;
    }

    const packageGroupId = 'b5e91c8a-47dc-436d-a388-4f181c19c1da';
    const masterId = properties[0].id;

    // Update each property with package linking fields
    for (let i = 0; i < 3; i++) {
        await prisma.property.update({
            where: { id: properties[i].id },
            data: {
                listingPackage: 'GOLD',
                packageGroupId: packageGroupId,
                packagePosition: i + 1,
                packageMasterId: masterId
            }
        });
        console.log(`✅ Linked property ${i + 1}/3: ${properties[i].title}`);
    }

    console.log(`\n🏆 Gold Package Created!`);
    console.log(`   Package Group ID: ${packageGroupId}`);
    console.log(`   Master Property ID: ${masterId}`);
    console.log(`   Properties Linked: 3`);
}

linkGoldPackage()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
