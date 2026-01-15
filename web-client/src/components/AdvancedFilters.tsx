"use client";

import React, { useState } from "react";
import { SavedSearch, MOCK_SAVED_SEARCHES } from "@/data/mockDocuments";

interface AdvancedFiltersProps {
    onApplyFilters?: (filters: any) => void;
    className?: string;
}

const PROPERTY_TYPES = ["Apartment", "House", "Studio", "Townhouse", "Villa"];
const AMENITIES = [
    "Parking",
    "Wi-Fi",
    "Security",
    "Gym",
    "Pool",
    "Generator",
    "Garden",
    "Balcony",
];
const AREAS = [
    "Westlands",
    "Lavington",
    "Kilimani",
    "Karen",
    "Runda",
    "Kileleshwa",
    "Parklands",
    "South B",
    "South C",
];

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    onApplyFilters,
    className = "",
}) => {
    const [filters, setFilters] = useState({
        propertyType: [] as string[],
        minPrice: 0,
        maxPrice: 200000,
        bedrooms: 0,
        bathrooms: 0,
        amenities: [] as string[],
        areas: [] as string[],
        furnished: false,
        petFriendly: false,
    });

    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(MOCK_SAVED_SEARCHES);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [searchName, setSearchName] = useState("");

    const toggleArrayValue = (array: string[], value: string) => {
        return array.includes(value)
            ? array.filter(item => item !== value)
            : [...array, value];
    };

    const handleSaveSearch = () => {
        if (!searchName.trim()) return;

        const newSearch: SavedSearch = {
            id: `search-${Date.now()}`,
            name: searchName,
            filters: { ...filters },
            createdAt: new Date().toISOString(),
            matchCount: 0, // TODO: Get from API
        };

        setSavedSearches([newSearch, ...savedSearches]);
        setSearchName("");
        setShowSaveDialog(false);
    };

    return (
        <div className={`advanced-filters ${className}`}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Advanced Filters</h3>
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <i className="las la-save mr-1"></i>
                        Save Search
                    </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Price Range (KES)</label>
                    <div className="px-2">
                        <input
                            type="range"
                            min="0"
                            max="200000"
                            step="5000"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                            <span>KES {filters.minPrice.toLocaleString()}</span>
                            <span>KES {filters.maxPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Property Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Property Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PROPERTY_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilters({
                                    ...filters,
                                    propertyType: toggleArrayValue(filters.propertyType, type),
                                })}
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${filters.propertyType.includes(type)
                                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                        : "border-neutral-300 dark:border-neutral-600"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Bedrooms</label>
                        <select
                            value={filters.bedrooms}
                            onChange={(e) => setFilters({ ...filters, bedrooms: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900"
                        >
                            <option value="0">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Bathrooms</label>
                        <select
                            value={filters.bathrooms}
                            onChange={(e) => setFilters({ ...filters, bathrooms: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900"
                        >
                            <option value="0">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>
                </div>

                {/* Areas */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Areas</label>
                    <div className="grid grid-cols-3 gap-2">
                        {AREAS.map((area) => (
                            <button
                                key={area}
                                onClick={() => setFilters({
                                    ...filters,
                                    areas: toggleArrayValue(filters.areas, area),
                                })}
                                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${filters.areas.includes(area)
                                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                        : "border-neutral-300 dark:border-neutral-600"
                                    }`}
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                        {AMENITIES.map((amenity) => (
                            <label key={amenity} className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.amenities.includes(amenity)}
                                    onChange={() => setFilters({
                                        ...filters,
                                        amenities: toggleArrayValue(filters.amenities, amenity),
                                    })}
                                    className="rounded"
                                />
                                <span className="text-sm">{amenity}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-4 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.furnished}
                            onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Furnished</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.petFriendly}
                            onChange={(e) => setFilters({ ...filters, petFriendly: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Pet Friendly</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => onApplyFilters?.(filters)}
                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => setFilters({
                            propertyType: [],
                            minPrice: 0,
                            maxPrice: 200000,
                            bedrooms: 0,
                            bathrooms: 0,
                            amenities: [],
                            areas: [],
                            furnished: false,
                            petFriendly: false,
                        })}
                        className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-500 transition-colors font-medium"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
                <div className="mt-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <h4 className="font-semibold mb-4">Saved Searches</h4>
                    <div className="space-y-3">
                        {savedSearches.map((search) => (
                            <div
                                key={search.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors cursor-pointer"
                            >
                                <div>
                                    <h5 className="font-medium">{search.name}</h5>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        {search.matchCount} properties match
                                    </p>
                                </div>
                                <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                    Load
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSaveDialog(false)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold mb-4">Save Search</h3>
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Enter search name..."
                            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg mb-4 bg-white dark:bg-neutral-900"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveSearch}
                                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;
