"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Invoice, ViewingRequest } from '../data/types';
import api from '../services/api';

interface InvoiceContextType {
    viewingRequests: ViewingRequest[];
    createViewingRequest: (request: any) => Promise<ViewingRequest>;
    updateViewingRequest: (id: string, updates: Partial<ViewingRequest>) => Promise<void>;
    getViewingRequestById: (id: string) => ViewingRequest | undefined;
    getViewingRequestsForProperty: (propertyId: string) => ViewingRequest[];
    getViewingRequestsForUser: (userId: string, role: 'tenant' | 'haunter') => ViewingRequest[];
    payViewingRequest: (requestId: string, phone: string) => Promise<any>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
    const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);

    const mapBackendToViewingRequest = (vr: any): ViewingRequest => ({
        id: vr.id,
        propertyId: vr.propertyId,
        propertyTitle: vr.property?.title || 'Unknown Property',
        tenantId: vr.tenantId,
        tenantName: vr.tenant?.name || 'Unknown Tenant',
        tenantPhone: vr.tenant?.phone || '',
        haunterId: vr.property?.hunterId || '',
        haunterName: vr.property?.hunter?.name || 'Unknown Hunter',
        proposedDates: typeof vr.proposedDates === 'string' ? JSON.parse(vr.proposedDates) : (vr.proposedDates || []),
        proposedLocation: vr.proposedLocation,
        status: vr.status || 'PENDING',
        amount: vr.amount || 0,
        paymentStatus: vr.paymentStatus || 'UNPAID',
        counterDate: vr.counterDate,
        counterTime: vr.counterTime,
        counterLocation: vr.counterLocation,
        counteredBy: vr.counteredBy,
        createdAt: vr.createdAt,
        updatedAt: vr.updatedAt,
    });

    const fetchViewingRequests = useCallback(async () => {
        try {
            const response = await api.get('/viewing-requests');
            const mapped = response.data.map(mapBackendToViewingRequest);
            setViewingRequests(mapped);
        } catch (err) {
            console.error('Failed to fetch viewing requests:', err);
        }
    }, []);

    useEffect(() => {
        fetchViewingRequests();
    }, [fetchViewingRequests]);

    const createViewingRequest = async (data: any): Promise<ViewingRequest> => {
        try {
            const response = await api.post('/viewing-requests', data);
            const newRequest = mapBackendToViewingRequest(response.data);
            setViewingRequests(prev => [newRequest, ...prev]);
            return newRequest;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to create viewing request');
        }
    };

    const updateViewingRequest = async (id: string, updates: Partial<ViewingRequest>) => {
        try {
            await api.patch(`/viewing-requests/${id}/status`, updates);
            await fetchViewingRequests();
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to update viewing request');
        }
    };

    const getViewingRequestById = (id: string) => viewingRequests.find(vr => vr.id === id);

    const getViewingRequestsForProperty = (propertyId: string) =>
        viewingRequests.filter(vr => vr.propertyId === propertyId);

    const getViewingRequestsForUser = (userId: string, role: 'tenant' | 'haunter') =>
        viewingRequests.filter(vr => role === 'tenant' ? vr.tenantId === userId : vr.haunterId === userId);

    const payViewingRequest = async (requestId: string, phone: string): Promise<any> => {
        try {
            const response = await api.post('/payments/stk-push', { requestId, phone });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to initiate payment');
        }
    };

    return (
        <InvoiceContext.Provider value={{
            viewingRequests,
            createViewingRequest,
            updateViewingRequest,
            getViewingRequestById,
            getViewingRequestsForProperty,
            getViewingRequestsForUser,
            payViewingRequest,
        }}>
            {children}
        </InvoiceContext.Provider>
    );
}

export function useInvoices() {
    const context = useContext(InvoiceContext);
    if (!context) {
        throw new Error('useInvoices must be used within InvoiceProvider');
    }
    return context;
}
