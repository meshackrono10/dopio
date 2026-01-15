"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useComparison } from "@/contexts/ComparisonContext";
import { Route } from "@/routers/types";

export default function ComparisonBar() {
    const { comparisonList, removeFromComparison, clearComparison } = useComparison();

    // Don't render if no properties in comparison
    if (comparisonList.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t-2 border-primary-600 shadow-2xl transform transition-transform duration-300">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Property Thumbnails */}
                    <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                {comparisonList.length}
                            </div>
                            <span className="font-semibold text-sm whitespace-nowrap">
                                {comparisonList.length === 1 ? "Property" : "Properties"} Selected
                            </span>
                        </div>

                        {/* Property Cards */}
                        <div className="flex gap-2 overflow-x-auto">
                            {comparisonList.map((property) => (
                                <div
                                    key={property.id}
                                    className="relative group flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 p-2 pr-3">
                                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={property.images[0]}
                                                alt={property.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate max-w-[120px]">
                                                {property.title}
                                            </p>
                                            <p className="text-xs text-primary-600 font-semibold">
                                                KES {property.rent.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromComparison(property.id.toString())}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        aria-label="Remove from comparison"
                                    >
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={clearComparison}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                        >
                            Clear All
                        </button>
                        <Link
                            href={"/tenant-dashboard?tab=comparison" as Route}
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <span>Compare Now</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
