"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function Analytics() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") {
            router.push("/");
            return;
        }

        fetchStats();
    }, [isAuthenticated, user]);

    const fetchStats = async () => {
        try {
            const response = await api.get("/admin/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Platform Analytics</h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Monitor key metrics and performance indicators
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Revenue"
                        value={`KSh ${(stats?.totalRevenue || 0).toLocaleString()}`}
                        icon="las la-money-bill-wave"
                        color="green"
                        trend="+15%"
                    />
                    <MetricCard
                        title="Active Users"
                        value={stats?.totalUsers || 0}
                        icon="las la-users"
                        color="blue"
                        trend="+12%"
                    />
                    <MetricCard
                        title="Total Bookings"
                        value={stats?.totalBookings || 0}
                        icon="las la-calendar-check"
                        color="purple"
                        trend="+8%"
                    />
                    <MetricCard
                        title="Active Listings"
                        value={stats?.activeListings || 0}
                        icon="las la-home"
                        color="orange"
                        trend="+5%"
                    />
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Statistics */}
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                            User Statistics
                        </h2>
                        <div className="space-y-4">
                            <StatRow label="Total Users" value={stats?.totalUsers || 0} />
                            <StatRow label="Hunters" value={stats?.totalHunters || 0} />
                            <StatRow label="Tenants" value={stats?.totalTenants || 0} />
                            <StatRow label="Pending Verifications" value={stats?.pendingVerifications || 0} highlight />
                        </div>
                    </div>

                    {/* Activity Statistics */}
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                            Activity Statistics
                        </h2>
                        <div className="space-y-4">
                            <StatRow label="Total Properties" value={stats?.totalProperties || 0} />
                            <StatRow label="Active Listings" value={stats?.activeListings || 0} />
                            <StatRow label="Total Messages" value={stats?.totalMessages || 0} />
                            <StatRow label="Recent Bookings (7d)" value={stats?.recentBookings || 0} highlight />
                        </div>
                    </div>
                </div>

                {/* Revenue Chart Placeholder */}
                <div className="mt-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Revenue Overview
                    </h2>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
                        <div className="text-center">
                            <i className="las la-chart-line text-6xl text-neutral-400 mb-2"></i>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Chart visualization coming soon
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    color,
    trend,
}: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
}) {
    const colorMap = {
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <div className={`${colorMap[color as keyof typeof colorMap]} rounded-lg p-3`}>
                    <i className={`${icon} text-2xl text-white`}></i>
                </div>
                {trend && (
                    <span className="text-sm font-medium text-green-600">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
        </div>
    );
}

function StatRow({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
            <span
                className={`text-lg font-semibold ${highlight
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-neutral-900 dark:text-white"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}
