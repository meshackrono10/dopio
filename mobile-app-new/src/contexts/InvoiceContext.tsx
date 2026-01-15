import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Invoice, InvoiceStatus, ViewingRequest } from '../data/types';
import api from '../services/api';

interface InvoiceContextType {
    invoices: Invoice[];
    viewingRequests: ViewingRequest[];
    createViewingRequest: (request: any) => Promise<ViewingRequest>;
    updateViewingRequest: (id: string, updates: Partial<ViewingRequest>) => Promise<void>;
    getViewingRequestById: (id: string) => ViewingRequest | undefined;
    getViewingRequestsForProperty: (propertyId: string) => ViewingRequest[];
    getViewingRequestsForUser: (userId: string, role: 'tenant' | 'hunter') => ViewingRequest[];
    counterRequest: (requestId: string, date: string, timeSlot: "morning" | "afternoon" | "evening", message?: string) => Promise<void>;
    acceptRequest: (requestId: string, agreedDate: string, agreedTime: string) => Promise<void>;
    rejectRequest: (requestId: string) => Promise<void>;
    createInvoice: (viewingRequestId: string, viewingFee: number, meetupLocation: { address: string; lat: number; lng: number; directions?: string }) => Promise<Invoice>;
    getInvoiceById: (id: string) => Invoice | undefined;
    getInvoicesForUser: (userId: string, role: 'tenant' | 'hunter') => Invoice[];
    payInvoice: (invoiceId: string, phone: string) => Promise<any>;
    releasePayment: (invoiceId: string) => Promise<void>;
    refundPayment: (invoiceId: string, partial?: boolean) => Promise<void>;
    cancelInvoice: (invoiceId: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
    const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const mapBackendToViewingRequest = (vr: any): ViewingRequest => ({
        id: vr.id,
        propertyId: vr.propertyId,
        propertyTitle: vr.property?.title || 'Unknown Property',
        tenantId: vr.tenantId,
        tenantName: vr.tenant?.name || 'Unknown Tenant',
        tenantPhone: vr.tenant?.phone || '',
        hunterId: vr.property?.hunterId || '',
        hunterName: vr.property?.hunter?.name || 'Unknown Hunter',
        proposedDates: vr.proposedDates || [],
        status: vr.status?.toLowerCase() as any || 'pending',
        createdAt: vr.createdAt,
        updatedAt: vr.updatedAt,
    });

    const fetchViewingRequests = async () => {
        try {
            const response = await api.get('/viewing-requests');
            const mapped = response.data.map(mapBackendToViewingRequest);
            setViewingRequests(mapped);
        } catch (err) {
            console.error('Failed to fetch viewing requests:', err);
        }
    };

    useEffect(() => {
        fetchViewingRequests();
    }, []);

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

    const getViewingRequestsForUser = (userId: string, role: 'tenant' | 'hunter') =>
        viewingRequests.filter(vr => role === 'tenant' ? vr.tenantId === userId : vr.hunterId === userId);

    const counterRequest = async (requestId: string, date: string, timeSlot: "morning" | "afternoon" | "evening", message?: string) => {
        await updateViewingRequest(requestId, { status: 'countered' as any });
    };

    const acceptRequest = async (requestId: string, agreedDate: string, agreedTime: string) => {
        await updateViewingRequest(requestId, { status: 'accepted' as any });
    };

    const rejectRequest = async (requestId: string) => {
        await updateViewingRequest(requestId, { status: 'rejected' as any });
    };

    const createInvoice = async (
        viewingRequestId: string,
        viewingFee: number,
        meetupLocation: { address: string; lat: number; lng: number; directions?: string }
    ): Promise<Invoice> => {
        // In the new backend, invoices are created automatically with viewing requests
        // This function might need to be adjusted or removed depending on the flow
        throw new Error('Invoice creation is handled by the backend');
    };

    const getInvoiceById = (id: string) => invoices.find(inv => inv.id === id);

    const getInvoicesForUser = (userId: string, role: 'tenant' | 'hunter') =>
        invoices.filter(inv => role === 'tenant' ? inv.tenantId === userId : inv.hunterId === userId);

    const payInvoice = async (invoiceId: string, phone: string): Promise<any> => {
        try {
            const response = await api.post('/payments/stk-push', { invoiceId, phone });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to initiate payment');
        }
    };

    const releasePayment = async (invoiceId: string) => {
        // await api.post(`/payments/${invoiceId}/release`);
    };

    const refundPayment = async (invoiceId: string, partial: boolean = false) => {
        // await api.post(`/payments/${invoiceId}/refund`, { partial });
    };

    const cancelInvoice = async (invoiceId: string) => {
        // await api.post(`/payments/${invoiceId}/cancel`);
    };

    return (
        <InvoiceContext.Provider value={{
            invoices,
            viewingRequests,
            createViewingRequest,
            updateViewingRequest,
            getViewingRequestById,
            getViewingRequestsForProperty,
            getViewingRequestsForUser,
            counterRequest,
            acceptRequest,
            rejectRequest,
            createInvoice,
            getInvoiceById,
            getInvoicesForUser,
            payInvoice,
            releasePayment,
            refundPayment,
            cancelInvoice,
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
