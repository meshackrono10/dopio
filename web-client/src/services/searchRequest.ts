import api from './api';

export interface SearchRequestData {
    preferredAreas: string[];
    minRent: number;
    maxRent: number;
    moveInDate: string;
    leaseDuration: string;
    propertyType: string;
    bathrooms: number;
    furnished: string;
    petFriendly: boolean;
    parkingRequired: boolean;
    parkingSpaces: number;
    securityFeatures: string[];
    utilitiesIncluded: string[];
    amenities: string[];
    mustHaveFeatures: string[];
    niceToHaveFeatures: string[];
    dealBreakers: string[];
    additionalNotes: string;
    serviceTier: string;
    numberOfOptions: number;
}

export const createSearchRequest = async (data: SearchRequestData) => {
    const response = await api.post('/search-requests', data);
    return response.data;
};

export const getSearchRequests = async (params?: { userId?: string; role?: string }) => {
    const response = await api.get('/search-requests', { params });
    return response.data;
};

export const getSearchRequestById = async (id: string) => {
    const response = await api.get(`/search-requests/${id}`);
    return response.data;
};

export const bidOnSearchRequest = async (id: string, amount: number, message: string, timeframe: number, bonuses: string[]) => {
    const response = await api.post(`/search-requests/${id}/bids`, { amount, message, timeframe, bonuses });
    return response.data;
};

export const acceptBid = async (requestId: string, bidId: string) => {
    const response = await api.post(`/search-requests/${requestId}/bids/${bidId}/accept`);
    return response.data;
};
