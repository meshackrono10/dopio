import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createMultipleGoldPackages() {
    console.log('🏆 Creating Multiple Gold Packages...\n');

    // Get all available properties (not already in packages)
    const availableProperties = await prisma.property.findMany({
        where: {
            packageGroupId: null,
            status: 'AVAILABLE'
        },
        include: {
            hunter: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log(`📦 Found ${availableProperties.length} available properties\n`);

    if (availableProperties.length < 6) {
        console.log(`⚠️  Need at least 6 properties to create 2 Gold packages. Found ${availableProperties.length}`);
        return;
    }

    // Group properties by hunter
    const propertiesByHunter = availableProperties.reduce((acc, prop) => {
        const hunterId = prop.hunterId;
        if (!acc[hunterId]) {
            acc[hunterId] = [];
        }
        acc[hunterId].push(prop);
        return acc;
    }, {} as Record<string, typeof availableProperties>);

    let packagesCreated = 0;
    const targetPackages = 2; // Create 2 additional Gold packages

    // Create Gold packages for hunters with at least 3 properties
    for (const [hunterId, properties] of Object.entries(propertiesByHunter)) {
        if (packagesCreated >= targetPackages) break;

        if (properties.length >= 3) {
            const packageGroupId = randomUUID();
            const propsToLink = properties.slice(0, 3);
            const masterId = propsToLink[0].id;

            console.log(`\n🏆 Creating Gold Package ${packagesCreated + 1}:`);
            console.log(`   Hunter: ${propsToLink[0].hunter.name} (${propsToLink[0].hunter.email})`);
            console.log(`   Package ID: ${packageGroupId}`);
            console.log(`   Properties:`);

            // Link the 3 properties
            for (let i = 0; i < 3; i++) {
                await prisma.property.update({
                    where: { id: propsToLink[i].id },
                    data: {
                        listingPackage: 'GOLD',
                        packageGroupId: packageGroupId,
                        packagePosition: i + 1,
                        packageMasterId: i === 0 ? null : masterId
                    }
                });

                console.log(`   ${i + 1}. ${propsToLink[i].title}`);

                // Update viewing packages to Gold
                await prisma.viewingPackage.updateMany({
                    where: { propertyId: propsToLink[i].id },
                    data: {
                        tier: 'GOLD',
                        name: 'Gold Viewing Package',
                        price: 1500,
                        propertiesIncluded: 3,
                        features: JSON.stringify([
                            'View 3 premium properties',
                            'Dedicated agent service',
                            'Flexible scheduling',
                            'Premium locations'
                        ])
                    }
                });
            }

            packagesCreated++;
            console.log(`   ✅ Package created successfully!`);
        }
    }

    console.log(`\n\n🎉 Summary:`);
    console.log(`   Total Gold Packages Created: ${packagesCreated}`);
    console.log(`   Properties Linked: ${packagesCreated * 3}`);
}

createMultipleGoldPackages()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
