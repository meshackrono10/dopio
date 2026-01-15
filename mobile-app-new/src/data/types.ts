// Removed web-specific imports for React Native
// Types are defined inline below
export type Route<T = string> = string;
export type StaticImageData = string | number;

//  ######  CustomLink  ######## //
export interface CustomLink {
  label: string;
  href: Route<string> | string;
  targetBlank?: boolean;
}

// ########## HOUSE HUNTERS TYPES ######## //

// Property Layout Options
export type PropertyLayout =
  | "bedsitter"
  | "studio"
  | "1-bedroom"
  | "2-bedroom"
  | "3-bedroom"
  | "4-bedroom+";

// Viewing Package Tiers
export type PackageTier = "bronze" | "gold" | "platinum";

// Booking Status
export type BookingStatus =
  | "pending_payment"      // Tenant initiated, needs to pay
  | "confirmed"            // Payment in escrow, viewing scheduled
  | "viewing_completed"    // Both parties attended viewing
  | "pending_verification" // Waiting for tenant to confirm property matches
  | "verified"             // Tenant confirmed match, payment released
  | "completed"            // Transaction complete
  | "cancelled"            // Cancelled before viewing
  | "disputed"             // Tenant disputes property mismatch
  | "refunded";            // Dispute verified, money returned to tenant

// Listing Status
export type ListingStatus = "pending" | "approved" | "rejected" | "inactive";

// Verification Status
export type VerificationStatus = "pending" | "approved" | "rejected";

// User Verification Status (for Hunters)
export type UserVerificationStatus =
  | "unverified"      // No documents submitted
  | "pending"         // Documents submitted, awaiting admin review
  | "verified"        // Admin approved
  | "rejected";       // Admin rejected, can resubmit

// Viewing Request Status (Negotiation Phase)
export type ViewingRequestStatus =
  | "pending"         // Tenant sent request, Hunter hasn't responded
  | "countered"       // Hunter proposed different date/time
  | "accepted"        // Both agreed, awaiting invoice creation
  | "rejected"        // Hunter declined
  | "invoiced"        // Invoice created, awaiting payment
  | "paid"            // Payment in escrow
  | "scheduled"       // Confirmed, meetup scheduled
  | "expired";        // Request/Invoice expired

// Invoice Status (Payment & Escrow)
export type InvoiceStatus =
  | "pending"         // Created, awaiting payment
  | "paid"            // Payment received, in escrow
  | "released"        // Funds released to Hunter
  | "refunded"        // Funds returned to Tenant
  | "partial"         // Partial refund after dispute
  | "expired"         // Not paid within validity period
  | "cancelled";      // Cancelled by either party

// Viewing Request Interface (Tenant → Hunter negotiation)
export interface ViewingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  hunterId: string;
  hunterName: string;

  // Proposed Dates (Tenant selects 1-3 options)
  proposedDates: {
    date: string;     // ISO date
    timeSlot: "morning" | "afternoon" | "evening";
  }[];

  // Counter Proposal (if Hunter counters)
  counterProposal?: {
    date: string;
    timeSlot: "morning" | "afternoon" | "evening";
    message?: string;
  };

  // Final Agreed Date
  agreedDate?: string;
  agreedTime?: string;

  message?: string;   // Optional message from Tenant
  status: ViewingRequestStatus;
  createdAt: string;
  updatedAt: string;
}

// Invoice Interface (Created by Hunter after agreement)
export interface Invoice {
  id: string;
  viewingRequestId: string;
  bookingId?: string; // Created after payment

  // Parties
  tenantId: string;
  tenantName: string;
  hunterId: string;
  hunterName: string;

  // Property
  propertyId: string;
  propertyTitle: string;

  // Payment
  viewingFee: number;       // Base fee in KES
  serviceFee: number;       // Platform fee (15%)
  totalAmount: number;      // viewingFee + serviceFee

  // Meetup Details
  meetupDate: string;       // ISO date
  meetupTime: string;       // e.g., "10:00 AM"
  meetupLocation?: {        // HIDDEN until paid
    address: string;
    lat: number;
    lng: number;
    directions?: string;
  };

  // Status & Timing
  status: InvoiceStatus;
  expiresAt: string;        // Invoice validity (24 hours)
  paidAt?: string;
  releasedAt?: string;
  refundedAt?: string;

  // Payment Details
  paymentMethod?: "mpesa" | "card";
  mpesaRef?: string;

  createdAt: string;
  updatedAt: string;
}

// Reschedule Request Interface (Day-of changes)
export interface RescheduleRequest {
  id: string;
  bookingId: string;
  requestedBy: "tenant" | "hunter";
  requestedById: string;

  // Original Schedule
  originalDate: string;
  originalTime: string;

  // New Proposed Time
  newDate: string;          // Must be same day
  newTime: string;
  reason?: string;

  // Response
  status: "pending" | "accepted" | "countered" | "rejected";
  counterTime?: string;     // If other party counters
  respondedAt?: string;

  createdAt: string;
}

// Check-In Interface (GPS + Timestamp proof)
export interface CheckIn {
  id: string;
  bookingId: string;
  userId: string;
  userRole: "tenant" | "hunter";

  // Location Proof
  coords: {
    lat: number;
    lng: number;
    accuracy: number;       // GPS accuracy in meters
  };

  // Time Proof
  timestamp: string;        // ISO datetime

  // Status
  isWithinRange: boolean;   // Within 500m of meetup location
  isOnTime: boolean;        // Within 1 hour of scheduled time
}

// Hunter Verification Request (ID + Selfie)
export interface VerificationRequest {
  id: string;
  hunterId: string;
  hunterName: string;
  hunterAvatar: string;
  hunterEmail: string;
  hunterPhone: string;
  idImage: string; // front of ID
  idImageBack?: string; // back of ID (optional)
  selfieImage: string; // live selfie
  status: VerificationStatus;
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// House Hunter (Agent) Type
export interface HouseHunter {
  id: string | number;
  name: string;
  phone: string;
  profilePhoto: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  successfulViewings: number;
  bio: string;
  areasOfOperation: string[];
  joinedDate: string;

  // Warning/Flagging System
  warnings?: {
    count: number;
    history: {
      id: string;
      reason: string;              // e.g., "Property mismatch verified"
      date: string;
      severity: 'minor' | 'major' | 'critical';
      disputeId: string | number;  // Related dispute ID
      adminNotes?: string;
    }[];
  };

  // Account Status (affects ability to receive bookings)
  accountStatus?: 'active' | 'warned' | 'suspended' | 'banned';
  suspendedUntil?: string;         // ISO date when suspension ends
  suspensionReason?: string;
}


// Viewing Package Type
export interface ViewingPackage {
  id: string | number;
  name: string;
  description: string;
  price: number; // in KES
  propertiesIncluded: number;
  duration: string; // e.g., "1 hour", "3 hours", "5 hours"
  tier: PackageTier;
  hunterId: string | number;
}

// Property Location Type
export interface PropertyLocation {
  generalArea: string; // e.g., "Kasarani, Nairobi"
  county: string;
  preciseLat?: number; // Only shared after booking
  preciseLng?: number; // Only shared after booking
  directions: string; // e.g., "500m from main stage, accessible via Matatu Route 17B"
  nearbyLandmarks?: string[];
}

// Property Utilities Type
export interface PropertyUtilities {
  waterIncluded: boolean;
  waterCost?: string; // e.g., "KES 500/month"
  electricityType: "prepaid" | "postpaid" | "included";
  electricityCost?: string;
  otherUtilities?: string[];
}

// Neighborhood Data Type (Phase 2)
export interface NeighborhoodData {
  safetyRating: number; // 1-5 stars
  noiseLevel: "quiet" | "moderate" | "noisy";
  internetRating: number; // 1-5 stars
  walkabilityScore: number; // 1-100
  nearbyAmenities: {
    type: "supermarket" | "hospital" | "school" | "restaurant" | "gym" | "mall" | "pharmacy";
    name: string;
    distance: number; // in meters
  }[];
  publicTransport: {
    type: "matatu" | "bus" | "train";
    route?: string;
    distanceToStop: number; // in meters
  }[];
}


// Property Listing Type
export interface PropertyListing {
  id: string | number;
  title: string;
  description: string;
  rent: number; // Monthly rent in KES
  deposit: number; // Deposit in KES
  propertyType: string; // e.g., "Apartment", "House", "Bedsitter"
  layout: PropertyLayout;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  location: PropertyLocation;
  amenities: string[]; // e.g., ["Balcony", "Parking", "Furnished", "Pet Friendly"]
  utilities: PropertyUtilities;
  images: (string | StaticImageData)[]; // Minimum 8 photos
  videoUrl: string; // Mandatory video tour
  houseHunter: HouseHunter;
  viewingPackages: ViewingPackage[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  viewCount: number;
  bookingCount: number;
  isExactLocation?: boolean;
  map?: { lat: number; lng: number }; // Backward compatibility with old data format

  // Phase 1: Enhanced Filter Fields
  petFriendly?: boolean;
  furnished?: "yes" | "no" | "semi";
  securityFeatures?: string[]; // e.g., ["CCTV", "Security Guard", "Gate", "Alarm System"]
  parking?: {
    available: boolean;
    spaces?: number;
    cost?: number; // KES per month
    type?: string; // e.g., "Covered", "Open", "Underground"
  };
  availableFrom?: string; // ISO date string
  leaseDuration?: ("monthly" | "yearly" | "flexible")[]; // Accepted lease terms

  // Phase 1: Reviews & Ratings
  averageRating?: number; // Calculated from reviews
  reviewCount?: number; // Count of reviews

  // Phase 2: Neighborhood Data
  neighborhoodData?: NeighborhoodData;
}


// Booking Type
export interface Booking {
  id: string | number;
  propertyId: string | number;
  property?: PropertyListing;
  tenantId: string | number;
  tenantName: string;
  tenantPhone: string;
  hunterId: string | number;
  hunter?: HouseHunter;
  package: ViewingPackage;
  status: BookingStatus;
  totalAmount: number;
  platformCommission: number;
  hunterPayout: number;
  mpesaTransactionId?: string;
  mpesaReceiptNumber?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  chatEnabled: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}


// Hunter Review Type
// NOTE: This reviews the HUNTER'S SERVICE, not the property itself
// The property context is included only to show which viewing the review is about
export interface Review {
  id: string | number;
  bookingId: string | number;

  // Property context (NOT reviewing the property)
  propertyId: string | number;        // Which viewing this was for
  propertyTitle?: string;             // Display context only

  // Hunter Being Reviewed
  tenantId: string | number;
  tenantName: string;
  tenantAvatar?: string;
  isVerifiedTenant?: boolean;
  hunterId: string | number;          // Hunter's service being evaluated

  // Hunter Service Quality Ratings (NOT property ratings)
  rating: number;                     // Overall service rating (1-5)
  professionalismRating: number;      // Hunter's behavior and conduct
  communicationRating?: number;        // Responsiveness and clarity
  accuracyRating: number;             // Did property match listing description?
  punctualityRating?: number;         // Was hunter on time?
  overallRating: number;

  // Review Content (should focus on hunter's service)
  comment: string;
  photos?: string[];
  createdAt: string;
  hunterResponse?: string;
  hunterResponseDate?: string;
  helpfulCount?: number;
  reportedCount?: number;
}



// Chat Message Type (for future implementation)
export interface ChatMessage {
  id: string | number;
  bookingId: string | number;
  senderId: string | number;
  senderType: "tenant" | "hunter";
  message: string;
  messageType: "text" | "location" | "image";
  metadata?: {
    lat?: number;
    lng?: number;
    imageUrl?: string;
  };
  createdAt: string;
  read: boolean;
}

// Notification Type
export type Notification = {
  id: string | number;
  userId: string | number;
  userType: "tenant" | "hunter";
  title: string;
  message: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'payment_pending' | 'review_received' | 'listing_approved' | 'listing_rejected' | 'verification_approved' | 'verification_rejected' | 'chat_message' | 'message_received' | 'dispute_filed';
  read: boolean;
  createdAt: string;
  data?: any;
};

// Issue/Dispute Type
export interface Issue {
  id: string | number;
  type:
  | "booking_dispute"
  | "payment_problem"
  | "property_mismatch"
  | "unprofessional_behavior"
  | "platform_bug"
  | "other";
  title: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: {
    id: string | number;
    name: string;
    role: "tenant" | "hunter";
  };
  relatedTo?: {
    type: "booking" | "property" | "user";
    id: string | number;
    title: string;
  };

  // Dispute Evidence (for property mismatch cases)
  evidencePhotos?: string[];          // Photos showing actual property
  evidenceVideos?: string[];          // Video proof of discrepancies
  comparisonPhotos?: {                // Side-by-side comparisons
    listingPhoto: string;             // Photo from original listing
    actualPhoto: string;              // Photo tenant took during viewing
    discrepancy: string;              // Description of the difference
  }[];

  // Admin Verification
  adminVerification?: {
    verified: boolean;                // True if mismatch confirmed
    verifiedBy: string;               // Admin ID who reviewed
    verifiedAt: string;
    notes: string;                    // Admin's analysis notes
    decision: 'refund_tenant' | 'pay_hunter' | 'split_payment' | 'no_action';
  };

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  resolution?: string;
  markedDoneBy?: Array<"tenant" | "hunter" | "admin">;
}

// Saved Search Type (Phase 3)
export interface SavedSearch {
  id: string | number;
  userId: string | number;
  name: string;
  criteria: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    layout?: PropertyLayout[];
    petFriendly?: boolean;
    furnished?: ("yes" | "no" | "semi")[];
    amenities?: string[];
    availableFrom?: string;
  };
  notificationsEnabled: boolean;
  lastExecuted?: string;
  newMatchesCount?: number;
  createdAt: string;
}

// Alert Preference Type (Phase 2)
export interface AlertPreference {
  userId: string | number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    newMatches: boolean;
    priceDrops: boolean;
    viewingReminders: boolean;
    newMessages: boolean;
  };
  frequency: "instant" | "daily" | "weekly";
}

// Viewing Checklist Type (Phase 3)
export interface ViewingChecklist {
  id: string | number;
  bookingId: string | number;
  propertyId: string | number;
  userId: string | number;
  preparationNotes?: string;
  questionsToAsk: string[];
  checklistItems: {
    id: string;
    label: string;
    checked: boolean;
    notes?: string;
  }[];
  photos?: string[];
  viewingNotes?: string;
  overallImpression?: number; // 1-5 rating
  createdAt: string;
  updatedAt: string;
}

// Custom Search Request Types
export type SearchRequestStatus =
  | 'draft'
  | 'pending_payment'
  | 'pending_assignment'
  | 'in_progress'
  | 'pending_review'
  | 'completed'
  | 'cancelled'
  | 'forfeited';

export type ServiceTier = 'standard' | 'premium' | 'urgent';

// Bidding System Types
export interface Bid {
  id: string | number;
  hunterId: string | number;
  hunterName: string;
  hunterAvatar?: string;
  hunterRating: number;
  hunterSuccessRate: number; // 0-100%

  // Bid Details
  price: number; // KES
  timeframe: number; // hours
  bonuses: string[]; // e.g., ["1 extra house", "Video tours included"]
  message?: string;

  // Status
  status: 'pending' | 'selected' | 'rejected';
  submittedAt: string;
}

export interface PropertyEvidence {
  id?: string | number;
  propertyId?: string | number; // If uploading from existing listing
  photos: string[]; // URLs
  videos: string[]; // URLs
  description: string;
  generalArea: string; // General neighborhood for privacy
  location?: {
    neighborhoodCircle: { lat: number; lng: number; radius: number };
    meetingPoint?: string;
  };
  matchScore: number;
  uploadedAt: string;
}

export interface MeetingPoint {
  id: string;
  name: string; // e.g., "Shell Petrol Station, Syokimau"
  description?: string;
  lat?: number;
  lng?: number;
  instructions?: string;
  suggestedTime?: string;
  sharedAt?: string;
  status?: 'pending' | 'confirmed';
}

export interface TimeframeExtension {
  id: string | number;
  requestedBy: 'hunter' | 'tenant';
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
}

export interface AdminReview {
  reviewerId: string | number;
  reviewerName: string;
  decision: 'refund_tenant' | 'pay_hunter' | 'split_payment';
  reasoning: string;
  evidenceAnalysis: {
    briefMatch: boolean;
    timelineMet: boolean;
    qualityAcceptable: boolean;
  };
  reviewedAt: string;
}

export interface SearchRequest {
  id: string | number;
  tenantId: string | number;
  tenantName: string;
  tenantPhone: string;
  tenantAvatar?: string;
  status: SearchRequestStatus;

  // Location & Budget
  preferredAreas: string[];
  minRent: number;
  maxRent: number;
  moveInDate?: string;
  leaseDuration: string;

  // Property Requirements
  propertyType: PropertyLayout;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  furnished: 'yes' | 'no' | 'semi' | 'flexible';
  petFriendly: boolean;

  // Amenities
  parkingRequired: boolean;
  parkingSpaces?: number;
  securityFeatures: string[];
  utilitiesIncluded: string[];
  amenities: string[];

  // Additional
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  dealBreakers: string[];
  additionalNotes?: string;

  // Service
  serviceTier: ServiceTier;
  numberOfOptions: number; // 1, 2, or 3 properties
  depositAmount: number;
  deadline: string;

  // Assignment
  hunterId: string | number;
  hunterName?: string;
  hunterAvatar?: string;
  claimedAt?: string;

  // Bidding
  bidsOpen: boolean;
  bidsCloseAt: string;
  bids: Bid[];
  selectedBidId?: string | number;

  // Timeframe
  agreedTimeframe?: number; // hours
  timeframeStartedAt?: string;
  timeframeExpiresAt?: string;
  timeframeExtensions: TimeframeExtension[];

  // Delivery
  uploadedEvidence: PropertyEvidence[];
  evidenceSubmittedAt?: string;

  // Meeting & Viewing
  meetingPoint?: MeetingPoint;
  meetingPoints?: MeetingPoint[];
  viewingConfirmed: boolean;
  viewingConfirmedAt?: string;

  // Refund/Dispute
  refundRequested: boolean;
  refundRequestedAt?: string;
  refundReason?: string;
  disputeReason?: string;
  adminReview?: AdminReview;

  // Properties (Deprecated - keeping for compatibility)
  submittedProperties: string[]; // property IDs
  submittedPropertiesData?: PropertyListing[];
  acceptedPropertyId?: string | number;

  // Payment
  depositPaid: boolean;
  depositPaidAt?: string;
  mpesaTransactionId?: string;
  paymentReleased: boolean;
  paymentReleasedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  reviewedAt?: string;
}

export interface SearchRequestProperty {
  id: string | number;
  searchRequestId: string | number;
  propertyId: string | number;
  property?: PropertyListing;
  submittedBy: string | number; // hunterId
  matchScore: number; // 0-100
  matchNotes: string; // Why this matches
  matchDetails: {
    locationMatch: boolean;
    budgetMatch: boolean;
    typeMatch: boolean;
    mustHavesMatch: boolean;
    dealBreakersAbsent: boolean;
  };
  submittedAt: string;
  reviewedAt?: string;
  accepted: boolean;
  rejectionReason?: string;
}


// ########## LEGACY TYPES (Keep for compatibility during migration) ######## //

export interface TaxonomyType {
  id: string | number;
  name: string;
  href: Route<string>;
  count?: number;
  thumbnail?: string;
  desc?: string;
  color?: TwMainColor | string;
  taxonomy: "category" | "tag";
  listingType?: "stay" | "experiences" | "car";
}

export interface AuthorType {
  id: string | number;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string | StaticImageData;
  bgImage?: string | StaticImageData;
  email?: string;
  count: number;
  desc: string;
  jobName: string;
  href: Route<string>;
  starRating?: number;
}

export interface PostDataType {
  id: string | number;
  author: AuthorType;
  date: string;
  href: Route<string>;
  categories: TaxonomyType[];
  title: string;
  featuredImage: StaticImageData | string;
  desc?: string;
  commentCount: number;
  viewdCount: number;
  readingTime: number;
  postType?: "standard" | "video" | "gallery" | "audio";
}

export type TwMainColor =
  | "pink"
  | "green"
  | "yellow"
  | "red"
  | "indigo"
  | "blue"
  | "purple"
  | "gray";

// Alias StayDataType to PropertyListing for backward compatibility
export type StayDataType = PropertyListing;

export interface ExperiencesDataType {
  id: string | number;
  author: AuthorType;
  date: string;
  href: Route<string>;
  title: string;
  featuredImage: StaticImageData | string;
  commentCount: number;
  viewCount: number;
  address: string;
  reviewStart: number;
  reviewCount: number;
  like: boolean;
  galleryImgs: (StaticImageData | string)[];
  price: string;
  listingCategory: TaxonomyType;
  maxGuests: number;
  saleOff?: string | null;
  isAds: boolean | null;
  map: {
    lat: number;
    lng: number;
  };
}

export interface CarDataType {
  id: string | number;
  author: AuthorType;
  date: string;
  href: Route<string>;
  title: string;
  featuredImage: StaticImageData | string;
  commentCount: number;
  viewCount: number;
  address: string;
  reviewStart: number;
  reviewCount: number;
  like: boolean;
  galleryImgs: (StaticImageData | string)[];
  price: string;
  listingCategory: TaxonomyType;
  seats: number;
  gearshift: string;
  saleOff?: string | null;
  isAds: boolean | null;
  map: {
    lat: number;
    lng: number;
  };
}
