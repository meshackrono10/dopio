import { PrismaClient, PropertyStatus, Role, PackageTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mock Data - Fresh user accounts
const MOCK_HAUNTERS = [
    {
        email: "sarah.mwangi@househaunters.com",
        name: "Sarah Mwangi",
        phone: "+254 798 123 456",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        bio: "Professional real estate agent with 5+ years experience. Specializing in Westlands, Kilimani, and Lavington premium properties.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "james.omondi@househaunters.com",
        name: "James Omondi",
        phone: "+254 711 987 654",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        bio: "Expert in budget-friendly housing in Kasarani, Roysambu, and Ruiru. Helping young professionals find their ideal home.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "grace.wanjiru@househaunters.com",
        name: "Grace Wanjiru",
        phone: "+254 722 456 789",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        bio: "Trusted agent for South B, South C, and Langata areas. Focused on family-friendly neighborhoods with great amenities.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "michael.kariuki@househaunters.com",
        name: "Michael Kariuki",
        phone: "+254 733 222 111",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
        bio: "Specialist in Embakasi and Industrial Area properties. 4 years helping tenants find quality, affordable housing.",
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
        // Most properties are Bronze (standard), some are Silver (premium)
        const isSilver = i % 5 === 0; // Every 5th property is Silver
        const rent = isSilver ? 35000 + (i * 1000) : 18000 + (i * 800);

        // Random amenities (3 to 6)
        const numAmenities = 3 + Math.floor(Math.random() * 4);
        const amenities = AMENITIES_POOL.sort(() => 0.5 - Math.random()).slice(0, numAmenities);

        const images = IMAGES_POOL.sort(() => 0.5 - Math.random()).slice(0, 3);
        const hunterIndex = i % 3; // Cycle through 3 hunters

        properties.push({
            title: `${isSilver ? 'Premium' : 'Modern'} ${i % 2 === 0 ? '2-Bedroom' : '1-Bedroom'} in ${loc.area}`,
            description: `A lovely unit located in ${loc.area}. Features modern finishing and great security. Perfect for professionals.`,
            rent: rent,
            hunterEmail: i % 3 === 0 ? "sarah.mwangi@househaunters.com" : (i % 3 === 1 ? "james.omondi@househaunters.com" : "grace.wanjiru@househaunters.com"),
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
            listingPackage: isSilver ? "SILVER" : "BRONZE", // Most are Bronze, some Silver

            packageProperties: null, // No package properties for standalone listings

            packages: [
                {
                    name: "Bronze Package",
                    description: "View this specific property",
                    price: 1000,
                    tier: PackageTier.BRONZE,
                    propertiesIncluded: 1,
                    features: ["1 hour viewing"]
                },
                ...(isSilver ? [{
                    name: "Silver Package",
                    description: "Extended viewing with area tour",
                    price: 1500,
                    tier: PackageTier.SILVER,
                    propertiesIncluded: 1,
                    features: ["2 hour viewing", "Area tour", "Transport assistance"]
                }] : [])
            ]

        });
    }
    return properties;
}

const MOCK_PROPERTIES = generateProperties(20); // Create 20 standalone Bronze/Silver properties


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

    // Create Admins
    const admin1 = await prisma.user.create({
        data: {
            email: 'admin@dapio.com',
            password,
            name: 'Peter Muthoni',
            role: Role.ADMIN,
            phone: '+254 700 111 222',
            isVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
        },
    });
    console.log(`👤 Created Admin: ${admin1.name}`);

    const admin2 = await prisma.user.create({
        data: {
            email: 'superadmin@dapio.com',
            password,
            name: 'Alice Kimani',
            role: Role.ADMIN,
            phone: '+254 700 333 444',
            isVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400'
        },
    });
    console.log(`👤 Created Super Admin: ${admin2.name}`);

    // Create Tenants
    const tenant1 = await prisma.user.create({
        data: {
            email: 'brian.ndung@gmail.com',
            password,
            name: 'Brian Ndungu',
            role: Role.TENANT,
            phone: '+254 722 555 666',
            avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400'
        },
    });
    console.log(`👤 Created Tenant: ${tenant1.name}`);

    const tenant2 = await prisma.user.create({
        data: {
            email: 'lucy.achieng@gmail.com',
            password,
            name: 'Lucy Achieng',
            role: Role.TENANT,
            phone: '+254 733 777 888',
            avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
        },
    });
    console.log(`👤 Created Tenant: ${tenant2.name}`);


    // Create Hunters
    const createdHunters: Record<string, string> = {}; // email -> id

    for (const hunterData of MOCK_HAUNTERS) {
        const isSarah = hunterData.email === "sarah.mwangi@househaunters.com";
        const hunter = await prisma.user.create({
            data: {
                id: isSarah ? "00000000-0000-0000-0000-000000000001" : undefined,
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
        console.log(`👤 Created Hunter: ${hunter.name} (${hunter.id})`);
    }

    // Create Properties
    for (const prop of MOCK_PROPERTIES) {
        const hunterId = createdHunters[prop.hunterEmail];
        if (!hunterId) {
            console.warn(`⚠️ Hunter not found for property ${prop.title}`);
            continue;
        }

        await prisma.property.create({
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

    // --- ADDED: Explicitly seed a Gold Bundle for Sarah Mwangi ---
    const sarahId = createdHunters["sarah.mwangi@househaunters.com"];
    if (sarahId) {
        console.log('💎 Seeding explicit bundles for Sarah Mwangi...');

        // 1. GOLD BUNDLE (5 properties)
        const goldGroupId = crypto.randomUUID();
        for (let i = 1; i <= 5; i++) {
            const loc = LOCATIONS[i % LOCATIONS.length];
            const title = `Gold Member ${i}: Luxury Apartment in ${loc.area}`;

            await prisma.property.create({
                data: {
                    title,
                    description: `Premium unit part of a Gold bundle. Exceptional quality in ${loc.area}.`,
                    rent: 55000 + (i * 2000),
                    hunterId: sarahId,
                    status: PropertyStatus.AVAILABLE,
                    location: JSON.stringify({
                        generalArea: loc.area,
                        county: "Nairobi",
                        address: loc.address,
                        lat: loc.lat + (Math.random() * 0.002),
                        lng: loc.lng + (Math.random() * 0.002)
                    }),
                    amenities: JSON.stringify(["WiFi", "Gym", "Pool", "CCTV", "Parking"]),
                    images: JSON.stringify([IMAGES_POOL[0], IMAGES_POOL[1]]),
                    videos: JSON.stringify(DEFAULT_VIDEO),
                    listingPackage: 'GOLD',
                    packageGroupId: goldGroupId,
                    packagePosition: i,
                    packageMasterId: i === 1 ? undefined : undefined, // Handled if needed, but grouping relies on groupId
                    packages: {
                        create: [
                            {
                                name: "Bronze Package",
                                price: 1000,
                                tier: PackageTier.BRONZE,
                                propertiesIncluded: 1,
                                features: JSON.stringify(["1 hour viewing"])
                            },
                            {
                                name: "Gold Package",
                                price: 3500,
                                tier: PackageTier.GOLD,
                                propertiesIncluded: 5,
                                features: JSON.stringify(["5 properties tour", "Lunch included", "Transport"]),
                                packageGroupId: goldGroupId,
                                packagePosition: i
                            }
                        ]
                    }
                }
            });
        }
        console.log(`🏆 Created Gold Bundle for Sarah Mwangi (5 houses)`);

        // 2. SILVER BUNDLE (3 properties)
        const silverGroupId = crypto.randomUUID();
        for (let i = 1; i <= 3; i++) {
            const loc = LOCATIONS[(i + 3) % LOCATIONS.length];
            const title = `Silver Member ${i}: Modern Flat in ${loc.area}`;

            await prisma.property.create({
                data: {
                    title,
                    description: `Quality unit part of a Silver bundle in ${loc.area}.`,
                    rent: 32000 + (i * 1500),
                    hunterId: sarahId,
                    status: PropertyStatus.AVAILABLE,
                    location: JSON.stringify({
                        generalArea: loc.area,
                        county: "Nairobi",
                        address: loc.address,
                        lat: loc.lat + (Math.random() * 0.002),
                        lng: loc.lng + (Math.random() * 0.002)
                    }),
                    amenities: JSON.stringify(["WiFi", "Borehole", "Elevator", "Security"]),
                    images: JSON.stringify([IMAGES_POOL[2], IMAGES_POOL[3]]),
                    videos: JSON.stringify(DEFAULT_VIDEO),
                    listingPackage: 'SILVER',
                    packageGroupId: silverGroupId,
                    packagePosition: i,
                    packages: {
                        create: [
                            {
                                name: "Bronze Package",
                                price: 1000,
                                tier: PackageTier.BRONZE,
                                propertiesIncluded: 1,
                                features: JSON.stringify(["1 hour viewing"])
                            },
                            {
                                name: "Silver Package",
                                price: 2000,
                                tier: PackageTier.SILVER,
                                propertiesIncluded: 3,
                                features: JSON.stringify(["3 properties tour", "Area guide"]),
                                packageGroupId: silverGroupId,
                                packagePosition: i
                            }
                        ]
                    }
                }
            });
        }
        console.log(`🥈 Created Silver Bundle for Sarah Mwangi (3 houses)`);
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
