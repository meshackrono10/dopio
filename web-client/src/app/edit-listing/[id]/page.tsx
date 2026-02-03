"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProperties } from "@/contexts/PropertyContext";
import { usePropertyForm, PropertyType } from "@/contexts/PropertyFormContext";
import { Route } from "@/routers/types";
import { toast } from "react-toastify";

export default function EditListingPage() {
    return (
        <EditListingContent />
    );
}

function EditListingContent() {
    const { id } = useParams();
    const router = useRouter();
    const { getPropertyById, loading: propertiesLoading } = useProperties();
    const { setFormData } = usePropertyForm();
    const [initializing, setInitializing] = useState(true);
    const hasLoadedData = useRef(false);

    useEffect(() => {
        // Prevent infinite loop - only run once
        if (hasLoadedData.current || propertiesLoading) return;

        const property = getPropertyById(id as string);

        if (!property) {
            toast.error("Property not found");
            router.push("/haunter-dashboard" as Route);
            return;
        }

        // Mark as loaded to prevent re-execution
        hasLoadedData.current = true;

        // Helper to normalize property type
        const normalizePropertyType = (layout: string): PropertyType => {
            if (!layout) return null;
            const normalized = layout.toLowerCase().trim();

            // Exact matches
            if (normalized === 'bedsitter') return 'Bedsitter';
            if (normalized === 'studio') return 'Studio';
            if (normalized === 'single room') return 'Single Room';
            if (normalized === 'maisonette') return 'Maisonette';
            if (normalized === 'bungalow') return 'Bungalow';
            if (normalized === 'townhouse') return 'Townhouse';
            if (normalized === 'servant quarter' || normalized === 'sq') return 'Servant Quarter';

            // Bedroom variations
            if (normalized.includes('1') && normalized.includes('bedroom')) return '1 Bedroom';
            if (normalized.includes('2') && normalized.includes('bedroom')) return '2 Bedroom';
            if (normalized.includes('3') && normalized.includes('bedroom')) return '3 Bedroom';
            if (normalized.includes('4') && normalized.includes('bedroom')) return '4+ Bedroom';
            if (normalized.includes('5') && normalized.includes('bedroom')) return '4+ Bedroom';

            return null;
        };

        // Helper to extract bedroom count from property type
        const extractBedroomCount = (propertyType: PropertyType, defaultBathrooms: number): number => {
            if (!propertyType) return 1;
            if (propertyType === 'Bedsitter') return 0;
            if (propertyType === 'Single Room') return 1;
            if (propertyType === 'Studio') return 1;
            if (propertyType === '1 Bedroom') return 1;
            if (propertyType === '2 Bedroom') return 2;
            if (propertyType === '3 Bedroom') return 3;
            if (propertyType === '4+ Bedroom') return 4;
            if (propertyType === 'Maisonette' || propertyType === 'Bungalow' || propertyType === 'Townhouse') return 3;
            if (propertyType === 'Servant Quarter') return 1;
            return defaultBathrooms || 1;
        };

        const propertyType = normalizePropertyType(property.layout);

        // Determine property category based on layout and location
        const determinePropertyCategory = (): string => {
            if (property.location.generalArea.toLowerCase().includes('estate')) {
                return 'House in an Estate';
            }
            if (propertyType === 'Maisonette' || propertyType === 'Bungalow' || propertyType === 'Townhouse') {
                return 'House in an Estate';
            }
            return 'Apartment / Flat';
        };

        // Extract coordinates - handle both formats
        const extractCoordinates = (): [number, number] | null => {
            if (property.map) {
                return [property.map.lng, property.map.lat];
            }
            return null;
        };

        // Map PropertyListing to PropertyFormData with comprehensive field extraction
        const editData: any = {
            // ===== Page 1: Property Details =====
            propertyId: property.id.toString(),
            propertyCategory: determinePropertyCategory(),
            propertyType: propertyType,
            propertyName: property.title,
            rentalArrangement: 'Entire property', // Default - not stored in backend

            // ===== Page 2: Location =====
            county: property.location.county || 'Nairobi',
            area: property.location.generalArea || '',
            areaName: property.location.generalArea || '',
            buildingName: property.location.directions || '',
            unitNumber: '', // Not stored separately in backend
            coordinates: property.map ? [property.map.lng, property.map.lat] : null,
            transportProximity: '5', // Default - not stored in backend

            // ===== Page 3: Size & Layout =====
            bedrooms: extractBedroomCount(propertyType, property.bathrooms),
            bathrooms: property.bathrooms || 1,
            ensuite: property.amenities.includes('Ensuite Master Bedroom') || property.amenities.includes('Ensuite'),
            maxOccupants: 2, // Default - not stored in backend
            floorLevel: '', // Not stored in backend
            hasBalcony: property.amenities.includes('Balcony/Terrace') || property.amenities.includes('Balcony'),

            // ===== Page 5: Utilities =====
            hasTokenMeter: property.utilities?.electricityType === 'prepaid' || true,
            waterBilling: property.utilities?.waterIncluded ? 'included' : 'separate',
            waterBillingAmount: property.utilities?.waterCost || '',
            garbageBilling: property.utilities?.garbageIncluded ? 'included' : 'separate',
            garbageBillingAmount: property.utilities?.garbageCost || '',
            electricityBilling: property.utilities?.electricityType || 'prepaid',
            electricityBillingAmount: property.utilities?.electricityCost || '',
            securityBilling: property.utilities?.securityIncluded ? 'included' : 'separate',
            securityBillingAmount: property.utilities?.securityCost || '',

            // ===== Page 7: Photos & Videos =====
            photos: Array.isArray(property.images) ? property.images : [],
            videos: property.videoUrl ? [property.videoUrl] : [],
            amenities: Array.isArray(property.amenities) ? property.amenities : [],

            // ===== Page 8: Price & Description =====
            monthlyRent: property.rent.toString(),
            deposit: (property.deposit || property.rent).toString(),
            leasePeriod: '6', // Default - not stored in backend
            noticePeriod: '1', // Default - not stored in backend
            description: property.description || '',

            // ===== Page 9: Terms & Conditions (Defaults - not stored in backend) =====
            furnishingStatus: 'unfurnished',
            advanceRent: '1',
            agentFee: 'no_agent',
            petsPolicy: 'no_pets',
            sublettingPolicy: 'no_sublet',
            genderPreference: 'any',
            maintenanceLandlord: true,
            maintenanceTenant: false,
            hasCaretaker: false,
            viewingArrangement: 'by_appointment',
            availabilityDate: 'immediate',
            writtenAgreement: true,
            proofOwnership: true,
            requireProofIncome: false,
            requireValidId: true,
            requireReferences: false,
            requireGoodConduct: false,
            noiseLevel: 'Moderate',
            socialAmenities: [],
            additionalRules: '',

            // ===== Page 6: Viewing Packages =====
            viewingPackages: property.viewingPackages.map(pkg => ({
                tier: pkg.tier.toUpperCase() as any,
                name: pkg.name,
                price: pkg.price,
                propertiesIncluded: pkg.propertiesIncluded,
                features: Array.isArray(pkg.features) ? pkg.features : (pkg.description ? [pkg.description] : [])
            }))
        };

        console.log('[EditListing] Mapped property data:', {
            originalProperty: property,
            mappedData: editData,
            propertyId: editData.propertyId,
            photos: editData.photos,
            videos: editData.videos,
            amenities: editData.amenities
        });

        console.log('[EditListing] Setting form data with propertyId:', editData.propertyId);
        setFormData(editData);

        console.log('[EditListing] Form data set, navigating to add-listing/1');

        // Small delay to ensure form data is set before navigation
        setTimeout(() => {
            router.push("/add-listing/1" as Route);
            setInitializing(false);
        }, 100);
    }, [id, propertiesLoading, getPropertyById, router, setFormData]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading property data...</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">Preparing edit mode</p>
        </div>
    );
}
