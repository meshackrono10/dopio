import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixGoldListing() {
    try {
        // Delete the incorrect listing with its packages
        console.log('Deleting incorrect listing and its packages...');
        await prisma.viewingPackage.deleteMany({
            where: { propertyId: '8f3fddf1-8173-47c0-830a-86a0a36cf066' }
        });
        await prisma.property.delete({
            where: { id: '8f3fddf1-8173-47c0-830a-86a0a36cf066' }
        });
        console.log('✅ Deleted incorrect listing\n');

        // Find the house hunter user
        const hunter = await prisma.user.findUnique({
            where: { email: 'john.kamau@househaunters.com' }
        });

        if (!hunter) {
            console.error('Hunter not found');
            return;
        }

        console.log('Creating 3 independent properties for Gold package...\n');

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

        console.log('\n✅ Successfully created 3 independent Gold package properties!\n');
        console.log('Property 1:', property1.id, '-', property1.title, '- KES', property1.rent.toLocaleString());
        console.log('Property 2:', property2.id, '-', property2.title, '- KES', property2.rent.toLocaleString());
        console.log('Property 3:', property3.id, '-', property3.title, '- KES', property3.rent.toLocaleString());
        console.log('\nAll properties are in Kilimani, Nairobi');
        console.log('Each property is completely independent with its own:');
        console.log('- Rent amount');
        console.log('- Amenities');
        console.log('- Images (8 each)');
        console.log('- Utilities configuration');
        console.log('\nThey share only:');
        console.log('- Location (Kilimani, Nairobi)');
        console.log('- Gold Viewing Package offering');
        console.log('\nHunter: John Kamau (john.kamau@househaunters.com)');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixGoldListing();
