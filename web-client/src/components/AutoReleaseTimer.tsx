"use client";

import React, { useState, useEffect } from "react";

interface AutoReleaseTimerProps {
    releaseDate: string;
    depositAmount: number;
    hunterName: string;
    onRelease?: () => void;
}

export default function AutoReleaseTimer({
    releaseDate,
    depositAmount,
    hunterName,
    onRelease
}: AutoReleaseTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const release = new Date(releaseDate);
            const now = new Date();
            const diff = release.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeRemaining("Payment Released");
                if (onRelease) {
                    onRelease();
                }
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
    }, [releaseDate, onRelease]);

    const getProgressPercentage = () => {
        // Assuming 7 days auto-release period
        const total = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const release = new Date(releaseDate);
        const now = new Date();
        const elapsed = release.getTime() - now.getTime();

        return Math.max(0, Math.min(100, (elapsed / total) * 100));
    };

    const percentage = getProgressPercentage();

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-bold text-lg">Escrow Auto-Release</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Payment to {hunterName}
                    </p>
                </div>
                {!isExpired && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                        {timeRemaining}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Time Until Auto-Release</span>
                    <span className="font-semibold">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${isExpired
                                ? "bg-green-600"
                                : percentage < 20
                                    ? "bg-red-600"
                                    : percentage < 50
                                        ? "bg-yellow-600"
                                        : "bg-blue-600"
                            }`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Amount */}
            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Escrow Amount</span>
                    <span className="text-2xl font-bold text-primary-600">
                        KES {depositAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Status */}
            {isExpired ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <i className="las la-check-circle text-green-600 text-2xl"></i>
                        <div>
                            <p className="font-semibold text-green-800 dark:text-green-300 mb-1">
                                Payment Released
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                KES {depositAmount.toLocaleString()} has been automatically released to {hunterName}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <i className="las la-info-circle text-blue-600 text-xl"></i>
                        <div>
                            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                                <strong>Auto-Release Protection:</strong> Payment will be automatically released on{" "}
                                {new Date(releaseDate).toLocaleDateString()} at{" "}
                                {new Date(releaseDate).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                You can manually release payment earlier or request a refund if unsatisfied.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
