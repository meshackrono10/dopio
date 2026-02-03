"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Route } from "next";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: string) => {
        const icons: any = {
            'RESCHEDULE_REQUEST': "la-clock",
            'BOOKING_REMINDER': "la-bell",
            'PAYMENT_RELEASED': "la-money-bill-wave",
            'SUCCESS': "la-check-circle",
            'INFO': "la-info-circle",
            'WARNING': "la-exclamation-triangle",
        };
        return icons[type] || "la-bell";
    };

    const getNotificationColor = (type: string) => {
        const colors: any = {
            'RESCHEDULE_REQUEST': "text-blue-600 dark:text-blue-400",
            'BOOKING_REMINDER': "text-orange-600 dark:text-orange-400",
            'PAYMENT_RELEASED': "text-green-600 dark:text-green-400",
            'SUCCESS': "text-green-600 dark:text-green-400",
            'WARNING': "text-red-600 dark:text-red-400",
        };
        return colors[type] || "text-neutral-600 dark:text-neutral-400";
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/mark-read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch("/notifications/mark-all-read");
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
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
                                                            <span className="text-xs text-neutral-500 whitespace-nowrap">
                                                                {formatTimestamp(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                                                            {notification.message}
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
                                                        <span className="text-xs text-neutral-500 whitespace-nowrap">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="las la-bell-slash text-2xl text-neutral-400"></i>
                                    </div>
                                    <p className="text-neutral-500 dark:text-neutral-400">No notifications yet</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 text-center">
                            <Link
                                href="/notifications"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
