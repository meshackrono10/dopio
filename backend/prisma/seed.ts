import { PrismaClient, PropertyStatus, Role, PackageTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mock Data
const MOCK_HAUNTERS = [
    {
        email: "john.kamau@househaunters.com",
        name: "John Kamau",
        phone: "+254 712 345 678",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Experienced Agent specializing in Kasarani and Roysambu areas. I help tenants find quality, affordable housing with transparent pricing.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "mary.njeri@househaunters.com",
        name: "Mary Njeri",
        phone: "+254 723 456 789",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        bio: "Expert in luxury and mid-range properties in Westlands and Kilimani. Over 3 years experience in the rental market.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "david.ochieng@househaunters.com",
        name: "David Ochieng",
        phone: "+254 734 567 890",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        bio: "Focused on affordable housing in Embakasi and Umoja. I ensure every viewing is worth your time and money.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    }
];

const LOCATIONS = [
    { area: "Kasarani", address: "Seasons Road", lat: -1.2189, lng: 36.8885 },
    { area: "Roysambu", address: "Lumumba Drive", lat: -1.2234, lng: 36.8856 },
    { area: "Westlands", address: "Waiyaki Way", lat: -1.2707, lng: 36.8025 },
    { area: "Kilimani", address: "Argwings Kodhek", lat: -1.2921, lng: 36.7871 },
    { area: "Kileleshwa", address: "Oloitoktok Road", lat: -1.2833, lng: 36.8167 },
    { area: "South B", address: "Plainview Estate", lat: -1.3069, lng: 36.8263 },
    { area: "Langata", address: "Phenom Estate", lat: -1.3433, lng: 36.7649 },
    { area: "Embakasi", address: "Nyayo Estate", lat: -1.3133, lng: 36.8979 },
];

const AMENITIES_POOL = ["WiFi", "Parking", "CCTV", "Borehole", "Gym", "Swimming Pool", "Backup Generator", "Elevator", "Balcony", "Garden"];

const IMAGES_POOL = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
];

// Ensure every property has this video
const DEFAULT_VIDEO = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"];

function generateProperties(count: number) {
    const properties: any[] = [];
    for (let i = 0; i < count; i++) {
        const loc = LOCATIONS[i % LOCATIONS.length];
        const isPremium = i % 3 === 0;
        const rent = isPremium ? 45000 + (i * 1000) : 15000 + (i * 500);

        // Random amenities (3 to 6)
        const numAmenities = 3 + Math.floor(Math.random() * 4);
        const amenities = AMENITIES_POOL.sort(() => 0.5 - Math.random()).slice(0, numAmenities);

        const images = IMAGES_POOL.sort(() => 0.5 - Math.random()).slice(0, 3);
        const hunterIndex = i % 3; // Cycle through 3 hunters

        properties.push({
            title: `${isPremium ? 'Premium' : 'Cozy'} ${i % 2 === 0 ? '2-Bedroom' : '1-Bedroom'} in ${loc.area}`,
            description: `A lovely unit located in ${loc.area}. Features modern finishing and great security. Perfect for professionals.`,
            rent: rent,
            hunterEmail: i % 3 === 0 ? "john.kamau@househaunters.com" : (i % 3 === 1 ? "mary.njeri@househaunters.com" : "david.ochieng@househaunters.com"),
            location: {
                generalArea: loc.area,
                county: "Nairobi",
                address: loc.address,
                lat: loc.lat + (Math.random() * 0.002), // slight jitter
                lng: loc.lng + (Math.random() * 0.002)
            },
            amenities,
            images,
            videos: DEFAULT_VIDEO, // STRICT REQUIREMENT: Never list without video
            utilities: {
                waterIncluded: Math.random() > 0.5,
                electricityType: Math.random() > 0.5 ? "prepaid" : "postpaid",
            },
            listingPackage: isPremium ? "GOLD" : null,
            packageProperties: isPremium ? [
                {
                    propertyName: `Bonus ${loc.area} Unit A`,
                    monthlyRent: rent - 5000,
                    images: [IMAGES_POOL[0]]
                },
                {
                    propertyName: `Bonus ${loc.area} Unit B`,
                    monthlyRent: rent - 3000,
                    images: [IMAGES_POOL[1]]
                }
            ] : null,
            packages: [
                {
                    name: "Bronze Package",
                    description: "View this specific property",
                    price: 1000,
                    tier: PackageTier.BRONZE,
                    propertiesIncluded: 1,
                    features: ["1 hour viewing"]
                },
                ...(isPremium ? [{
                    name: "Gold Package",
                    description: "View this plus 2 similar units",
                    price: 2500,
                    tier: PackageTier.GOLD,
                    propertiesIncluded: 3,
                    features: ["3 hour viewing", "Area tour"]
                }] : [])
            ]
        });
    }
    return properties;
}

const MOCK_PROPERTIES = generateProperties(25); // Create 25 properties

async function main() {
    console.log('🌱 Starting database seed with MANY houses...');

    // Clear existing data (Order matters due to foreign keys)
    await prisma.hunterEarnings.deleteMany();
    await prisma.meetingPoint.deleteMany();
    await prisma.rescheduleRequest.deleteMany();
    await prisma.alternativeOffer.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.savedProperty.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.paymentHistory.deleteMany();
    await prisma.conversation.deleteMany();

    await prisma.message.deleteMany();
    await prisma.review.deleteMany();

    // Break circular or complex deps if needed, but deleting booking then request usually works if request.bookingId is nullable
    await prisma.booking.deleteMany();
    await prisma.viewingRequest.deleteMany();

    await prisma.viewingPackage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleared existing data.');

    // Passwords
    const password = await bcrypt.hash('password123', 10);

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@househaunters.com',
            password,
            name: 'Admin User',
            role: Role.ADMIN,
            phone: '0700000000',
            isVerified: true
        },
    });
    console.log(`👤 Created Admin: ${admin.name}`);

    // Create Tenant
    const tenant = await prisma.user.create({
        data: {
            email: 'tenant@househaunters.com',
            password,
            name: 'Jane Tenant',
            role: Role.TENANT,
            phone: '0722222222',
        },
    });
    console.log(`👤 Created Tenant: ${tenant.name}`);

    // Create Hunters
    const createdHunters: Record<string, string> = {}; // email -> id

    for (const hunterData of MOCK_HAUNTERS) {
        const hunter = await prisma.user.create({
            data: {
                email: hunterData.email,
                password, // same password for all
                name: hunterData.name,
                role: Role.HUNTER,
                phone: hunterData.phone,
                avatarUrl: hunterData.avatarUrl,
                description: hunterData.bio,
                isVerified: hunterData.isVerified,
                verificationStatus: hunterData.verificationStatus
            }
        });
        createdHunters[hunter.email] = hunter.id;
        console.log(`👤 Created Hunter: ${hunter.name}`);
    }

    // Create Properties
    for (const prop of MOCK_PROPERTIES) {
        const hunterId = createdHunters[prop.hunterEmail];
        if (!hunterId) {
            console.warn(`⚠️ Hunter not found for property ${prop.title}`);
            continue;
        }

        const property = await prisma.property.create({
            data: {
                title: prop.title,
                description: prop.description,
                rent: prop.rent,
                hunterId: hunterId,
                status: PropertyStatus.AVAILABLE,
                location: JSON.stringify(prop.location),
                amenities: JSON.stringify(prop.amenities),
                images: JSON.stringify(prop.images),
                utilities: JSON.stringify(prop.utilities),
                // Add the new fields
                packageProperties: prop.packageProperties ? JSON.stringify(prop.packageProperties) : null,
                listingPackage: prop.listingPackage || null,
                packages: {
                    create: prop.packages.map((pkg: any) => ({
                        name: pkg.name,
                        description: pkg.description,
                        price: pkg.price,
                        tier: pkg.tier,
                        propertiesIncluded: pkg.propertiesIncluded,
                        features: JSON.stringify(pkg.features)
                    }))
                }
            }
        });
        console.log(`🏠 Created Property: ${prop.title}`);
    }

    console.log('✅ Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
