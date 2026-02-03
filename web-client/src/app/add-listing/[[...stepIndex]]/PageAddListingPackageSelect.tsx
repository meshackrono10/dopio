"use client";

import React from "react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";

interface PackageOption {
    tier: "BRONZE" | "SILVER" | "GOLD";
    name: string;
    propertyCount: number;
    description: string;
    features: string[];
    color: string;
    icon: string;
}

const PACKAGES: PackageOption[] = [
    {
        tier: "BRONZE",
        name: "Bronze",
        propertyCount: 1,
        description: "Perfect for listing a single property.",
        features: [
            "List 1 Property",
            "Basic Visibility",
            "Standard Support"
        ],
        color: "from-orange-400 to-orange-600",
        icon: "la-home"
    },
    {
        tier: "SILVER",
        name: "Silver",
        propertyCount: 3,
        description: "Great value for small portfolios.",
        features: [
            "List 3 Properties",
            "Enhanced Visibility",
            "Priority Support",
            "Packaged Listing Display"
        ],
        color: "from-gray-300 to-gray-500",
        icon: "la-building"
    },
    {
        tier: "GOLD",
        name: "Gold",
        propertyCount: 4,
        description: "Maximum exposure for serious haunters.",
        features: [
            "List 4 Properties",
            "Premium Visibility",
            "Dedicated Agent Support",
            "Featured Listing Status",
            "Advanced Analytics"
        ],
        color: "from-yellow-400 to-yellow-600",
        icon: "la-city"
    }
];

const PageAddListingPackageSelect = () => {
    const { formData, selectPackage } = usePropertyForm();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold">Select Your Listing Package</h2>
                <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    Choose a package that fits your portfolio size. You can list multiple properties under a single package for better management.
                </span>
            </div>

            <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map((pkg) => {
                    const isSelected = formData.selectedPackage === pkg.tier;

                    return (
                        <div
                            key={pkg.tier}
                            onClick={() => selectPackage(pkg.tier)}
                            className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-xl ${isSelected
                                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/10 dark:border-primary-500"
                                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-200 dark:hover:border-primary-800"
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-primary-600 text-white text-xs font-bold shadow-sm">
                                    SELECTED
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                                <i className={`las ${pkg.icon} text-3xl`}></i>
                            </div>

                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {pkg.name}
                            </h3>

                            <div className="mt-1 flex items-baseline">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    {pkg.propertyCount} Property {pkg.propertyCount > 1 ? 'Listings' : 'Listing'}
                                </span>
                            </div>

                            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {pkg.description}
                            </p>

                            <div className="mt-6 space-y-3 flex-1">
                                {pkg.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <i className="las la-check-circle text-primary-600 mt-0.5 mr-2"></i>
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm text-center transition-colors ${isSelected
                                    ? "bg-primary-600 text-white"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 group-hover:bg-primary-50"
                                }`}>
                                {isSelected ? "Selected" : "Select Plan"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PageAddListingPackageSelect;
