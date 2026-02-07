import { PrismaClient, PropertyStatus, Role, PackageTier } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const MOCK_HAUNTERS = [
    {
        email: "sarah.mwangi@househaunters.com",
        name: "Sarah Mwangi",
        phone: "+254 798 123 456",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        description: "Professional real estate agent with 5+ years experience. Specializing in Westlands, Kilimani, and Lavington premium properties.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "james.omondi@househaunters.com",
        name: "James Omondi",
        phone: "+254 711 987 654",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        description: "Expert in budget-friendly housing in Kasarani, Roysambu, and Ruiru. Helping young professionals find their ideal home.",
        role: Role.HUNTER,
        isVerified: true,
        verificationStatus: 'APPROVED'
    },
    {
        email: "grace.wanjiru@househaunters.com",
        name: "Grace Wanjiru",
        phone: "+254 722 456 789",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        description: "Trusted agent for South B, South C, and Langata areas. Focused on family-friendly neighborhoods with great amenities.",
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
    { area: "Lavington", address: "James Gichuru", lat: -1.2764, lng: 36.7725 },
    { area: "Karen", address: "Ngong Road", lat: -1.3213, lng: 36.7025 },
];

const AMENITIES_POOL = ["WiFi", "Parking", "CCTV", "Borehole", "Gym", "Swimming Pool", "Backup Generator", "Elevator", "Balcony", "Garden", "Security Guard", "Intercom", "Electric Fence"];

const IMAGES_POOL = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
];

const DEFAULT_VIDEO = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"];

async function createProperty(data: any) {
    const { packagesData, ...propertyData } = data;
    return await prisma.property.create({
        data: {
            ...propertyData,
            location: JSON.stringify(data.location),
            amenities: JSON.stringify(data.amenities || []),
            images: JSON.stringify(data.images || []),
            videos: JSON.stringify(data.videos || DEFAULT_VIDEO),
            utilities: JSON.stringify(data.utilities || { waterIncluded: true, electricityType: "prepaid" }),
            packages: {
                create: packagesData.map((pkg: any) => ({
                    ...pkg,
                    features: JSON.stringify(pkg.features || [])
                }))
            }
        }
    });
}

async function main() {
    console.log('🌱 Starting MASSIVE database seed...');

    // Clear existing data (Order matters)
    await prisma.alternativeOffer.deleteMany();
    await prisma.review.deleteMany();
    await prisma.meetingPoint.deleteMany();
    await prisma.rescheduleRequest.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.savedProperty.deleteMany();
    await prisma.hunterEarnings.deleteMany();
    await prisma.paymentHistory.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.viewingRequest.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.viewingPackage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    // Passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const tenantPassword = await bcrypt.hash('tenant123', 10);
    const hunterPassword = await bcrypt.hash('hunter123', 10);

    // 1. Create Requested Users
    await prisma.user.create({
        data: { email: 'admin@dapio.com', password: adminPassword, name: 'System Admin', role: Role.ADMIN, isVerified: true }
    });
    await prisma.user.create({
        data: { email: 'tenant@dapio.com', password: tenantPassword, name: 'Standard Tenant', role: Role.TENANT }
    });
    const requestedHunter = await prisma.user.create({
        data: { email: 'hunter@dapio.com', password: hunterPassword, name: 'Elite Hunter', role: Role.HUNTER, isVerified: true, verificationStatus: 'APPROVED' }
    });

    const hunterIds = [requestedHunter.id];
    for (const h of MOCK_HAUNTERS) {
        const user = await prisma.user.create({
            data: { ...h, password: await bcrypt.hash('password123', 10) }
        });
        hunterIds.push(user.id);
    }

    console.log(`👤 Created ${hunterIds.length} Hunters.`);

    // 2. Generate GOLD BUNDLES (20 bundles x 5 properties = 100 listings)
    console.log('🏆 Generating 20 Gold Bundles...');
    for (let b = 0; b < 20; b++) {
        const groupId = crypto.randomUUID();
        const loc = LOCATIONS[b % LOCATIONS.length];
        const hunterId = hunterIds[b % hunterIds.length];

        for (let i = 1; i <= 5; i++) {
            await createProperty({
                title: `Gold ${b + 1} Unit ${i}: Premium Residence in ${loc.area}`,
                description: `Exclusive living in ${loc.area}. Part of our premiere Gold bundle tour.`,
                rent: 50000 + (Math.random() * 20000),
                hunterId: hunterId,
                status: PropertyStatus.AVAILABLE,
                location: { generalArea: loc.area, county: "Nairobi", address: loc.address, lat: loc.lat + (Math.random() * 0.005), lng: loc.lng + (Math.random() * 0.005) },
                amenities: AMENITIES_POOL.sort(() => 0.5 - Math.random()).slice(0, 6),
                images: IMAGES_POOL.sort(() => 0.5 - Math.random()).slice(0, 3),
                listingPackage: 'GOLD',
                packageGroupId: groupId,
                packagePosition: i,
                packagesData: [
                    { name: "Bronze Package", price: 1000, tier: PackageTier.BRONZE, propertiesIncluded: 1, features: ["Single viewing"] },
                    { name: "Gold Package", price: 4000, tier: PackageTier.GOLD, propertiesIncluded: 5, features: ["5-property tour", "Transport"], packageGroupId: groupId, packagePosition: i }
                ]
            });
        }
    }

    // 3. Generate SILVER BUNDLES (25 bundles x 3 properties = 75 listings)
    console.log('🥈 Generating 25 Silver Bundles...');
    for (let b = 0; b < 25; b++) {
        const groupId = crypto.randomUUID();
        const loc = LOCATIONS[(b + 2) % LOCATIONS.length];
        const hunterId = hunterIds[(b + 1) % hunterIds.length];

        for (let i = 1; i <= 3; i++) {
            await createProperty({
                title: `Silver ${b + 1} Unit ${i}: Modern Living in ${loc.area}`,
                description: `Stylish and functional apartment in ${loc.area}. Part of a curated Silver bundle.`,
                rent: 30000 + (Math.random() * 10000),
                hunterId: hunterId,
                status: PropertyStatus.AVAILABLE,
                location: { generalArea: loc.area, county: "Nairobi", address: loc.address, lat: loc.lat + (Math.random() * 0.005), lng: loc.lng + (Math.random() * 0.005) },
                amenities: AMENITIES_POOL.sort(() => 0.5 - Math.random()).slice(0, 4),
                images: IMAGES_POOL.sort(() => 0.5 - Math.random()).slice(0, 2),
                listingPackage: 'SILVER',
                packageGroupId: groupId,
                packagePosition: i,
                packagesData: [
                    { name: "Bronze Package", price: 1000, tier: PackageTier.BRONZE, propertiesIncluded: 1, features: ["Single viewing"] },
                    { name: "Silver Package", price: 2500, tier: PackageTier.SILVER, propertiesIncluded: 3, features: ["3-property tour"], packageGroupId: groupId, packagePosition: i }
                ]
            });
        }
    }

    // 4. Generate BRONZE LISTINGS (30 standalone listings)
    console.log('🥉 Generating 30 Bronze Standalone Listings...');
    for (let i = 1; i <= 30; i++) {
        const loc = LOCATIONS[(i + 5) % LOCATIONS.length];
        const hunterId = hunterIds[i % hunterIds.length];

        await createProperty({
            title: `Bronze Listing ${i}: Budget Friendly Unit in ${loc.area}`,
            description: `Affordable and clean unit in ${loc.area}. Perfect for young professionals.`,
            rent: 15000 + (Math.random() * 10000),
            hunterId: hunterId,
            status: PropertyStatus.AVAILABLE,
            location: { generalArea: loc.area, county: "Nairobi", address: loc.address, lat: loc.lat + (Math.random() * 0.005), lng: loc.lng + (Math.random() * 0.005) },
            amenities: AMENITIES_POOL.sort(() => 0.5 - Math.random()).slice(0, 3),
            images: IMAGES_POOL.sort(() => 0.5 - Math.random()).slice(0, 2),
            listingPackage: 'BRONZE',
            packagesData: [
                { name: "Bronze Package", price: 1000, tier: PackageTier.BRONZE, propertiesIncluded: 1, features: ["Single viewing"] }
            ]
        });
    }

    console.log('✅ MASSIVE Seeding completed successfully!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
