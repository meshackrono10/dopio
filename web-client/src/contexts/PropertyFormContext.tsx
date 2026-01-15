"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PropertyType =
    | 'Single Room'
    | 'Bedsitter'
    | 'Studio'
    | '1 Bedroom'
    | '2 Bedroom'
    | '3 Bedroom'
    | '4+ Bedroom'
    | 'Maisonette'
    | 'Bungalow'
    | 'Townhouse'
    | 'Servant Quarter'
    | null;

interface PropertyFormData {
    // Page 1: Property Details
    propertyCategory: string;
    propertyType: PropertyType;
    propertyName: string;
    rentalArrangement: string;

    // Page 2: Location
    county: string;
    area: string;
    areaName: string;
    buildingName: string;
    unitNumber: string;
    coordinates: [number, number] | null;
    transportProximity: string;

    // Page 3: Size & Layout
    bedrooms: number;
    bathrooms: number;
    ensuite: boolean;
    maxOccupants: number;
    floorLevel: string;
    hasBalcony: boolean;

    // Page 5: Utilities
    hasTokenMeter: boolean;

    // Page 9: Terms
    noiseLevel: string;
    socialAmenities: string[];

    // Page 8: Price & Description
    monthlyRent: string;
    deposit: string;
    leasePeriod: string;
    noticePeriod: string;
    description: string;

    // Additional data
    amenities: string[];
    photos: string[];
    videos: string[];
    viewingPackages?: Array<{
        tier: 'BRONZE' | 'SILVER' | 'GOLD';
        name: string;
        price: number;
        propertiesIncluded: number;
        features: string[];
    }>;
}

interface PropertyFormContextType {
    formData: PropertyFormData;
    updateFormData: (key: keyof PropertyFormData, value: any) => void;
    clearFormData: () => void;
    propertyType: PropertyType;
    setPropertyType: (type: PropertyType) => void;
    shouldSkipSizeDetails: () => boolean;
    getBedroomCount: () => number;
    getBathroomCount: () => number;
}

const initialFormData: PropertyFormData = {
    propertyCategory: 'Apartment / Flat',
    propertyType: null,
    propertyName: '',
    rentalArrangement: 'Entire property',
    county: 'Nairobi',
    area: '',
    areaName: '',
    buildingName: '',
    unitNumber: '',
    coordinates: null,
    transportProximity: '',
    bedrooms: 1,
    bathrooms: 1,
    ensuite: false,
    maxOccupants: 2,
    floorLevel: '',
    hasBalcony: false,
    hasTokenMeter: true,
    noiseLevel: 'Moderate',
    socialAmenities: [],
    monthlyRent: '',
    deposit: '',
    leasePeriod: '6',
    noticePeriod: '1',
    description: '',
    amenities: [],
    photos: [],
    videos: [],
    viewingPackages: [],
};

const PropertyFormContext = createContext<PropertyFormContextType | undefined>(undefined);

export const PropertyFormProvider = ({ children }: { children: ReactNode }) => {
    const [formData, setFormData] = useState<PropertyFormData>(initialFormData);

    // Load saved data from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('propertyFormData');
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading saved form data:', error);
            }
        }
    }, []);

    // Save to localStorage whenever formData changes
    useEffect(() => {
        localStorage.setItem('propertyFormData', JSON.stringify(formData));
    }, [formData]);

    const updateFormData = (key: keyof PropertyFormData, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [key]: value };

            // Auto-set rentalArrangement based on category if category changes
            if (key === 'propertyCategory') {
                newData.rentalArrangement = value === 'Shared Accommodation'
                    ? 'Shared accommodation'
                    : 'Entire property';
            }

            return newData;
        });
    };

    const clearFormData = () => {
        setFormData(initialFormData);
        localStorage.removeItem('propertyFormData');
    };

    const setPropertyType = (type: PropertyType) => {
        updateFormData('propertyType', type);

        // Auto-configure based on property type to avoid redundancy
        if (type === 'Single Room') {
            updateFormData('bedrooms', 1);
            updateFormData('bathrooms', 0); // Shared bathroom
            updateFormData('maxOccupants', 1);
            updateFormData('ensuite', false);
        } else if (type === 'Bedsitter') {
            updateFormData('bedrooms', 0); // No separate bedroom
            updateFormData('bathrooms', 1); // Private bathroom
            updateFormData('maxOccupants', 1);
            updateFormData('ensuite', false);
        } else if (type === 'Studio') {
            updateFormData('bedrooms', 1);
            updateFormData('bathrooms', 1);
            updateFormData('maxOccupants', 2);
            updateFormData('ensuite', false);
        } else if (type === '1 Bedroom') {
            updateFormData('bedrooms', 1);
            updateFormData('bathrooms', 1);
        } else if (type === '2 Bedroom') {
            updateFormData('bedrooms', 2);
            updateFormData('bathrooms', 1);
        } else if (type === '3 Bedroom') {
            updateFormData('bedrooms', 3);
            updateFormData('bathrooms', 2);
        } else if (type === '4+ Bedroom') {
            updateFormData('bedrooms', 4);
            updateFormData('bathrooms', 3);
        } else if (type === 'Maisonette' || type === 'Bungalow' || type === 'Townhouse') {
            updateFormData('bedrooms', 3);
            updateFormData('bathrooms', 2);
            updateFormData('ensuite', true);
        } else if (type === 'Servant Quarter') {
            updateFormData('bedrooms', 1);
            updateFormData('bathrooms', 1);
            updateFormData('ensuite', false);
        }
    };

    const shouldSkipSizeDetails = () => {
        // Skip full size details for Single Room, Bedsitter, and Studio
        return formData.propertyType === 'Single Room' ||
            formData.propertyType === 'Bedsitter' ||
            formData.propertyType === 'Studio';
    };

    const getBedroomCount = () => {
        if (formData.propertyType === 'Single Room') return 1;
        if (formData.propertyType === 'Bedsitter') return 0;
        if (formData.propertyType === 'Studio') return 1;
        return formData.bedrooms;
    };

    const getBathroomCount = () => {
        if (formData.propertyType === 'Single Room') return 0; // Shared
        if (formData.propertyType === 'Bedsitter') return 1;
        if (formData.propertyType === 'Studio') return 1;
        return formData.bathrooms;
    };

    const propertyType = formData.propertyType;

    return (
        <PropertyFormContext.Provider value={{
            formData,
            updateFormData,
            clearFormData,
            propertyType,
            setPropertyType,
            shouldSkipSizeDetails,
            getBedroomCount,
            getBathroomCount
        }}>
            {children}
        </PropertyFormContext.Provider>
    );
};

export const usePropertyForm = () => {
    const context = useContext(PropertyFormContext);
    if (context === undefined) {
        throw new Error('usePropertyForm must be used within PropertyFormProvider');
    }
    return context;
};
