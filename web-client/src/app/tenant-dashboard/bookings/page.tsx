"use client";

import ViewingRequestsTab from "@/components/ViewingRequestsTab";

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
                <p className="text-neutral-500">View your completed property viewings</p>
            </div>
            <ViewingRequestsTab filter="finished" />
        </div>
    );
}
