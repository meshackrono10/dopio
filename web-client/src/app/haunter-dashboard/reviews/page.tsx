"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useToast } from "@/components/Toast";

interface Review {
    id: string;
    tenantId: string;
    tenantName: string;
    tenantAvatar?: string;
    propertyId: string;
    propertyTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ReviewsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });



    const fetchReviews = React.useCallback(async () => {
        try {
            const response = await api.get("/reviews/haunter");
            setReviews(response.data.reviews || []);
            setStats(response.data.stats || stats);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    }, [stats]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <i
                key={i}
                className={`las la-star ${i < rating ? "text-yellow-500" : "text-neutral-300 dark:text-neutral-600"}`}
            ></i>
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Reviews</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    See what tenants are saying about your service
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Average Rating</p>
                            <p className="text-3xl font-bold mt-2">{stats.averageRating.toFixed(1)}</p>
                            <div className="flex gap-1 mt-2">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                        </div>
                        <i className="las la-star text-4xl text-yellow-500"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Reviews</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalReviews}</p>
                        </div>
                        <i className="las la-comments text-4xl text-primary-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">Rating Distribution</p>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-3">{rating}</span>
                                <i className="las la-star text-yellow-500 text-xs"></i>
                                <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{
                                            width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 w-8 text-right">
                                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <i className="las la-star text-6xl text-neutral-300 dark:text-neutral-600"></i>
                    <h3 className="text-xl font-semibold mt-4">No reviews yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Reviews from tenants will appear here after completed viewings
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                                    {review.tenantAvatar ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={review.tenantAvatar}
                                            alt={review.tenantName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <i className="las la-user text-primary-600 text-xl"></i>
                                    )}
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{review.tenantName}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {review.propertyTitle}
                                            </p>
                                        </div>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex gap-1 mt-2">
                                        {renderStars(review.rating)}
                                    </div>

                                    <p className="mt-3 text-neutral-700 dark:text-neutral-300">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
