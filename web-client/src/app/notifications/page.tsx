"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Route } from "@/routers/types";

interface Notification {
    id: string;
    type: "booking_confirmed" | "payment_received" | "review_received" | "listing_approved" | "issue_update" | "viewing_reminder";
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "notif-1",
        type: "booking_confirmed",
        title: "Viewing Confirmed!",
        message: "Your Gold Package viewing for Modern 2-Bedroom in Kasarani is confirmed for Dec 18, 2025.",
        link: "/booking/book-1",
        read: false,
        createdAt: "2025-12-16T10:30:00",
    },
    {
        id: "notif-2",
        type: "payment_received",
        title: "Payment Successful",
        message: "Your M-Pesa payment of KES 2,500 has been received. Transaction ID: QH12345678",
        link: "/tenant-dashboard",
        read: false,
        createdAt: "2025-12-16T09:15:00",
    },
    {
        id: "notif-3",
        type: "viewing_reminder",
        title: "Viewing Tomorrow!",
        message: "Reminder: Your viewing in Roysambu is scheduled for tomorrow at 2:00 PM.",
        link: "/booking/book-2",
        read: true,
        createdAt: "2025-12-15T18:00:00",
    },
    {
        id: "notif-4",
        type: "review_received",
        title: "New Review",
        message: "Jane Doe left you a 5-star review! Check it out.",
        link: "/haunter-dashboard",
        read: true,
        createdAt: "2025-12-14T14:20:00",
    },
    {
        id: "notif-5",
        type: "listing_approved",
        title: "Listing Approved",
        message: "Your listing 'Cozy Bedsitter in Embakasi' has been approved and is now live!",
        link: "/haunter-dashboard",
        read: true,
        createdAt: "2025-12-13T11:00:00",
    },
    {
        id: "notif-6",
        type: "issue_update",
        title: "Issue Resolved",
        message: "Your payment issue has been resolved. KES 2,500 credited to your account.",
        link: "/tenant-dashboard",
        read: true,
        createdAt: "2025-12-12T16:45:00",
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filteredNotifications =
        filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "booking_confirmed":
                return "las la-calendar-check text-green-600";
            case "payment_received":
                return "las la-wallet text-blue-600";
            case "review_received":
                return "las la-star text-yellow-600";
            case "listing_approved":
                return "las la-check-circle text-green-600";
            case "issue_update":
                return "las la-exclamation-circle text-orange-600";
            case "viewing_reminder":
                return "las la-bell text-primary-600";
            default:
                return "las la-info-circle text-neutral-600";
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="nc-NotificationsPage container pb-24 lg:pb-32">
            <main className="pt-11">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl lg:text-4xl font-semibold">Notifications</h2>
                    <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                        Stay updated with your viewings and bookings
                    </span>
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === "all"
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === "unread"
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-12 text-center">
                        <i className="las la-bell-slash text-6xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white dark:bg-neutral-800 rounded-2xl border p-5 transition-all hover:shadow-md ${!notification.read
                                    ? "border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10"
                                    : "border-neutral-200 dark:border-neutral-700"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.read
                                            ? "bg-primary-100 dark:bg-primary-900/20"
                                            : "bg-neutral-100 dark:bg-neutral-700"
                                            }`}
                                    >
                                        <i className={`${getNotificationIcon(notification.type)} text-2xl`}></i>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="font-semibold text-lg">{notification.title}</h4>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                            <span>{getTimeAgo(notification.createdAt)}</span>
                                            {notification.link && (
                                                <>
                                                    <span>•</span>
                                                    <Link
                                                        href={notification.link as Route}
                                                        className="text-primary-600 hover:underline"
                                                    >
                                                        View Details
                                                    </Link>
                                                </>
                                            )}
                                            {!notification.read && (
                                                <>
                                                    <span>•</span>
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-primary-600 hover:underline"
                                                    >
                                                        Mark as read
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
