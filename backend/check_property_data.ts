
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLatestProperty() {
    try {
        const property = await prisma.property.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { packages: true }
        });

        if (!property) {
            console.log("No properties found.");
            return;
        }

        console.log("Latest Property:");
        console.log("ID:", property.id);
        console.log("Title:", property.title);
        console.log("Amenities:", property.amenities);
        console.log("Packages:", property.packages);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestProperty();
