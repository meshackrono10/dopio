"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

interface Notification {
    id: string;
    type: "booking" | "message" | "review" | "payment" | "system";
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "booking":
                return { icon: "la-calendar-check", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" };
            case "message":
                return { icon: "la-comments", color: "text-green-600 bg-green-100 dark:bg-green-900/30" };
            case "review":
                return { icon: "la-star", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" };
            case "payment":
                return { icon: "la-wallet", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" };
            default:
                return { icon: "la-bell", color: "text-neutral-600 bg-neutral-100 dark:bg-neutral-900/30" };
        }
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 border-b-2 transition-colors ${filter === "all"
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                        }`}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 border-b-2 transition-colors ${filter === "unread"
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <i className="las la-bell-slash text-6xl text-neutral-300 dark:text-neutral-600"></i>
                    <h3 className="text-xl font-semibold mt-4">
                        {filter === "unread" ? "No unread notifications" : "No notifications"}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        {filter === "unread"
                            ? "You're all caught up!"
                            : "Notifications will appear here when you have updates"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredNotifications.map((notification) => {
                        const { icon, color } = getNotificationIcon(notification.type);
                        return (
                            <div
                                key={notification.id}
                                className={`bg-white dark:bg-neutral-800 rounded-xl p-4 border transition-all ${notification.read
                                        ? "border-neutral-200 dark:border-neutral-700"
                                        : "border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                                        <i className={`las ${icon} text-xl`}></i>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                            {notification.message}
                                        </p>
                                        {notification.actionUrl && (
                                            <a
                                                href={notification.actionUrl}
                                                className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                                            >
                                                View details →
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <i className="las la-check text-lg"></i>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <i className="las la-trash text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
