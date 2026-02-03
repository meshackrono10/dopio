// Add this to your tenant dashboard or create a new requests tab

"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import Link from "next/link";
import { Route } from "@/routers/types";
import Skeleton from "@/shared/Skeleton";
import ViewingRequestCard from "@/components/ViewingRequestCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";

interface ViewingRequestsTabProps {
    filter?: 'unfinished' | 'finished' | 'all';
    userRole?: 'TENANT' | 'HUNTER';
}

export default function ViewingRequestsTab({ filter = 'all', userRole = 'TENANT' }: ViewingRequestsTabProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subFilter, setSubFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

    const fetchRequests = useCallback(async () => {
        try {
            const response = await api.get("/viewing-requests");
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch viewing requests:", error);
            showToast("error", "Failed to load viewing requests");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user, fetchRequests]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    const pendingRequests = requests.filter(r => {
        if (userRole === 'HUNTER') {
            // For hunters, pending requests often need escrow payment first
            return (r.status === 'PENDING' || r.status === 'COUNTERED') && r.paymentStatus === 'ESCROW';
        }
        return r.status === 'PENDING' || r.status === 'COUNTERED';
    });

    const upcomingRequests = requests.filter(r => r.status === 'ACCEPTED' || r.status === 'PAID' || r.status === 'SCHEDULED');

    const completedRequests = requests.filter(r => {
        const isPast = r.status === 'REJECTED' || r.status === 'CANCELLED' || r.status === 'COMPLETED';
        const isStalePending = userRole === 'HUNTER' && (r.status === 'PENDING' || r.status === 'COUNTERED') && r.paymentStatus !== 'ESCROW';

        if (!(isPast || isStalePending)) return false;

        return (
            subFilter === 'all' ||
            (subFilter === 'completed' && r.status === 'COMPLETED') ||
            (subFilter === 'cancelled' && (r.status === 'CANCELLED' || r.status === 'REJECTED' || isStalePending))
        );
    });

    const filteredRequests = () => {
        if (filter === 'unfinished') return pendingRequests;
        if (filter === 'finished') return [...upcomingRequests, ...completedRequests];
        return requests;
    };

    const displayRequests = filteredRequests();

    const FilterButtons = () => (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {(['all', 'completed', 'cancelled'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setSubFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${subFilter === f
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        }`}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
            ))}
        </div>
    );

    if (displayRequests.length === 0 && subFilter === 'all') {
        return (
            <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">
                    {filter === 'unfinished' ? "No Pending Requests" : "No Bookings Found"}
                </h3>
                <p className="text-neutral-500">
                    {filter === 'unfinished'
                        ? "You don't have any viewing requests in progress."
                        : "You haven't completed or confirmed any viewings yet."}
                </p>
                {filter === 'unfinished' && (
                    <Link href={"/listing-stay" as Route} className="inline-block mt-4 text-primary-600 font-medium">
                        Browse properties to start a request
                    </Link>
                )}
            </div>
        );
    }

    if (filter === 'unfinished') {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">
                    Unfinished Requests ({displayRequests.length})
                </h2>
                <div className="space-y-4">
                    {displayRequests.map((request) => (
                        <ViewingRequestCard
                            key={request.id}
                            request={request}
                            userRole={userRole}
                            onUpdate={fetchRequests}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
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
                                userRole={userRole}
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed/Cancelled Requests */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    Past & Cancelled
                </h2>
                <FilterButtons />
                {completedRequests.length > 0 ? (
                    <div className="space-y-4">
                        {completedRequests.map((request) => (
                            <ViewingRequestCard
                                key={request.id}
                                request={request}
                                userRole={userRole}
                                onUpdate={fetchRequests}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                        <p className="text-neutral-500">No items found for the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
