"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import { Route } from "@/routers/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ConfirmationModal from "@/components/ConfirmationModal";
import IssueReportModal from "@/components/IssueReportModal";
import ReviewModal from "@/components/ReviewModal";

interface ViewingRequestCardProps {
    request: any;
    userRole: "HUNTER" | "TENANT";
    onUpdate: () => void;
}

export default function ViewingRequestCard({ request, userRole, onUpdate }: ViewingRequestCardProps) {
    console.log(`DEBUG: Rendering ViewingRequestCard for request ${request.id}`, { status: request.status, userRole });

    // Date diagnostics
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const rawDate = request.counterDate || (request.proposedDates && request.proposedDates[0]?.date);
    let isToday = false;
    let bDateStr = "N/A";

    if (rawDate) {
        const bDate = new Date(rawDate);
        bDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
        isToday = today.getFullYear() === bDate.getFullYear() &&
            today.getMonth() === bDate.getMonth() &&
            today.getDate() === bDate.getDate();
    }

    console.log(`DEBUG: Date check for Card ${request.id}:`, { today: todayStr, scheduled: bDateStr, isToday });

    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [showAcceptForm, setShowAcceptForm] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [acceptLocation, setAcceptLocation] = useState("");
    const [showReportIssueModal, setShowReportIssueModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Unified confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText?: string;
        onConfirm: () => void;
        confirmButtonClass?: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    const proposedDates = request.proposedDates || [];
    const firstDate = proposedDates[0] || {};

    const [counterDate, setCounterDate] = useState(request.counterDate ? request.counterDate.split('T')[0] : (proposedDates[0]?.date ? proposedDates[0].date.split('T')[0] : ""));
    const [counterTime, setCounterTime] = useState(request.counterTime || proposedDates[0]?.timeSlot || "10:00");
    const [counterLocation, setCounterLocation] = useState(() => {
        const loc = request.counterLocation || request.proposedLocation || request.property?.location?.generalArea || "";
        if (typeof loc === 'object' && loc !== null) {
            return loc.name || loc.location || loc.address || loc.generalArea || (typeof loc === 'string' ? loc : '');
        }
        if (typeof loc === 'string' && loc.startsWith('{')) {
            try {
                const parsed = JSON.parse(loc);
                return parsed.name || parsed.location || parsed.address || parsed.generalArea || loc;
            } catch (e) {
                return loc;
            }
        }
        return loc;
    });

    // Use counter values if they exist, otherwise use the first proposed date
    const displayDate = request.counterDate
        ? new Date(request.counterDate).toLocaleDateString()
        : (firstDate.date ? new Date(firstDate.date).toLocaleDateString() : "TBD");
    const displayTime = request.counterTime || firstDate.timeSlot || "TBD";

    // Robust location display with fallbacks
    const getDisplayLocation = () => {
        const rawLoc = request.counterLocation || request.proposedLocation || request.property?.location || "TBD";
        if (typeof rawLoc === 'string' && rawLoc.startsWith('{')) {
            try {
                const parsed = JSON.parse(rawLoc);
                const loc = parsed.name || parsed.location || parsed.address || parsed.generalArea || rawLoc;
                return typeof loc === 'string' ? loc : JSON.stringify(loc);
            } catch (e) {
                return rawLoc;
            }
        }
        if (typeof rawLoc === 'object' && rawLoc !== null) {
            const loc = rawLoc.name || rawLoc.location || rawLoc.address || rawLoc.generalArea;
            if (loc && typeof loc === 'string') return loc;
            if (loc && typeof loc === 'object') return JSON.stringify(loc);
            return JSON.stringify(rawLoc);
        }
        return rawLoc;
    };
    const displayLocation = getDisplayLocation();

    const booking = request.booking;
    const isMeetingInProgress = booking?.status === 'IN_PROGRESS' || booking?.physicalMeetingConfirmed;
    const myId = userRole === "HUNTER" ? request.property?.hunterId : request.tenantId;
    const status = (request.status || "PENDING").toUpperCase();
    const otherRoleLabel = userRole === "HUNTER" ? "TENANT" : "HUNTER";
    const partnerId = userRole === "HUNTER" ? request.tenantId : request.property?.agentId || request.property?.hunterId;

    const isMyTurn = !isMeetingInProgress && ((status === "PENDING" && userRole === "HUNTER") || (status === "COUNTERED" && request.counteredBy !== myId));
    const canEdit = !isMeetingInProgress && ((status === "PENDING" && userRole === "TENANT") || (status === "COUNTERED" && request.counteredBy === myId) || (status === "ACCEPTED"));
    const canCancel = (status === "PENDING" || status === "COUNTERED" || status === "ACCEPTED") && (!isMeetingInProgress || userRole === "HUNTER");
    const paymentStatus = (request.paymentStatus || "").toUpperCase();
    const canAccept = isMyTurn && paymentStatus === "ESCROW" && status !== "ACCEPTED";
    const canCounter = isMyTurn || canEdit || status === "ACCEPTED";

    // Hunter Actions
    const handleAccept = async () => {
        setLoading(true);
        try {
            // When accepting, send the scheduled details (especially important for countered requests)
            const payload: any = {};

            // If this is a countered request, use the counter values
            if (request.status === 'COUNTERED') {
                payload.scheduledDate = request.counterDate;
                payload.scheduledTime = request.counterTime;
                payload.location = request.counterLocation;
            } else {
                // For pending requests, use the proposed values and optional acceptLocation
                payload.scheduledDate = firstDate.date;
                payload.scheduledTime = firstDate.timeSlot;
                if (acceptLocation) {
                    payload.location = JSON.stringify({
                        type: "LANDMARK",
                        name: acceptLocation,
                        location: acceptLocation
                    });
                }
            }

            await api.post(`/viewing-requests/${request.id}/accept`, payload);
            showToast("success", "Viewing request accepted! Booking created.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept request");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Reject Viewing Request",
            description: `Are you sure you want to reject this viewing request? ${userRole === "TENANT" ? "The booking will be cancelled and refund processed." : "The tenant will be refunded."}`,
            confirmText: "Yes, Reject",
            confirmButtonClass: "!bg-red-600 hover:!bg-red-700 text-white",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    if (request.bookingId) {
                        await api.post(`/bookings/${request.bookingId}/cancel`, {
                            reason: "Cancelled by hunter after meetup confirmed"
                        });
                    } else {
                        await api.post(`/viewing-requests/${request.id}/reject`, {
                            reason: "Not available at the proposed time"
                        });
                    }
                    showToast("success", request.bookingId ? "Booking cancelled successfully" : "Request rejected successfully");
                    onUpdate();
                } catch (error: any) {
                    showToast("error", error.response?.data?.message || `Failed to ${request.bookingId ? 'cancel booking' : 'reject request'}`);
                } finally {
                    setLoading(false);
                }
            }
        });
    };


    const handleCounter = async () => {
        if (!counterDate || !counterTime) {
            showToast("error", "Please select a date and time");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/viewing-requests/${request.id}/counter`, {
                date: new Date(counterDate).toISOString(),
                time: counterTime,
                location: JSON.stringify({
                    type: "LANDMARK",
                    name: counterLocation,
                    location: counterLocation
                }),
                message: `${canEdit ? 'Updated' : 'Counter-proposal'}: ${new Date(counterDate).toLocaleDateString()} at ${counterTime} at ${counterLocation}`
            });
            showToast("success", "Counter-proposal sent");
            setShowCounterForm(false);
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to send counter-proposal");
        } finally {
            setLoading(false);
        }
    };

    // Tenant Actions (for countered requests)
    const handleAcceptCounter = async () => {
        setLoading(true);
        try {
            // Send the counter values when accepting
            const payload = {
                scheduledDate: request.counterDate,
                scheduledTime: request.counterTime,
                location: request.counterLocation
            };

            await api.post(`/viewing-requests/${request.id}/accept`, payload);
            showToast("success", "Counter-proposal accepted! Booking confirmed.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectCounter = async () => {
        setLoading(true);
        try {
            await api.post(`/viewing-requests/${request.id}/reject`, {
                reason: "Counter-proposal not acceptable"
            });
            showToast("success", "Request canceled. You will be refunded.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to reject");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: "Delete from View",
            description: "Are you sure you want to remove this from your dashboard? This will NOT delete it for the other party.",
            confirmText: "Yes, Remove",
            confirmButtonClass: "!bg-red-600 hover:!bg-red-700 text-white",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    // Decide which endpoint to use based on whether it's a booking or just a request
                    const endpoint = request.bookingId ? `/bookings/${request.bookingId}` : `/viewing-requests/${request.id}`;
                    await api.delete(endpoint);
                    showToast("success", "Item removed from your view");
                    onUpdate();
                } catch (error: any) {
                    showToast("error", error.response?.data?.message || "Failed to remove item");
                    setLoading(false);
                }
            }
        });
    };

    const getStatusBadge = () => {
        const statusColors = {
            REJECTED: "bg-red-100 text-red-800",
            COUNTERED: "bg-blue-100 text-blue-800",
            CANCELLED: "bg-neutral-100 text-neutral-800",
        };

        const displayStatus = status === "CANCELLED" ? "CANCELED" : status;

        return (
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
                    {displayStatus}
                </span>
                {(status === "REJECTED" || status === "CANCELLED" || status === "COMPLETED") && (
                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete from my view"
                    >
                        <i className="las la-trash-alt text-lg"></i>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Property Image */}
                <div className="lg:w-48 h-32 relative rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                        fill
                        src={(() => {
                            const images = request.property?.images;
                            if (Array.isArray(images) && images.length > 0) return images[0];
                            if (typeof images === 'string') {
                                try {
                                    const parsed = JSON.parse(images);
                                    return Array.isArray(parsed) ? parsed[0] : parsed;
                                } catch (e) {
                                    return images;
                                }
                            }
                            return "/placeholder.jpg";
                        })()}
                        alt={request.property?.title || "Property"}
                        className="object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">{request.property?.title || "Property"}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {(() => {
                                    const loc = request.property?.location;
                                    if (typeof loc === 'string') {
                                        try {
                                            const parsed = JSON.parse(loc);
                                            return parsed.generalArea || parsed.name || loc;
                                        } catch (e) {
                                            return loc;
                                        }
                                    }
                                    return loc?.generalArea || loc?.name || "Location";
                                })()}
                            </p>
                        </div>
                        {getStatusBadge()}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {userRole === "HUNTER" ? "Tenant" : "House Hunter"}
                            </p>
                            <p className="font-medium">
                                {userRole === "HUNTER" ? request.tenant?.name : request.property?.hunter?.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Date & Time</p>
                            <p className="font-medium">{displayDate} at {displayTime}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Meeting Location</p>
                            <p className="font-medium">
                                {displayLocation}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Amount</p>
                            <p className="font-medium text-primary-600">KES {request.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Payment Status</p>
                            <p className="font-medium">{paymentStatus === "ESCROW" ? "In Escrow" : paymentStatus}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    {(status === "PENDING" || status === "COUNTERED" || status === "ACCEPTED") && (
                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            {!showCounterForm ? (
                                <div className="flex flex-wrap gap-2 w-full">
                                    {canAccept && !showAcceptForm && (
                                        <ButtonPrimary
                                            onClick={() => {
                                                if (userRole === "HUNTER" && status === "PENDING") {
                                                    setShowAcceptForm(true);
                                                } else {
                                                    handleAccept();
                                                }
                                            }}
                                            loading={loading}
                                            className="flex-1 sm:flex-none"
                                        >
                                            <i className="las la-check-circle mr-2"></i>
                                            Accept Proposal
                                        </ButtonPrimary>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={() => setShowCounterForm(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:opacity-50 flex items-center justify-center"
                                        >
                                            <i className="las la-edit mr-2"></i>
                                            Edit Proposal
                                        </button>
                                    )}
                                    {!canEdit && canCounter && (
                                        <button
                                            onClick={() => setShowCounterForm(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-neutral-800 text-white rounded-full hover:bg-neutral-900 transition-colors shadow-sm font-medium disabled:opacity-50 flex items-center justify-center"
                                        >
                                            <i className="las la-history mr-2"></i>
                                            Edit Proposal
                                        </button>
                                    )}
                                    {canCancel && (
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-6 py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
                                        >
                                            <i className="las la-times-circle mr-2"></i>
                                            Cancel Request
                                        </button>
                                    )}
                                </div>
                            ) : showAcceptForm ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Set Meeting Location (Optional):</p>
                                    <input
                                        type="text"
                                        value={acceptLocation}
                                        onChange={(e) => setAcceptLocation(e.target.value)}
                                        placeholder="e.g., Meet at Shell Petrol Station"
                                        className="w-full rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                    />
                                    <div className="flex gap-2">
                                        <ButtonPrimary onClick={handleAccept} loading={loading} className="flex-1">
                                            Confirm & Accept
                                        </ButtonPrimary>
                                        <button
                                            onClick={() => setShowAcceptForm(false)}
                                            className="px-4 py-2 border border-neutral-300 rounded-full hover:bg-neutral-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">
                                        {canEdit ? "Edit Your Proposal:" : "Propose Alternative Details:"}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={counterDate}
                                                onChange={(e) => setCounterDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Time</label>
                                            <select
                                                value={counterTime}
                                                onChange={(e) => setCounterTime(e.target.value)}
                                                className="w-full rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                            >
                                                {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">Meeting Location</label>
                                        <input
                                            type="text"
                                            value={counterLocation}
                                            onChange={(e) => setCounterLocation(e.target.value)}
                                            placeholder="e.g., Meet at Shell Petrol Station"
                                            className="w-full rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <ButtonPrimary onClick={handleCounter} loading={loading} className="flex-1">
                                            {canEdit ? "Update Request" : "Send Counter-Proposal"}
                                        </ButtonPrimary>
                                        <button
                                            onClick={() => setShowCounterForm(false)}
                                            className="px-4 py-2 border border-neutral-300 rounded-full hover:bg-neutral-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isMyTurn && status === "COUNTERED" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                ⏳ Waiting for the other party to respond to the counter-proposal...
                            </p>
                        </div>
                    )}

                    {/* Status messages */}
                    {userRole === "TENANT" && request.status === "PENDING" && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                            <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                ⏳ Waiting for House Hunter to confirm your viewing request. You can still edit your proposal below if needed.
                            </p>
                        </div>
                    )}

                    {status === "ACCEPTED" && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-4">
                            <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                                ✅ Viewing confirmed! {isToday ? (
                                    request.booking?.status === 'IN_PROGRESS'
                                        ? "The viewing is currently in progress."
                                        : "The viewing is scheduled for today."
                                ) : "Check your bookings tab for details."}
                            </p>

                            {isToday && (
                                <div className="space-y-3">
                                    {(() => {
                                        const booking = request.booking;
                                        if (!booking) return null;

                                        const hasCurrentConfirmed = userRole === "HUNTER" ? booking.hunterMetConfirmed : booking.tenantMetConfirmed;
                                        const hasOtherConfirmed = userRole === "HUNTER" ? booking.tenantMetConfirmed : booking.hunterMetConfirmed;
                                        const otherRoleLabel = userRole === "HUNTER" ? "TENANT" : "HUNTER";

                                        if (hasCurrentConfirmed && hasOtherConfirmed) {
                                            const isIssueReporter = booking.issueReporterId === myId;
                                            const hasPendingIssue = booking.issueCreated && booking.issueStatus === 'PENDING';

                                            return (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold bg-green-100 dark:bg-green-800/40 p-3 rounded-lg animate-pulse">
                                                        <i className="las la-users text-xl"></i>
                                                        MEETUP CONFIRMED - VIEWING IN PROGRESS
                                                    </div>

                                                    {hasPendingIssue ? (
                                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                                            <h4 className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-2">
                                                                <i className="las la-exclamation-circle text-xl"></i>
                                                                {isIssueReporter ? "You reported an issue" : `${otherRoleLabel} reported an issue`}
                                                            </h4>
                                                            <p className="text-sm text-orange-700 dark:text-orange-300 mb-4 italic">
                                                                &quot;{booking.tenantFeedback}&quot;
                                                            </p>

                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                {userRole === "HUNTER" ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                isOpen: true,
                                                                                title: "Accept Issue",
                                                                                description: "Are you sure you want to ACCEPT this issue? This will cancel the viewing and refund the tenant.",
                                                                                confirmText: "Accept Issue",
                                                                                confirmButtonClass: "!bg-green-600 hover:!bg-green-700 text-white",
                                                                                onConfirm: async () => {
                                                                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                                    setLoading(true);
                                                                                    try {
                                                                                        await api.post(`/bookings/${booking.id}/respond-issue`, { action: 'ACCEPT' });
                                                                                        showToast("success", "Issue accepted. Viewing cancelled.");
                                                                                        onUpdate();
                                                                                    } catch (error: any) {
                                                                                        showToast("error", error.response?.data?.message || "Failed to accept issue");
                                                                                    } finally {
                                                                                        setLoading(false);
                                                                                    }
                                                                                }
                                                                            })}
                                                                            disabled={loading}
                                                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                                                                        >
                                                                            <i className="las la-check"></i>
                                                                            ACCEPT ISSUE
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                isOpen: true,
                                                                                title: "Deny Issue",
                                                                                description: "Are you sure you want to DENY this issue? This will open an admin dispute.",
                                                                                confirmText: "Deny Issue",
                                                                                confirmButtonClass: "!bg-red-600 hover:!bg-red-700 text-white",
                                                                                onConfirm: async () => {
                                                                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                                    setLoading(true);
                                                                                    try {
                                                                                        await api.post(`/bookings/${booking.id}/respond-issue`, { action: 'DENY' });
                                                                                        showToast("warning", "Issue denied. Dispute opened for admin.");
                                                                                        onUpdate();
                                                                                    } catch (error: any) {
                                                                                        showToast("error", error.response?.data?.message || "Failed to deny issue");
                                                                                    } finally {
                                                                                        setLoading(false);
                                                                                    }
                                                                                }
                                                                            })}
                                                                            disabled={loading}
                                                                            className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2"
                                                                        >
                                                                            <i className="las la-times"></i>
                                                                            DENY ISSUE
                                                                        </button>
                                                                    </>
                                                                ) : isIssueReporter && (
                                                                    <button
                                                                        onClick={() => setConfirmModal({
                                                                            isOpen: true,
                                                                            title: "Withdraw Issue",
                                                                            description: "Are you sure you want to withdraw this issue?",
                                                                            confirmText: "Withdraw",
                                                                            confirmButtonClass: "!bg-neutral-600 hover:!bg-neutral-700 text-white",
                                                                            onConfirm: async () => {
                                                                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                                setLoading(true);
                                                                                try {
                                                                                    await api.post(`/bookings/${booking.id}/cancel-issue`);
                                                                                    showToast("success", "Issue withdrawn.");
                                                                                    onUpdate();
                                                                                } catch (error: any) {
                                                                                    showToast("error", error.response?.data?.message || "Failed to withdraw issue");
                                                                                } finally {
                                                                                    setLoading(false);
                                                                                }
                                                                            }
                                                                        })}
                                                                        disabled={loading}
                                                                        className="w-full px-4 py-2 border-2 border-neutral-400 text-neutral-600 rounded-lg hover:bg-neutral-50 font-bold text-sm flex items-center justify-center gap-2"
                                                                    >
                                                                        <i className="las la-undo"></i>
                                                                        CANCEL/WITHDRAW ISSUE
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : booking.issueStatus === 'DENIED' ? (
                                                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-center">
                                                            <p className="text-sm font-bold text-red-700 dark:text-red-300">
                                                                🚨 ISSUE DISPUTED - WAITING FOR ADMIN RESOLUTION
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            {!(userRole === "HUNTER" ? booking.hunterDone : booking.tenantDone) ? (
                                                                <button
                                                                    onClick={() => setConfirmModal({
                                                                        isOpen: true,
                                                                        title: "Complete Viewing",
                                                                        description: "Are you satisfied with the viewing? This will release payment once both parties confirm.",
                                                                        confirmText: "Mark as Done",
                                                                        confirmButtonClass: "!bg-primary-600 hover:!bg-primary-700 text-white",
                                                                        onConfirm: async () => {
                                                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                            setLoading(true);
                                                                            try {
                                                                                await api.post(`/bookings/${booking.id}/done`);
                                                                                showToast("success", "Marked as completed!");
                                                                                if (userRole === "TENANT") {
                                                                                    setShowReviewModal(true);
                                                                                }
                                                                                onUpdate();
                                                                            } catch (error: any) {
                                                                                showToast("error", error.response?.data?.message || "Failed to mark done");
                                                                            } finally {
                                                                                setLoading(false);
                                                                            }
                                                                        }
                                                                    })}
                                                                    disabled={loading}
                                                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold text-sm shadow-md flex items-center justify-center gap-2"
                                                                >
                                                                    <i className="las la-check-double"></i>
                                                                    MARK AS SATISFIED (DONE)
                                                                </button>
                                                            ) : (
                                                                <div className="flex-1 text-sm text-neutral-500 italic p-3 border border-dashed border-neutral-300 rounded-lg text-center flex items-center justify-center gap-2">
                                                                    <i className="las la-clock"></i>
                                                                    Waiting for {otherRoleLabel.toLowerCase()} to finish...
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => setShowReportIssueModal(true)}
                                                                disabled={loading}
                                                                className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2"
                                                            >
                                                                <i className="las la-exclamation-triangle"></i>
                                                                REPORT ISSUE
                                                            </button>

                                                            {userRole === "HUNTER" && (
                                                                <button
                                                                    onClick={() => setShowCancelModal(true)}
                                                                    disabled={loading}
                                                                    className="px-4 py-3 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 font-bold text-sm flex items-center justify-center gap-2"
                                                                >
                                                                    <i className="las la-times-circle"></i>
                                                                    CANCEL VIEWING
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (hasCurrentConfirmed && !hasOtherConfirmed) {
                                            return (
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                                                        You have confirmed your presence. Waiting for the {otherRoleLabel.toLowerCase()} to confirm...
                                                    </div>
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                                                        <div className="bg-green-500 h-full w-1/2 rounded-full"></div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                onClick={async () => {
                                                    setLoading(true);
                                                    try {
                                                        const bId = booking.id;
                                                        await api.post(`/bookings/${bId}/confirm-meeting`);
                                                        showToast("success", "Presence confirmed!");
                                                        onUpdate();
                                                    } catch (error: any) {
                                                        showToast("error", error.response?.data?.message || "Failed to confirm meeting");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                disabled={loading}
                                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <i className="las la-check-circle text-xl"></i>
                                                {hasOtherConfirmed
                                                    ? `CONFIRM I MET ${otherRoleLabel} (THEY ARE HERE)`
                                                    : `CONFIRM I MET ${otherRoleLabel}`}
                                            </button>
                                        );
                                    })()}

                                    {booking && (
                                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                            <Link
                                                href={`/booking-detail/${booking.id}` as Route}
                                                className="flex-1 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm font-medium text-center flex items-center justify-center gap-2"
                                            >
                                                <i className="las la-info-circle"></i>
                                                VIEW DETAILS
                                            </Link>
                                            <Link
                                                href={`/${userRole.toLowerCase()}-dashboard?tab=messages&partnerId=${partnerId}` as Route}
                                                className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium text-center flex items-center justify-center gap-2"
                                            >
                                                <i className="las la-comment"></i>
                                                CHAT WITH {otherRoleLabel}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(status === "REJECTED" || status === "CANCELLED" || status === "COMPLETED") && (
                        <div className="space-y-3">
                            <div className={`${status === "COMPLETED" ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"} p-4 rounded-lg`}>
                                <p className={`text-sm ${status === "COMPLETED" ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"}`}>
                                    {status === "COMPLETED" ? "✅ Viewing Completed Successfully." : (
                                        <>
                                            ❌ This request was {status === "CANCELLED" ? "canceled" : "rejected"}.
                                            {userRole === "TENANT" && status !== "CANCELLED" && " You will be refunded shortly."}
                                            {status === "CANCELLED" && " Refund process initiated."}
                                        </>
                                    )}
                                </p>
                            </div>

                            {status === "COMPLETED" && userRole === "TENANT" && (
                                (() => {
                                    const hasReviewed = booking?.reviews?.some((r: any) => r.type === 'TENANT_TO_HUNTER');
                                    if (hasReviewed) return null;

                                    return (
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="w-full px-4 py-2.6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                        >
                                            <i className="las la-star"></i>
                                            LEAVE A REVIEW
                                        </button>
                                    );
                                })()
                            )}
                        </div>
                    )}
                </div>

                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    hunterName={request.property.hunter?.name}
                    onConfirm={async (rating, comment) => {
                        setLoading(true);
                        try {
                            await api.post("/reviews", {
                                bookingId: booking.id,
                                rating,
                                comment
                            });
                            showToast("success", "Thank you for your review!");
                            setShowReviewModal(false);
                            onUpdate();
                        } catch (error: any) {
                            showToast("error", error.response?.data?.message || "Failed to submit review");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    loading={loading}
                />
                <ConfirmationModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={() => {
                        setShowCancelModal(false);
                        userRole === "TENANT" ? handleRejectCounter() : handleReject();
                    }}
                    title="Cancel Viewing Request"
                    description={`Are you sure you want to cancel this viewing request? ${userRole === "TENANT" ? "You will be refunded shortly." : "The tenant will be refunded."}`}
                    confirmText="Yes, Cancel Request"
                    loading={loading}
                />

                {/* Unified Confirmation Modal */}
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmText={confirmModal.confirmText}
                    confirmButtonClass={confirmModal.confirmButtonClass}
                    loading={loading}
                />

                {/* Issue Reporting Modal */}
                <IssueReportModal
                    isOpen={showReportIssueModal}
                    onClose={() => setShowReportIssueModal(false)}
                    onConfirm={async (feedback) => {
                        setShowReportIssueModal(false);
                        setLoading(true);
                        try {
                            await api.post(`/bookings/${booking.id}/outcome`, {
                                outcome: "ISSUE_REPORTED",
                                feedback
                            });
                            showToast("warning", "Issue reported. Waiting for hunter response.");
                            onUpdate();
                        } catch (error: any) {
                            showToast("error", error.response?.data?.message || "Failed to report issue");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    loading={loading}
                />
            </div>
        </div>
    );
}
