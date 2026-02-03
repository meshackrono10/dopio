"use client";

import React from "react";
import { useParams } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Avatar from "@/shared/Avatar";
import HaunterReviewCard, { HaunterReview } from "@/components/HaunterReviewCard";
import { MOCK_PROPERTIES } from "@/data/mockData";

// Mock tenant data - in real app, this would come from API
const MOCK_TENANT_DATA: { [key: string]: any } = {
    "tenant-1": {
        id: "tenant-1",
        name: "Jane Doe",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        joinedDate: "2024-10-15",
        isVerified: true,
        bio: "Looking for a modern 2-bedroom apartment in Nairobi with good transport links and amenities.",
        reviewsWritten: [
            {
                id: "review-1",
                haunterId: "haunter-1",
                tenantId: "tenant-1",
                tenantName: "Jane Doe",
                rating: 5,
                professionalismRating: 5,
                accuracyRating: 5,
                comment: "Excellent service! John was very professional and showed me exactly what was advertised. Highly recommend!",
                propertyId: "prop-1",
                propertyTitle: MOCK_PROPERTIES[0].title,
                bookingId: "book-past-1",
                createdAt: "2024-11-15",
                haunterResponse: "Thank you! It was a pleasure showing you around.",
                haunterResponseDate: "2024-11-16",
                helpfulCount: 5,
            },
        ],
    },
    "tenant-2": {
        id: "tenant-2",
        name: "Michael Ochieng",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        joinedDate: "2024-08-20",
        isVerified: true,
        bio: "Relocating to Nairobi for work. Interested in studio or 1-bedroom apartments in CBD or Westlands.",
        reviewsWritten: [],
    },
};

export default function TenantProfilePage() {
    const params = useParams();
    const tenantId = params.id as string;

    const tenant = MOCK_TENANT_DATA[tenantId];

    if (!tenant) {
        return (
            <div className="container py-16">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4">Tenant Not Found</h1>
                    <p className="text-neutral-500">The tenant profile you&apos;re looking for doesn&apos;t exist.</p>
                    <ButtonPrimary href="/" className="mt-6">
                        Back to Home
                    </ButtonPrimary>
                </div>
            </div>
        );
    }

    return (
        <div className="nc-TenantProfilePage">
            {/* Header Section */}
            <div className="bg-neutral-50 dark:bg-neutral-800 py-12 lg:py-16">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <Avatar
                                    sizeClass="w-32 h-32 lg:w-40 lg:h-40"
                                    radius="rounded-full"
                                    imgUrl={tenant.avatar}
                                    userName={tenant.name}
                                    hasChecked={tenant.isVerified}
                                    hasCheckedClass="w-8 h-8 -bottom-1 -right-1"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h1 className="text-3xl lg:text-4xl font-semibold flex items-center gap-3 mb-2">
                                    {tenant.name}
                                    {tenant.isVerified && (
                                        <i className="las la-check-circle text-primary-600 text-2xl" title="Verified Tenant"></i>
                                    )}
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                    Tenant • Member since {new Date(tenant.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                                </p>

                                {/* Stats */}
                                <div className="flex flex-wrap gap-6 mb-6">
                                    <div className="flex items-center gap-2">
                                        <i className="las la-star text-2xl text-primary-600"></i>
                                        <div>
                                            <div className="font-semibold">{tenant.reviewsWritten.length}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Reviews written
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="las la-calendar-check text-2xl text-green-600"></i>
                                        <div>
                                            <div className="font-semibold">
                                                {Math.floor((new Date().getTime() - new Date(tenant.joinedDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                                            </div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Member duration
                                            </div>
                                        </div>
                                    </div>
                                    {tenant.isVerified && (
                                        <div className="flex items-center gap-2">
                                            <i className="las la-shield-alt text-2xl text-blue-600"></i>
                                            <div>
                                                <div className="font-semibold">Verified</div>
                                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    Identity confirmed
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                {tenant.bio && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                                            ABOUT
                                        </h3>
                                        <p className="text-neutral-700 dark:text-neutral-300">
                                            {tenant.bio}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="container py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <h2 className="text-2xl font-semibold mb-6">
                            Reviews by {tenant.name.split(" ")[0]}
                        </h2>

                        {tenant.reviewsWritten.length > 0 ? (
                            <div>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                                    {tenant.name.split(" ")[0]} has written {tenant.reviewsWritten.length} {tenant.reviewsWritten.length === 1 ? "review" : "reviews"} for agents.
                                </p>
                                <div className="divide-y divide-neutral-200 dark:border-neutral-700">
                                    {tenant.reviewsWritten.map((review: HaunterReview) => (
                                        <HaunterReviewCard
                                            key={review.id}
                                            review={review}
                                            className="py-6 first:pt-0 last:pb-0"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <i className="las la-pen text-6xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                                <p className="text-neutral-500 dark:text-neutral-400">
                                    {tenant.name.split(" ")[0]} hasn&apos;t written any reviews yet.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Verification Badge Info */}
                    {tenant.isVerified && (
                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <i className="las la-shield-alt text-3xl text-blue-600"></i>
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        Verified Tenant
                                    </h3>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {tenant.name.split(" ")[0]}&apos;s identity has been verified by Dapio. This includes verification of phone number and email address.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trust & Safety */}
                    <div className="mt-6 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                        <h3 className="font-semibold mb-3">Trust & Safety</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            We take the safety of our community seriously. All reviews are monitored and verified.
                        </p>
                        <div className="flex gap-3">
                            <button className="text-sm px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 transition-colors">
                                <i className="las la-flag mr-1"></i>
                                Report Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
