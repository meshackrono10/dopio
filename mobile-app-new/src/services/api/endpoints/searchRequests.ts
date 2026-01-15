/**
 * Search Requests API Endpoints
 */

import apiClient from '../client';
import { ENDPOINTS } from '../../../config/api.config';
import { SearchRequest, Bid, PropertyEvidence } from '../../../data/types';
import { CreateSearchRequestRequest } from '../types';

export const searchRequestsApi = {
    /**
     * Get all search requests
     */
    getSearchRequests: async () => {
        return apiClient.get<SearchRequest[]>(ENDPOINTS.SEARCH_REQUESTS.LIST);
    },

    /**
     * Get search request by ID
     */
    getSearchRequestById: async (id: string) => {
        return apiClient.get<SearchRequest>(ENDPOINTS.SEARCH_REQUESTS.DETAIL(id));
    },

    /**
     * Create new search request
     */
    createSearchRequest: async (data: CreateSearchRequestRequest) => {
        return apiClient.post<SearchRequest>(ENDPOINTS.SEARCH_REQUESTS.CREATE, data);
    },

    /**
     * Update search request
     */
    updateSearchRequest: async (id: string, data: Partial<SearchRequest>) => {
        return apiClient.put<SearchRequest>(ENDPOINTS.SEARCH_REQUESTS.UPDATE(id), data);
    },

    /**
     * Submit bid for search request (Hunter)
     */
    submitBid: async (requestId: string, bidData: Partial<Bid>) => {
        return apiClient.post<Bid>(ENDPOINTS.SEARCH_REQUESTS.SUBMIT_BID(requestId), bidData);
    },

    /**
     * Accept bid (Tenant)
     */
    acceptBid: async (requestId: string, bidId: string) => {
        return apiClient.post(ENDPOINTS.SEARCH_REQUESTS.ACCEPT_BID(requestId, bidId));
    },

    /**
     * Submit evidence (Hunter)
     */
    submitEvidence: async (requestId: string, evidence: PropertyEvidence[]) => {
        return apiClient.post(ENDPOINTS.SEARCH_REQUESTS.SUBMIT_EVIDENCE(requestId), { evidence });
    },
};
