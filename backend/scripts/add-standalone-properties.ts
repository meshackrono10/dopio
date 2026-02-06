import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStandaloneProperties() {
    console.log('🏠 Adding Standalone Properties...\n');

    // Get all hunters
    const hunters = await prisma.user.findMany({
        where: { role: 'HUNTER' },
        select: { id: true, name: true, email: true }
    });

    if (hunters.length === 0) {
        console.log('❌ No hunters found');
        return;
    }

    console.log(`Found ${hunters.length} hunters\n`);

    const locations = [
        { area: 'Kasarani', county: 'Nairobi', lat: -1.2221, lng: 36.8986 },
        { area: 'Roysambu', county: 'Nairobi', lat: -1.2100, lng: 36.8920 },
        { area: 'Westlands', county: 'Nairobi', lat: -1.2676, lng: 36.8070 },
        { area: 'Kilimani', county: 'Nairobi', lat: -1.2921, lng: 36.7856 },
        { area: 'Kileleshwa', county: 'Nairobi', lat: -1.2897, lng: 36.7728 },
        { area: 'South B', county: 'Nairobi', lat: -1.3106, lng: 36.8336 },
        { area: 'Langata', county: 'Nairobi', lat: -1.3525, lng: 36.7496 },
        { area: 'Embakasi', county: 'Nairobi', lat: -1.3197, lng: 36.8947 },
        { area: 'Ruaka', county: 'Kiambu', lat: -1.2044, lng: 36.7775 },
        { area: 'Kahawa West', county: 'Nairobi', lat: -1.1815, lng: 36.9294 }
    ];

    const types = ['1-bedroom', '2-bedroom', 'bedsitter', 'studio'];
    const amenities = [
        'Parking',
        'Security',
        'Water Supply',
        'Backup Generator',
        'CCTV',
        'Gym',
        'Swimming Pool',
        'Playground',
        'Shopping Center Nearby',
        'Hospital Nearby'
    ];

    let totalCreated = 0;

    // Create 5 properties per hunter
    for (const hunter of hunters) {
        console.log(`Creating properties for ${hunter.name}...`);

        for (let i = 0; i < 5; i++) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const isSilver = Math.random() > 0.7; // 30% chance of Silver

            const baseRent = type === 'bedsitter' ? 12000 :
                type === 'studio' ? 15000 :
                    type === '1-bedroom' ? 18000 : 25000;

            const rent = baseRent + Math.floor(Math.random() * 10000);

            // Random selection of amenities (5-8 amenities)
            const numAmenities = 5 + Math.floor(Math.random() * 4);
            const selectedAmenities = [...amenities]
                .sort(() => Math.random() - 0.5)
                .slice(0, numAmenities);

            // Generate placeholder images
            const images = [
                `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800`,
                `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800`,
                `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800`,
                `https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800`,
                `https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800`,
                `https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=800`,
                `https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800`,
                `https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800`
            ];

            const title = `${isSilver ? 'Premium' : 'Modern'} ${type} in ${location.area}`;
            const description = `A lovely ${type} apartment located in ${location.area}. Features modern finishing, excellent security, and great amenities. Perfect for ${type === 'bedsitter' || type === 'studio' ? 'young professionals' : 'small families'}.`;

            const property = await prisma.property.create({
                data: {
                    title,
                    description,
                    rent,
                    location: JSON.stringify({
                        lat: location.lat + (Math.random() - 0.5) * 0.01,
                        lng: location.lng + (Math.random() - 0.5) * 0.01,
                        address: `Plot ${Math.floor(Math.random() * 500) + 1}, ${location.area}`,
                        generalArea: location.area,
                        county: location.county
                    }),
                    amenities: JSON.stringify(selectedAmenities),
                    images: JSON.stringify(images),
                    utilities: JSON.stringify({
                        waterIncluded: true,
                        electricityType: 'prepaid',
                        garbageIncluded: true,
                        securityIncluded: true
                    }),
                    listingPackage: isSilver ? 'SILVER' : 'BRONZE',
                    status: 'AVAILABLE',
                    hunterId: hunter.id,
                    packages: {
                        create: isSilver ? [
                            {
                                tier: 'BRONZE',
                                name: 'Bronze Viewing Package',
                                price: 1000,
                                propertiesIncluded: 1,
                                features: JSON.stringify([
                                    'View this property',
                                    'Standard showing',
                                    'Professional agent'
                                ])
                            },
                            {
                                tier: 'SILVER',
                                name: 'Silver Viewing Package',
                                price: 1500,
                                propertiesIncluded: 1,
                                features: JSON.stringify([
                                    'Extended viewing time',
                                    'Area tour included',
                                    'Dedicated agent',
                                    'Flexible scheduling'
                                ])
                            }
                        ] : [{
                            tier: 'BRONZE',
                            name: 'Bronze Viewing Package',
                            price: 1000,
                            propertiesIncluded: 1,
                            features: JSON.stringify([
                                'View this property',
                                'Standard showing',
                                'Professional agent'
                            ])
                        }]
                    }
                }
            });

            console.log(`  ✅ Created: ${title}`);
            totalCreated++;
        }
        console.log('');
    }

    console.log(`\n🎉 Summary:`);
    console.log(`   Total Properties Created: ${totalCreated}`);
    console.log(`   Properties per Hunter: 5`);
    console.log(`   All properties are standalone (not in packages)`);
}

addStandaloneProperties()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
