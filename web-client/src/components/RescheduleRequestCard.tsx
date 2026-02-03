"use client";

import React, { useState } from "react";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface RescheduleRequest {
    id: string;
    requestedBy: string;
    proposedDate: string;
    proposedTime: string;
    proposedLocation?: string;
    reason?: string;
    status: string;
    counterDate?: string;
    counterTime?: string;
    counterLocation?: string;
    counterReason?: string;
}

interface RescheduleRequestCardProps {
    request: RescheduleRequest;
    bookingId: string;
    currentDate: string;
    currentTime: string;
    isRequester: boolean;
    onUpdate: () => void;
}

export default function RescheduleRequestCard({
    request,
    bookingId,
    currentDate,
    currentTime,
    isRequester,
    onUpdate,
}: RescheduleRequestCardProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [counterDate, setCounterDate] = useState("");
    const [counterTime, setCounterTime] = useState("10:00");
    const [counterLocation, setCounterLocation] = useState(request.proposedLocation || "");
    const [counterReason, setCounterReason] = useState("");

    const handleAccept = async () => {
        setLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/reschedule/${request.id}/respond`, {
                action: 'ACCEPT',
            });
            showToast("success", "Reschedule request accepted!");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept request");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this reschedule request?")) return;

        setLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/reschedule/${request.id}/respond`, {
                action: 'REJECT',
            });
            showToast("success", "Reschedule request rejected");
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
            await api.post(`/bookings/${bookingId}/reschedule/${request.id}/respond`, {
                action: 'COUNTER',
                counterDate: new Date(counterDate).toISOString(),
                counterTime,
                counterLocation,
                counterReason: counterReason || "Counter-proposal",
            });
            showToast("success", "Counter-proposal sent!");
            setShowCounterForm(false);
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to send counter-proposal");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptCounter = async () => {
        setLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/reschedule/${request.id}/accept-counter`);
            showToast("success", "Counter-proposal accepted! Viewing rescheduled.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept counter-proposal");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        const statusColors = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
            COUNTERED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[request.status as keyof typeof statusColors]}`}>
                {request.status}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Reschedule Request</h3>
                {getStatusBadge()}
            </div>

            <div className="space-y-4">
                {/* Current Schedule */}
                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Current Schedule
                    </p>
                    <p className="font-medium">
                        {new Date(currentDate).toLocaleDateString()} at {currentTime}
                    </p>
                </div>

                {/* Proposed Schedule */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Proposed New Schedule
                    </p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                        {new Date(request.proposedDate).toLocaleDateString()} at {request.proposedTime}
                    </p>
                    {request.proposedLocation && (
                        <p className="text-sm font-medium mt-1">
                            <i className="las la-map-marker mr-1"></i>
                            Location: {typeof request.proposedLocation === 'object' ? JSON.stringify(request.proposedLocation) : request.proposedLocation}
                        </p>
                    )}
                    {request.reason && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                            Reason: {request.reason}
                        </p>
                    )}
                </div>

                {/* Counter-Proposal (if exists) */}
                {request.status === 'COUNTERED' && request.counterDate && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                            Counter-Proposal
                        </p>
                        <p className="font-medium text-purple-900 dark:text-purple-100">
                            {new Date(request.counterDate).toLocaleDateString()} at {request.counterTime}
                        </p>
                        {request.counterLocation && (
                            <p className="text-sm font-medium mt-1">
                                <i className="las la-map-marker mr-1"></i>
                                Location: {typeof request.counterLocation === 'object' ? JSON.stringify(request.counterLocation) : request.counterLocation}
                            </p>
                        )}
                        {request.counterReason && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                                {request.counterReason}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                {request.status === 'PENDING' && !isRequester && (
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
                                <input
                                    type="text"
                                    value={counterLocation}
                                    onChange={(e) => setCounterLocation(e.target.value)}
                                    placeholder="Alternative Meeting Location"
                                    className="w-full rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                />
                                <textarea
                                    value={counterReason}
                                    onChange={(e) => setCounterReason(e.target.value)}
                                    placeholder="Reason for counter-proposal (optional)"
                                    rows={2}
                                    className="w-full rounded-lg border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                />
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

                {/* Accept Counter (for original requester) */}
                {request.status === 'COUNTERED' && isRequester && (
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                        <div className="flex gap-2">
                            <ButtonPrimary
                                onClick={handleAcceptCounter}
                                loading={loading}
                                className="flex-1"
                            >
                                ✅ Accept Counter-Proposal
                            </ButtonPrimary>
                            <button
                                onClick={handleReject}
                                disabled={loading}
                                className="flex-1 px-6 py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                ❌ Decline
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {request.status === 'PENDING' && isRequester && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                            ⏳ Waiting for the other party to respond...
                        </p>
                    </div>
                )}

                {request.status === 'ACCEPTED' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-sm text-green-900 dark:text-green-100">
                            ✅ Reschedule accepted! Viewing has been rescheduled.
                        </p>
                    </div>
                )}

                {request.status === 'REJECTED' && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <p className="text-sm text-red-900 dark:text-red-100">
                            ❌ Reschedule request was rejected. Original schedule remains.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
