// Add this to your haunter dashboard

"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import ViewingRequestCard from "@/components/ViewingRequestCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import Skeleton from "@/shared/Skeleton";

export default function HunterViewingRequestsTab() {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await api.get("/viewing-requests");
            // Filter for requests where the hunter owns the property
            const hunterRequests = response.data.filter(
                (r: any) => r.property.hunterId === user?.id
            );
            console.log("DEBUG: HunterViewingRequestsTab - fetched requests:", hunterRequests.map((r: any) => ({ id: r.id, status: r.status, date: r.proposedDates })));
            setRequests(hunterRequests);
        } catch (error) {
            console.error("Failed to fetch viewing requests:", error);
            showToast("error", "Failed to load viewing requests");
        } finally {
            setLoading(false);
        }
    }, [user?.id, showToast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRequests();
        }
    }, [isAuthenticated, fetchRequests]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">No Viewing Requests</h3>
                <p className="text-neutral-500">
                    You haven&apos;t received any viewing requests yet.
                </p>
            </div>
        );
    }

    const pendingRequests = requests.filter(r =>
        (r.status === 'PENDING' || r.status === 'COUNTERED') && r.paymentStatus === 'ESCROW'
    );
    const upcomingRequests = requests.filter(r => r.status === 'ACCEPTED');
    const reviewedRequests = requests.filter(r =>
        r.status === 'REJECTED' || r.status === 'CANCELLED' || r.status === 'COMPLETED' ||
        ((r.status === 'PENDING' || r.status === 'COUNTERED') && r.paymentStatus !== 'ESCROW')
    );

    return (
        <div className="space-y-8">
            {/* Pending Requests - Needs Action */}
            {pendingRequests.length > 0 && (
                <div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                        <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                            ⚠️ Action Required: {pendingRequests.length} New {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                        </h2>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Review and respond to viewing requests. Funds are held in escrow.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {pendingRequests.map((request) => (
                            <ViewingRequestCard
                                key={request.id}
                                request={request}
                                userRole="HUNTER"
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Viewings */}
            {upcomingRequests.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        📅 Upcoming Viewings ({upcomingRequests.length})
                    </h2>
                    <div className="space-y-4">
                        {upcomingRequests.map((request) => (
                            <ViewingRequestCard
                                key={request.id}
                                request={request}
                                userRole="HUNTER"
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Reviewed Requests */}
            {reviewedRequests.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        {pendingRequests.length > 0 ? 'Previously Reviewed' : 'All Requests'} ({reviewedRequests.length})
                    </h2>
                    <div className="space-y-4">
                        {reviewedRequests.map((request) => (
                            <ViewingRequestCard
                                key={request.id}
                                request={request}
                                userRole="HUNTER"
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
