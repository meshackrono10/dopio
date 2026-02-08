import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Package Availability Service
 * Determines which packages can be offered based on property availability
 */

interface PackageRequirements {
    GOLD: number;
    SILVER: number;
    BRONZE: number;
}

const PACKAGE_REQUIREMENTS: PackageRequirements = {
    GOLD: 5,
    SILVER: 2,
    BRONZE: 1,
};

/**
 * Get available (unlocked) properties in a bundle
 */
export async function getAvailablePropertiesInBundle(packageGroupId: string): Promise<any[]> {
    if (!packageGroupId) return [];

    const properties = await prisma.property.findMany({
        where: {
            packageGroupId,
            isLocked: false,
            status: 'AVAILABLE',
        },
        include: {
            packages: true,
        },
    });

    return properties;
}

/**
 * Calculate which packages are actually available for a property
 * based on how many properties in its bundle are unlocked
 */
export async function getAvailablePackagesForProperty(propertyId: string): Promise<any[]> {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            packages: true,
        },
    });

    if (!property) return [];

    // Bronze is always available for any property
    let availablePackages = property.packages.filter((pkg) => pkg.tier === 'BRONZE');

    // If property is part of a bundle, check if Gold/Silver packages are valid
    if (property.packageGroupId) {
        const availablePropertiesInBundle = await getAvailablePropertiesInBundle(
            property.packageGroupId
        );
        const availableCount = availablePropertiesInBundle.length;

        // Check if Gold package can be offered
        if (availableCount >= PACKAGE_REQUIREMENTS.GOLD) {
            const goldPackages = property.packages.filter((pkg) => pkg.tier === 'GOLD');
            availablePackages = [...availablePackages, ...goldPackages];
        }

        // Check if Silver package can be offered
        if (availableCount >= PACKAGE_REQUIREMENTS.SILVER) {
            const silverPackages = property.packages.filter((pkg) => pkg.tier === 'SILVER');
            availablePackages = [...availablePackages, ...silverPackages];
        }
    }

    return availablePackages;
}

/**
 * Validate that a package is actually available for a property
 * Used during checkout/booking to prevent manipulation
 */
export async function validatePackageAvailability(
    propertyId: string,
    packageId: string
): Promise<{ isValid: boolean; reason?: string }> {
    const availablePackages = await getAvailablePackagesForProperty(propertyId);
    const packageAvailable = availablePackages.find((pkg) => pkg.id === packageId);

    if (!packageAvailable) {
        return {
            isValid: false,
            reason: 'This package is no longer available for this property',
        };
    }

    return { isValid: true };
}

/**
 * Get the count of available properties in a bundle
 */
export async function getBundleAvailabilityInfo(packageGroupId: string): Promise<{
    totalProperties: number;
    availableProperties: number;
    lockedProperties: number;
    canOfferGold: boolean;
    canOfferSilver: boolean;
}> {
    if (!packageGroupId) {
        return {
            totalProperties: 0,
            availableProperties: 0,
            lockedProperties: 0,
            canOfferGold: false,
            canOfferSilver: false,
        };
    }

    const allProperties = await prisma.property.findMany({
        where: { packageGroupId },
    });

    const availableProperties = allProperties.filter(
        (p) => !p.isLocked && p.status === 'AVAILABLE'
    );

    const totalProperties = allProperties.length;
    const availableCount = availableProperties.length;
    const lockedCount = totalProperties - availableCount;

    return {
        totalProperties,
        availableProperties: availableCount,
        lockedProperties: lockedCount,
        canOfferGold: availableCount >= PACKAGE_REQUIREMENTS.GOLD,
        canOfferSilver: availableCount >= PACKAGE_REQUIREMENTS.SILVER,
    };
}
