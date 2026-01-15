export interface Document {
    id: string;
    name: string;
    type: "id" | "contract" | "receipt" | "lease" | "verification" | "other";
    fileUrl: string;
    uploadedAt: string;
    uploadedBy: string;
    size: number; // in bytes
    mimeType: string;
    status?: "pending" | "approved" | "rejected";
}

export const MOCK_DOCUMENTS: Document[] = [
    {
        id: "doc-1",
        name: "National ID - Front.pdf",
        type: "id",
        fileUrl: "/documents/id-front.pdf",
        uploadedAt: "2026-01-01T10:00:00Z",
        uploadedBy: "tenant-1",
        size: 245678,
        mimeType: "application/pdf",
        status: "approved",
    },
    {
        id: "doc-2",
        name: "National ID - Back.pdf",
        type: "id",
        fileUrl: "/documents/id-back.pdf",
        uploadedAt: "2026-01-01T10:01:00Z",
        uploadedBy: "tenant-1",
        size: 238945,
        mimeType: "application/pdf",
        status: "approved",
    },
    {
        id: "doc-3",
        name: "Lease Agreement - Lavington Apartment.pdf",
        type: "lease",
        fileUrl: "/documents/lease-lavington.pdf",
        uploadedAt: "2026-01-05T14:30:00Z",
        uploadedBy: "haunter-1",
        size: 456789,
        mimeType: "application/pdf",
        status: "pending",
    },
    {
        id: "doc-4",
        name: "Payment Receipt - Booking #12345.pdf",
        type: "receipt",
        fileUrl: "/documents/receipt-12345.pdf",
        uploadedAt: "2026-01-03T09:15:00Z",
        uploadedBy: "tenant-1",
        size: 123456,
        mimeType: "application/pdf",
        status: "approved",
    },
];

export interface SavedSearch {
    id: string;
    name: string;
    filters: {
        propertyType?: string[];
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
        amenities?: string[];
        areas?: string[];
        furnished?: boolean;
        petFriendly?: boolean;
    };
    createdAt: string;
    matchCount?: number;
}

export const MOCK_SAVED_SEARCHES: SavedSearch[] = [
    {
        id: "search-1",
        name: "2BR Apartments in Westlands",
        filters: {
            propertyType: ["apartment"],
            minPrice: 30000,
            maxPrice: 60000,
            bedrooms: 2,
            areas: ["Westlands"],
            furnished: true,
        },
        createdAt: "2026-01-01T10:00:00Z",
        matchCount: 12,
    },
    {
        id: "search-2",
        name: "Pet-Friendly Houses in Karen",
        filters: {
            propertyType: ["house"],
            minPrice: 80000,
            maxPrice: 150000,
            areas: ["Karen"],
            petFriendly: true,
        },
        createdAt: "2025-12-28T15:30:00Z",
        matchCount: 5,
    },
];

export interface AnalyticsData {
    bookings: {
        total: number;
        completed: number;
        upcoming: number;
        cancelled: number;
        trend: { month: string; count: number }[];
    };
    revenue: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        byPackage: { name: string; value: number }[];
        trend: { month: string; amount: number }[];
    };
    ratings: {
        average: number;
        total: number;
        distribution: { rating: number; count: number }[];
    };
    properties: {
        total: number;
        mostViewed: { id: string; title: string; views: number }[];
    };
}

export const MOCK_ANALYTICS: AnalyticsData = {
    bookings: {
        total: 48,
        completed: 35,
        upcoming: 10,
        cancelled: 3,
        trend: [
            { month: "Aug", count: 5 },
            { month: "Sep", count: 7 },
            { month: "Oct", count: 9 },
            { month: "Nov", count: 12 },
            { month: "Dec", count: 15 },
        ],
    },
    revenue: {
        total: 98500,
        thisMonth: 24000,
        lastMonth: 18500,
        byPackage: [
            { name: "Bronze", value: 15000 },
            { name: "Silver", value: 32500 },
            { name: "Gold", value: 51000 },
        ],
        trend: [
            { month: "Aug", amount: 12000 },
            { month: "Sep", amount: 15500 },
            { month: "Oct", amount: 17000 },
            { month: "Nov", amount: 18500 },
            { month: "Dec", amount: 24000 },
        ],
    },
    ratings: {
        average: 4.7,
        total: 42,
        distribution: [
            { rating: 5, count: 28 },
            { rating: 4, count: 10 },
            { rating: 3, count: 3 },
            { rating: 2, count: 1 },
            { rating: 1, count: 0 },
        ],
    },
    properties: {
        total: 156,
        mostViewed: [
            { id: "prop-1", title: "Modern 2BR Apartment in Lavington", views: 245 },
            { id: "prop-2", title: "Luxury Villa in Karen", views: 198 },
            { id: "prop-3", title: "Cozy Studio in Westlands", views: 176 },
        ],
    },
};
