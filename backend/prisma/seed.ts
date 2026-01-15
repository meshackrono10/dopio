import { PrismaClient, PropertyStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.booking.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.viewingRequest.deleteMany();
    await prisma.viewingPackage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const hunterPassword = await bcrypt.hash('hunter123', 10);
    const tenantPassword = await bcrypt.hash('tenant123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@househaunters.com',
            password: adminPassword,
            name: 'Admin User',
            role: Role.ADMIN,
            phone: '0700000000',
        },
    });

    const hunter = await prisma.user.create({
        data: {
            email: 'hunter@househaunters.com',
            password: hunterPassword,
            name: 'John Hunter',
            role: Role.HUNTER,
            phone: '0711111111',
            isVerified: true,
            verificationStatus: 'APPROVED',
        },
    });

    const tenant = await prisma.user.create({
        data: {
            email: 'tenant@househaunters.com',
            password: tenantPassword,
            name: 'Jane Tenant',
            role: Role.TENANT,
            phone: '0722222222',
        },
    });

    // Create Property
    const property = await prisma.property.create({
        data: {
            title: 'Modern 2-Bedroom Apartment',
            description: 'A beautiful modern apartment in the heart of Kasarani.',
            rent: 25000,
            location: {
                generalArea: 'Kasarani',
                county: 'Nairobi',
                address: 'Mwiki Road, near Moi Stadium',
                lat: -1.2189,
                lng: 36.8885,
            },
            amenities: ['WiFi', 'Parking', 'CCTV', 'Borehole'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
            status: PropertyStatus.AVAILABLE,
            hunterId: hunter.id,
            packages: {
                create: [
                    {
                        name: 'Bronze Package',
                        description: 'Basic viewing for 1 property',
                        price: 1000,
                        tier: 'BRONZE',
                        propertiesIncluded: 1,
                        features: ['1-hour slot', 'Single property viewing'],
                    },
                    {
                        name: 'Silver Package',
                        description: 'View up to 3 similar properties',
                        price: 2000,
                        tier: 'SILVER',
                        propertiesIncluded: 3,
                        features: ['2-hour slot', 'Up to 3 properties', 'Area tour'],
                    },
                    {
                        name: 'Gold Package',
                        description: 'Premium viewing with neighborhood tour',
                        price: 2500,
                        tier: 'GOLD',
                        propertiesIncluded: 5,
                        features: ['3-hour slot', 'Up to 5 properties', 'Full neighborhood tour', 'Property recommendations'],
                    },
                ],
            },
        },
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
