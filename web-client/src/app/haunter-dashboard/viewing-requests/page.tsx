"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ViewingRequestCard from "@/components/ViewingRequestCard";
import Skeleton from "@/shared/Skeleton";

export default function ViewingRequestsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

    const fetchViewingRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/viewing-requests");
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch viewing requests", error);
            showToast("error", "Failed to load viewing requests");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchViewingRequests();
    }, [fetchViewingRequests]);

    // Hunter filter: Only show requests for properties owned by the current hunter
    // Also filter out ACCEPTED requests as they are now handled in the Bookings tab
    const hunterRequests = requests.filter(req => req.property?.hunterId === user?.id && req.status !== 'ACCEPTED');

    // Filter by status
    const filteredRequests = hunterRequests.filter((r) => {
        if (filter === "pending") {
            return r.status === "PENDING" || r.status === "COUNTERED";
        }
        if (filter === "completed") {
            return r.status === "ACCEPTED" || r.status === "REJECTED" || r.status === "CANCELLED";
        }
        return true;
    });

    const pendingCount = hunterRequests.filter(
        (r) => r.status === "PENDING" || r.status === "COUNTERED"
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Viewing Requests</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Manage property viewing requests from tenants
                    </p>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {hunterRequests.length} total requests
                </div>
            </div>

            {/* Action Alert */}
            {pendingCount > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                                {pendingCount} Pending {pendingCount === 1 ? "Request" : "Requests"}
                            </h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                You have viewing requests waiting for your response. Funds are held in escrow.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
                {[
                    { key: "all" as const, label: "All", count: hunterRequests.length },
                    { key: "pending" as const, label: "Pending", count: pendingCount },
                    {
                        key: "completed" as const,
                        label: "Completed",
                        count: hunterRequests.filter(r => ["ACCEPTED", "REJECTED", "CANCELLED"].includes(r.status)).length
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 font-medium transition-colors relative ${filter === tab.key
                            ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600"
                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 font-bold">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <i className="las la-eye text-6xl text-neutral-300 dark:text-neutral-600"></i>
                    <h3 className="text-xl font-semibold mt-4">No viewing requests</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        {filter === "all"
                            ? "Viewing requests from tenants will appear here"
                            : `You have no ${filter} requests at the moment`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <ViewingRequestCard
                            key={request.id}
                            request={request}
                            userRole="HUNTER"
                            onUpdate={fetchViewingRequests}
                        />
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {!loading && hunterRequests.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Total</p>
                        <p className="text-2xl font-bold mt-1">{hunterRequests.length}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl">
                        <p className="text-xs text-yellow-600 uppercase tracking-wider font-bold">Pending</p>
                        <p className="text-2xl font-bold mt-1 text-yellow-700">{pendingCount}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl">
                        <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Accepted</p>
                        <p className="text-2xl font-bold mt-1 text-green-700">
                            {hunterRequests.filter(r => r.status === "ACCEPTED").length}
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                        <p className="text-xs text-red-600 uppercase tracking-wider font-bold">Rejected</p>
                        <p className="text-2xl font-bold mt-1 text-red-700">
                            {hunterRequests.filter(r => r.status === "REJECTED").length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
