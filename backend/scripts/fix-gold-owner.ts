import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixGoldPackageOwnership() {
    console.log('🔧 Fixing Gold Package ownership...\n');

    // Get Sarah Mwangi (the first hunter)
    const sarah = await prisma.user.findUnique({
        where: { email: 'sarah.mwangi@househaunters.com' }
    });

    if (!sarah) {
        console.error('❌ Sarah Mwangi not found');
        return;
    }

    // Get all Gold package properties
    const goldProperties = await prisma.property.findMany({
        where: {
            packageGroupId: 'b5e91c8a-47dc-436d-a388-4f181c19c1da'
        }
    });

    console.log(`📦 Transferring ${goldProperties.length} properties to Sarah Mwangi...\n`);

    // Transfer all properties to Sarah
    for (const prop of goldProperties) {
        await prisma.property.update({
            where: { id: prop.id },
            data: { hunterId: sarah.id }
        });
        console.log(`✅ Transferred: ${prop.title}`);
    }

    console.log(`\n🎉 All Gold package properties now owned by Sarah Mwangi!`);
}

fixGoldPackageOwnership()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
