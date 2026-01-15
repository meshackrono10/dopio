/**
 * App Constants
 * Application-wide constants and configuration
 */

// App Metadata
export const APP_NAME = 'Dapio';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURE_FLAGS = {
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_BIOMETRIC_AUTH: false,
    ENABLE_DARK_MODE: true,
    ENABLE_ANALYTICS: false,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Image Upload
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGES_PER_PROPERTY = 12;

// Form Limits
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_TITLE_LENGTH = 100;
export const MIN_PASSWORD_LENGTH = 8;

// Currency
export const CURRENCY_CODE = 'KES';
export const CURRENCY_SYMBOL = 'KES';

// Date Formats
export const DATE_FORMAT = 'MMM D, YYYY';
export const TIME_FORMAT = 'h:mm A';
export const DATETIME_FORMAT = 'MMM D, YYYY • h:mm A';

// Property Types
export const PROPERTY_TYPES = [
    'Apartment',
    'House',
    'Bedsitter',
    'Bungalow',
    'Condo',
    'Cottage',
    'Studio',
];

// Property Layouts
export const PROPERTY_LAYOUTS = [
    'bedsitter',
    'studio',
    '1-bedroom',
    '2-bedroom',
    '3-bedroom',
    '4-bedroom+',
];

// Amenities
export const COMMON_AMENITIES = [
    'Wifi',
    'Kitchen',
    'Free parking',
    'Air conditioning',
    'Heating',
    'Washer',
    'Dryer',
    'TV',
    'Dedicated workspace',
    'Gym',
    'Swimming Pool',
    'Security',
    'Backup Generator',
    'Elevator',
    'Balcony',
];

// Security Features
export const SECURITY_FEATURES = [
    'CCTV',
    'Security Guard',
    'Gate',
    'Alarm System',
    'Intercom',
];

// Service Tiers for Search Requests
export const SERVICE_TIERS = {
    STANDARD: {
        name: 'Standard',
        price: 5000,
        deliveryHours: 48,
        properties: 1,
    },
    PREMIUM: {
        name: 'Premium',
        price: 10000,
        deliveryHours: 24,
        properties: 3,
    },
    URGENT: {
        name: 'Urgent',
        price: 15000,
        deliveryHours: 12,
        properties: 3
    },
};

// Viewing Package Tiers
export const PACKAGE_TIERS = {
    BRONZE: {
        name: 'Bronze',
        color: '#CD7F32',
    },
    GOLD: {
        name: 'Gold',
        color: '#FFD700',
    },
    PLATINUM: {
        name: 'Platinum',
        color: '#E5E4E2',
    },
};

// Booking Status
export const BOOKING_STATUS = {
    PENDING_PAYMENT: 'Pending Payment',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    DISPUTED: 'Disputed',
};

// Search Request Status
export const SEARCH_REQUEST_STATUS = {
    DRAFT: 'Draft',
    PENDING_PAYMENT: 'Pending Payment',
    PENDING_ASSIGNMENT: 'Pending Assignment',
    IN_PROGRESS: 'In Progress',
    PENDING_REVIEW: 'Pending Review',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    FORFEITED: 'Forfeited',
};

// Notification Types
export const NOTIFICATION_TYPES = {
    BOOKING_CONFIRMED: 'booking_confirmed',
    BOOKING_CANCELLED: 'booking_cancelled',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_PENDING: 'payment_pending',
    REVIEW_RECEIVED: 'review_received',
    LISTING_APPROVED: 'listing_approved',
    LISTING_REJECTED: 'listing_rejected',
    MESSAGE_RECEIVED: 'message_received',
    DISPUTE_FILED: 'dispute_filed',
};

// Issue Types
export const ISSUE_TYPES = {
    BOOKING_DISPUTE: 'Booking Dispute',
    PAYMENT_PROBLEM: 'Payment Problem',
    PROPERTY_MISMATCH: 'Property Mismatch',
    UNPROFESSIONAL_BEHAVIOR: 'Unprofessional Behavior',
    PLATFORM_BUG: 'Platform Bug',
    OTHER: 'Other',
};

// Counties in Kenya
export const KENYAN_COUNTIES = [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Kiambu',
    'Machakos',
    'Kajiado',
    'Nyeri',
];

// Popular Areas in Nairobi
export const NAIROBI_AREAS = [
    'Westlands',
    'Kilimani',
    'Parklands',
    'Kasarani',
    'Roysambu',
    'Githurai',
    'Embakasi',
    'Umoja',
    'Donholm',
    'Kileleshwa',
    'Lavington',
    'Spring Valley',
    'Ngong Road',
    'Karen',
    'Langata',
];
