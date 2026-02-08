"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import Image from "next/image";
import Link from "next/link";
import { Route } from "@/routers/types";
import Skeleton from "@/shared/Skeleton";
import { useToast } from "@/components/Toast";

export default function BookingsPage() {
    const { user } = useAuth();
    const { bookings: allBookings, loading: bookingsLoading, confirmMeetup, markDone } = useBookings();
    const { showToast } = useToast();
    const { fetchBookings } = useBookings();

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const haunterBookings = allBookings.filter(b => b.haunterId === user?.id);

    const handleConfirmMeetup = async (bookingId: string) => {
        try {
            await confirmMeetup(bookingId);
            showToast("success", "Physical meeting confirmed!");
        } catch (error) {
            showToast("error", "Failed to confirm meeting");
        }
    };

    const handleMarkDone = async (bookingId: string) => {
        try {
            await markDone(bookingId);
            showToast("success", "Booking marked as done!");
        } catch (error) {
            showToast("error", "Failed to mark as done");
        }
    };

    if (bookingsLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex gap-4">
                            <Skeleton className="w-32 h-32 rounded-lg" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Bookings</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Manage your property viewing bookings
                    </p>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {haunterBookings.length} total bookings
                </div>
            </div>

            {haunterBookings.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <i className="las la-calendar-times text-6xl text-neutral-300 dark:text-neutral-600"></i>
                    <h3 className="text-xl font-semibold mt-4">No bookings yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Your bookings will appear here when tenants book viewings for your properties.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {haunterBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Property Image */}
                                <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={booking.propertyImage || "/placeholder.jpg"}
                                        alt={booking.propertyTitle}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{booking.propertyTitle}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                Tenant: {booking.tenantName}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${booking.status === "confirmed" || booking.status === "in_progress"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : booking.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    : booking.status === "completed"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Package</p>
                                            <p className="font-medium">{booking.packageName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Amount</p>
                                            <p className="font-medium">KSh {booking.price.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Viewing Date</p>
                                            <p className="font-medium">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Booked On</p>
                                            <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <Link
                                            href={`/booking-detail/${booking.id}`}
                                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </Link>

                                        {(booking.status === "confirmed" || booking.status === "in_progress") && !booking.physicalMeetingConfirmed && (
                                            <button
                                                onClick={() => handleConfirmMeetup(booking.id)}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                            >
                                                Confirm Meetup
                                            </button>
                                        )}

                                        {booking.physicalMeetingConfirmed && !booking.hunterDone && (
                                            <button
                                                onClick={() => handleMarkDone(booking.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                Mark as Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
