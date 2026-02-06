import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function linkGoldProperties() {
    try {
        console.log('🔗 Linking existing Gold properties...\n');

        // Find all Gold properties belonging to John Kamau
        const hunter = await prisma.user.findUnique({
            where: { email: 'john.kamau@househaunters.com' }
        });

        if (!hunter) {
            console.error('❌ Hunter not found');
            return;
        }

        const goldProperties = await prisma.property.findMany({
            where: {
                hunterId: hunter.id,
                listingPackage: 'GOLD'
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`Found ${goldProperties.length} Gold properties`);

        if (goldProperties.length !== 3) {
            console.warn(`⚠️  Expected 3 Gold properties, found ${goldProperties.length}`);
            if (goldProperties.length < 3) {
                console.log('Not enough properties to link. Exiting.');
                return;
            }
        }

        // Generate a package group ID
        const packageGroupId = randomUUID();
        console.log(`Generated package group ID: ${packageGroupId}\n`);

        // Property 1: 2BR Modern (Master)
        await prisma.property.update({
            where: { id: goldProperties[0].id },
            data: {
                packageGroupId,
                packagePosition: 1,
                packageMasterId: null // Master property doesn't have a master
            }
        });
        console.log(`✓ Property 1 (Master): ${goldProperties[0].title}`);
        console.log(`  ID: ${goldProperties[0].id}`);
        console.log(`  Position: 1 (Master)`);

        // Property 2: 1BR Furnished
        await prisma.property.update({
            where: { id: goldProperties[1].id },
            data: {
                packageGroupId,
                packagePosition: 2,
                packageMasterId: goldProperties[0].id // Points to master
            }
        });
        console.log(`\n✓ Property 2: ${goldProperties[1].title}`);
        console.log(`  ID: ${goldProperties[1].id}`);
        console.log(`  Position: 2`);
        console.log(`  Master: ${goldProperties[0].id}`);

        // Property 3: 3BR Family
        await prisma.property.update({
            where: { id: goldProperties[2].id },
            data: {
                packageGroupId,
                packagePosition: 3,
                packageMasterId: goldProperties[0].id // Points to master
            }
        });
        console.log(`\n✓ Property 3: ${goldProperties[2].title}`);
        console.log(`  ID: ${goldProperties[2].id}`);
        console.log(`  Position: 3`);
        console.log(`  Master: ${goldProperties[0].id}`);

        // Verify the linking
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('🎉 Successfully linked all 3 properties into a Gold package!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Package Group ID: ${packageGroupId}`);
        console.log(`Master Property: ${goldProperties[0].title}`);
        console.log(`Location: Kilimani, Nairobi`);
        console.log(`Hunter: John Kamau`);

        // Test querying package members
        console.log('\n📊 Testing package member query...');
        const masterWithMembers = await prisma.property.findUnique({
            where: { id: goldProperties[0].id },
            include: {
                packageMembers: true
            }
        });

        console.log(`Master property has ${masterWithMembers?.packageMembers.length || 0} members`);
        masterWithMembers?.packageMembers.forEach((member, idx) => {
            console.log(`  ${idx + 1}. ${member.title} (Position ${member.packagePosition})`);
        });

    } catch (error) {
        console.error('❌ Error linking properties:', error);
    } finally {
        await prisma.$disconnect();
    }
}

linkGoldProperties();
