"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";
import PostViewingModal from "../../../components/PostViewingModal";
import RescheduleModal from "@/components/RescheduleModal";
import RescheduleRequestCard from "@/components/RescheduleRequestCard";
import MeetingPointCard from "@/components/MeetingPointCard";
import AlternativeOfferModal from "@/components/AlternativeOfferModal";
import AlternativeOfferCard from "@/components/AlternativeOfferCard";
import DisputeResponseModal from "@/components/DisputeResponseModal";

interface Booking {
    id: string;
    property: any;
    tenant: any;
    hunter: any;
    amount: number;
    paymentStatus: string;
    scheduledDate: string;
    scheduledTime: string;
    scheduledEndTime: string;
    status: string;
    tenantConfirmed: boolean;
    hunterConfirmed: boolean;
    tenantMetConfirmed: boolean;
    hunterMetConfirmed: boolean;
    physicalMeetingConfirmed: boolean;
    viewingOutcome?: string;
    tenantFeedback?: string;
    meetingPoint?: any;
    rescheduleRequests?: any[];
    alternativeOffers?: any[];
    disputes?: any[];
    createdAt: string;
}

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPostViewingModal, setShowPostViewingModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showAlternativeModal, setShowAlternativeModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [timeUntilViewing, setTimeUntilViewing] = useState<string>("");
    const [isViewingTime, setIsViewingTime] = useState(false);

    const isHunter = user?.role === "HUNTER";
    const isTenant = user?.role === "TENANT";

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    useEffect(() => {
        if (!booking) return;

        const updateTimer = () => {
            const now = new Date();
            const viewingDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
            const diff = viewingDateTime.getTime() - now.getTime();

            if (diff <= 0) {
                setIsViewingTime(true);
                setTimeUntilViewing("Viewing time!");
            } else if (diff < 3600000) { // Less than 1 hour
                const minutes = Math.floor(diff / 60000);
                setTimeUntilViewing(`${minutes} minutes until viewing`);
                setIsViewingTime(true);
            } else if (diff < 86400000) { // Less than 24 hours
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                setTimeUntilViewing(`${hours}h ${minutes}m until viewing`);
            } else {
                const days = Math.floor(diff / 86400000);
                const hours = Math.floor((diff % 86400000) / 3600000);
                setTimeUntilViewing(`${days}d ${hours}h until viewing`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [booking]);

    const fetchBooking = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBooking(response.data);
        } catch (error: any) {
            console.error("Failed to fetch booking:", error);
            showToast("error", "Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmArrival = async () => {
        setActionLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/confirm-meeting`);
            showToast("success", "Meeting confirmed!");
            fetchBooking();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to confirm meeting");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReportNoShow = async () => {
        if (!confirm("Are you sure the other party didn't show up? This will create a dispute.")) return;

        setActionLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/report-no-show`, {
                reason: `${isHunter ? "Tenant" : "Hunter"} did not show up for scheduled viewing`
            });
            showToast("success", "No-show reported. Admin will review.");
            router.push(isHunter ? "/haunter-dashboard" : "/tenant-dashboard");
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to report no-show");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        const reason = prompt("Please enter a reason for cancellation:");
        if (reason === null) return;

        setActionLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/cancel`, { reason });
            showToast("success", "Booking cancelled");
            router.push(isHunter ? "/haunter-dashboard" : "/tenant-dashboard");
        } catch (error: any) {
            showToast("error", "Failed to cancel booking");
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewingComplete = () => {
        setShowPostViewingModal(true);
    };

    if (loading) {
        return (
            <div className="container py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container py-16 text-center">
                <h2 className="text-2xl font-semibold">Booking not found</h2>
            </div>
        );
    }

    const otherParty = isHunter ? booking.tenant : booking.hunter;
    const myMetConfirmed = isHunter ? booking.hunterMetConfirmed : booking.tenantMetConfirmed;
    const otherMetConfirmed = isHunter ? booking.tenantMetConfirmed : booking.hunterMetConfirmed;
    const pendingReschedule = booking.rescheduleRequests?.find(r => r.status === 'PENDING' || r.status === 'COUNTERED');
    const activeAlternativeOffer = booking.alternativeOffers?.find(o => o.status === 'PENDING');

    return (
        <div className="container py-8 lg:py-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4"
                        >
                            <i className="las la-arrow-left text-2xl mr-2"></i>
                            Back
                        </button>
                        <h1 className="text-3xl font-bold">Viewing Details</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                            Booking ID: {booking.id.slice(0, 8)}...
                        </p>
                    </div>
                    {booking.status === 'CONFIRMED' && !booking.physicalMeetingConfirmed && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRescheduleModal(true)}
                                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
                            >
                                <i className="las la-calendar-plus mr-1"></i>
                                Reschedule
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                            >
                                <i className="las la-times-circle mr-1"></i>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Reschedule Request Notification */}
                {pendingReschedule && (
                    <div className="mb-6">
                        <RescheduleRequestCard
                            request={pendingReschedule}
                            bookingId={booking.id}
                            currentDate={booking.scheduledDate}
                            currentTime={booking.scheduledTime}
                            isRequester={pendingReschedule.requestedBy === user?.id}
                            onUpdate={fetchBooking}
                        />
                    </div>
                )}

                {/* Alternative Offer Notification */}
                {activeAlternativeOffer && isTenant && (
                    <div className="mb-6">
                        <AlternativeOfferCard
                            bookingId={booking.id}
                            offer={activeAlternativeOffer}
                            onUpdate={fetchBooking}
                        />
                    </div>
                )}

                {/* Status Banner / Timer */}
                {booking.status === "CONFIRMED" && (
                    <div className={`border rounded-2xl p-6 mb-6 transition-all ${isViewingTime
                        ? "bg-primary-600 border-primary-700 text-white shadow-lg shadow-primary-500/20"
                        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isViewingTime ? "bg-white/20" : "bg-primary-50 dark:bg-primary-900/20"
                                    }`}>
                                    <i className={`las la-clock text-2xl ${isViewingTime ? "text-white" : "text-primary-600"}`}></i>
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isViewingTime ? "text-white" : "text-neutral-900 dark:text-neutral-100"}`}>
                                        {timeUntilViewing}
                                    </h3>
                                    <p className={`text-sm ${isViewingTime ? "text-white/80" : "text-neutral-500 dark:text-neutral-400"}`}>
                                        {new Date(booking.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {booking.scheduledTime}
                                    </p>
                                </div>
                            </div>
                            {isViewingTime && !booking.physicalMeetingConfirmed && (
                                <div className="hidden md:block">
                                    <span className="px-4 py-2 bg-white text-primary-600 rounded-full text-sm font-bold animate-pulse">
                                        ACTION REQUIRED
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Arrival Confirmation Prompt (Prominent) */}
                {isViewingTime && booking.status === "CONFIRMED" && !booking.physicalMeetingConfirmed && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 rounded-2xl p-8 mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Have you met?</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                            Both you and the {isHunter ? "tenant" : "hunter"} must confirm your arrival to start the viewing process.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${myMetConfirmed ? "bg-green-50 border-green-500 text-green-700" : "bg-white dark:bg-neutral-800 border-neutral-200"
                                }`}>
                                <span className="font-medium">Your Status</span>
                                {myMetConfirmed ? (
                                    <span className="flex items-center gap-1 font-bold"><i className="las la-check-circle text-xl"></i> Confirmed</span>
                                ) : (
                                    <span className="text-neutral-400 italic">Waiting...</span>
                                )}
                            </div>
                            <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${otherMetConfirmed ? "bg-green-50 border-green-500 text-green-700" : "bg-white dark:bg-neutral-800 border-neutral-200"
                                }`}>
                                <span className="font-medium">{isHunter ? "Tenant" : "Hunter"} Status</span>
                                {otherMetConfirmed ? (
                                    <span className="flex items-center gap-1 font-bold"><i className="las la-check-circle text-xl"></i> Confirmed</span>
                                ) : (
                                    <span className="text-neutral-400 italic">Waiting...</span>
                                )}
                            </div>
                        </div>

                        {!myMetConfirmed ? (
                            <ButtonPrimary
                                onClick={handleConfirmArrival}
                                loading={actionLoading}
                                className="w-full py-4 text-lg"
                            >
                                <i className="las la-check-circle mr-2 text-xl"></i>
                                I Have Met the {isHunter ? "Tenant" : "Hunter"}
                            </ButtonPrimary>
                        ) : !otherMetConfirmed ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm font-medium">Waiting for {isHunter ? "tenant" : "hunter"} to confirm...</p>
                                </div>
                                <button
                                    onClick={handleReportNoShow}
                                    disabled={actionLoading}
                                    className="text-red-600 hover:underline text-sm font-medium"
                                >
                                    They haven't shown up? Report No-Show
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Property Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-6">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-48 md:h-auto relative">
                            <Image
                                fill
                                src={booking.property.images?.[0] || "/placeholder.jpg"}
                                alt={booking.property.title}
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 p-6">
                            <h2 className="text-2xl font-semibold mb-2">{booking.property.title}</h2>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                <i className="las la-map-marker mr-1"></i>
                                {booking.property.location?.generalArea || "Location"}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Amount Paid</p>
                                    <p className="text-xl font-bold text-primary-600">
                                        KES {booking.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Payment Status</p>
                                    <p className="font-medium capitalize">{booking.paymentStatus.toLowerCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meeting Point Card */}
                <div className="mb-6">
                    <MeetingPointCard
                        bookingId={booking.id}
                        meetingPoint={booking.meetingPoint}
                        isHunter={isHunter}
                        onUpdate={fetchBooking}
                    />
                </div>

                {/* Other Party Info */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {isHunter ? "Tenant" : "House Hunter"} Information
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden relative">
                            {otherParty.avatarUrl ? (
                                <Image fill src={otherParty.avatarUrl} alt={otherParty.name} className="object-cover" />
                            ) : (
                                <i className="las la-user text-3xl text-neutral-500"></i>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{otherParty.name}</p>
                            <p className="text-neutral-500 dark:text-neutral-400">{otherParty.phone}</p>
                        </div>
                        <div className="ml-auto">
                            <a
                                href={`tel:${otherParty.phone}`}
                                className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors"
                            >
                                <i className="las la-phone text-xl"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Complete Viewing Button (Tenant Only) */}
                {isTenant && booking.physicalMeetingConfirmed && !booking.viewingOutcome && (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8 shadow-lg border-primary-100">
                        <h3 className="text-xl font-bold mb-2">Viewing in Progress</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Once you've finished viewing the property, please let us know the outcome. This will release the payment to the hunter or allow you to report an issue.
                        </p>
                        <ButtonPrimary onClick={handleViewingComplete} className="w-full py-4">
                            <i className="las la-clipboard-check mr-2 text-xl"></i>
                            Submit Viewing Outcome
                        </ButtonPrimary>
                    </div>
                )}

                {/* Offer Alternative Button (Hunter Only, if requested) */}
                {isHunter && booking.viewingOutcome === 'ALTERNATIVE_REQUESTED' && booking.status !== 'CANCELLED' && (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Offer Alternative Property</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            The tenant requested an alternative. You can offer another property from your listings.
                        </p>
                        <ButtonPrimary onClick={() => setShowAlternativeModal(true)} className="w-full">
                            <i className="las la-exchange-alt mr-2"></i>
                            Offer Alternative
                        </ButtonPrimary>
                    </div>
                )}

                {/* Dispute Response (Hunter Only) */}
                {isHunter && booking.viewingOutcome === 'ISSUE_REPORTED' && booking.status !== 'CANCELLED' && (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-red-200 dark:border-red-900/30 p-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Issue Reported by Tenant</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            The tenant has reported an issue with this viewing. Please provide your response and any evidence to help resolve the dispute.
                        </p>
                        <ButtonPrimary onClick={() => setShowDisputeModal(true)} className="w-full !bg-red-600 hover:!bg-red-700">
                            <i className="las la-gavel mr-2"></i>
                            Respond to Dispute
                        </ButtonPrimary>
                    </div>
                )}

                {/* Viewing Outcome */}
                {booking.viewingOutcome && (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Viewing Outcome</h3>
                        <div className={`p-4 rounded-xl ${booking.viewingOutcome === "COMPLETED_SATISFIED"
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                            : booking.viewingOutcome === "ISSUE_REPORTED"
                                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            }`}>
                            <p className="font-semibold">
                                {booking.viewingOutcome === "COMPLETED_SATISFIED" && "✅ Viewing Completed Successfully"}
                                {booking.viewingOutcome === "ISSUE_REPORTED" && "⚠️ Issue Reported - Under Review"}
                                {booking.viewingOutcome === "ALTERNATIVE_REQUESTED" && "🔄 Alternative Requested"}
                            </p>
                            {booking.tenantFeedback && (
                                <p className="text-sm mt-2 text-neutral-600 dark:text-neutral-400">
                                    Feedback: {booking.tenantFeedback}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showPostViewingModal && (
                <PostViewingModal
                    bookingId={booking.id}
                    onClose={() => setShowPostViewingModal(false)}
                    onSuccess={() => {
                        setShowPostViewingModal(false);
                        fetchBooking();
                    }}
                />
            )}

            {showRescheduleModal && (
                <RescheduleModal
                    bookingId={booking.id}
                    currentDate={booking.scheduledDate}
                    currentTime={booking.scheduledTime}
                    currentLocation={booking.meetingPoint?.location}
                    onClose={() => setShowRescheduleModal(false)}
                    onSuccess={() => {
                        setShowRescheduleModal(false);
                        fetchBooking();
                    }}
                />
            )}

            {showAlternativeModal && (
                <AlternativeOfferModal
                    bookingId={booking.id}
                    onClose={() => setShowAlternativeModal(false)}
                    onSuccess={() => {
                        setShowAlternativeModal(false);
                        fetchBooking();
                    }}
                />
            )}

            {showDisputeModal && (
                <DisputeResponseModal
                    disputeId={booking.disputes?.[0]?.id}
                    onClose={() => setShowDisputeModal(false)}
                    onSuccess={() => {
                        setShowDisputeModal(false);
                        fetchBooking();
                    }}
                />
            )}
        </div>
    );
}
