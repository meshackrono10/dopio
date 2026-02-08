"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import api from "@/services/api";
import ViewingRequestCard from "@/components/ViewingRequestCard";
import Skeleton from "@/shared/Skeleton";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { Route } from "@/routers/types";

export default function ViewingRequestsPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchRequests = React.useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await api.get("/viewing-requests");
            setRequests(response.data);
        } catch (error: any) {
            console.error("Failed to fetch viewing requests:", error);
            showToast("error", "Failed to load viewing requests");
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user, fetchRequests]);

    if (authLoading || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const userRole = user.role === "HUNTER" ? "HUNTER" : "TENANT";

    // Filter requests based on user role
    const userRequests = userRole === "HUNTER"
        ? requests.filter((r) => r.property?.hunterId === user.id)
        : requests.filter((r) => r.tenantId === user.id);

    // Apply filter
    const filteredRequests = userRequests.filter((r) => {
        if (filter === "pending") {
            return r.status === "PENDING" || r.status === "COUNTERED";
        }
        if (filter === "completed") {
            return r.status === "ACCEPTED" || r.status === "REJECTED" || r.status === "CANCELLED" || r.status === "COMPLETED";
        }
        return true;
    });

    const pendingCount = userRequests.filter(
        (r) => r.status === "PENDING" || r.status === "COUNTERED"
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {userRole === "HUNTER" ? "Viewing Requests" : "My Viewing Requests"}
                        </h1>
                        <p className="text-neutral-500">
                            {userRole === "HUNTER"
                                ? "Manage incoming viewing requests from tenants"
                                : "Track your viewing requests and respond to House Hunters"}
                        </p>
                    </div>
                    {userRole === "TENANT" && (
                        <ButtonPrimary href={"/listing-stay" as Route} className="hidden sm:block">
                            + Book a Viewing
                        </ButtonPrimary>
                    )}
                </div>
            </div>

            {/* Alert for pending actions (Hunter only) */}
            {userRole === "HUNTER" && pendingCount > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                Action Required: {pendingCount} Pending {pendingCount === 1 ? "Request" : "Requests"}
                            </h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                You have viewing requests waiting for your response. Funds are held in escrow.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-700">
                {[
                    { key: "all" as const, label: "All", count: userRequests.length },
                    {
                        key: "pending" as const,
                        label: "Pending",
                        count: userRequests.filter((r) => r.status === "PENDING" || r.status === "COUNTERED").length,
                    },
                    {
                        key: "completed" as const,
                        label: "Completed",
                        count: userRequests.filter((r) => r.status === "ACCEPTED" || r.status === "REJECTED").length,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 font-medium transition-colors relative ${filter === tab.key
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-700">
                                {tab.count}
                            </span>
                        )}
                        {filter === tab.key && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
                        )}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredRequests.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">
                        {filter === "pending" ? "⏳" : filter === "completed" ? "✅" : "📭"}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                        No {filter !== "all" ? filter : ""} viewing requests
                    </h3>
                    <p className="text-neutral-500 mb-6">
                        {userRole === "TENANT"
                            ? filter === "pending"
                                ? "You have no pending viewing requests"
                                : filter === "completed"
                                    ? "You haven't completed any viewing requests yet"
                                    : "You haven't made any viewing requests yet. Start searching for properties!"
                            : filter === "pending"
                                ? "No pending requests at the moment"
                                : filter === "completed"
                                    ? "You haven't reviewed any requests yet"
                                    : "You haven't received any viewing requests yet"}
                    </p>
                    {userRole === "TENANT" && filter !== "completed" && (
                        <ButtonPrimary href={"/listing-stay" as Route}>Find Properties</ButtonPrimary>
                    )}
                </div>
            )}

            {/* Requests List */}
            {!loading && filteredRequests.length > 0 && (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <ViewingRequestCard
                            key={request.id}
                            request={request}
                            userRole={userRole}
                            onUpdate={fetchRequests}
                        />
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {!loading && userRequests.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Total</p>
                        <p className="text-2xl font-bold">{userRequests.length}</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                            {userRequests.filter((r) => r.status === "PENDING" || r.status === "COUNTERED").length}
                        </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4">
                        <p className="text-sm text-green-700 dark:text-green-300">Accepted</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {userRequests.filter((r) => r.status === "ACCEPTED").length}
                        </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/20 rounded-xl p-4">
                        <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                            {userRequests.filter((r) => r.status === "REJECTED").length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
