declare const __DEV__: boolean;

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
        CONFIRM_MEETING: (id: string) => `/bookings/${id}/confirm-meeting`,
        DONE: (id: string) => `/bookings/${id}/done`,
        OUTCOME: (id: string) => `/bookings/${id}/outcome`,
        CANCEL_ISSUE: (id: string) => `/bookings/${id}/cancel-issue`,
        RESPOND_ISSUE: (id: string) => `/bookings/${id}/respond-issue`,
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
