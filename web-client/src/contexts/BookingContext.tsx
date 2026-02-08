"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { BookingStatus } from '../data/types';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface Booking {
    id: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    tenantId: string;
    tenantName: string;
    haunterId: string;
    haunterName: string;
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
    isPropertyLocked: boolean;
    viewingOutcome?: string;
    physicalMeetingConfirmed?: boolean;
    hunterMetConfirmed?: boolean;
    tenantMetConfirmed?: boolean;
    hunterDone?: boolean;
    tenantDone?: boolean;
    createdAt: string;
    completedAt?: string;
    updatedAt: string;
    reviews?: any[];
}

interface BookingContextType {
    bookings: Booking[];
    loading: boolean;
    fetchBookings: () => Promise<void>;
    updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
    getBookingById: (id: string) => Booking | undefined;
    getBookingsForUser: (userId: string, role: 'tenant' | 'haunter') => Booking[];
    cancelBooking: (id: string) => Promise<void>;
    completeViewing: (id: string) => Promise<void>;
    acceptViewing: (id: string) => Promise<void>;
    reportIssue: (id: string) => Promise<void>;
    confirmMeetup: (id: string) => Promise<void>;
    markDone: (id: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const mapBackendToBooking = (b: any): Booking => {
        let status: BookingStatus = 'pending';

        if (b.status === 'COMPLETED') {
            status = 'completed';
        } else if (b.status === 'CANCELLED') {
            status = 'cancelled';
        } else if (b.status === 'CONFIRMED') {
            status = 'confirmed';
        } else if (b.status === 'IN_PROGRESS') {
            status = 'in_progress';
        } else if (b.status === 'DISPUTED') {
            status = 'disputed';
        } else if (b.status === 'PENDING_PAYMENT') {
            status = 'pending_payment';
        }

        const property = b.property || {};
        const images = Array.isArray(property.images) ? property.images : [];
        const location = property.location || {};

        return {
            id: b.id,
            propertyId: b.propertyId,
            propertyTitle: property.title || 'Unknown Property',
            propertyImage: images[0] || '',
            tenantId: b.tenantId,
            tenantName: b.tenant?.name || 'Unknown Tenant',
            haunterId: b.hunterId,
            haunterName: property.hunter?.name || 'Unknown Hunter',
            scheduledDate: b.scheduledDate,
            scheduledTime: b.scheduledTime,
            meetupLocation: b.meetingPoint ? {
                address: b.meetingPoint.location?.name || b.meetingPoint.location || '',
                lat: b.meetingPoint.location?.lat || 0,
                lng: b.meetingPoint.location?.lng || 0,
                directions: '',
            } : undefined,
            packageName: b.viewingRequest?.packageId ? `${b.viewingRequest.packageId.charAt(0).toUpperCase()}${b.viewingRequest.packageId.slice(1)} Package` : 'Standard Package',
            price: b.amount || 0,
            status: status,
            isPropertyLocked: true,
            viewingOutcome: b.viewingOutcome,
            physicalMeetingConfirmed: b.physicalMeetingConfirmed,
            hunterMetConfirmed: b.hunterMetConfirmed,
            tenantMetConfirmed: b.tenantMetConfirmed,
            hunterDone: b.hunterDone,
            tenantDone: b.tenantDone,
            createdAt: b.createdAt,
            completedAt: b.completedAt,
            updatedAt: b.updatedAt,
            reviews: b.reviews || [],
        };
    };

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings');
            const mapped = response.data.map(mapBackendToBooking);
            setBookings(mapped);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchBookings();
        } else {
            setBookings([]);
            setLoading(false);
        }
    }, [fetchBookings, isAuthenticated]);

    const updateBooking = async (id: string, updates: Partial<Booking>) => {
        try {
            // await api.patch(`/bookings/${id}`, updates);
            await fetchBookings();
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to update booking');
        }
    };

    const getBookingById = (id: string) => bookings.find(b => b.id === id);

    const getBookingsForUser = (userId: string, role: 'tenant' | 'haunter') =>
        bookings.filter(b => role === 'tenant' ? b.tenantId === userId : b.haunterId === userId);

    const cancelBooking = async (id: string) => {
        await updateBooking(id, { status: 'cancelled' });
    };

    const completeViewing = async (id: string) => {
        await updateBooking(id, { status: 'completed' });
    };

    const acceptViewing = async (id: string): Promise<void> => {
        await updateBooking(id, { status: 'completed' });
    };

    const reportIssue = async (id: string) => {
        await api.post(`/bookings/${id}/outcome`, { outcome: 'ISSUE_REPORTED' });
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

    return (
        <BookingContext.Provider value={{
            bookings,
            loading,
            fetchBookings,
            updateBooking,
            getBookingById,
            getBookingsForUser,
            cancelBooking,
            completeViewing,
            acceptViewing,
            reportIssue,
            confirmMeetup,
            markDone,
        }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookings() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookings must be used within BookingProvider');
    }
    return context;
}
