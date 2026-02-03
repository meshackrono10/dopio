"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import { useProperties } from "@/contexts/PropertyContext";
import Link from "next/link";
import { Route } from "@/routers/types";
import api from "@/services/api";

export default function HaunterDashboardOverview() {
    const { user } = useAuth();
    const { bookings: allBookings } = useBookings();
    const { properties: allProperties } = useProperties();
    const [walletBalance, setWalletBalance] = useState({ available: 0, escrow: 0, withdrawn: 0 });

    const haunterBookings = allBookings.filter(b => b.haunterId === user?.id);
    const haunterProperties = allProperties.filter((p) => p.agent.id === user?.id && p.status !== 'rented');

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await api.get("/payments/summary");
                setWalletBalance(response.data.balance);
            } catch (error) {
                console.error("Failed to fetch wallet summary", error);
            }
        };
        fetchWallet();
    }, []);

    const totalEarnings = walletBalance.available + walletBalance.withdrawn;
    const pendingEarnings = walletBalance.escrow;

    const stats = [
        {
            name: "Total Bookings",
            value: haunterBookings.length,
            icon: "la-calendar-check",
            color: "bg-blue-500",
            href: "/haunter-dashboard/bookings"
        },
        {
            name: "Active Listings",
            value: haunterProperties.length,
            icon: "la-home",
            color: "bg-green-500",
            href: "/haunter-dashboard/listings"
        },
        {
            name: "Total Earnings",
            value: `KSh ${totalEarnings.toLocaleString()}`,
            icon: "la-wallet",
            color: "bg-purple-500",
            href: "/haunter-dashboard/wallet"
        },
        {
            name: "Pending Earnings",
            value: `KSh ${pendingEarnings.toLocaleString()}`,
            icon: "la-clock",
            color: "bg-orange-500",
            href: "/haunter-dashboard/wallet"
        },
    ];

    const recentBookings = haunterBookings.slice(0, 5);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                    Here&apos;s what&apos;s happening with your properties today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Link
                        key={stat.name}
                        href={stat.href}
                        className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.name}</p>
                                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                <i className={`las ${stat.icon} text-2xl text-white`}></i>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Recent Bookings</h2>
                    <Link
                        href="/haunter-dashboard/bookings"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        View all →
                    </Link>
                </div>

                {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                        {recentBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                            >
                                <div>
                                    <h3 className="font-medium">{booking.propertyTitle}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {booking.tenantName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">Booking #{booking.id}</p>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${booking.status === "confirmed"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : booking.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                            }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                        No bookings yet. Your bookings will appear here.
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/add-listing/1"
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl p-6 flex items-center gap-4 transition-colors"
                >
                    <i className="las la-plus-circle text-4xl"></i>
                    <div>
                        <h3 className="font-semibold">Add New Listing</h3>
                        <p className="text-sm opacity-90">List a new property</p>
                    </div>
                </Link>

                <Link
                    href="/haunter-dashboard/messages"
                    className="bg-white dark:bg-neutral-800 hover:shadow-lg border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex items-center gap-4 transition-shadow"
                >
                    <i className="las la-comments text-4xl text-primary-600"></i>
                    <div>
                        <h3 className="font-semibold">Messages</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Chat with tenants</p>
                    </div>
                </Link>

                <Link
                    href="/haunter-dashboard/wallet"
                    className="bg-white dark:bg-neutral-800 hover:shadow-lg border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex items-center gap-4 transition-shadow"
                >
                    <i className="las la-wallet text-4xl text-primary-600"></i>
                    <div>
                        <h3 className="font-semibold">Wallet</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage earnings</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
