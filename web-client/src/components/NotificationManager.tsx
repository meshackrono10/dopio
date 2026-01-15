"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

interface NotificationManagerProps {
    userRole: "admin" | "tenant" | "hunter";
}

// Mock notifications based on user role
const getMockNotifications = (role: string): Notification[] => {
    const baseNotifications: Notification[] = [
        {
            id: "n1",
            title: "Welcome!",
            message: "Welcome to House Haunters platform. Complete your profile to get started.",
            type: "info",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
        },
    ];

    if (role === "tenant") {
        return [
            ...baseNotifications,
            {
                id: "n2",
                title: "New Property Match",
                message: "We found 3 new properties matching your search criteria in Westlands.",
                type: "success",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                read: false,
                actionUrl: "/listing-stay",
            },
            {
                id: "n3",
                title: "Viewing Confirmed",
                message: "Your property viewing at Kilimani Apartments is confirmed for tomorrow at 2 PM.",
                type: "info",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                read: true,
            },
        ];
    }

    if (role === "hunter") {
        return [
            ...baseNotifications,
            {
                id: "n2",
                title: "New Search Request",
                message: "A tenant is looking for a 2BR apartment in your service area.",
                type: "info",
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                read: false,
                actionUrl: "/request-search",
            },
            {
                id: "n3",
                title: "Bid Accepted!",
                message: "Your bid for Search Request #SR-1234 has been accepted.",
                type: "success",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                read: false,
            },
        ];
    }

    if (role === "admin") {
        return [
            ...baseNotifications,
            {
                id: "n2",
                title: "New Hunter Verification",
                message: "12 new house hunter verifications pending your review.",
                type: "warning",
                timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                read: false,
                actionUrl: "/admin/verifications",
            },
            {
                id: "n3",
                title: "Dispute Filed",
                message: "A new dispute has been filed for Request #SR-5678.",
                type: "error",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
                read: false,
                actionUrl: "/admin/disputes",
            },
        ];
    }

    return baseNotifications;
};

export default function NotificationManager({ userRole }: NotificationManagerProps) {
    const [notifications, setNotifications] = useState<Notification[]>(
        getMockNotifications(userRole)
    );
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteAll = () => {
        setNotifications([]);
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications;

    const getTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return "Just now";
    };

    const typeColors = {
        info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
        warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
    };

    const typeIcons = {
        info: "las la-info-circle",
        success: "las la-check-circle",
        warning: "las la-exclamation-triangle",
        error: "las la-exclamation-circle",
    };

    return (
        <div className="nc-NotificationManager bg-white dark:bg-neutral-800 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Manage your notifications
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <ButtonSecondary onClick={markAllAsRead} className="text-sm">
                            Mark All Read
                        </ButtonSecondary>
                    )}
                    {notifications.length > 0 && (
                        <ButtonSecondary onClick={deleteAll} className="text-sm text-red-600">
                            Delete All
                        </ButtonSecondary>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${filter === "all"
                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        }`}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${filter === "unread"
                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`${typeColors[notification.type]} border-2 rounded-xl p-4 transition-all ${!notification.read ? "shadow-md" : "opacity-70"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <i className={`${typeIcons[notification.type]} text-2xl mt-0.5`}></i>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <p className="text-sm mt-1">{notification.message}</p>
                                            <p className="text-xs mt-2 opacity-70">
                                                {getTimeAgo(notification.timestamp)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {notification.actionUrl && (
                                            <a
                                                href={notification.actionUrl}
                                                className="text-xs font-semibold underline hover:no-underline"
                                            >
                                                View Details →
                                            </a>
                                        )}
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="text-xs font-semibold hover:underline"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="text-xs font-semibold hover:underline ml-auto"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <i className="las la-bell-slash text-6xl text-neutral-300 dark:text-neutral-600"></i>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-4">
                            No {filter === "unread" ? "unread " : ""}notifications
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
