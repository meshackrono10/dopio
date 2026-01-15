"use client";

import React, { useState } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { MOCK_PROPERTIES } from "@/data/mockData";

type Property = typeof MOCK_PROPERTIES[0];

interface ComparisonButtonProps {
    property: Property;
    variant?: "default" | "icon-only";
    className?: string;
}

export default function ComparisonButton({
    property,
    variant = "default",
    className = ""
}: ComparisonButtonProps) {
    const { comparisonList, addToComparison, removeFromComparison, isInComparison, maxCompareCount } = useComparison();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [showTooltip, setShowTooltip] = useState(false);

    const isSelected = isInComparison(String(property.id));
    const isMaxReached = comparisonList.length >= maxCompareCount && !isSelected;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (isSelected) {
            removeFromComparison(String(property.id));
        } else {
            const success = addToComparison(property);
            if (!success && !isMaxReached) {
                // Show error feedback if needed
                console.log("Failed to add property to comparison");
            }
        }
    };

    const getTooltipText = () => {
        if (isSelected) return "Remove from comparison";
        if (isMaxReached) return `Maximum ${maxCompareCount} properties`;
        return "Add to comparison";
    };

    if (variant === "icon-only") {
        return (
            <div className="relative">
                <button
                    onClick={handleClick}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    disabled={isMaxReached}
                    className={`p-2 rounded-full transition-all ${isSelected
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : isMaxReached
                            ? "bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed"
                            : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600"
                        } ${className}`}
                    aria-label={getTooltipText()}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isSelected ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        )}
                    </svg>
                </button>

                {/* Tooltip */}
                {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                        {getTooltipText()}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isMaxReached}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${isSelected
                ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md"
                : isMaxReached
                    ? "bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 hover:border-primary-400"
                } ${className}`}
        >
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                {isSelected ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                )}
            </svg>
            <span>
                {isSelected ? "Remove from Compare" : isMaxReached ? `Max ${maxCompareCount} reached` : "Add to Compare"}
            </span>
        </button>
    );
}
