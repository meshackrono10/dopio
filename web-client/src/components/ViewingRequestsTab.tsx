// Add this to your tenant dashboard or create a new requests tab

"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import ViewingRequestCard from "@/components/ViewingRequestCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import Skeleton from "@/shared/Skeleton";

export default function ViewingRequestsTab() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const response = await api.get("/viewing-requests");
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch viewing requests:", error);
            showToast("error", "Failed to load viewing requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

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
                    You haven't made any viewing requests yet.
                </p>
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'COUNTERED');
    const completedRequests = requests.filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED');

    return (
        <div className="space-y-8">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Pending Requests ({pendingRequests.length})
                    </h2>
                    <div className="space-y-4">
                        {pendingRequests.map((request) => (
                            <ViewingRequestCard
                                key={request.id}
                                request={request}
                                userRole="TENANT"
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Requests */}
            {completedRequests.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Past Requests ({completedRequests.length})
                    </h2>
                    <div className="space-y-4">
                        {completedRequests.map((request) => (
                            <ViewingRequestCard
                                key={request.id}
                                request={request}
                                userRole="TENANT"
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
