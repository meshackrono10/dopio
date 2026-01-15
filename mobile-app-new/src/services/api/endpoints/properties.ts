/**
 * Properties API Endpoints
 */

import apiClient from '../client';
import { ENDPOINTS } from '../../../config/api.config';
import { PropertyListing } from '../../../data/types';
import { PropertyFilters, PaginatedResponse } from '../types';

export const propertiesApi = {
    /**
     * Get all properties with filters
     */
    getProperties: async (filters?: PropertyFilters) => {
        return apiClient.get<PaginatedResponse<PropertyListing>>(
            ENDPOINTS.PROPERTIES.LIST,
            { params: filters }
        );
    },

    /**
     * Get property by ID
     */
    getPropertyById: async (id: string) => {
        return apiClient.get<PropertyListing>(ENDPOINTS.PROPERTIES.DETAIL(id));
    },

    /**
     * Create new property
     */
    createProperty: async (data: Partial<PropertyListing>) => {
        return apiClient.post<PropertyListing>(ENDPOINTS.PROPERTIES.CREATE, data);
    },

    /**
     * Update property
     */
    updateProperty: async (id: string, data: Partial<PropertyListing>) => {
        return apiClient.put<PropertyListing>(ENDPOINTS.PROPERTIES.UPDATE(id), data);
    },

    /**
     * Delete property
     */
    deleteProperty: async (id: string) => {
        return apiClient.delete(ENDPOINTS.PROPERTIES.DELETE(id));
    },

    /**
     * Search properties
     */
    searchProperties: async (query: string, filters?: PropertyFilters) => {
        return apiClient.get<PaginatedResponse<PropertyListing>>(
            ENDPOINTS.PROPERTIES.SEARCH,
            { params: { query, ...filters } }
        );
    },

    /**
     * Get featured properties
     */
    getFeaturedProperties: async () => {
        return apiClient.get<PropertyListing[]>(ENDPOINTS.PROPERTIES.FEATURED);
    },
};
