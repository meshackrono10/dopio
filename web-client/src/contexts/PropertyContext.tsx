"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PropertyListing, PropertyLayout } from '../data/types';
import api from '../services/api';

interface PropertyContextType {
    properties: PropertyListing[];
    filteredProperties: PropertyListing[];
    addProperty: (property: any) => Promise<void>;
    updateProperty: (id: string | number, updates: any) => Promise<void>;
    deleteProperty: (id: string | number) => Promise<void>;
    getPropertyById: (id: string | number) => PropertyListing | undefined;
    searchProperties: (query: string) => void;
    filterProperties: (filters: PropertyFilters) => void;
    refreshProperties: () => Promise<void>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

interface PropertyFilters {
    minRent?: number;
    maxRent?: number;
    layout?: string[];
    location?: string;
    amenities?: string[];
    furnished?: string;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<PropertyListing[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<PropertyFilters>({});

    const clearError = () => setError(null);

    const mapBackendToFrontend = (p: any): PropertyListing => {
        const location = typeof p.location === 'string' ? JSON.parse(p.location) : p.location;
        const amenities = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities;
        const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;

        return {
            id: p.id,
            title: p.title,
            description: p.description,
            rent: p.rent,
            deposit: p.rent, // Default to 1 month rent
            layout: p.layout || '1-bedroom',
            bathrooms: p.bathrooms,
            location: {
                generalArea: location?.generalArea || 'Unknown Area',
                county: location?.county || 'Nairobi',
                directions: location?.address || '',
            },
            amenities: amenities || [],
            utilities: {
                waterIncluded: true,
                electricityType: 'prepaid',
            },
            images: images || [],
            videoUrl: p.videos ? (typeof p.videos === 'string' ? JSON.parse(p.videos)[0] : p.videos[0]) : '',
            houseHaunter: {
                id: p.hunter?.id || '',
                name: p.hunter?.name || 'Unknown Hunter',
                phone: '',
                profilePhoto: p.hunter?.avatarUrl || '',
                isVerified: true,
                rating: 4.5,
                reviewCount: 10,
                successfulViewings: 5,
                bio: '',
                areasOfOperation: [],
                joinedDate: new Date().toISOString(),
            },
            viewingPackages: (p.packages || []).map((pkg: any) => {
                const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : (pkg.features || []);
                return {
                    id: pkg.id,
                    name: pkg.name,
                    description: features[0] || pkg.description || '',
                    price: pkg.price,
                    propertiesIncluded: pkg.propertiesIncluded,
                    duration: '1 hour',
                    tier: pkg.tier.toLowerCase(),
                    haunterId: p.hunter?.id || '',
                    features: features,
                };
            }),
            status: 'approved',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            viewCount: 0,
            bookingCount: 0,
        };
    };

    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/properties');
            const mapped = response.data.map(mapBackendToFrontend);
            setProperties(mapped);
            setFilteredProperties(mapped);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);



    const applyFilters = useCallback(() => {
        let filtered = [...properties];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.location.generalArea.toLowerCase().includes(query)
            );
        }

        if (activeFilters.minRent !== undefined) {
            filtered = filtered.filter(p => p.rent >= activeFilters.minRent!);
        }
        if (activeFilters.maxRent !== undefined) {
            filtered = filtered.filter(p => p.rent <= activeFilters.maxRent!);
        }
        if (activeFilters.location) {
            filtered = filtered.filter(p =>
                p.location.generalArea.toLowerCase().includes(activeFilters.location!.toLowerCase())
            );
        }

        setFilteredProperties(filtered);
    }, [properties, searchQuery, activeFilters]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const addProperty = useCallback(async (propertyData: any) => {
        try {
            clearError();
            setLoading(true);
            const response = await api.post('/properties', propertyData);
            const newProperty = mapBackendToFrontend(response.data);
            setProperties(prev => [newProperty, ...prev]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add property');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const updateProperty = useCallback(async (id: string | number, updates: any) => {
        try {
            clearError();
            setLoading(true);
            const response = await api.put(`/properties/${id}`, updates);
            const updated = mapBackendToFrontend(response.data);
            setProperties(prev => prev.map(p => p.id === id ? updated : p));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update property');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const deleteProperty = useCallback(async (id: string | number) => {
        try {
            clearError();
            setLoading(true);
            await api.delete(`/properties/${id}`);
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete property');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const getPropertyById = useCallback((id: string | number) => {
        return properties.find(p => p.id === id);
    }, [properties]);

    const searchProperties = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const filterProperties = useCallback((filters: PropertyFilters) => {
        setActiveFilters(filters);
    }, []);

    const refreshProperties = useCallback(async () => {
        await fetchProperties();
    }, [fetchProperties]);

    return (
        <PropertyContext.Provider value={{
            properties,
            filteredProperties,
            addProperty,
            updateProperty,
            deleteProperty,
            getPropertyById,
            searchProperties,
            filterProperties,
            refreshProperties,
            loading,
            error,
            clearError,
        }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperties = () => {
    const context = useContext(PropertyContext);
    if (context === undefined) {
        throw new Error('useProperties must be used within a PropertyProvider');
    }
    return context;
};
