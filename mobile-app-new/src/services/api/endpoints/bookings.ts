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
};
