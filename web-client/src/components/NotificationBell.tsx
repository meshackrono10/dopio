"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Route } from "@/routers/types";

interface Notification {
    id: string;
    type: "bid_received" | "bid_accepted" | "evidence_uploaded" | "extension_request" | "payment_released" | "general";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            type: "bid_received",
            title: "New Bid Received",
            message: "Hunter John Doe submitted a bid of KES 5,000",
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/request-search/req-1",
        },
        {
            id: "2",
            type: "evidence_uploaded",
            title: "Properties Uploaded",
            message: "Hunter uploaded 2 new properties for your review",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            actionUrl: "/request-search/req-1",
        },
        {
            id: "3",
            type: "payment_released",
            title: "Payment Released",
            message: "Escrow payment of KES 10,000 released to hunter",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: Notification["type"]) => {
        const icons = {
            bid_received: "la-hand-pointer",
            bid_accepted: "la-check-circle",
            evidence_uploaded: "la-images",
            extension_request: "la-clock",
            payment_released: "la-money-bill-wave",
            general: "la-bell",
        };
        return icons[type] || icons.general;
    };

    const getNotificationColor = (type: Notification["type"]) => {
        const colors = {
            bid_received: "text-blue-600 dark:text-blue-400",
            bid_accepted: "text-green-600 dark:text-green-400",
            evidence_uploaded: "text-purple-600 dark:text-purple-400",
            extension_request: "text-yellow-600 dark:text-yellow-400",
            payment_released: "text-green-600 dark:text-green-400",
            general: "text-neutral-600 dark:text-neutral-400",
        };
        return colors[type] || colors.general;
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const formatTimestamp = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now.getTime() - time.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
                <i className="las la-bell text-2xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer ${!notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                            }`}
                                        onClick={() => {
                                            markAsRead(notification.id);
                                            if (notification.actionUrl) {
                                                setIsOpen(false);
                                            }
                                        }}
                                    >
                                        {notification.actionUrl ? (
                                            <Link href={notification.actionUrl as Route}>
                                                <div className="flex gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.read ? "bg-primary-100 dark:bg-primary-900/20" : "bg-neutral-100 dark:bg-neutral-700"
                                                        }`}>
                                                        <i className={`las ${getNotificationIcon(notification.type)} text-xl ${getNotificationColor(notification.type)}`}></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <h4 className={`font-semibold text-sm ${!notification.read ? "text-neutral-900 dark:text-white" : ""}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1 ml-2"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.read ? "bg-primary-100 dark:bg-primary-900/20" : "bg-neutral-100 dark:bg-neutral-700"
                                                    }`}>
                                                    <i className={`las ${getNotificationIcon(notification.type)} text-xl ${getNotificationColor(notification.type)}`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className={`font-semibold text-sm ${!notification.read ? "text-neutral-900 dark:text-white" : ""}`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1 ml-2"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <i className="las la-bell-slash text-5xl text-neutral-400 mb-2"></i>
                                    <p className="text-neutral-600 dark:text-neutral-400">No notifications</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 text-center">
                                <Link
                                    href={"/notifications" as Route}
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
