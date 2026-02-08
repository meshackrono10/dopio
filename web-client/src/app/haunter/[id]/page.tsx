"use client";

import React, { FC, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import StartRating from "@/components/StartRating";
import StayCard2 from "@/components/StayCard2";
import CommentListing from "@/components/CommentListing";
import { Tab } from "@headlessui/react";
import Link from "next/link";
import { Route } from "@/routers/types";
import { useSearchParams } from "next/navigation";
import ReviewModal from "@/components/ReviewModal";
import { useToast } from "@/components/Toast";

export interface HaunterProfilePageProps {
    params: {
        id: string;
    };
}

const HaunterProfilePage: FC<HaunterProfilePageProps> = ({ params }) => {
    const { id } = params;
    const [hunter, setHunter] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const router = useRouter();

    const isReviewMode = searchParams.get("review") === "true";
    const bookingId = searchParams.get("bookingId");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/users/hunter/${id}`);
                setHunter(response.data.hunter);
                setProperties(response.data.properties);
                setReviews(response.data.reviews);
                setRating(response.data.rating);
                setReviewCount(response.data.reviewCount);
            } catch (err: any) {
                console.error("Error fetching hunter profile:", err);
                setError(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    useEffect(() => {
        if (isReviewMode && bookingId) {
            setShowReviewModal(true);
        }
    }, [isReviewMode, bookingId]);

    const handleReviewConfirm = async (rating: number, comment: string) => {
        if (!bookingId) return;

        setSubmittingReview(true);
        try {
            await api.post("/reviews", {
                bookingId,
                rating,
                comment,
            });
            setReviews(response.data.reviews);

            showToast("success", "Review submitted successfully!");
            router.push("/tenant-dashboard/bookings" as Route);

            // Clean up URL
            router.replace(`/haunter/${id}` as Route);
        } catch (err: any) {
            showToast("error", err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-24 flex justify-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !hunter) {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-2xl font-semibold mb-4">
                    {error || "Hunter not found"}
                </h2>
                <ButtonPrimary href="/" className="mt-4">
                    Go back home
                </ButtonPrimary>
            </div>
        );
    }

    const renderSidebar = () => {
        return (
            <div className="w-full flex flex-col items-center text-center sm:rounded-2xl sm:border border-neutral-200 dark:border-neutral-700 space-y-6 sm:space-y-7 px-0 sm:p-6 xl:p-8">
                <Avatar
                    hasChecked={hunter.isVerified}
                    hasCheckedClass="w-6 h-6 -top-0.5 right-2"
                    sizeClass="w-28 h-28"
                    imgUrl={hunter.avatarUrl}
                />

                {/* ---- */}
                <div className="space-y-3 text-center flex flex-col items-center">
                    <h2 className="text-3xl font-semibold">{hunter.name}</h2>
                    <StartRating className="!text-base" point={rating} reviewCount={reviewCount} />
                </div>

                {/* ---- */}
                <p className="text-neutral-500 dark:text-neutral-400">
                    Member since {new Date(hunter.createdAt).getFullYear()}
                </p>

                {/* ---- */}
                <div className="border-b border-neutral-200 dark:border-neutral-700 w-14"></div>

                {/* ---- */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <span className="text-neutral-6000 dark:text-neutral-300">
                            {properties.length} Active Listings
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                        </svg>
                        <span className="text-neutral-6000 dark:text-neutral-300">
                            Speaks English, Swahili
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <span className="text-neutral-6000 dark:text-neutral-300">
                            Works in {hunter.workLocation || "Nairobi"}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-neutral-6000 dark:text-neutral-300">
                            {hunter.isVerified ? "Verified Identity" : "Unverified Identity"}
                        </span>
                    </div>
                </div>

                {/* Message Button */}
                <div className="w-full pt-4">
                    <Link
                        href={`/tenant-dashboard?tab=messages&partnerId=${hunter.id}` as Route}
                        className="w-full"
                    >
                        <ButtonPrimary className="w-full">
                            <i className="las la-comment-dots mr-2 text-xl"></i>
                            Message Agent
                        </ButtonPrimary>
                    </Link>
                </div>
            </div>
        );
    };

    const renderMain = () => {
        return (
            <div className="w-full flex flex-col space-y-8 xl:space-y-10">
                <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6">
                    <h2 className="text-2xl font-semibold">About {hunter.name}</h2>
                    <div className="text-neutral-6000 dark:text-neutral-300 mt-4 leading-relaxed">
                        <p>
                            {hunter.description || `I am a professional Agent dedicated to finding you the perfect home. I specialize in verified listings and seamless viewing experiences in ${hunter.workLocation || "the area"}.`}
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-6">Active Listings</h2>
                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                            {properties.map((item) => (
                                <StayCard2 key={item.id} data={item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500">No active listings at the moment.</p>
                    )}
                </div>

                <div className="border-b border-neutral-200 dark:border-neutral-700"></div>

                <div>
                    <h2 className="text-2xl font-semibold mb-6">
                        Reviews ({reviewCount})
                    </h2>
                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {reviews.map((review) => (
                                <CommentListing
                                    key={review.id}
                                    data={{
                                        name: review.tenantName,
                                        avatar: review.tenantAvatar,
                                        date: new Date(review.createdAt).toLocaleDateString(),
                                        comment: review.comment,
                                        starPoint: review.rating,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500">No reviews yet.</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`nc-HaunterProfilePage  container py-16 lg:py-28 `}>
            <div className="flex flex-col lg:flex-row">
                <div className="flex-shrink-0 w-full lg:w-1/4 lg:pr-8 mb-12 lg:mb-0">
                    {renderSidebar()}
                </div>
                <div className="flex-grow">{renderMain()}</div>
            </div>

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onConfirm={handleReviewConfirm}
                loading={submittingReview}
                hunterName={hunter?.name}
            />
        </div>
    );
};

export default HaunterProfilePage;
