import React, { createContext, useContext, useState } from 'react';
import { SearchRequest } from '../data/types';
import { MOCK_SEARCH_REQUESTS } from '../services/mockData';

interface SearchRequestContextType {
    searchRequests: SearchRequest[];
    addSearchRequest: (request: SearchRequest) => void;
    updateSearchRequest: (id: string | number, updates: Partial<SearchRequest>) => void;
    deleteSearchRequest: (id: string | number) => void;
    getSearchRequestById: (id: string | number) => SearchRequest | undefined;
}

const SearchRequestContext = createContext<SearchRequestContextType | undefined>(undefined);

export const SearchRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchRequests, setSearchRequests] = useState<SearchRequest[]>(MOCK_SEARCH_REQUESTS);

    const addSearchRequest = (request: SearchRequest) => {
        setSearchRequests(prev => [request, ...prev]);
    };

    const updateSearchRequest = (id: string | number, updates: Partial<SearchRequest>) => {
        setSearchRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteSearchRequest = (id: string | number) => {
        setSearchRequests(prev => prev.filter(r => r.id !== id));
    };

    const getSearchRequestById = (id: string | number) => {
        return searchRequests.find(r => r.id === id);
    };

    return (
        <SearchRequestContext.Provider value={{
            searchRequests,
            addSearchRequest,
            updateSearchRequest,
            deleteSearchRequest,
            getSearchRequestById
        }}>
            {children}
        </SearchRequestContext.Provider>
    );
};

export const useSearchRequests = () => {
    const context = useContext(SearchRequestContext);
    if (context === undefined) {
        throw new Error('useSearchRequests must be used within a SearchRequestProvider');
    }
    return context;
};
