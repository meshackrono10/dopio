"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { BookingStatus } from '../data/types';
import api from '../services/api';

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
    createdAt: string;
    completedAt?: string;
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
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const mapBackendToBooking = (b: any): Booking => {
        let status: BookingStatus = 'pending'; // Default to pending

        if (b.paymentStatus === 'ESCROW' || b.paymentStatus === 'PAID') {
            status = 'confirmed';
        } else if (b.status === 'ACCEPTED') {
            status = 'confirmed';
        } else if (b.status === 'REJECTED' || b.status === 'CANCELLED') {
            status = 'cancelled';
        } else if (b.status === 'COMPLETED') {
            status = 'completed';
        } else if (b.status === 'PENDING' || b.status === 'COUNTERED') {
            status = 'pending';
        }

        return {
            id: b.id,
            propertyId: b.propertyId,
            propertyTitle: b.property?.title || 'Unknown Property',
            propertyImage: b.property?.images?.[0] || '',
            tenantId: b.tenantId,
            tenantName: b.tenant?.name || 'Unknown Tenant',
            haunterId: b.property?.hunterId || '',
            haunterName: b.property?.hunter?.name || 'Unknown Hunter',
            scheduledDate: b.counterDate || b.proposedDates?.[0]?.date || b.createdAt,
            scheduledTime: b.counterTime || b.proposedDates?.[0]?.timeSlot || 'TBD',
            meetupLocation: b.counterLocation || b.property?.location ? {
                address: b.counterLocation?.location || b.property.location.address || '',
                lat: b.property.location.lat || 0,
                lng: b.property.location.lng || 0,
                directions: b.property.location.directions || '',
            } : undefined,
            packageName: 'Standard Package', // TODO: Fetch real package name
            price: b.amount || 0,
            status: status,
            isPropertyLocked: true,
            createdAt: b.createdAt,
            completedAt: b.completedAt,
        };
    };

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/viewing-requests');
            // Filter for requests that are relevant to bookings
            const mapped = response.data
                .filter((vr: any) =>
                    vr.status === 'PENDING' ||
                    vr.status === 'COUNTERED' ||
                    vr.status === 'ACCEPTED' ||
                    vr.paymentStatus === 'ESCROW' ||
                    vr.paymentStatus === 'PAID' ||
                    vr.status === 'COMPLETED'
                )
                .map(mapBackendToBooking);
            setBookings(mapped);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

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
        await updateBooking(id, { status: 'disputed' });
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
