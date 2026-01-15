import { Issue } from "./types";

// Mock Issues for Admin Dashboard
export const MOCK_ISSUES: Issue[] = [
    {
        id: "issue-1",
        type: "booking_dispute",
        title: "Property not as described in listing",
        description: "The property I viewed did not match the photos. The house looked much older and the amenities were not working properly. I paid for the Gold package and feel misled.",
        status: "pending",
        priority: "high",
        createdBy: {
            id: "tenant-1",
            name: "James Mwangi",
            role: "tenant",
        },
        relatedTo: {
            type: "booking",
            id: "book-1",
            title: "Modern 2-Bedroom Apartment in Kasarani",
        },
        createdAt: "2025-12-15T10:30:00",
        updatedAt: "2025-12-15T10:30:00",
    },
    {
        id: "issue-2",
        type: "payment_problem",
        title: "M-Pesa payment deducted but booking not confirmed",
        description: "I made a payment of KES 2,500 via M-Pesa but my booking is still showing as 'pending payment'. Transaction ID: QH12345678. Need urgent help.",
        status: "in_progress",
        priority: "urgent",
        createdBy: {
            id: "tenant-2",
            name: "Grace Akinyi",
            role: "tenant",
        },
        relatedTo: {
            type: "booking",
            id: "book-2",
            title: "Cozy Bedsitter in Roysambu",
        },
        createdAt: "2025-12-14T14:20:00",
        updatedAt: "2025-12-15T09:00:00",
        adminNotes: "Investigating with M-Pesa team. Transaction found in gateway logs.",
    },
    {
        id: "issue-3",
        type: "unprofessional_behavior",
        title: "Tenant did not show up for confirmed viewing",
        description: "I confirmed a Platinum package viewing with a tenant. I waited for 2 hours at the meeting point but they never showed up and never responded to my calls. This wastes my time and affects my ratings.",
        status: "pending",
        priority: "medium",
        createdBy: {
            id: "haunter-1",
            name: "John Kamau",
            role: "haunter",
        },
        relatedTo: {
            type: "booking",
            id: "book-4",
            title: "No-show incident",
        },
        createdAt: "2025-12-13T16:45:00",
        updatedAt: "2025-12-13T16:45:00",
    },
    {
        id: "issue-4",
        type: "property_mismatch",
        title: "House Haunter showed different properties than listed",
        description: "I booked to view the Westlands 3-bedroom apartment but the agent took me to completely different properties in Kilimani. When I asked about the original property, they said it was already taken.",
        status: "resolved",
        priority: "high",
        createdBy: {
            id: "tenant-3",
            name: "Peter Omondi",
            role: "tenant",
        },
        relatedTo: {
            type: "booking",
            id: "book-3",
            title: "Spacious 3-Bedroom in Westlands",
        },
        createdAt: "2025-12-10T11:00:00",
        updatedAt: "2025-12-12T15:00:00",
        resolvedAt: "2025-12-12T15:00:00",
        adminNotes: "Verified the complaint. Property was marked as unavailable before booking. Agent suspended for 7 days.",
        resolution: "Full refund issued. Agent given warning and suspended. Listing removed.",
        markedDoneBy: ["admin", "tenant"],
    },
    {
        id: "issue-5",
        type: "platform_bug",
        title: "Cannot upload photos to new listing",
        description: "I'm trying to create a new listing but the photo upload keeps failing. I've tried different images and browsers but nothing works. Error: 'Upload failed - please try again'.",
        status: "in_progress",
        priority: "medium",
        createdBy: {
            id: "haunter-2",
            name: "Mary Njeri",
            role: "haunter",
        },
        createdAt: "2025-12-14T09:15:00",
        updatedAt: "2025-12-15T08:00:00",
        adminNotes: "Cloudinary API issue identified. Working on fix.",
    },
    {
        id: "issue-6",
        type: "payment_problem",
        title: "Earnings payout delayed",
        description: "My completed viewings from last week (KES 12,750) still haven't been sent to my M-Pesa. Usually it's instant after the viewing window ends. Need this urgently for bills.",
        status: "resolved",
        priority: "high",
        createdBy: {
            id: "haunter-3",
            name: "David Ochieng",
            role: "haunter",
        },
        createdAt: "2025-12-11T13:00:00",
        updatedAt: "2025-12-12T10:00:00",
        resolvedAt: "2025-12-12T10:00:00",
        adminNotes: "M-Pesa B2C system had temporary outage. Payment manually processed.",
        resolution: "Payment of KES 12,750 successfully sent to M-Pesa account ending in 890.",
        markedDoneBy: ["admin", "haunter"],
    },
    {
        id: "issue-7",
        type: "other",
        title: "Cannot access chat after payment",
        description: "I paid for a viewing package but the chat is still locked. I can't communicate with the House Haunter to arrange the viewing time.",
        status: "pending",
        priority: "high",
        createdBy: {
            id: "tenant-4",
            name: "Sarah Wanjiku",
            role: "tenant",
        },
        relatedTo: {
            type: "booking",
            id: "book-5",
            title: "1-Bedroom Apartment in Embakasi",
        },
        createdAt: "2025-12-15T12:00:00",
        updatedAt: "2025-12-15T12:00:00",
    },
];

// Utility function to get issue by ID
export const getIssueById = (id: string | number): Issue | undefined => {
    return MOCK_ISSUES.find((issue) => issue.id === id);
};

// Utility function to get issues by status
export const getIssuesByStatus = (status: Issue["status"]): Issue[] => {
    return MOCK_ISSUES.filter((issue) => issue.status === status);
};

// Utility function to get issues by user
export const getIssuesByUser = (userId: string | number): Issue[] => {
    return MOCK_ISSUES.filter((issue) => issue.createdBy.id === userId);
};

// Utility function to get issues by role
export const getIssuesByRole = (role: "tenant" | "haunter"): Issue[] => {
    return MOCK_ISSUES.filter((issue) => issue.createdBy.role === role);
};
