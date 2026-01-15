/**
 * API Service Types
 * Type definitions for API requests and responses
 */

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'tenant' | 'hunter';
        avatar?: string;
    };
    token: string;
    refreshToken: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role: 'tenant' | 'hunter';
    phone?: string;
}

// Property Types
export interface PropertyFilters {
    minRent?: number;
    maxRent?: number;
    layout?: string[];
    location?: string;
    amenities?: string[];
    furnished?: string;
    petFriendly?: boolean;
    page?: number;
    limit?: number;
}

// Booking Types
export interface CreateBookingRequest {
    propertyId: string;
    packageId: string;
    scheduledDate: string;
    scheduledTime: string;
}

// Search Request Types
export interface CreateSearchRequestRequest {
    preferredAreas: string[];
    minRent: number;
    maxRent: number;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    furnished: string;
    amenities: string[];
    serviceTier: 'standard' | 'premium' | 'urgent';
    numberOfOptions: number;
    deadline: string;
}

// Message Types
export interface SendMessageRequest {
    message: string;
    messageType?: 'text' | 'image' | 'location';
    metadata?: any;
}
