"use client";

import React, { useState, useEffect } from "react";
import { MOCK_PROPERTIES, MOCK_HAUNTERS, getReviewsByHaunterId, MOCK_SEARCH_REQUESTS } from "@/data/mockData";
import { getAvailableSearchRequests } from "@/data/mockData";
import { SearchRequest } from "@/data/types";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { Route } from "@/routers/types";
import CreateIssueModal from "@/components/CreateIssueModal";
import HaunterReviewCard, { HaunterReview } from "@/components/HaunterReviewCard";
import SearchRequestCard from "@/components/SearchRequestCard";
import BidSubmissionForm from "@/components/BidSubmissionForm";
import WalletManagement from "@/components/WalletManagement";
import NotificationManager from "@/components/NotificationManager";
import { getSearchRequests } from "@/services/searchRequest";
import Skeleton from "@/shared/Skeleton";
import { useToast } from "@/components/Toast";
import VerificationBanner from "@/components/VerificationBanner";

interface Booking {
    id: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    tenantName: string;
    tenantPhone: string;
    packageTier: string;
    amount: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    viewingDate: string;
    bookingDate: string;
}

type TabType = "bookings" | "listings" | "earnings" | "reviews" | "messages" | "search-requests" | "wallet" | "notifications";

import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import { useProperties } from "@/contexts/PropertyContext";

export default function HaunterDashboard() {
    const { user } = useAuth();
    const { bookings: allBookings, loading: bookingsLoading } = useBookings();
    const { properties: allProperties } = useProperties();

    const haunterProperties = allProperties.filter((p) => p.houseHaunter.id === user?.id);
    const [activeTab, setActiveTab] = useState<TabType>("bookings");
    const [selectedConversation, setSelectedConversation] = useState<string | undefined>();
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [showBidForm, setShowBidForm] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    // Get available search requests
    const [availableRequests, setAvailableRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchRequests = async () => {
            setLoadingRequests(true);
            try {
                const data = await getSearchRequests();
                setAvailableRequests(data);
            } catch (err) {
                console.error("Failed to fetch search requests:", err);
                showToast("error", "Failed to fetch search requests. Please try again.");
            } finally {
                setLoadingRequests(false);
            }
        };
        fetchRequests();
    }, [showToast]);

    const myActiveRequests: any[] = availableRequests.filter(r => r.assignedHaunterId === user?.id);

    // Get haunter reviews
    const haunterReviews: any[] = [];

    const haunterBookings = allBookings.filter(b => b.haunterId === user?.id);

    const bookings = haunterBookings.map(b => ({
        id: b.id.toString(),
        propertyId: b.propertyId.toString(),
        propertyTitle: b.propertyTitle,
        propertyImage: b.propertyImage,
        tenantName: b.tenantName,
        tenantPhone: "Contact via Chat", // Hide phone for privacy if needed
        packageTier: b.packageName,
        amount: b.price,
        status: b.status as any,
        viewingDate: b.scheduledDate,
        bookingDate: b.createdAt,
    }));

    const totalEarnings = bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.amount * 0.85, 0);

    const pendingEarnings = bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.amount * 0.85, 0);

    // Initialize first conversation when component mounts
    React.useEffect(() => {
        if (!selectedConversation && bookings.length > 0) {
            setSelectedConversation(bookings[0].id);
        }
    }, [bookings, selectedConversation]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300";
            case "pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";
            case "completed":
                return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
            default:
                return "bg-neutral-100 text-neutral-700";
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "bookings":
                return (
                    <div className="space-y-4">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
                                >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="flex-1 flex gap-4">
                                            <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    fill
                                                    src={booking.propertyImage}
                                                    alt={booking.propertyTitle}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg line-clamp-2">{booking.propertyTitle}</h3>
                                                <div className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                                                    <p>
                                                        <i className="las la-user mr-1"></i>
                                                        {booking.tenantName}
                                                    </p>
                                                    <p>
                                                        <i className="las la-phone mr-1"></i>
                                                        {booking.tenantPhone}
                                                    </p>
                                                    <p>
                                                        <i className="las la-calendar mr-1"></i>
                                                        Viewing: {new Date(booking.viewingDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between lg:w-64">
                                            <div>
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {booking.status}
                                                </span>
                                                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                                                    {booking.packageTier} Package
                                                </p>
                                                <p className="text-2xl font-bold mt-1 text-primary-600">
                                                    KES {booking.amount.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    You earn: KES {(booking.amount * 0.85).toLocaleString()}
                                                </p>
                                            </div>

                                            {booking.status === "pending" && (
                                                <div className="flex gap-2 mt-4">
                                                    <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                                        Accept
                                                    </button>
                                                    <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-secondary-500 transition-colors text-sm font-medium">
                                                        Decline
                                                    </button>
                                                </div>
                                            )}

                                            {booking.status === "confirmed" && (
                                                <Link
                                                    href={"/chat" as Route}
                                                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
                                                >
                                                    <i className="las la-comment mr-1"></i>
                                                    Chat with Tenant
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center">
                                <i className="las la-calendar-times text-6xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                                <h3 className="font-semibold mb-2">No Bookings Yet</h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    You don&apos;t have any viewing bookings yet.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case "listings":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {haunterProperties.map((property) => (
                            <div
                                key={property.id}
                                className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="aspect-w-4 aspect-h-3 relative">
                                    <Image
                                        fill
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                                            Active
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                        {property.location.generalArea}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xl font-bold text-primary-600">
                                            KES {property.rent.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">/month</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Link
                                            href={`/property/${property.id}` as Route}
                                            className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium text-center"
                                        >
                                            View
                                        </Link>
                                        <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center min-h-[300px] hover:border-primary-500 transition-colors cursor-pointer">
                            <div className="text-center p-6">
                                <i className="las la-plus-circle text-6xl text-neutral-400 mb-4"></i>
                                <h3 className="font-semibold text-lg mb-2">Add New Listing</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Create a new property listing
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "earnings":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-wallet text-3xl text-green-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Earned</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            KES {totalEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-clock text-3xl text-yellow-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Pending Payout</p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            KES {pendingEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                            <h3 className="text-xl font-semibold mb-4">Earnings History</h3>
                            <div className="space-y-4">
                                {bookings.filter((b) => b.status === "completed").map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{booking.tenantName}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {new Date(booking.viewingDate).toLocaleDateString()} • {booking.packageTier} Package
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                +KES {(booking.amount * 0.85).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Paid to M-Pesa</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "messages":
                const activeConversation = bookings.find((b) => b.id === selectedConversation);

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        {/* Left Sidebar - Conversations List */}
                        <div className="lg:col-span-1 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h3 className="font-semibold text-lg">Messages</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    {bookings.filter((b) => b.status !== "cancelled").length} conversations
                                </p>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: "calc(600px - 80px)" }}>
                                {bookings.filter((b) => b.status !== "cancelled").map((booking) => (
                                    <button
                                        key={booking.id}
                                        onClick={() => setSelectedConversation(booking.id)}
                                        className={`w-full p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left ${selectedConversation === booking.id ? "bg-primary-50 dark:bg-primary-900/20" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                                <i className="las la-user text-xl text-neutral-500"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold truncate">{booking.tenantName}</h4>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">2h</span>
                                                </div>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                                                    {booking.propertyTitle}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1">
                                                    Looking forward to the viewing...
                                                </p>
                                            </div>
                                            {booking.status === "pending" && (
                                                <div className="w-3 h-3 bg-primary-600 rounded-full flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Chat Window */}
                        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col">
                            {activeConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                    <i className="las la-user text-lg text-neutral-500"></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{activeConversation.tenantName}</h3>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {activeConversation.tenantPhone}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${activeConversation.tenantPhone}`}
                                                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm"
                                            >
                                                <i className="las la-phone mr-1"></i>
                                                Call
                                            </a>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900">
                                        {/* Sample Messages */}
                                        <div className="flex justify-start">
                                            <div className="max-w-md">
                                                <div className="bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3">
                                                    <p className="text-sm">
                                                        Hi! I&apos;m interested in viewing {activeConversation.propertyTitle}. Is it still available?
                                                    </p>
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1 px-2">10:30 AM</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="max-w-md">
                                                <div className="bg-primary-600 text-white rounded-2xl px-4 py-3">
                                                    <p className="text-sm">
                                                        Yes, it&apos;s available! I&apos;ve confirmed your {activeConversation.packageTier} package viewing.
                                                    </p>
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1 px-2 text-right">10:32 AM</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            <div className="max-w-md">
                                                <div className="bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3">
                                                    <p className="text-sm">Great! What time works best for you on {new Date(activeConversation.viewingDate).toLocaleDateString()}?</p>
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1 px-2">10:35 AM</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="max-w-md">
                                                <div className="bg-primary-600 text-white rounded-2xl px-4 py-3">
                                                    <p className="text-sm">
                                                        2 PM works perfectly. I&apos;ll share the exact location closer to the date. Looking forward to showing you around!
                                                    </p>
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1 px-2 text-right">10:37 AM</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
                                                <i className="las la-paperclip text-2xl text-neutral-500"></i>
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
                                <div className="flex-1 flex items-center justify-center text-neutral-400">
                                    <div className="text-center">
                                        <i className="las la-comments text-6xl mb-4"></i>
                                        <p>Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "reviews":
                const averageRating = haunterReviews.length > 0
                    ? (haunterReviews.reduce((sum, r) => sum + r.rating, 0) / haunterReviews.length).toFixed(1)
                    : "0.0";

                const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
                    rating,
                    count: haunterReviews.filter(r => r.rating === rating).length,
                    percentage: haunterReviews.length > 0
                        ? Math.round((haunterReviews.filter(r => r.rating === rating).length / haunterReviews.length) * 100)
                        : 0
                }));

                return (
                    <div className="space-y-6">
                        {/* Review Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-primary-600 mb-2">{averageRating}</div>
                                    <div className="flex justify-center items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <i
                                                key={i}
                                                className={`las la-star text-2xl ${i < Math.round(parseFloat(averageRating))
                                                    ? "text-yellow-500"
                                                    : "text-neutral-300 dark:text-neutral-600"
                                                    }`}
                                            ></i>
                                        ))}
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-300">
                                        Based on {haunterReviews.length} {haunterReviews.length === 1 ? "review" : "reviews"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <h3 className="font-semibold mb-4">Rating Breakdown</h3>
                                {ratingDistribution.map(({ rating, count, percentage }) => (
                                    <div key={rating} className="flex items-center gap-3 mb-3">
                                        <span className="text-sm font-medium w-8">{rating} <i className="las la-star text-yellow-500"></i></span>
                                        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-600"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400 w-12 text-right">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                            <h3 className="text-xl font-semibold mb-6">
                                All Reviews ({haunterReviews.length})
                            </h3>
                            {haunterReviews.length > 0 ? (
                                <div className="divide-y divide-neutral-200 dark:border-neutral-700">
                                    {haunterReviews.map((review) => (
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
                                        No reviews yet. Complete some viewings to start receiving reviews!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "search-requests":
                return (
                    <div className="space-y-6">
                        {/* Available Requests */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">
                                Available Requests ({loadingRequests ? "..." : availableRequests.length})
                            </h3>
                            {loadingRequests ? (
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
                            ) : availableRequests.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableRequests.map((request) => (
                                        <SearchRequestCard
                                            key={request.id}
                                            request={request as SearchRequest}
                                            viewType="hunter"
                                            onBidClick={() => {
                                                setSelectedRequestId(request.id);
                                                setShowBidForm(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-12 text-center">
                                    <i className="las la-search text-6xl text-neutral-400 mb-4"></i>
                                    <h4 className="font-semibold mb-2">No Available Requests</h4>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Check back later for new search requests in your area!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* My Active Requests */}
                        {myActiveRequests.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">
                                    My Active Requests ({myActiveRequests.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myActiveRequests.map((request) => (
                                        <SearchRequestCard
                                            key={request.id}
                                            request={request as SearchRequest}
                                            viewType="hunter"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bid Submission Modal */}
                        {showBidForm && selectedRequestId && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                    <BidSubmissionForm
                                        requestId={selectedRequestId}
                                        onSuccess={() => {
                                            setShowBidForm(false);
                                            setSelectedRequestId(null);
                                        }}
                                        onCancel={() => {
                                            setShowBidForm(false);
                                            setSelectedRequestId(null);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "wallet":
                return (
                    <WalletManagement />
                );

            case "notifications":
                return <NotificationManager userRole="hunter" />;
        }
    };

    return (
        <div className="nc-HaunterDashboard container pb-24 lg:pb-32">
            <main className="pt-11">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-semibold">House Haunter Dashboard</h2>
                            <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                                Manage your listings and bookings
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsIssueModalOpen(true)}
                                disabled={user?.verificationStatus !== "APPROVED"}
                                className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="las la-exclamation-circle mr-2"></i>
                                Report Issue
                            </button>
                            <button
                                disabled={user?.verificationStatus !== "APPROVED"}
                                onClick={() => {
                                    if (user?.verificationStatus === "APPROVED") {
                                        window.location.href = "/add-listing";
                                    } else {
                                        alert("Please complete verification before adding listings");
                                    }
                                }}
                                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="las la-plus mr-2"></i>
                                Add Listing
                            </button>
                        </div>
                    </div>

                    <CreateIssueModal
                        isOpen={isIssueModalOpen}
                        onClose={() => setIsIssueModalOpen(false)}
                        userRole="haunter"
                        userName={user?.name || ""}
                        userId={user?.id?.toString() || ""}
                    />
                </div>

                {/* Verification Banner */}
                <VerificationBanner />

                {/* Stats Grid */}
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
                                        <i className="las la-home text-2xl text-primary-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Listings</p>
                                        <p className="text-2xl font-bold">{haunterProperties.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-calendar-check text-2xl text-yellow-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Pending Bookings</p>
                                        <p className="text-2xl font-bold">
                                            {bookings.filter((b) => b.status === "pending").length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-wallet text-2xl text-green-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Earned</p>
                                        <p className="text-2xl font-bold">KES {totalEarnings.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                                        <i className="las la-star text-2xl text-primary-600"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Rating</p>
                                        <p className="text-2xl font-bold">{(user as any)?.rating || 5.0} ⭐</p>
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
                                onClick={() => setActiveTab("bookings")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "bookings"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-calendar-check mr-1"></i>
                                Bookings ({bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled").length})
                            </button>
                            <button
                                onClick={() => setActiveTab("listings")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "listings"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-home mr-1"></i>
                                My Listings ({haunterProperties.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("earnings")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "earnings"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-wallet mr-1"></i>
                                Earnings
                            </button>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "reviews"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-star mr-1"></i>
                                Reviews ({haunterReviews.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("messages")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "messages"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-comment mr-1"></i>
                                Messages
                                {bookings.filter((b) => b.status === "pending").length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white rounded-full text-xs">
                                        {bookings.filter((b) => b.status === "pending").length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("search-requests")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "search-requests"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                <i className="las la-search mr-1"></i>
                                Search Requests
                                {availableRequests.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-green-600 text-white rounded-full text-xs">
                                        {availableRequests.length}
                                    </span>
                                )}
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
