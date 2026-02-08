"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";
import api from "@/services/api";
import { ViewingRequest } from "@/data/types";
import Skeleton from "@/shared/Skeleton";

export default function CheckoutSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<ViewingRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            if (!params.id) return;
            try {
                const response = await api.get(`/viewing-requests/${params.id}`);
                setRequest(response.data);
            } catch (error) {
                console.error("Failed to fetch viewing request details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [params.id]);

    if (loading) {
        return (
            <div className="container py-24 lg:py-32">
                <div className="max-w-2xl mx-auto space-y-8">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-64 rounded-2xl" />
                    <div className="flex gap-4">
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="container py-24 text-center">
                <h1 className="text-2xl font-bold">Request not found</h1>
                <p className="mt-4 text-neutral-500">We couldn't load your viewing request details.</p>
                <Link href="/" className="mt-8 inline-block text-primary-600 font-medium">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="nc-CheckoutSuccessPage container pb-24 lg:pb-32">
            <main className="pt-11 lg:pt-16">
                <div className="max-w-2xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="las la-check-circle text-6xl text-green-600"></i>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                            Congratulations!
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                            Your viewing request has been sent successfully.
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm mb-8">
                        <div className="p-6 sm:p-8">
                            <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between pb-4 border-b border-neutral-100 dark:border-neutral-700">
                                    <span className="text-neutral-500">Property</span>
                                    <Link href={`/listing-stay-detail/${request.propertyId}` as any}>
                                        <span className="font-semibold text-right hover:text-primary-600 transition-colors cursor-pointer">
                                            {request.propertyTitle}
                                        </span>
                                    </Link>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-neutral-100 dark:border-neutral-700">
                                    <span className="text-neutral-500">Amount Paid</span>
                                    <span className="font-bold text-green-600">KES {request.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-neutral-100 dark:border-neutral-700">
                                    <span className="text-neutral-500">House Hunter</span>
                                    <span className="font-semibold">{request.haunterName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Status</span>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        Pending Approval
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-900/10 p-6 flex items-start gap-3">
                            <i className="las la-info-circle text-2xl text-primary-600"></i>
                            <div className="text-sm text-neutral-600 dark:text-neutral-300">
                                <p className="font-semibold text-primary-900 dark:text-primary-100">What happens next?</p>
                                <p className="mt-1">The House Hunter will review your request. You'll receive a notification and SMS once they confirm the date and time.</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={`/tenant-dashboard/messages?partnerId=${request.haunterId}`}
                            className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold text-center hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
                        >
                            <i className="las la-comment-dots mr-2 text-xl"></i>
                            Message House Hunter
                        </Link>
                        <Link
                            href="/tenant-dashboard/viewing-requests"
                            className="flex-1 px-8 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl font-bold text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                        >
                            <i className="las la-file-alt mr-2 text-xl"></i>
                            View Request Details
                        </Link>
                    </div>

                    <div className="text-center mt-12 bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl">
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Want to see more properties? <Link href="/" className="text-primary-600 font-bold hover:underline">Continue Browsing</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
