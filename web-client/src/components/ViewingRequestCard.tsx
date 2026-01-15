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
    const [counterDate, setCounterDate] = useState("");
    const [counterTime, setCounterTime] = useState("10:00");

    const proposedDates = request.proposedDates || [];
    const firstDate = proposedDates[0] || {};
    const proposedDate = firstDate.date ? new Date(firstDate.date).toLocaleDateString() : "TBD";
    const proposedTime = firstDate.timeSlot || "TBD";

    // Hunter Actions
    const handleAccept = async () => {
        setLoading(true);
        try {
            await api.post(`/viewing-requests/${request.id}/accept`);
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
                proposedDates: [{
                    date: new Date(counterDate).toISOString(),
                    timeSlot: counterTime
                }],
                message: `How about ${new Date(counterDate).toLocaleDateString()} at ${counterTime} instead?`
            });
            showToast("success", "Counter-proposal sent to tenant");
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
            await api.post(`/viewing-requests/${request.id}/accept`);
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[request.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
                {request.status}
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
                                {request.property?.location?.generalArea || "Location"}
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
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Proposed Date & Time</p>
                            <p className="font-medium">{proposedDate} at {proposedTime}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Amount</p>
                            <p className="font-medium text-primary-600">KES {request.invoice?.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Payment Status</p>
                            <p className="font-medium">{request.invoice?.status === "ESCROW" ? "In Escrow" : request.invoice?.status}</p>
                        </div>
                    </div>

                    {/* Actions for HUNTER */}
                    {userRole === "HUNTER" && request.status === "PENDING" && request.invoice?.status === "ESCROW" && (
                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            {!showCounterForm ? (
                                <div className="flex flex-wrap gap-2">
                                    <ButtonPrimary
                                        onClick={handleAccept}
                                        loading={loading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        ✅ Accept
                                    </ButtonPrimary>
                                    <button
                                        onClick={() => setShowCounterForm(true)}
                                        disabled={loading}
                                        className="flex-1 sm:flex-none px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        🔄 Counter-Propose
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="flex-1 sm:flex-none px-6 py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Propose Alternative Date & Time:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="date"
                                            value={counterDate}
                                            onChange={(e) => setCounterDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                        />
                                        <select
                                            value={counterTime}
                                            onChange={(e) => setCounterTime(e.target.value)}
                                            className="rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                        >
                                            {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <ButtonPrimary onClick={handleCounter} loading={loading} className="flex-1">
                                            Send Counter-Proposal
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

                    {/* Actions for TENANT (Countered requests) */}
                    {userRole === "TENANT" && request.status === "COUNTERED" && (
                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    🔄 House Hunter proposed a new time:
                                </p>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {proposedDate} at {proposedTime}
                                </p>
                                {request.message && (
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">"{request.message}"</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <ButtonPrimary
                                    onClick={handleAcceptCounter}
                                    loading={loading}
                                    className="flex-1"
                                >
                                    Accept New Time
                                </ButtonPrimary>
                                <button
                                    onClick={handleRejectCounter}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    Decline & Get Refund
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status messages */}
                    {userRole === "TENANT" && request.status === "PENDING" && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                ⏳ Waiting for House Hunter to confirm your viewing request...
                            </p>
                        </div>
                    )}

                    {request.status === "ACCEPTED" && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-green-900 dark:text-green-100">
                                ✅ Viewing confirmed! Check your bookings tab for details.
                            </p>
                        </div>
                    )}

                    {request.status === "REJECTED" && (
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
