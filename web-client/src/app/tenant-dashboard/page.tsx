"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useMessaging } from "@/contexts/MessagingContext";
import Link from "next/link";
import { Route } from "@/routers/types";
import Skeleton from "@/shared/Skeleton";
import api from "@/services/api";

export default function TenantDashboardOverview() {
    const { user } = useAuth();
    const { bookings: allBookings, loading: bookingsLoading } = useBookings();
    const { comparisonList } = useComparison();
    const { conversations } = useMessaging();

    const [savedCount, setSavedCount] = useState(0);
    const [viewingRequestsCount, setViewingRequestsCount] = useState(0);

    const tenantBookings = allBookings.filter(b => b.tenantId === user?.id);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [savedRes, viewingRes] = await Promise.all([
                    api.get("/users/saved-properties"),
                    api.get("/viewing-requests")
                ]);
                setSavedCount(savedRes.data.length);
                setViewingRequestsCount(viewingRes.data.filter((r: any) =>
                    r.status === "PENDING" || r.status === "COUNTERED"
                ).length);
            } catch (error) {
                console.error("Failed to fetch counts", error);
            }
        };

        if (user) {
            fetchCounts();
        }
    }, [user]);

    const stats = [
        {
            icon: "la-heart",
            label: "Saved Properties",
            value: savedCount,
            href: "/tenant-dashboard/saved",
            color: "primary"
        },
        {
            icon: "la-clipboard-list",
            label: "Pending Requests",
            value: viewingRequestsCount,
            href: "/tenant-dashboard/viewing-requests",
            color: "yellow"
        },
        {
            icon: "la-calendar-check",
            label: "Upcoming Viewings",
            value: tenantBookings.filter((b: any) => b.status === "confirmed" || b.status === "in_progress").length,
            href: "/tenant-dashboard/viewing-requests",
            color: "green"
        },
        {
            icon: "la-check-circle",
            label: "Completed",
            value: tenantBookings.filter((b: any) => b.status === "completed").length,
            href: "/tenant-dashboard/bookings",
            color: "blue"
        },
        {
            icon: "la-balance-scale",
            label: "Comparing",
            value: comparisonList.length,
            href: "/tenant-dashboard/comparison",
            color: "purple"
        },
        {
            icon: "la-comment",
            label: "Messages",
            value: conversations.length,
            href: "/tenant-dashboard/messages",
            color: "pink"
        },
    ];

    const colorClasses: Record<string, { bg: string, text: string }> = {
        primary: { bg: "bg-primary-100 dark:bg-primary-900/20", text: "text-primary-600" },
        yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-600" },
        green: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-600" },
        blue: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-600" },
        purple: { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-600" },
        pink: { bg: "bg-pink-100 dark:bg-pink-900/20", text: "text-pink-600" },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p className="block mt-3 text-neutral-500 dark:text-neutral-400">
                    Manage your property search and bookings
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookingsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-14 h-14 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-12" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    stats.map((stat) => {
                        const classes = colorClasses[stat.color];
                        return (
                            <Link key={stat.label} href={stat.href as Route}>
                                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 ${classes.bg} rounded-full flex items-center justify-center`}>
                                            <i className={`las ${stat.icon} text-3xl ${classes.text}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                                            <p className="text-3xl font-bold">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Ready to find your dream home?</h2>
                <p className="text-primary-100 mb-6">
                    Browse thousands of verified properties curated by professional House Hunters
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link
                        href={"/listing-stay" as Route}
                        className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-neutral-100 transition-colors"
                    >
                        <i className="las la-search mr-2"></i>
                        Browse Properties
                    </Link>
                    <Link
                        href={"/listing-stay-map" as Route}
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors"
                    >
                        <i className="las la-map-marked mr-2"></i>
                        Map View
                    </Link>
                    <Link
                        href={"/tenant-dashboard/comparison" as Route}
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors"
                    >
                        <i className="las la-balance-scale mr-2"></i>
                        Compare Properties ({comparisonList.length})
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Viewings */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Upcoming Viewings</h3>
                        <Link href={"/tenant-dashboard/viewing-requests" as Route} className="text-sm text-primary-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    {tenantBookings.filter((b: any) => b.status === "confirmed" || b.status === "in_progress").length > 0 ? (
                        <div className="space-y-3">
                            {tenantBookings
                                .filter((b: any) => b.status === "confirmed" || b.status === "in_progress")
                                .slice(0, 3)
                                .map((booking: any) => (
                                    <div key={booking.id} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                                        <p className="font-medium text-sm">{booking.propertyTitle}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">No upcoming viewings</p>
                    )}
                </div>

                {/* Recent Messages */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Messages</h3>
                        <Link href={"/tenant-dashboard/messages" as Route} className="text-sm text-primary-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    {conversations.length > 0 ? (
                        <div className="space-y-3">
                            {conversations.slice(0, 3).map((conv) => (
                                <div key={conv.partnerId} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                                    <p className="font-medium text-sm">{conv.partner.name}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                                        {conv.lastMessage?.content || "No messages yet"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">No messages yet</p>
                    )}
                </div>
            </div>

            {/* Recently Completed */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Recently Completed</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Your successful viewings and history</p>
                    </div>
                    <Link href={"/tenant-dashboard/bookings" as Route} className="text-sm text-primary-600 hover:underline">
                        View All History
                    </Link>
                </div>

                {tenantBookings.filter((b: any) => b.status === "completed").length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tenantBookings
                            .filter((b: any) => b.status === "completed")
                            .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())
                            .slice(0, 3)
                            .map((booking: any) => (
                                <div key={booking.id} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge name="Completed" color="green" />
                                        <span className="text-[10px] text-neutral-400 uppercase font-medium">
                                            {new Date(booking.completedAt || booking.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{booking.propertyTitle}</p>
                                    <div className="flex items-center gap-2 mt-3 p-2 bg-white dark:bg-neutral-800 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                            <i className="las la-user-tie text-primary-600"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Haunter</p>
                                            <p className="text-sm font-medium truncate">{booking.hunterName}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/tenant-dashboard/reviews` as Route}
                                        className="mt-4 block w-full py-2 px-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg text-center text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Share Feedback
                                    </Link>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">
                        <i className="las la-history text-4xl text-neutral-300 dark:text-neutral-600"></i>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">No completed bookings yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
