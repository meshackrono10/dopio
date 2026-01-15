"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function VerificationBanner() {
    const { user } = useAuth();

    // Only show for hunters who are not verified
    if (!user || user.role !== "HUNTER" || user.verificationStatus === "APPROVED") {
        return null;
    }

    const getStatusConfig = () => {
        switch (user.verificationStatus) {
            case "PENDING":
                return {
                    icon: "las la-clock",
                    title: "Verification Pending",
                    message: "Your documents are being reviewed. We'll notify you within 24-48 hours.",
                    color: "orange",
                    bgColor: "bg-orange-50 dark:bg-orange-900/20",
                    borderColor: "border-orange-200 dark:border-orange-800",
                    textColor: "text-orange-900 dark:text-orange-100",
                    iconColor: "text-orange-600",
                    showAction: false,
                };
            case "REJECTED":
                return {
                    icon: "las la-times-circle",
                    title: "Verification Rejected",
                    message: "Your verification was rejected. Please upload new documents and try again.",
                    color: "red",
                    bgColor: "bg-red-50 dark:bg-red-900/20",
                    borderColor: "border-red-200 dark:border-red-800",
                    textColor: "text-red-900 dark:text-red-100",
                    iconColor: "text-red-600",
                    showAction: true,
                    actionText: "Upload New Documents",
                };
            case "UNVERIFIED":
            default:
                return {
                    icon: "las la-exclamation-triangle",
                    title: "Verification Required",
                    message: "You need to verify your account to access hunter features. Please upload your ID document.",
                    color: "yellow",
                    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
                    borderColor: "border-yellow-200 dark:border-yellow-800",
                    textColor: "text-yellow-900 dark:text-yellow-100",
                    iconColor: "text-yellow-600",
                    showAction: true,
                    actionText: "Verify Account Now",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-6`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <i className={`${config.icon} text-3xl ${config.iconColor}`}></i>
                </div>
                <div className="flex-1">
                    <h3 className={`font-semibold ${config.textColor} mb-1`}>
                        {config.title}
                    </h3>
                    <p className={`text-sm ${config.textColor} opacity-90 mb-3`}>
                        {config.message}
                    </p>
                    {config.showAction && (
                        <Link
                            href="/haunter-onboarding"
                            className={`inline-flex items-center px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors text-sm font-medium`}
                        >
                            {config.actionText}
                            <i className="las la-arrow-right ml-2"></i>
                        </Link>
                    )}
                </div>
                {user.verificationStatus === "PENDING" && (
                    <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
