import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const processProperty = (prop: any) => {
    const location = typeof prop.location === 'string' ? JSON.parse(prop.location) : prop.location;
    const amenities = typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : prop.amenities;
    const images = typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images;
    const videos = typeof prop.videos === 'string' ? JSON.parse(prop.videos) : prop.videos;
    const utilities = typeof prop.utilities === 'string' ? JSON.parse(prop.utilities) : prop.utilities;

    return {
        ...prop,
        location,
        amenities,
        images,
        videos,
        utilities
    };
};

export const getPackageMembers = async (req: Request, res: Response) => {
    try {
        const propertyId = req.params.id as string;

        // Find all viewing packages for this property that belong to a group
        const propertyPackages = await prisma.viewingPackage.findMany({
            where: { propertyId, packageGroupId: { not: null } }
        });

        if (propertyPackages.length === 0) {
            const property = await prisma.property.findUnique({
                where: { id: propertyId },
                include: { packages: true, hunter: { select: { id: true, name: true, avatarUrl: true } } }
            });
            if (!property) return res.status(404).json({ message: 'Property not found' });

            return res.json({
                packageGroupId: 'standalone',
                totalProperties: 1,
                properties: [processProperty(property)]
            });
        }

        // Return members for each tier group
        const results = await Promise.all(propertyPackages.map(async (vpkg) => {
            const members = await prisma.viewingPackage.findMany({
                where: { packageGroupId: vpkg.packageGroupId },
                include: {
                    property: {
                        include: {
                            packages: true,
                            hunter: { select: { id: true, name: true, avatarUrl: true } }
                        }
                    }
                },
                orderBy: { packagePosition: 'asc' }
            });

            return {
                tier: vpkg.tier,
                packageGroupId: vpkg.packageGroupId,
                totalProperties: members.length,
                properties: members.map(m => processProperty(m.property))
            };
        }));

        // For dashboard compatibility, return the highest tier as the primary response
        const sorted = results.sort((a, b) => {
            const weights = { GOLD: 3, SILVER: 2, BRONZE: 1 };
            return (weights as any)[b.tier] - (weights as any)[a.tier];
        });

        res.json({
            ...sorted[0],
            allTiers: sorted
        });

    } catch (error: any) {
        console.error('Error getting package members:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE /api/packages/properties/:id/remove
 * Remove a property from a Gold package (converts it to Bronze)
 */
export const removePropertyFromPackage = async (req: any, res: Response) => {
    try {
        const propertyId = req.params.id as string;

        // Find the property
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Verify ownership
        if (property.hunterId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this property' });
        }

        if (!property.packageGroupId) {
            return res.status(400).json({ message: 'Property is not part of a package' });
        }

        // Count properties in package
        const packageCount = await prisma.property.count({
            where: { packageGroupId: property.packageGroupId }
        });

        // If only 3 properties left, must break entire package
        if (packageCount <= 3) {
            return res.status(400).json({
                message: 'Cannot remove property. Package must have at least 3 properties. Use "Break Package" instead.'
            });
        }

        // Remove property from package
        await prisma.$transaction(async (tx) => {
            // Clear package fields
            await tx.property.update({
                where: { id: propertyId },
                data: {
                    packageGroupId: null,
                    packagePosition: null,
                    packageMasterId: null,
                    listingPackage: 'BRONZE'
                }
            });

            // Update viewing packages to Bronze
            await tx.viewingPackage.updateMany({
                where: { propertyId },
                data: {
                    tier: 'BRONZE',
                    price: 1000,
                    propertiesIncluded: 1,
                    features: JSON.stringify([
                        'View this property',
                        'Standard showing',
                        'Professional agent'
                    ])
                }
            });
        });

        res.json({
            success: true,
            message: 'Property removed from package and converted to Bronze listing'
        });
    } catch (error: any) {
        console.error('Error removing property from package:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/packages/break-package
 * Break a Gold package into 3 independent Bronze listings
 */
const breakPackageSchema = z.object({
    packageGroupId: z.string().uuid(),
    bronzePackagePrice: z.number().positive().optional().default(500)
});

export const breakPackage = async (req: any, res: Response) => {
    try {
        const validatedData = breakPackageSchema.parse(req.body);
        const { packageGroupId, bronzePackagePrice } = validatedData;

        // Find all properties in the package
        const properties = await prisma.property.findMany({
            where: { packageGroupId }
        });

        if (properties.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Verify ownership
        if (properties[0].hunterId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to break this package' });
        }

        // Break the package using a transaction
        await prisma.$transaction(async (tx) => {
            for (const property of properties) {
                // Clear package fields
                await tx.property.update({
                    where: { id: property.id },
                    data: {
                        packageGroupId: null,
                        packagePosition: null,
                        packageMasterId: null,
                        listingPackage: 'BRONZE'
                    }
                });

                // Update viewing package to Bronze
                await tx.viewingPackage.updateMany({
                    where: { propertyId: property.id },
                    data: {
                        tier: 'BRONZE',
                        price: bronzePackagePrice,
                        propertiesIncluded: 1,
                        features: JSON.stringify([
                            'View 1 property',
                            'Standard showing',
                            'Professional agent',
                            'Flexible timing'
                        ])
                    }
                });
            }
        });

        res.json({
            success: true,
            message: 'Package broken into 3 independent Bronze listings',
            propertyIds: properties.map(p => p.id)
        });
    } catch (error: any) {
        console.error('Error breaking package:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/packages/:packageGroupId/replace-property
 * Replace a property in a package
 */
const replacePropertySchema = z.object({
    positionToReplace: z.number().min(1).max(3),
    newPropertyData: z.object({
        title: z.string().min(5),
        description: z.string().min(20),
        rent: z.number().positive(),
        location: z.object({
            lat: z.number(),
            lng: z.number(),
            address: z.string(),
            generalArea: z.string(),
            county: z.string().optional(),
        }),
        amenities: z.array(z.string()),
        images: z.array(z.string()).min(8),
        videos: z.array(z.string()).optional(),
        utilities: z.object({
            waterIncluded: z.boolean(),
            waterCost: z.string().optional(),
            electricityType: z.enum(['prepaid', 'postpaid', 'included', 'shared']),
            electricityCost: z.string().optional(),
            garbageIncluded: z.boolean().optional(),
            garbageCost: z.string().optional(),
            securityIncluded: z.boolean().optional(),
            securityCost: z.string().optional(),
        }).optional(),
    })
});

export const replaceProperty = async (req: any, res: Response) => {
    try {
        const packageGroupId = req.params.packageGroupId;
        const validatedData = replacePropertySchema.parse(req.body);
        const { positionToReplace, newPropertyData } = validatedData;

        // Find a property in the package to verify ownership and location
        const existingProperty = await prisma.property.findFirst({
            where: {
                packageGroupId,
                packagePosition: { not: positionToReplace }
            }
        });

        if (!existingProperty) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Verify ownership
        if (existingProperty.hunterId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this package' });
        }

        // Validate location matches package location
        const existingLocation = typeof existingProperty.location === 'string'
            ? JSON.parse(existingProperty.location)
            : existingProperty.location;

        if (existingLocation.generalArea !== newPropertyData.location.generalArea ||
            existingLocation.county !== newPropertyData.location.county) {
            return res.status(400).json({
                message: `New property must be in the same location as package (${existingLocation.generalArea}, ${existingLocation.county})`
            });
        }

        // Find the property to replace
        const propertyToReplace = await prisma.property.findFirst({
            where: {
                packageGroupId,
                packagePosition: positionToReplace
            }
        });

        if (!propertyToReplace) {
            return res.status(404).json({ message: 'Property to replace not found' });
        }

        // Get the master property ID (position 1)
        const masterProperty = await prisma.property.findFirst({
            where: {
                packageGroupId,
                packagePosition: 1
            }
        });

        // Replace the property in a transaction
        const newProperty = await prisma.$transaction(async (tx) => {
            // Delete old property and its packages
            await tx.viewingPackage.deleteMany({
                where: { propertyId: propertyToReplace.id }
            });
            await tx.property.delete({
                where: { id: propertyToReplace.id }
            });

            // Create new property with package fields
            const created = await tx.property.create({
                data: {
                    ...newPropertyData,
                    location: JSON.stringify(newPropertyData.location),
                    amenities: JSON.stringify(newPropertyData.amenities),
                    images: JSON.stringify(newPropertyData.images),
                    videos: newPropertyData.videos ? JSON.stringify(newPropertyData.videos) : null,
                    utilities: newPropertyData.utilities ? JSON.stringify(newPropertyData.utilities) : null,
                    packageGroupId,
                    packagePosition: positionToReplace,
                    packageMasterId: positionToReplace === 1 ? null : masterProperty?.id,
                    listingPackage: 'GOLD',
                    hunterId: req.user.userId,
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

            return created;
        });

        res.json({
            success: true,
            message: 'Property replaced successfully',
            newProperty: {
                id: newProperty.id,
                title: newProperty.title,
                position: newProperty.packagePosition
            }
        });
    } catch (error: any) {
        console.error('Error replacing property:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/packages/:packageGroupId/add-properties
 * Add multiple properties to an existing Gold package
 */
const addPropertiesSchema = z.object({
    propertyIds: z.array(z.string().uuid())
});

export const addPropertyToPackage = async (req: any, res: Response) => {
    try {
        const packageGroupId = req.params.packageGroupId;
        const validatedData = addPropertiesSchema.parse(req.body);
        const { propertyIds } = validatedData;

        if (!propertyIds || propertyIds.length === 0) {
            return res.status(400).json({ message: 'No properties provided' });
        }

        // Find an existing viewing package in this group to verify ownership and tier
        const existingVPkg = await prisma.viewingPackage.findFirst({
            where: { packageGroupId },
            include: { property: true }
        });

        if (!existingVPkg) {
            return res.status(404).json({ message: 'Package group not found' });
        }

        // Verify the user owns the properties in this group
        if (existingVPkg.property.hunterId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this package' });
        }

        const tier = existingVPkg.tier;

        // Find all properties to add
        const propertiesToAdd = await prisma.property.findMany({
            where: { id: { in: propertyIds } }
        });

        if (propertiesToAdd.length !== propertyIds.length) {
            return res.status(404).json({ message: 'One or more properties not found' });
        }

        // Verify ownership for each property to add
        for (const prop of propertiesToAdd) {
            if (prop.hunterId !== req.user.userId) {
                return res.status(403).json({ message: `You do not own property: ${prop.title}` });
            }
        }

        // Get current highest position in the tier group
        const groupMembers = await prisma.viewingPackage.findMany({
            where: { packageGroupId },
            orderBy: { packagePosition: 'desc' },
            take: 1
        });

        let currentPosition = groupMembers[0]?.packagePosition || 0;
        const masterId = existingVPkg.packageMasterId || existingVPkg.propertyId;

        // Add properties to package in a transaction
        await prisma.$transaction(async (tx) => {
            for (const prop of propertiesToAdd) {
                currentPosition++;

                // Associate with this group
                await tx.viewingPackage.create({
                    data: {
                        tier: tier,
                        name: tier === 'GOLD' ? 'Gold Viewing Package' : 'Silver Viewing Package',
                        price: tier === 'GOLD' ? 3500 : 2000,
                        propertiesIncluded: currentPosition, // Will sync later
                        features: existingVPkg.features,
                        propertyId: prop.id,
                        packageGroupId: packageGroupId,
                        packagePosition: currentPosition,
                        packageMasterId: masterId
                    }
                });

                // Ensure every added property also has its own Bronze package if it doesn't
                const existingBronze = await tx.viewingPackage.findFirst({
                    where: { propertyId: prop.id, tier: 'BRONZE' }
                });

                if (!existingBronze) {
                    await tx.viewingPackage.create({
                        data: {
                            tier: 'BRONZE',
                            name: 'Bronze Viewing Package',
                            price: 1000,
                            propertiesIncluded: 1,
                            features: JSON.stringify(['View this property', 'Standard showing', 'Professional agent']),
                            propertyId: prop.id,
                            packageGroupId: crypto.randomUUID(),
                            packagePosition: 1
                        }
                    });
                }
            }

            // Sync property count for ALL members in the tier group
            const finalCount = currentPosition;
            await tx.viewingPackage.updateMany({
                where: { packageGroupId },
                data: {
                    propertiesIncluded: finalCount
                }
            });
        });

        res.json({
            success: true,
            message: `${propertiesToAdd.length} properties added to ${tier} package successfully`,
            newTotal: currentPosition
        });
    } catch (error: any) {
        console.error('Error adding properties to package:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};
