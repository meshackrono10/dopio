"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { PropertyLayout } from "@/data/types";

export interface FilterCriteria {
    priceMin?: number;
    priceMax?: number;
    layout?: PropertyLayout[];
    petFriendly?: boolean;
    furnished?: ("yes" | "no" | "semi")[];
    securityFeatures?: string[];
    parkingRequired?: boolean;
    availableFrom?: string;
    leaseDuration?: ("monthly" | "yearly" | "flexible")[];
}

export interface AdvancedFiltersPanelProps {
    filters: FilterCriteria;
    onChange: (filters: FilterCriteria) => void;
    onClose?: () => void;
    onApply?: () => void;
}

const SECURITY_OPTIONS = [
    "CCTV",
    "Security Guard",
    "Gate",
    "Alarm System",
    "Intercom",
];

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
    filters,
    onChange,
    onClose,
    onApply,
}) => {
    const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);

    const updateFilter = (key: keyof FilterCriteria, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const toggleArrayItem = <T extends string>(
        key: keyof FilterCriteria,
        value: T
    ) => {
        const current = (localFilters[key] as T[]) || [];
        const newValue = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        updateFilter(key, newValue.length > 0 ? newValue : undefined);
    };

    const handleApply = () => {
        onChange(localFilters);
        onApply?.();
    };

    const handleClear = () => {
        setLocalFilters({});
        onChange({});
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Advanced Filters</h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <i className="las la-times text-2xl"></i>
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Price Range */}
                <div>
                    <label className="text-sm font-medium block mb-3">
                        Price Range (KES/month)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            placeholder="Min"
                            value={localFilters.priceMin || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "priceMin",
                                    e.target.value ? Number(e.target.value) : undefined
                                )
                            }
                            className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={localFilters.priceMax || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "priceMax",
                                    e.target.value ? Number(e.target.value) : undefined
                                )
                            }
                            className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                        />
                    </div>
                </div>

                {/* Property Type */}
                <div>
                    <label className="text-sm font-medium block mb-3">Property Type</label>
                    <div className="flex flex-wrap gap-2">
                        {(["bedsitter", "studio", "1-bedroom", "2-bedroom", "3-bedroom"] as PropertyLayout[]).map(
                            (type) => (
                                <button
                                    key={type}
                                    onClick={() => toggleArrayItem("layout", type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${localFilters.layout?.includes(type)
                                            ? "bg-primary-600 text-white"
                                            : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Pet Friendly */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={localFilters.petFriendly || false}
                            onChange={(e) => updateFilter("petFriendly", e.target.checked ? true : undefined)}
                            className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        <span className="text-sm font-medium flex items-center gap-2">
                            <i className="las la-paw text-xl"></i>
                            Pet Friendly
                        </span>
                    </label>
                </div>

                {/* Furnished Status */}
                <div>
                    <label className="text-sm font-medium block mb-3">Furnished</label>
                    <div className="flex flex-wrap gap-2">
                        {(["yes", "no", "semi"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => toggleArrayItem("furnished", status)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${localFilters.furnished?.includes(status)
                                        ? "bg-primary-600 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                    }`}
                            >
                                {status === "yes" ? "Furnished" : status === "no" ? "Unfurnished" : "Semi-Furnished"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Security Features */}
                <div>
                    <label className="text-sm font-medium block mb-3">Security Features</label>
                    <div className="grid grid-cols-2 gap-2">
                        {SECURITY_OPTIONS.map((feature) => (
                            <label key={feature} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localFilters.securityFeatures?.includes(feature) || false}
                                    onChange={() => toggleArrayItem("securityFeatures", feature)}
                                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700"
                                />
                                <span className="text-sm">{feature}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Parking Required */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={localFilters.parkingRequired || false}
                            onChange={(e) => updateFilter("parkingRequired", e.target.checked ? true : undefined)}
                            className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        <span className="text-sm font-medium flex items-center gap-2">
                            <i className="las la-parking text-xl"></i>
                            Parking Required
                        </span>
                    </label>
                </div>

                {/* Lease Duration */}
                <div>
                    <label className="text-sm font-medium block mb-3">Lease Duration</label>
                    <div className="flex flex-wrap gap-2">
                        {(["monthly", "yearly", "flexible"] as const).map((duration) => (
                            <button
                                key={duration}
                                onClick={() => toggleArrayItem("leaseDuration", duration)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${localFilters.leaseDuration?.includes(duration)
                                        ? "bg-primary-600 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                    }`}
                            >
                                {duration}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Available From */}
                <div>
                    <label className="text-sm font-medium block mb-3">Available From</label>
                    <input
                        type="date"
                        value={localFilters.availableFrom || ""}
                        onChange={(e) => updateFilter("availableFrom", e.target.value || undefined)}
                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
                <ButtonSecondary onClick={handleClear} className="flex-1">
                    Clear All
                </ButtonSecondary>
                <ButtonPrimary onClick={handleApply} className="flex-1">
                    Apply Filters
                </ButtonPrimary>
            </div>
        </div>
    );
};

export default AdvancedFiltersPanel;
