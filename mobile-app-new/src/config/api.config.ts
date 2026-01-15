/**
 * API Configuration
 * Environment-based configuration for API endpoints
 */

export const API_CONFIG = {
    // Base URLs for different environments
    BASE_URL: __DEV__
        ? 'http://localhost:3000/api'
        : 'https://api.dapio.com',

    // Timeout settings
    TIMEOUT: 30000, // 30 seconds

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second

    // Headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

export const ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },

    // Properties
    PROPERTIES: {
        LIST: '/properties',
        DETAIL: (id: string) => `/properties/${id}`,
        CREATE: '/properties',
        UPDATE: (id: string) => `/properties/${id}`,
        DELETE: (id: string) => `/properties/${id}`,
        SEARCH: '/properties/search',
        FEATURED: '/properties/featured',
    },

    // Bookings
    BOOKINGS: {
        LIST: '/bookings',
        DETAIL: (id: string) => `/bookings/${id}`,
        CREATE: '/bookings',
        UPDATE: (id: string) => `/bookings/${id}`,
        CANCEL: (id: string) => `/bookings/${id}/cancel`,
    },

    // Search Requests
    SEARCH_REQUESTS: {
        LIST: '/search-requests',
        DETAIL: (id: string) => `/search-requests/${id}`,
        CREATE: '/search-requests',
        UPDATE: (id: string) => `/search-requests/${id}`,
        SUBMIT_BID: (id: string) => `/search-requests/${id}/bids`,
        ACCEPT_BID: (id: string, bidId: string) => `/search-requests/${id}/bids/${bidId}/accept`,
        SUBMIT_EVIDENCE: (id: string) => `/search-requests/${id}/evidence`,
    },

    // Wallet & Payments
    WALLET: {
        BALANCE: '/wallet/balance',
        TRANSACTIONS: '/wallet/transactions',
        WITHDRAW: '/wallet/withdraw',
        DEPOSIT: '/wallet/deposit',
    },

    // Messages
    MESSAGES: {
        CONVERSATIONS: '/messages/conversations',
        CONVERSATION_DETAIL: (id: string) => `/messages/conversations/${id}`,
        SEND_MESSAGE: (conversationId: string) => `/messages/conversations/${conversationId}/messages`,
        MARK_READ: (conversationId: string) => `/messages/conversations/${conversationId}/read`,
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
    },

    // User Profile
    USER: {
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/profile',
        UPLOAD_AVATAR: '/user/avatar',
    },

    // Reviews
    REVIEWS: {
        LIST: '/reviews',
        CREATE: '/reviews',
        UPDATE: (id: string) => `/reviews/${id}`,
    },

    // Issues/Disputes
    ISSUES: {
        LIST: '/issues',
        CREATE: '/issues',
        DETAIL: (id: string) => `/issues/${id}`,
        UPDATE: (id: string) => `/issues/${id}`,
    },
};
