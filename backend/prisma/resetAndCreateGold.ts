import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAndCreateGoldPackage() {
    try {
        console.log('🗑️  Deleting all existing properties...');

        // Delete all viewing packages first (foreign key constraint)
        await prisma.viewingPackage.deleteMany({});
        console.log('   Deleted all viewing packages');

        // Delete all properties
        await prisma.property.deleteMany({});
        console.log('   Deleted all properties');

        console.log('\n✅ All listings deleted\n');

        // Find the house hunter user
        const hunter = await prisma.user.findUnique({
            where: { email: 'john.kamau@househaunters.com' }
        });

        if (!hunter) {
            console.error('❌ Hunter not found with email: john.kamau@househaunters.com');
            return;
        }

        console.log('📦 Creating Gold Package (3 independent properties)...\n');

        // Common location (Kilimani)
        const location = {
            lat: -1.2921,
            lng: 36.7856,
            address: 'Kilimani, Nairobi',
            generalArea: 'Kilimani',
            county: 'Nairobi',
            directions: 'Off Argwings Kodhek Road, near Yaya Centre'
        };

        // Property 1: 2BR Modern Apartment
        const property1 = await prisma.property.create({
            data: {
                title: 'Modern 2BR Apartment with Balcony - Kilimani',
                description: 'Spacious 2-bedroom apartment featuring modern finishes, a large balcony with city views, and premium amenities. Located in a secure compound with ample parking and 24/7 security.',
                rent: 50000,
                location: JSON.stringify(location),
                amenities: JSON.stringify([
                    'Parking',
                    'Security Guard',
                    'WiFi',
                    'Water Backup',
                    'Balcony',
                    'Modern Kitchen',
                    'CCTV',
                    'Gym'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1502672260066-6bc35f0da85a?w=800',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
                    'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
                ]),
                videos: JSON.stringify(['https://www.youtube.com/watch?v=dQw4w9WgXcQ']),
                utilities: JSON.stringify({
                    waterIncluded: false,
                    waterCost: '500',
                    electricityType: 'prepaid',
                    electricityCost: '',
                    garbageIncluded: true,
                    securityIncluded: true
                }),
                listingPackage: 'GOLD',
                hunterId: hunter.id,
                status: 'AVAILABLE',
                packages: {
                    create: [{
                        tier: 'GOLD',
                        name: 'Gold Viewing Package',
                        price: 1500,
                        propertiesIncluded: 3,
                        features: JSON.stringify([
                            'View 3 properties in one package',
                            'Premium locations',
                            'Dedicated agent',
                            'Flexible scheduling'
                        ])
                    }]
                }
            }
        });

        // Property 2: 1BR Furnished Apartment
        const property2 = await prisma.property.create({
            data: {
                title: 'Fully Furnished 1BR Apartment - Kilimani',
                description: 'Cozy 1-bedroom fully furnished apartment perfect for young professionals. Includes all furniture, kitchen appliances, and utilities. Move-in ready!',
                rent: 45000,
                location: JSON.stringify(location),
                amenities: JSON.stringify([
                    'Parking',
                    'Security Guard',
                    'Furnished',
                    'WiFi Ready',
                    'Modern Kitchen',
                    'Swimming Pool',
                    'CCTV'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
                    'https://images.unsplash.com/photo-1502672260066-6bc35f0da85a?w=800',
                    'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800',
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
                ]),
                videos: JSON.stringify(['https://www.youtube.com/watch?v=dQw4w9WgXcQ']),
                utilities: JSON.stringify({
                    waterIncluded: true,
                    electricityType: 'prepaid',
                    garbageIncluded: true,
                    securityIncluded: true
                }),
                listingPackage: 'GOLD',
                hunterId: hunter.id,
                status: 'AVAILABLE',
                packages: {
                    create: [{
                        tier: 'GOLD',
                        name: 'Gold Viewing Package',
                        price: 1500,
                        propertiesIncluded: 3,
                        features: JSON.stringify([
                            'View 3 properties in one package',
                            'Premium locations',
                            'Dedicated agent',
                            'Flexible scheduling'
                        ])
                    }]
                }
            }
        });

        // Property 3: 3BR Family Apartment
        const property3 = await prisma.property.create({
            data: {
                title: 'Spacious 3BR Family Apartment - Kilimani',
                description: 'Large 3-bedroom apartment ideal for families. Features include spacious living areas, master ensuite, family bathroom, and a dedicated parking spot. Near top schools and shopping centers.',
                rent: 65000,
                location: JSON.stringify(location),
                amenities: JSON.stringify([
                    'Parking (2 spots)',
                    'Security Guard',
                    'WiFi',
                    'Water Backup',
                    'Playground',
                    'Modern Kitchen',
                    'CCTV',
                    'Gym',
                    'Generator Backup'
                ]),
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1502672260066-6bc35f0da85a?w=800',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
                    'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
                ]),
                videos: JSON.stringify(['https://www.youtube.com/watch?v=dQw4w9WgXcQ']),
                utilities: JSON.stringify({
                    waterIncluded: false,
                    waterCost: '800',
                    electricityType: 'postpaid',
                    electricityCost: '',
                    garbageIncluded: true,
                    securityIncluded: true
                }),
                listingPackage: 'GOLD',
                hunterId: hunter.id,
                status: 'AVAILABLE',
                packages: {
                    create: [{
                        tier: 'GOLD',
                        name: 'Gold Viewing Package',
                        price: 1500,
                        propertiesIncluded: 3,
                        features: JSON.stringify([
                            'View 3 properties in one package',
                            'Premium locations',
                            'Dedicated agent',
                            'Flexible scheduling'
                        ])
                    }]
                }
            }
        });

        console.log('✅ Successfully created Gold Package (3 independent properties)!\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Property 1: Modern 2BR Apartment');
        console.log(`  ID: ${property1.id}`);
        console.log(`  Rent: KES ${property1.rent.toLocaleString()}/month`);
        console.log(`  Amenities: 8 (incl. Parking, Gym, Balcony)`);
        console.log(`  Utilities: Water KES 500/mo, Electricity Prepaid`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('Property 2: Furnished 1BR Apartment');
        console.log(`  ID: ${property2.id}`);
        console.log(`  Rent: KES ${property2.rent.toLocaleString()}/month`);
        console.log(`  Amenities: 7 (incl. Furnished, Swimming Pool)`);
        console.log(`  Utilities: Water Included, Electricity Prepaid`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('Property 3: Spacious 3BR Family Apartment');
        console.log(`  ID: ${property3.id}`);
        console.log(`  Rent: KES ${property3.rent.toLocaleString()}/month`);
        console.log(`  Amenities: 9 (incl. 2 Parking, Playground, Generator)`);
        console.log(`  Utilities: Water KES 800/mo, Electricity Postpaid`);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('\n📍 Location: Kilimani, Nairobi (all 3 properties)');
        console.log('💎 Package: Gold Viewing Package - KES 1,500');
        console.log('👤 Hunter: John Kamau (john.kamau@househaunters.com)');
        console.log('\n✨ Each property is completely independent and browseable!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAndCreateGoldPackage();
