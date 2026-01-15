import { Bid } from "./types";

// Mock Bids for Search Requests
export const MOCK_BIDS: Bid[] = [
    {
        id: "bid-1",
        haunterId: "haunter-1",
        haunterName: "John Kamau",
        haunterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        hunterRating: 4.8,
        hunterSuccessRate: 95,
        price: 7000,
        timeframe: 96, // 4 days
        bonuses: ["1 extra property option", "Video tours included"],
        message: "I specialize in the Westlands area and have access to premium listings. I can deliver high-quality options within 4 days.",
        status: "pending",
        submittedAt: "2024-12-19T10:30:00",
    },
    {
        id: "bid-2",
        haunterId: "haunter-2",
        haunterName: "Sarah Njeri",
        haunterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        hunterRating: 4.9,
        hunterSuccessRate: 98,
        price: 6500,
        timeframe: 72, // 3 days
        bonuses: ["Priority viewing slots", "Detailed neighborhood reports"],
        message: "I have 5+ years experience in Kilimani and Parklands. Fast delivery guaranteed with premium quality properties.",
        status: "pending",
        submittedAt: "2024-12-19T11:15:00",
    },
    {
        id: "bid-3",
        haunterId: "haunter-3",
        haunterName: "James Mwangi",
        haunterAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        hunterRating: 4.7,
        hunterSuccessRate: 92,
        price: 7500,
        timeframe: 120, // 5 days
        bonuses: ["Free property inspection report"],
        message: "I focus on quality over speed. Each property will be thoroughly vetted to match your requirements.",
        status: "pending",
        submittedAt: "2024-12-19T14:20:00",
    },
];

// Utility to get bids for a search request
export const getBidsBySearchRequestId = (searchRequestId: string | number) => {
    // For demo, return all bids for search-1
    if (searchRequestId === "search-1") {
        return MOCK_BIDS;
    }
    return [];
};

// Utility to get hunter's active bids
export const getBidsByHaunterId = (haunterId: string | number) => {
    return MOCK_BIDS.filter(bid => bid.haunterId === haunterId);
};
