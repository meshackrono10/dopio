"use client";

import React, { useState } from "react";
import Image from "next/image";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface ViewingRequestCardProps {
    request: any;
    userRole: "HUNTER" | "TENANT";
    onUpdate: () => void;
}

export default function ViewingRequestCard({ request, userRole, onUpdate }: ViewingRequestCardProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [showAcceptForm, setShowAcceptForm] = useState(false);
    const [acceptLocation, setAcceptLocation] = useState("");

    const proposedDates = request.proposedDates || [];
    const firstDate = proposedDates[0] || {};

    const [counterDate, setCounterDate] = useState(request.counterDate ? request.counterDate.split('T')[0] : (proposedDates[0]?.date ? proposedDates[0].date.split('T')[0] : ""));
    const [counterTime, setCounterTime] = useState(request.counterTime || proposedDates[0]?.timeSlot || "10:00");
    const [counterLocation, setCounterLocation] = useState(() => {
        const loc = request.counterLocation || request.proposedLocation || request.property?.location?.generalArea || "";
        if (typeof loc === 'string' && loc.startsWith('{')) {
            try {
                return JSON.parse(loc).name || loc;
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
                return parsed.name || parsed.location || parsed.address || parsed.generalArea || rawLoc;
            } catch (e) {
                return rawLoc;
            }
        }
        if (typeof rawLoc === 'object' && rawLoc !== null) {
            return rawLoc.name || rawLoc.location || rawLoc.address || rawLoc.generalArea || JSON.stringify(rawLoc);
        }
        return rawLoc;
    };
    const displayLocation = getDisplayLocation();

    const myId = userRole === "HUNTER" ? request.property?.hunterId : request.tenantId;
    const status = (request.status || "PENDING").toUpperCase();

    const isMyTurn = (status === "PENDING" && userRole === "HUNTER") || (status === "COUNTERED" && request.counteredBy !== myId);
    const canEdit = (status === "PENDING" && userRole === "TENANT") || (status === "COUNTERED" && request.counteredBy === myId);
    const canCancel = (status === "PENDING" || status === "COUNTERED");
    const paymentStatus = (request.paymentStatus || "").toUpperCase();
    const canAccept = isMyTurn && paymentStatus === "ESCROW";
    const canCounter = isMyTurn || canEdit;

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
        if (!confirm("Are you sure you want to reject this viewing request? The tenant will be refunded.")) return;

        setLoading(true);
        try {
            await api.post(`/viewing-requests/${request.id}/reject`, {
                reason: "Not available at the proposed time"
            });
            showToast("success", "Request rejected. Tenant will be refunded.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to reject request");
        } finally {
            setLoading(false);
        }
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

    const getStatusBadge = () => {
        const statusColors = {
            PENDING: "bg-yellow-100 text-yellow-800",
            ACCEPTED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
            COUNTERED: "bg-blue-100 text-blue-800",
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Property Image */}
                <div className="lg:w-48 h-32 relative rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                        fill
                        src={request.property?.images[0] || "/placeholder.jpg"}
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
                    {(isMyTurn || canEdit) && (
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
                                            ✅ Accept Proposal
                                        </ButtonPrimary>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={() => setShowCounterForm(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ✏️ Edit My Proposal
                                        </button>
                                    )}
                                    {!canEdit && canCounter && (
                                        <button
                                            onClick={() => setShowCounterForm(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-neutral-800 text-white rounded-full hover:bg-neutral-900 transition-colors shadow-sm font-medium disabled:opacity-50 flex items-center justify-center"
                                        >
                                            🔄 Counter-Propose
                                        </button>
                                    )}
                                    {canCancel && (
                                        <button
                                            onClick={userRole === "TENANT" ? handleRejectCounter : handleReject}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-6 py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                                        >
                                            ❌ {userRole === "TENANT" ? "Cancel Request" : "Reject Request"}
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

                    {!isMyTurn && request.status !== "ACCEPTED" && request.status !== "REJECTED" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                ⏳ Waiting for the other party to respond to the proposal...
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
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-green-900 dark:text-green-100">
                                ✅ Viewing confirmed! Check your bookings tab for details.
                            </p>
                        </div>
                    )}

                    {status === "REJECTED" && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <p className="text-sm text-red-900 dark:text-red-100">
                                ❌ This request was {userRole === "TENANT" ? "declined" : "rejected"}.
                                {userRole === "TENANT" && " You will be refunded shortly."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
