import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BookingStatus, RescheduleRequest, CheckIn } from '../data/types';
import api from '../services/api';

export interface Booking {
    id: string;
    invoiceId: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    tenantId: string;
    tenantName: string;
    hunterId: string;
    hunterName: string;
    scheduledDate: string;
    scheduledTime: string;
    meetupLocation?: {
        address: string;
        lat: number;
        lng: number;
        directions?: string;
    };
    packageName: string;
    price: number;
    status: BookingStatus;
    tenantCheckIn?: CheckIn;
    hunterCheckIn?: CheckIn;
    rescheduleRequest?: RescheduleRequest;
    physicalMeetingConfirmed?: boolean;
    tenantMetConfirmed?: boolean;
    hunterMetConfirmed?: boolean;
    tenantDone?: boolean;
    hunterDone?: boolean;
    issueCreated?: boolean;
    isPropertyLocked?: boolean;
    createdAt: string;
    completedAt?: string;
}

interface BookingContextType {
    bookings: Booking[];
    rescheduleRequests: RescheduleRequest[];
    addBooking: (booking: any) => Promise<Booking>;
    updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
    getBookingById: (id: string) => Booking | undefined;
    getBookingsForUser: (userId: string, role: 'tenant' | 'hunter') => Booking[];
    cancelBooking: (id: string) => Promise<void>;
    checkIn: (bookingId: string, role: 'tenant' | 'hunter', coords: { lat: number; lng: number; accuracy: number }) => Promise<void>;
    requestReschedule: (bookingId: string, requestedBy: 'tenant' | 'hunter', newTime: string, reason?: string) => Promise<void>;
    respondToReschedule: (bookingId: string, accept: boolean, counterTime?: string) => Promise<void>;
    completeViewing: (id: string) => Promise<void>;
    acceptViewing: (id: string) => Promise<void>;
    reportIssue: (id: string, feedback: string) => Promise<void>;
    cancelIssue: (id: string) => Promise<void>;
    respondToIssue: (id: string, action: 'accept' | 'deny') => Promise<void>;
    confirmMeetup: (id: string) => Promise<void>;
    markDone: (id: string) => Promise<void>;
    requestAlternative: (id: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);

    const mapBackendToBooking = (b: any): Booking => ({
        id: b.id,
        invoiceId: b.invoice?.id || '',
        propertyId: b.propertyId,
        propertyTitle: b.property?.title || 'Unknown Property',
        propertyImage: b.property?.images?.[0] || '',
        tenantId: b.tenantId,
        tenantName: b.tenant?.name || 'Unknown Tenant',
        hunterId: b.hunterId || b.property?.hunterId || '',
        hunterName: b.property?.hunter?.name || 'Unknown Hunter',
        scheduledDate: b.scheduledDate || b.createdAt,
        scheduledTime: b.scheduledTime || 'TBD',
        meetupLocation: b.property?.location ? {
            address: b.property.location.address || '',
            lat: b.property.location.lat || 0,
            lng: b.property.location.lng || 0,
            directions: b.property.location.directions || '',
        } : undefined,
        packageName: 'Standard Package',
        price: b.invoice?.amount || 0,
        status: b.status.toLowerCase() as BookingStatus,
        isPropertyLocked: b.property?.isLocked ?? true,
        physicalMeetingConfirmed: b.physicalMeetingConfirmed,
        tenantMetConfirmed: b.tenantMetConfirmed,
        hunterMetConfirmed: b.hunterMetConfirmed,
        tenantDone: b.tenantDone,
        hunterDone: b.hunterDone,
        issueCreated: b.issueCreated,
        createdAt: b.createdAt,
        completedAt: b.completedAt,
    });

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            const mapped = response.data.map(mapBackendToBooking);
            setBookings(mapped);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const addBooking = async (data: any): Promise<Booking> => {
        // In real app, bookings are created after payment
        throw new Error('Bookings are created automatically after payment');
    };

    const updateBooking = async (id: string, updates: Partial<Booking>) => {
        try {
            // await api.patch(`/bookings/${id}`, updates);
            await fetchBookings();
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to update booking');
        }
    };

    const getBookingById = (id: string) => bookings.find(b => b.id === id);

    const getBookingsForUser = (userId: string, role: 'tenant' | 'hunter') =>
        bookings.filter(b => role === 'tenant' ? b.tenantId === userId : b.hunterId === userId);

    const cancelBooking = async (id: string) => {
        await updateBooking(id, { status: 'cancelled' });
    };

    const checkIn = async (bookingId: string, role: 'tenant' | 'hunter', coords: { lat: number; lng: number; accuracy: number }) => {
        // await api.post(`/bookings/${bookingId}/check-in`, { role, coords });
        await fetchBookings();
    };

    const requestReschedule = async (bookingId: string, requestedBy: 'tenant' | 'hunter', newTime: string, reason?: string) => {
        // await api.post(`/bookings/${bookingId}/reschedule`, { requestedBy, newTime, reason });
        await fetchBookings();
    };

    const respondToReschedule = async (bookingId: string, accept: boolean, counterTime?: string) => {
        // await api.post(`/bookings/${bookingId}/reschedule/respond`, { accept, counterTime });
        await fetchBookings();
    };

    const completeViewing = async (id: string) => {
        await markDone(id);
    };

    const acceptViewing = async (id: string): Promise<void> => {
        // This was for verified property match, now part of markDone/outcome
        await markDone(id);
    };

    const reportIssue = async (id: string, feedback: string) => {
        await api.post(`/bookings/${id}/outcome`, { outcome: 'ISSUE_REPORTED', feedback });
        await fetchBookings();
    };

    const cancelIssue = async (id: string) => {
        await api.post(`/bookings/${id}/cancel-issue`);
        await fetchBookings();
    };

    const respondToIssue = async (id: string, action: 'accept' | 'deny') => {
        await api.post(`/bookings/${id}/respond-issue`, { action });
        await fetchBookings();
    };

    const confirmMeetup = async (id: string) => {
        await api.post(`/bookings/${id}/confirm-meeting`);
        await fetchBookings();
    };

    const markDone = async (id: string) => {
        await api.post(`/bookings/${id}/done`);
        await fetchBookings();
    };

    const requestAlternative = async (id: string) => {
        // await api.post(`/bookings/${id}/alternative`);
        await fetchBookings();
    };

    return (
        <BookingContext.Provider value={{
            bookings,
            rescheduleRequests,
            addBooking,
            updateBooking,
            getBookingById,
            getBookingsForUser,
            cancelBooking,
            checkIn,
            requestReschedule,
            respondToReschedule,
            completeViewing,
            acceptViewing,
            reportIssue,
            cancelIssue,
            respondToIssue,
            confirmMeetup,
            markDone,
            requestAlternative,
        }}>
            {children}
        </BookingContext.Provider>
    );
}

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function useBookings() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookings must be used within BookingProvider');
    }
    return context;
}
