export interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    propertyId: string;
    propertyTitle: string;
    tenantId: string;
    tenantName: string;
    haunterId: string;
    haunterName: string;
    packageTier: "bronze" | "silver" | "gold";
    status: "pending" | "confirmed" | "completed" | "cancelled";
    location?: string;
    notes?: string;
}

// Mock appointments for calendar
export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: "appt-1",
        title: "Property Viewing - Lavington Apartment",
        start: new Date(2026, 0, 8, 10, 0), // Jan 8, 2026, 10:00 AM
        end: new Date(2026, 0, 8, 11, 0),
        propertyId: "prop-1",
        propertyTitle: "Modern 2BR Apartment in Lavington",
        tenantId: "tenant-1",
        tenantName: "James Mwangi",
        haunterId: "haunter-1",
        haunterName: "John Kamau",
        packageTier: "gold",
        status: "confirmed",
        location: "Lavington, Nairobi",
        notes: "Client interested in move-in date flexibility",
    },
    {
        id: "appt-2",
        title: "Property Viewing - Westlands Studio",
        start: new Date(2026, 0, 8, 14, 0), // Jan 8, 2026, 2:00 PM
        end: new Date(2026, 0, 8, 15, 0),
        propertyId: "prop-2",
        propertyTitle: "Cozy Studio Apartment in Westlands",
        tenantId: "tenant-2",
        tenantName: "Grace Akinyi",
        haunterId: "haunter-1",
        haunterName: "John Kamau",
        packageTier: "silver",
        status: "confirmed",
        location: "Westlands, Nairobi",
    },
    {
        id: "appt-3",
        title: "Property Viewing - Kilimani 3BR",
        start: new Date(2026, 0, 10, 11, 0), // Jan 10, 2026, 11:00 AM
        end: new Date(2026, 0, 10, 12, 30),
        propertyId: "prop-3",
        propertyTitle: "Spacious 3BR in Kilimani",
        tenantId: "tenant-3",
        tenantName: "Peter Omondi",
        haunterId: "haunter-1",
        haunterName: "John Kamau",
        packageTier: "gold",
        status: "pending",
        location: "Kilimani, Nairobi",
        notes: "First-time renter, needs guidance",
    },
    {
        id: "appt-4",
        title: "Property Viewing - Karen Villa",
        start: new Date(2026, 0, 12, 9, 0), // Jan 12, 2026, 9:00 AM
        end: new Date(2026, 0, 12, 10, 30),
        propertyId: "prop-4",
        propertyTitle: "Luxury Villa in Karen",
        tenantId: "tenant-4",
        tenantName: "Sarah Wanjiku",
        haunterId: "haunter-1",
        haunterName: "John Kamau",
        packageTier: "gold",
        status: "confirmed",
        location: "Karen, Nairobi",
    },
    {
        id: "appt-5",
        title: "Property Viewing - Runda Townhouse",
        start: new Date(2026, 0, 15, 15, 0), // Jan 15, 2026, 3:00 PM
        end: new Date(2026, 0, 15, 16, 0),
        propertyId: "prop-5",
        propertyTitle: "Modern Townhouse in Runda",
        tenantId: "tenant-5",
        tenantName: "Michael Njoroge",
        haunterId: "haunter-1",
        haunterName: "John Kamau",
        packageTier: "bronze",
        status: "pending",
        location: "Runda, Nairobi",
    },
];

export interface AvailabilitySlot {
    id: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string;
    isRecurring: boolean;
}

export const MOCK_AVAILABILITY: AvailabilitySlot[] = [
    {
        id: "avail-1",
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
    },
    {
        id: "avail-2",
        dayOfWeek: 2, // Tuesday
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
    },
    {
        id: "avail-3",
        dayOfWeek: 3, // Wednesday
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
    },
    {
        id: "avail-4",
        dayOfWeek: 4, // Thursday
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
    },
    {
        id: "avail-5",
        dayOfWeek: 5, // Friday
        startTime: "09:00",
        endTime: "15:00",
        isRecurring: true,
    },
];
