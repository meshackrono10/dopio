import React, { createContext, useContext, useState, useEffect } from 'react';
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
    lockedProperties: Set<string>;
    isPropertyLocked: (propertyId: string | number) => boolean;
    lockProperty: (propertyId: string | number) => void;
    unlockProperty: (propertyId: string | number) => void;
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
    const [lockedProperties, setLockedProperties] = useState<Set<string>>(new Set());

    const clearError = () => setError(null);

    const mapBackendToFrontend = (p: any): PropertyListing => ({
        id: p.id,
        title: p.title,
        description: p.description,
        rent: p.rent,
        deposit: p.rent, // Default to 1 month rent
        propertyType: 'Apartment', // Default
        layout: '1-bedroom' as PropertyLayout, // Default
        beds: 1,
        bedrooms: 1,
        bathrooms: 1,
        location: {
            generalArea: p.location?.generalArea || 'Unknown Area',
            county: p.location?.county || 'Nairobi',
            directions: p.location?.address || '',
        },
        amenities: p.amenities || [],
        utilities: {
            waterIncluded: true,
            electricityType: 'prepaid',
        },
        images: p.images || [],
        videoUrl: '',
        houseHunter: {
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
        viewingPackages: (p.packages || []).map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price,
            propertiesIncluded: 1,
            duration: '1 hour',
            tier: 'gold',
            hunterId: p.hunter?.id || '',
        })),
        status: 'approved',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        viewCount: 0,
        bookingCount: 0,
    });

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/properties');
            const mapped = response.data.map(mapBackendToFrontend);
            setProperties(mapped);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const isPropertyLocked = (propertyId: string | number): boolean => {
        return lockedProperties.has(String(propertyId));
    };

    const lockProperty = (propertyId: string | number): void => {
        setLockedProperties(prev => new Set(prev).add(String(propertyId)));
    };

    const unlockProperty = (propertyId: string | number): void => {
        setLockedProperties(prev => {
            const newSet = new Set(prev);
            newSet.delete(String(propertyId));
            return newSet;
        });
    };

    useEffect(() => {
        applyFilters();
    }, [searchQuery, activeFilters, properties]);

    const applyFilters = () => {
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
    };

    const addProperty = async (propertyData: any) => {
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
    };

    const updateProperty = async (id: string | number, updates: any) => {
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
    };

    const deleteProperty = async (id: string | number) => {
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
    };

    const getPropertyById = (id: string | number) => {
        return properties.find(p => p.id === id);
    };

    const searchProperties = (query: string) => {
        setSearchQuery(query);
    };

    const filterProperties = (filters: PropertyFilters) => {
        setActiveFilters(filters);
    };

    const refreshProperties = async () => {
        await fetchProperties();
    };

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
            lockedProperties,
            isPropertyLocked,
            lockProperty,
            unlockProperty,
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
