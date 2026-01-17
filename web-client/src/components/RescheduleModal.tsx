"use client";

import React, { useState } from "react";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface RescheduleModalProps {
    bookingId: string;
    currentDate: string;
    currentTime: string;
    currentLocation?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RescheduleModal({
    bookingId,
    currentDate,
    currentTime,
    currentLocation,
    onClose,
    onSuccess,
}: RescheduleModalProps) {
    const { showToast } = useToast();
    const [proposedDate, setProposedDate] = useState("");
    const [proposedTime, setProposedTime] = useState("10:00");
    const [proposedLocation, setProposedLocation] = useState(currentLocation || "");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!proposedDate || !proposedTime) {
            showToast("error", "Please select a date and time");
            return;
        }

        setSubmitting(true);
        try {
            console.log("Sending reschedule request:", {
                proposedDate: new Date(proposedDate).toISOString(),
                proposedTime,
                proposedLocation,
                reason: reason || "Requesting to reschedule",
            });
            await api.post(`/bookings/${bookingId}/reschedule`, {
                proposedDate: new Date(proposedDate).toISOString(),
                proposedTime,
                proposedLocation,
                reason: reason || "Requesting to reschedule",
            });

            showToast("success", "Reschedule request sent!");
            onSuccess();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to send reschedule request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-lg w-full">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Reschedule Viewing</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <i className="las la-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Schedule */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                            Current Schedule
                        </p>
                        <p className="font-semibold">
                            {new Date(currentDate).toLocaleDateString()} at {currentTime}
                        </p>
                    </div>

                    {/* New Schedule */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Propose New Date & Time
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={proposedDate}
                                    onChange={(e) => setProposedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                    Time
                                </label>
                                <select
                                    value={proposedTime}
                                    onChange={(e) => setProposedTime(e.target.value)}
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                                >
                                    {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* New Location */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Meeting Location
                        </label>
                        <input
                            type="text"
                            value={proposedLocation}
                            onChange={(e) => setProposedLocation(e.target.value)}
                            placeholder="e.g., Meet at Shell Petrol Station"
                            className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reason (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why do you need to reschedule?"
                            rows={3}
                            className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <i className="las la-info-circle mr-1"></i>
                            The other party will be notified and can accept, reject, or propose a different time.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <ButtonPrimary
                        onClick={handleSubmit}
                        loading={submitting}
                        className="flex-1"
                    >
                        Send Request
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
