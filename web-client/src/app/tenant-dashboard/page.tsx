"use client";

import React, { FC, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PROPERTIES, getReviewsByHaunterId, MOCK_SEARCH_REQUESTS, getSearchRequestsByTenantId } from "@/data/mockData";
import { SearchRequest } from "@/data/types";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { Route } from "@/routers/types";
import CreateIssueModal from "@/components/CreateIssueModal";
import ReviewForm, { ReviewFormData } from "@/components/ReviewForm";
import HaunterReviewCard, { HaunterReview } from "@/components/HaunterReviewCard";
import SearchRequestCard from "@/components/SearchRequestCard";
import WalletManagement from "@/components/WalletManagement";
import NotificationManager from "@/components/NotificationManager";
import { useComparison } from "@/contexts/ComparisonContext";

import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import { useProperties } from "@/contexts/PropertyContext";
import { getSearchRequests } from "@/services/searchRequest";
import Skeleton from "@/shared/Skeleton";
import { useToast } from "@/components/Toast";
import api from "@/services/api";

type TabType = "saved" | "bookings" | "comparison" | "reviews" | "messages" | "search-requests" | "wallet" | "notifications";

interface SavedProperty {
    id: string;
    property: any;
}

export default function TenantDashboard() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as TabType | null;
    const [activeTab, setActiveTab] = useState<TabType>(tabParam || "saved");
    const [selectedConversation, setSelectedConversation] = useState<string | undefined>();
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);

    const { user } = useAuth();
    const { bookings: allBookings, loading: bookingsLoading } = useBookings();
    const { getPropertyById } = useProperties();

    const tenantBookings = allBookings.filter(b => b.tenantId === user?.id);

    // Map real bookings to the format expected by the UI
    const bookings = tenantBookings.map(b => {
        const property = getPropertyById(b.propertyId);
        return {
            id: b.id.toString(),
            propertyId: b.propertyId.toString(),
            propertyTitle: property?.title || "Unknown Property",
            propertyImage: property?.images[0] as string || "",
            propertyLocation: property?.location.generalArea || "Unknown Location",
            packageTier: b.packageName,
            amount: b.price,
            viewingDate: b.scheduledDate,
            status: b.status === "completed" ? "completed" : "upcoming",
            haunterName: property?.houseHaunter.name || "Unknown Haunter",
            haunterPhone: property?.houseHaunter.phone || "",
        };
    });

    const [mySearchRequests, setMySearchRequests] = useState<any[]>([]);
    const [loadingSearchRequests, setLoadingSearchRequests] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchSearchRequests = async () => {
            setLoadingSearchRequests(true);
            try {
                if (user?.id) {
                    const data = await getSearchRequests({ userId: String(user.id), role: 'TENANT' });
                    setMySearchRequests(data);
                }
            } catch (err) {
                console.error("Failed to fetch search requests:", err);
                showToast("error", "Failed to fetch search requests. Please try again.");
            } finally {
                setLoadingSearchRequests(false);
            }
        };
        if (user?.id) {
            fetchSearchRequests();
        }
    }, [user, showToast]);

    // Use comparison context
    const { comparisonList, removeFromComparison, clearComparison } = useComparison();

    // Mock user reviews (reviews submitted by this tenant)
    const [myReviews, setMyReviews] = useState<HaunterReview[]>([]);

    const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);

    useEffect(() => {
        const fetchSavedProperties = async () => {
            try {
                const response = await api.get("/users/saved-properties");
                setSavedProperties(response.data);
            } catch (error) {
                console.error("Failed to fetch saved properties", error);
            }
        };

        if (activeTab === "saved") {
            fetchSavedProperties();
        }
    }, [activeTab]);

    const handleRemoveSaved = async (propertyId: string) => {
        try {
            await api.post(`/users/saved-properties/${propertyId}`);
            // Refresh the list
            setSavedProperties(prev => prev.filter(p => p.property.id !== propertyId));
            showToast("success", "Property removed from saved list");
        } catch (error) {
            console.error("Failed to remove saved property", error);
            showToast("error", "Failed to remove property");
        }
    };



    // Initialize first conversation
    React.useEffect(() => {
        if (!selectedConversation && bookings.length > 0) {
            setSelectedConversation(bookings[0].id);
        }
    }, [bookings, selectedConversation]);

    const handleReviewSubmit = (reviewData: ReviewFormData) => {
        // In a real app, this would submit to an API
        const newReview: HaunterReview = {
            id: `review-${Date.now()}`,
            haunterId: reviewData.haunterId,
            tenantId: "tenant-1",
            tenantName: "Jane Doe",
            rating: reviewData.rating,
            professionalismRating: reviewData.professionalismRating,
            accuracyRating: reviewData.accuracyRating,
            comment: reviewData.comment,
            propertyId: reviewData.propertyId,
            propertyTitle: reviewData.propertyTitle,
            bookingId: reviewData.bookingId,
            createdAt: new Date().toISOString(),
        };

        setMyReviews([newReview, ...myReviews]);
        setShowReviewForm(false);
        setSelectedBookingForReview(null);
        alert("Review submitted successfully!");
    };

    const completedBookingsWithoutReview = bookings.filter(
        (b) => b.status === "completed" && !myReviews.some(r => r.bookingId === b.id)
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "saved":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedProperties.map((saved) => (
                            <div
                                key={saved.id}
                                className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="aspect-w-4 aspect-h-3 relative">
                                    <Image
                                        fill
                                        src={saved.property.images[0]}
                                        alt={saved.property.title}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-lg line-clamp-2">{saved.property.title}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                        {saved.property.location.generalArea}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xl font-bold text-primary-600">
                                            KES {saved.property.rent.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">/month</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Link
                                            href={`/property/${saved.property.id}` as Route}
                                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveSaved(saved.property.id)}
                                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                                        >
                                            <i className="las la-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {savedProperties.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                    <i className="las la-heart text-4xl text-neutral-400"></i>
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                                    No saved properties
                                </h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
                                    You haven&apos;t saved any properties yet. Browse our listings to find your next home.
                                </p>
                                <ButtonPrimary className="mt-6" href={"/listing-stay-map" as Route}>
                                    Browse Properties
                                </ButtonPrimary>
                            </div>
                        )}
                    </div>
                );

            case "bookings":
                return (
                    <div className="space-y-6">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                                >
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-72 h-48 lg:h-auto relative">
                                            <Image
                                                fill
                                                src={booking.propertyImage}
                                                alt={booking.propertyTitle}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold line-clamp-2">
                                                        {booking.propertyTitle}
                                                    </h3>
                                                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                                                        <i className="las la-map-marker mr-1"></i>
                                                        {booking.propertyLocation}
                                                    </p>

                                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                                Viewing Date
                                                            </p>
                                                            <p className="font-medium mt-1">
                                                                {new Date(booking.viewingDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Package</p>
                                                            <p className="font-medium mt-1 capitalize">{booking.packageTier}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                                        <i className="las la-user-tie text-2xl text-primary-600"></i>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{booking.haunterName}</p>
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                                {booking.haunterPhone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:w-48 flex flex-col gap-2">
                                                    <div className="text-center lg:text-right mb-4">
                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Amount Paid</p>
                                                        <p className="text-2xl font-bold text-primary-600">
                                                            KES {booking.amount.toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {booking.status === "upcoming" && (
                                                        <>
                                                            <Link
                                                                href={"/chat" as Route}
                                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
                                                            >
                                                                <i className="las la-comment mr-1"></i>
                                                                Chat
                                                            </Link>
                                                            <button className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-secondary-500 transition-colors text-sm font-medium">
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}

                                                    {booking.status === "completed" && (
                                                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                                            <i className="las la-star mr-1"></i>
                                                            Leave Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center">
                                <i className="las la-calendar-times text-6xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                                <h3 className="font-semibold mb-2">No Bookings Yet</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    You haven&apos;t booked any viewings yet.
                                </p>
                                <Link href={"/listing-stay" as Route}>
                                    <ButtonPrimary>
                                        <i className="las la-search mr-2"></i>
                                        Browse Properties
                                    </ButtonPrimary>
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case "reviews":
                return (
                    <div className="space-y-6">
                        {/* Review Form */}
                        {showReviewForm && selectedBookingForReview && (
                            <div className="mb-6">
                                <ReviewForm
                                    bookingId={selectedBookingForReview.id}
                                    haunterId={selectedBookingForReview.haunterName}
                                    haunterName={selectedBookingForReview.haunterName}
                                    propertyId={selectedBookingForReview.propertyId}
                                    propertyTitle={selectedBookingForReview.propertyTitle}
                                    onSubmit={handleReviewSubmit}
                                    onCancel={() => {
                                        setShowReviewForm(false);
                                        setSelectedBookingForReview(null);
                                    }}
                                />
                            </div>
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
                                                    Viewed on {new Date(booking.viewingDate).toLocaleDateString()} • {booking.haunterName}
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
                            {myReviews.length > 0 ? (
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

            case "comparison":
                return (
                    <div className="space-y-4">
                        {comparisonList.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                        Comparing {comparisonList.length} {comparisonList.length === 1 ? "Property" : "Properties"}
                                    </h3>
                                    <button
                                        onClick={clearComparison}
                                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <th className="p-4 text-left font-semibold">Feature</th>
                                                {comparisonList.map((property) => (
                                                    <th key={property.id} className="p-4 text-left font-semibold min-w-[250px]">
                                                        <div className="relative aspect-w-4 aspect-h-3 mb-3 rounded-xl overflow-hidden">
                                                            <Image
                                                                fill
                                                                src={property.images[0]}
                                                                alt={property.title}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <p className="line-clamp-2">{property.title}</p>
                                                        <button
                                                            onClick={() => removeFromComparison(property.id.toString())}
                                                            className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <i className="las la-times mr-1"></i>
                                                            Remove
                                                        </button>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="p-4 font-medium">Monthly Rent</td>
                                                {comparisonList.map((property) => (
                                                    <td key={property.id} className="p-4">
                                                        <span className="text-lg font-bold text-primary-600">
                                                            KES {property.rent.toLocaleString()}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="p-4 font-medium">Deposit</td>
                                                {comparisonList.map((property) => (
                                                    <td key={property.id} className="p-4">
                                                        KES {property.deposit.toLocaleString()}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="p-4 font-medium">Layout</td>
                                                {comparisonList.map((property) => (
                                                    <td key={property.id} className="p-4 capitalize">
                                                        {property.layout}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="p-4 font-medium">Bathrooms</td>
                                                {comparisonList.map((property) => (
                                                    <td key={property.id} className="p-4">
                                                        {property.bathrooms}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="p-4 font-medium">Location</td>
                                                {comparisonList.map((property) => (
                                                    <td key={property.id} className="p-4">
                                                        {property.location.generalArea}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="p-4 font-medium">Amenities</td>
                                                {comparisonList.map((property) => (
                                                    <td key={property.id} className="p-4">
                                                        <div className="space-y-1">
                                                            {property.amenities.slice(0, 3).map((amenity) => (
                                                                <div key={amenity} className="text-sm">
                                                                    <i className="las la-check text-primary-600 mr-1"></i>
                                                                    {amenity}
                                                                </div>
                                                            ))}
                                                            {property.amenities.length > 3 && (
                                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                    +{property.amenities.length - 3} more
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center">
                                <i className="las la-balance-scale text-6xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                                <h3 className="font-semibold mb-2">No Properties to Compare</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    Add properties to your comparison list to see them side by side!
                                </p>
                                <Link href={"/listing-stay" as Route}>
                                    <ButtonPrimary>
                                        <i className="las la-search mr-2"></i>
                                        Browse Properties
                                    </ButtonPrimary>
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case "messages":
                const activeConversation = bookings.find((b) => b.id === selectedConversation);

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h3 className="font-semibold text-lg">Messages</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    {bookings.length} conversations
                                </p>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: "calc(600px - 80px)" }}>
                                {bookings.map((booking) => (
                                    <button
                                        key={booking.id}
                                        onClick={() => setSelectedConversation(booking.id)}
                                        className={`w-full p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left ${selectedConversation === booking.id ? "bg-primary-50 dark:bg-primary-900/20" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                                <i className="las la-user-tie text-xl text-neutral-500 dark:text-neutral-400"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold truncate">{booking.haunterName}</h4>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">2h</span>
                                                </div>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                                                    {booking.propertyTitle}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1">
                                                    See you at the viewing!
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Chat Panel */}
                        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col">
                            {activeConversation ? (
                                <>
                                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                    <i className="las la-user-tie text-lg text-neutral-500 dark:text-neutral-400"></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{activeConversation.haunterName}</h3>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {activeConversation.haunterPhone}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${activeConversation.haunterPhone}`}
                                                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm"
                                            >
                                                <i className="las la-phone mr-1"></i>
                                                Call
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900">
                                        <div className="flex justify-end">
                                            <div className="max-w-md">
                                                <div className="bg-primary-600 text-white rounded-2xl px-4 py-3">
                                                    <p className="text-sm">
                                                        Hi! I&apos;m interested in viewing the property. Is {new Date(activeConversation.viewingDate).toLocaleDateString()} still available?
                                                    </p>
                                                </div>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 px-2 text-right">10:30 AM</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            <div className="max-w-md">
                                                <div className="bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3">
                                                    <p className="text-sm">
                                                        Yes! I&apos;ve confirmed your {activeConversation.packageTier} package. Looking forward to showing you around!
                                                    </p>
                                                </div>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 px-2">10:32 AM</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
                                                <i className="las la-paperclip text-2xl text-neutral-500 dark:text-neutral-400"></i>
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-neutral-50 dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-full text-sm font-normal h-11 px-4 py-3"
                                            />
                                            <button className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors font-medium">
                                                <i className="las la-paper-plane mr-1"></i>
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                                    <div className="text-center">
                                        <i className="las la-comments text-6xl mb-4"></i>
                                        <p>Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "search-requests":
                return (
                    <div className="space-y-6">
                        {loadingSearchRequests ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-6 w-1/3" />
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </div>
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : mySearchRequests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mySearchRequests.map((request) => (
                                    <SearchRequestCard
                                        key={request.id}
                                        request={request as SearchRequest}
                                        viewType="tenant"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center">
                                <i className="las la-search text-6xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                                <h3 className="font-semibold mb-2">No Search Requests Yet</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    Let professional house hunters find your perfect property!
                                </p>
                                <Link href={"/request-search" as Route}>
                                    <ButtonPrimary>
                                        <i className="las la-plus mr-2"></i>
                                        Create Search Request
                                    </ButtonPrimary>
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case "wallet":
                return <WalletManagement />;

            case "notifications":
                return <NotificationManager userRole="tenant" />;
        }
    };

    return (
        <div className="nc-TenantDashboard container pb-24 lg:pb-32">
            <main className="pt-11">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-semibold">My Dashboard</h2>
                            <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                                Manage your saved properties and bookings
                            </span>
                        </div>
                        <button
                            onClick={() => setIsIssueModalOpen(true)}
                            className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
                        >
                            <i className="las la-exclamation-circle mr-2"></i>
                            Report Issue
                        </button>
                    </div>

                    <CreateIssueModal
                        isOpen={isIssueModalOpen}
                        onClose={() => setIsIssueModalOpen(false)}
                        userRole="tenant"
                        userName="Jane Doe"
                        userId="tenant-1"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {bookingsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-12" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-heart text-2xl text-primary-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Saved Properties</p>
                                        <p className="text-2xl font-bold">{savedProperties.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-calendar-check text-2xl text-yellow-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Upcoming Viewings</p>
                                        <p className="text-2xl font-bold">
                                            {bookings.filter((b) => b.status === "upcoming").length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-check-circle text-2xl text-green-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
                                        <p className="text-2xl font-bold">
                                            {bookings.filter((b) => b.status === "completed").length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-comment text-2xl text-primary-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Messages</p>
                                        <p className="text-2xl font-bold">{bookings.length}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-neutral-200 dark:border-neutral-700">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("saved")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "saved"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-heart mr-1"></i>
                                Saved Properties ({savedProperties.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "bookings"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-calendar-check mr-1"></i>
                                My Bookings ({bookings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("comparison")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "comparison"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-balance-scale mr-1"></i>
                                Compare ({comparisonList.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "reviews"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-star mr-1"></i>
                                My Reviews ({myReviews.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("messages")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "messages"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-comment mr-1"></i>
                                Messages ({bookings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("search-requests")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "search-requests"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-search mr-1"></i>
                                My Requests ({mySearchRequests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("wallet")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "wallet"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-wallet mr-1"></i>
                                Wallet
                            </button>
                            <button
                                onClick={() => setActiveTab("notifications")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "notifications"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-bell mr-1"></i>
                                Notifications
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </main>
        </div>
    );
}
