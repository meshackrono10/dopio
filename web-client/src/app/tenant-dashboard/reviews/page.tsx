"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import { useToast } from "@/components/Toast";
import api from "@/services/api";
import HaunterReviewCard, { HaunterReview } from "@/components/HaunterReviewCard";
import ReviewModal from "@/components/ReviewModal";

export default function ReviewsPage() {
    const { user } = useAuth();
    const { bookings: allBookings } = useBookings();
    const { showToast } = useToast();

    const [myReviews, setMyReviews] = useState<HaunterReview[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const tenantBookings = allBookings.filter(b => b.tenantId === user?.id);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await api.get("/reviews");
            const mappedReviews: HaunterReview[] = response.data.map((r: any) => ({
                id: r.id,
                haunterId: r.booking.hunterId,
                tenantId: r.booking.tenantId,
                tenantName: r.booking.tenant.name,
                tenantAvatar: r.booking.tenant.avatarUrl,
                rating: r.rating,
                comment: r.comment,
                propertyId: r.booking.propertyId,
                propertyTitle: r.booking.property.title,
                bookingId: r.bookingId,
                createdAt: r.createdAt,
            }));
            setMyReviews(mappedReviews);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const completedBookingsWithoutReview = tenantBookings.filter(
        (b: any) => b.status === "COMPLETED" && !myReviews.some(r => r.bookingId === b.id)
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
                <p className="text-neutral-500">Manage your reviews for House Hunters</p>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && selectedBookingForReview && (
                <ReviewModal
                    isOpen={showReviewForm}
                    onClose={() => {
                        setShowReviewForm(false);
                        setSelectedBookingForReview(null);
                    }}
                    hunterName={selectedBookingForReview.haunterName}
                    onConfirm={async (rating, comment) => {
                        try {
                            await api.post('/reviews', {
                                bookingId: selectedBookingForReview.id,
                                rating,
                                comment
                            });
                            showToast("success", "Thank you for your review!");
                            setShowReviewForm(false);
                            setSelectedBookingForReview(null);
                            fetchReviews();
                        } catch (error: any) {
                            showToast("error", error.response?.data?.message || "Failed to submit review");
                        }
                    }}
                />
            )}

            {/* Pending Reviews */}
            {!showReviewForm && completedBookingsWithoutReview.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="las la-clock text-yellow-600"></i>
                        Pending Reviews ({completedBookingsWithoutReview.length})
                    </h3>
                    <div className="space-y-3">
                        {completedBookingsWithoutReview.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-xl"
                            >
                                <div>
                                    <p className="font-medium">{booking.propertyTitle}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Viewed on {new Date(booking.scheduledDate).toLocaleDateString()} • {booking.haunterName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedBookingForReview(booking);
                                        setShowReviewForm(true);
                                    }}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                >
                                    <i className="las la-star mr-1"></i>
                                    Leave Review
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My Reviews */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-xl font-semibold mb-6">
                    My Reviews ({myReviews.length})
                </h3>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-700 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : myReviews.length > 0 ? (
                    <div className="divide-y divide-neutral-200 dark:border-neutral-700">
                        {myReviews.map((review) => (
                            <HaunterReviewCard
                                key={review.id}
                                review={review}
                                className="py-6 first:pt-0 last:pb-0"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <i className="las la-star text-6xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            You haven&apos;t submitted any reviews yet.
                        </p>
                        {completedBookingsWithoutReview.length > 0 && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                You have {completedBookingsWithoutReview.length} pending {completedBookingsWithoutReview.length === 1 ? "review" : "reviews"}.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
