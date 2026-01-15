import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    // All roles
    ExploreTab: NavigatorScreenParams<SearchStackParamList>;
    SavedTab: undefined;
    DashboardTab: undefined;
    BookingsTab: NavigatorScreenParams<BookingsStackParamList>;
    MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
    ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
    ActivityTab: undefined;

    // Hunter-specific
    ListingsTab: undefined;
    RequestsTab: undefined;
    EarningsTab: undefined;
    ReviewsTab: undefined;
    OrdersTab: undefined;

    // Tenant-specific
    SearchTab: undefined;

    // Admin-specific
    UsersTab: undefined;
    PropertiesTab: undefined;
    AnalyticsTab: undefined;
    DisputesTab: undefined;
};

export type HomeStackParamList = {
    Home: undefined;
    PropertyDetail: { propertyId: string };
    HunterDetail: { hunterId: string };
    HunterList: undefined;
};

export type SearchStackParamList = {
    Explore: undefined;
    Search: undefined;
    SearchRequests: undefined;
    PropertyDetail: { propertyId: string };
    BookingFlow: { propertyId: string };
    SearchRequestLanding: undefined;
    CreateSearchRequest: undefined;
    SearchRequestDetail: { requestId: string };
    BidReview: { requestId: string; bids: any[] };
    EvidenceReview: { requestId: string; evidence: any[] };
    Checkout: { propertyId: string; packageId: string };
    BookingConfirmation: { bookingId: string };
    BookingReview: { bookingId: string };
    PropertyComparison: undefined;
};

export type ProfileStackParamList = {
    Profile: undefined;
    MyReviews: undefined;
    EditProfile: undefined;
    Legal: undefined;
    PaymentHistory: undefined;
    PayoutSettings: undefined;
    Verification: undefined;
    MyIssues: { initialTab?: string };
    DisputeResponse: { disputeId: string };
    ReportIssue: { bookingId?: string; propertyId?: string; hunterId?: string; tenantId?: string };
    HunterProfile: { hunterId: string };
    TenantProfile: { tenantId: string };
    HunterDashboard: undefined;
    TenantDashboard: undefined;
    Notifications: undefined;
    PropertyDetail: { propertyId: string };
    EditProperty: { propertyId: string };
    AddListing: undefined;
    Wallet: undefined;
    Withdraw: undefined;
    HelpCenter: undefined;
    Contact: undefined;
    HowItWorks: undefined;
    CreateSearchRequest: undefined;
    SearchRequestDetail: { requestId: string };
    PropertyComparison: undefined;
    PropertyAnalytics: { propertyId: string; propertyTitle: string };
    AdminVerifications: undefined;
    AdminSettings: undefined;
    Earnings: undefined;
    Reviews: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
};

export type PropertyStackParamList = {
    Properties: undefined;
    PropertyDetail: { propertyId: string };
    AddListing: undefined;
    EditProperty: { propertyId: string };
};

export type AdminStackParamList = {
    Users: undefined;
    Properties: undefined;
    Analytics: undefined;
    Disputes: undefined;
    Verifications: undefined;
};

export type MessagesStackParamList = {
    Messages: undefined;
    Chat: {
        conversationId: string;
        otherPartyName: string;
        propertyTitle: string;
    };
};

export type BookingsStackParamList = {
    Bookings: undefined;
    BookingDetail: { bookingId: string };
    BookingConfirmation: { bookingId: string };
    BookingReview: { bookingId: string };
    RefundRequest: { bookingId: string };
    ViewingRequests: undefined;
    Invoice: { invoiceId: string };
    PostViewing: { bookingId: string };
    MeetupDay: { bookingId: string };
    Verification: undefined;
};

export type Property = {
    id: string;
    title: string;
    rent: number;
    location: {
        generalArea: string;
        county: string;
    };
    layout: string;
    bathrooms: number;
    images: string[];
    propertyType: string;
    furnished: string;
    parking?: {
        available: boolean;
        spaces: number;
        cost: number;
    };
    amenities?: string[];
    description?: string;
};
