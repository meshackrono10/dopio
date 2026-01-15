"use client";

import React, { useState, useEffect } from "react";
import { SearchRequest, TimeframeExtension } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

interface TimeframeTrackerProps {
    request: SearchRequest;
    userRole: "hunter" | "tenant";
    onRequestExtension?: (hours: number, reason: string) => void;
    onApproveExtension?: (extensionId: string) => void;
    onRejectExtension?: (extensionId: string) => void;
}

export default function TimeframeTracker({
    request,
    userRole,
    onRequestExtension,
    onApproveExtension,
    onRejectExtension
}: TimeframeTrackerProps) {
    const [timeRemaining, setTimeRemaining] = useState("");
    const [showExtensionForm, setShowExtensionForm] = useState(false);
    const [extensionHours, setExtensionHours] = useState(24);
    const [extensionReason, setExtensionReason] = useState("");

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const deadline = new Date(request.deadline);
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining("Expired");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [request.deadline]);

    const getProgressPercentage = () => {
        const start = new Date(request.claimedAt || request.createdAt);
        const deadline = new Date(request.deadline);
        const now = new Date();

        const total = deadline.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));

        return 100 - percentage; // Invert so it counts down
    };

    const handleExtensionSubmit = () => {
        if (!extensionReason.trim()) {
            alert("Please provide a reason for the extension");
            return;
        }

        if (onRequestExtension) {
            onRequestExtension(extensionHours, extensionReason);
        }

        setShowExtensionForm(false);
        setExtensionReason("");
        setExtensionHours(24);
    };

    const percentage = getProgressPercentage();
    const isUrgent = percentage < 20;
    const isWarning = percentage < 40 && percentage >= 20;

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Timeframe</h3>
                {timeRemaining !== "Expired" && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isUrgent
                        ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : isWarning
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                            : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        }`}>
                        {timeRemaining}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Time Remaining</span>
                    <span className="font-semibold">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${isUrgent
                            ? "bg-red-600"
                            : isWarning
                                ? "bg-yellow-600"
                                : "bg-green-600"
                            }`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Deadline Info */}
            <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Started:</span>
                    <span className="font-medium">
                        {new Date(request.claimedAt || request.createdAt).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Deadline:</span>
                    <span className="font-medium">
                        {new Date(request.deadline).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Extension Requests */}
            {request.timeframeExtensions && request.timeframeExtensions.length > 0 && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mb-4">
                    <h4 className="font-semibold mb-3">Extension Requests</h4>
                    <div className="space-y-2">
                        {request.timeframeExtensions.map((ext) => (
                            <div
                                key={ext.id}
                                className={`p-3 rounded-lg border ${ext.status === "approved"
                                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                    : ext.status === "rejected"
                                        ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                        : "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">+{ext.hours}h extension</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ext.status === "approved"
                                        ? "bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                        : ext.status === "rejected"
                                            ? "bg-red-200 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                            : "bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                        }`}>
                                        {ext.status}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">{ext.reason}</p>

                                {ext.status === "pending" && userRole === "tenant" && (
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => onApproveExtension?.(String(ext.id))}
                                            className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onRejectExtension?.(String(ext.id))}
                                            className="flex-1 px-3 py-1 border border-red-600 text-red-600 rounded text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hunter: Request Extension */}
            {userRole === "hunter" && request.status === "in_progress" && (
                <div>
                    {!showExtensionForm ? (
                        <ButtonSecondary
                            onClick={() => setShowExtensionForm(true)}
                            className="w-full"
                        >
                            <i className="las la-clock mr-2"></i>
                            Request Extension
                        </ButtonSecondary>
                    ) : (
                        <div className="space-y-3 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Extension Hours</label>
                                <select
                                    value={extensionHours}
                                    onChange={(e) => setExtensionHours(parseInt(e.target.value))}
                                    className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                >
                                    <option value="12">12 hours</option>
                                    <option value="24">24 hours (1 day)</option>
                                    <option value="48">48 hours (2 days)</option>
                                    <option value="72">72 hours (3 days)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Reason</label>
                                <textarea
                                    value={extensionReason}
                                    onChange={(e) => setExtensionReason(e.target.value)}
                                    rows={3}
                                    placeholder="Explain why you need more time..."
                                    className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal px-4 py-3"
                                />
                            </div>
                            <div className="flex gap-2">
                                <ButtonPrimary onClick={handleExtensionSubmit} className="flex-1">
                                    Submit Request
                                </ButtonPrimary>
                                <ButtonSecondary
                                    onClick={() => {
                                        setShowExtensionForm(false);
                                        setExtensionReason("");
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </ButtonSecondary>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Warnings */}
            {isUrgent && request.status === "in_progress" && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <i className="las la-exclamation-triangle text-red-600 text-xl"></i>
                        <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Urgent!</p>
                            <p className="text-xs text-red-700 dark:text-red-400">
                                Less than 20% of time remaining. Complete soon or request extension.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
