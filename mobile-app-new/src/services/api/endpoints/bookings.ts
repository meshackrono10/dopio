/**
 * Bookings API Endpoints
 */

import apiClient from '../client';
import { ENDPOINTS } from '../../../config/api.config';
import { Booking } from '../../../data/types';
import { CreateBookingRequest } from '../types';

export const bookingsApi = {
    /**
     * Get all bookings
     */
    getBookings: async () => {
        return apiClient.get<Booking[]>(ENDPOINTS.BOOKINGS.LIST);
    },

    /**
     * Get booking by ID
     */
    getBookingById: async (id: string) => {
        return apiClient.get<Booking>(ENDPOINTS.BOOKINGS.DETAIL(id));
    },

    /**
     * Create new booking
     */
    createBooking: async (data: CreateBookingRequest) => {
        return apiClient.post<Booking>(ENDPOINTS.BOOKINGS.CREATE, data);
    },

    /**
     * Update booking
     */
    updateBooking: async (id: string, data: Partial<Booking>) => {
        return apiClient.put<Booking>(ENDPOINTS.BOOKINGS.UPDATE(id), data);
    },

    /**
     * Cancel booking
     */
    cancelBooking: async (id: string, reason?: string) => {
        return apiClient.post(ENDPOINTS.BOOKINGS.CANCEL(id), { reason });
    },

    /**
     * Confirm physical meetup
     */
    confirmMeetup: async (id: string) => {
        return apiClient.post(ENDPOINTS.BOOKINGS.CONFIRM_MEETING(id));
    },

    /**
     * Mark booking as done
     */
    markDone: async (id: string) => {
        return apiClient.post(ENDPOINTS.BOOKINGS.DONE(id));
    },

    /**
     * Submit viewing outcome (Done/Issue)
     */
    submitOutcome: async (id: string, data: any) => {
        return apiClient.post(ENDPOINTS.BOOKINGS.OUTCOME(id), data);
    },

    /**
     * Cancel reported issue
     */
    cancelIssue: async (id: string) => {
        return apiClient.post(ENDPOINTS.BOOKINGS.CANCEL_ISSUE(id));
    },

    /**
     * Respond to issue
     */
    respondToIssue: async (id: string, action: 'accept' | 'deny') => {
        return apiClient.post(ENDPOINTS.BOOKINGS.RESPOND_ISSUE(id), { action });
    },
};
