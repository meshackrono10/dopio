"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useParams, useRouter } from "next/navigation";

export default function BookingConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState({
        days: 2,
        hours: 14,
        minutes: 30,
    });

    const booking = {
        id: params.id,
        property: "Modern 2-Bedroom Apartment",
        location: "Kasarani, Nairobi",
        package: "Gold Package",
        amount: 2500,
        haunterName: "John Kamau",
        haunterPhone: "+254 712 345 678",
        viewingDate: "Dec 18, 2025",
        viewingTime: "2:00 PM",
        mpesaRef: "QH12345678",
        paymentDate: "Dec 16, 2025 - 10:30 AM",
    };

    return (
        <div className="nc-BookingConfirmationPage container pb-24 lg:pb-32">
            <main className="pt-11">
                <div className="max-w-3xl mx-auto">
                    {/* Success Message */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="las la-check-circle text-6xl text-green-600"></i>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                            Viewing Confirmed!
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                            Your payment was successful. Check your SMS for viewing details.
                        </p>
                    </div>

                    {/* Countdown */}
                    <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-8 mb-8">
                        <p className="text-center text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                            Your viewing is in:
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary-600">{countdown.days}</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Days</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary-600">{countdown.hours}</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Hours</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary-600">{countdown.minutes}</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Minutes</div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8 mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Viewing Details</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                <span className="text-neutral-500 dark:text-neutral-400">Property</span>
                                <span className="font-medium">{booking.property}</span>
                            </div>
                            <div className="flex justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                <span className="text-neutral-500 dark:text-neutral-400">Location</span>
                                <span className="font-medium">{booking.location}</span>
                            </div>
                            <div className="flex justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                <span className="text-neutral-500 dark:text-neutral-400">Package</span>
                                <span className="font-medium">{booking.package}</span>
                            </div>
                            <div className="flex justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                <span className="text-neutral-500 dark:text-neutral-400">Date & Time</span>
                                <span className="font-medium">{booking.viewingDate} at {booking.viewingTime}</span>
                            </div>
                            <div className="flex justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                <span className="text-neutral-500 dark:text-neutral-400">House Haunter</span>
                                <span className="font-medium">{booking.haunterName}</span>
                            </div>
                            <div className="flex justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                <span className="text-neutral-500 dark:text-neutral-400">Haunter Phone</span>
                                <a href={`tel:${booking.haunterPhone}`} className="font-medium text-primary-600 hover:underline">
                                    {booking.haunterPhone}
                                </a>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">Amount Paid</span>
                                <span className="font-semibold text-lg text-green-600">KES {booking.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800 p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <i className="las la-check-circle text-2xl text-green-600 mt-1"></i>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Payment Confirmed</h3>
                                <div className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                                    <p>M-Pesa Ref: <span className="font-medium">{booking.mpesaRef}</span></p>
                                    <p>Paid on: {booking.paymentDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-8">
                        <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-300">
                            <i className="las la-info-circle mr-1"></i>
                            What Happens Next?
                        </h3>
                        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
                            <li>You&apos;ll receive an SMS with exact meeting location 24 hours before viewing</li>
                            <li>Your house haunter will call you 1 hour before the viewing</li>
                            <li>Meet at the exact location at the scheduled time</li>
                            <li>After viewing, you can leave a review and rating</li>
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <ButtonPrimary
                            onClick={() => router.push("/tenant-dashboard")}
                            className="flex-1"
                        >
                            <i className="las la-home mr-2"></i>
                            View My Bookings
                        </ButtonPrimary>
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                        >
                            <i className="las la-search mr-2"></i>
                            Browse More Properties
                        </button>
                    </div>

                    {/* Support */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Need help? <a href="/contact" className="text-primary-600 hover:underline">Contact Support</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
