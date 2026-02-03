import { Route } from "@/routers/types";
import { StaticImageData } from "next/image";

//  ######  CustomLink  ######## //
export interface CustomLink {
  label: string;
  href: Route<string> | string;
  targetBlank?: boolean;
}

// ########## DAPIO TYPES ######## //

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
  | "pending"
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

// Listing Status
export type ListingStatus = "pending" | "approved" | "rejected" | "inactive" | "rented" | "available" | "locked" | "pending_approval";

// Verification Status
export type VerificationStatus = "pending" | "approved" | "rejected";

// Agent Type
export interface Agent {
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
  haunterId: string | number;
  features?: string[];
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
  electricityType: "prepaid" | "postpaid" | "included" | "shared";
  electricityCost?: string;
  garbageIncluded?: boolean;
  garbageCost?: string;
  securityIncluded?: boolean;
  securityCost?: string;
  otherUtilities?: string[];
}

// Neighborhood Data Type (Phase 2)
export interface NeighborhoodData {
  neighborhoodType?: "Court" | "Estate" | "Apartment Block" | "Standalone" | "Gated Community" | string;
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
  layout: PropertyLayout;
  bathrooms: number;
  location: PropertyLocation;
  amenities: string[]; // e.g., ["Balcony", "Parking", "Furnished", "Pet Friendly"]
  utilities: PropertyUtilities;
  images: (string | StaticImageData)[]; // Minimum 8 photos
  videoUrl: string; // Mandatory video tour
  agent: Agent;
  viewingPackages: ViewingPackage[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  viewCount: number;
  bookingCount: number;
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

  // Legacy/UI properties
  saleOff?: string | null;
  isAds?: boolean | null;
  author?: AuthorType;
  listingCategory?: TaxonomyType;
  href?: Route<string>;

  // Package info
  listingPackage?: 'BRONZE' | 'SILVER' | 'GOLD' | string;
  packageProperties?: any;
}


export interface ViewingRequest {
  id: string | number;
  propertyId: string | number;
  propertyTitle: string;
  tenantId: string | number;
  tenantName: string;
  tenantPhone: string;
  haunterId: string | number;
  haunterName: string;
  proposedDates: any[];
  proposedLocation?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'PAID' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  amount: number;
  paymentStatus: 'UNPAID' | 'ESCROW' | 'PAID' | 'REFUNDED';
  counterDate?: string;
  counterTime?: string;
  counterLocation?: string;
  counteredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string | number;
  viewingRequestId: string | number;
  tenantId: string | number;
  haunterId: string | number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  mpesaCheckoutRequestId?: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Booking Type
export interface Booking {
  id: string | number;
  propertyId: string | number;
  property?: PropertyListing;
  tenantId: string | number;
  tenantName: string;
  tenantPhone: string;
  haunterId: string | number;
  agent?: Agent;
  package: ViewingPackage;
  status: BookingStatus;
  totalAmount: number;
  platformCommission: number;
  haunterPayout: number;
  mpesaTransactionId?: string;
  mpesaReceiptNumber?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  tenantMetConfirmed: boolean;
  hunterMetConfirmed: boolean;
  physicalMeetingConfirmed: boolean;
  viewingOutcome?: string;
  tenantFeedback?: string;
  chatEnabled: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Review Type (Enhanced for Phase 1)
export interface Review {
  id: string | number;
  bookingId: string | number;
  propertyId: string | number;
  tenantId: string | number;
  tenantName: string;
  tenantAvatar?: string;
  isVerifiedTenant?: boolean; // Badge for verified tenants
  haunterId: string | number;
  rating: number; // 1-5 stars
  professionalismRating: number;
  accuracyRating: number;
  overallRating: number;
  comment: string;
  photos?: string[]; // Optional review photos
  createdAt: string;
  haunterResponse?: string;
  haunterResponseDate?: string;
  helpfulCount?: number; // Number of users who found this helpful
  reportedCount?: number; // Number of reports
}


// Chat Message Type (for future implementation)
export interface ChatMessage {
  id: string | number;
  bookingId: string | number;
  senderId: string | number;
  senderType: "tenant" | "haunter";
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
export interface Notification {
  id: string | number;
  userId: string | number;
  userType: "tenant" | "haunter";
  type:
  | "booking_confirmed"
  | "payment_received"
  | "review_received"
  | "listing_approved"
  | "listing_rejected"
  | "verification_approved"
  | "verification_rejected"
  | "chat_message";
  title: string;
  message: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
}

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
    role: "tenant" | "haunter";
  };
  relatedTo?: {
    type: "booking" | "property" | "user";
    id: string | number;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  resolution?: string;
  markedDoneBy?: Array<"tenant" | "haunter" | "admin">;
  hunterResponse?: string;
  hunterEvidenceUrl?: string;
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
