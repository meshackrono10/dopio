"use client";

import React, { useState } from "react";
import { MOCK_PROPERTIES } from "@/data/mockData";
import Image from "next/image";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";

export default function SearchPage() {
    const [layout, setLayout] = useState<string[]>([]);
    const [minRent, setMinRent] = useState(0);
    const [maxRent, setMaxRent] = useState(100000);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const layouts = ["Bedsitter", "Studio", "1-Bedroom", "2-Bedroom", "3-Bedroom", "4+ Bedroom"];
    const amenitiesList = ["Parking", "Balcony", "Furnished", "Pet Friendly", "Security", "Gym", "Pool"];

    const filteredProperties = MOCK_PROPERTIES.filter((property) => {
        const rentInRange = property.rent >= minRent && property.rent <= maxRent;
        const layoutMatch = layout.length === 0 || layout.includes(property.layout);
        return rentInRange && layoutMatch;
    });

    const toggleAmenity = (amenity: string) => {
        setAmenities((prev) =>
            prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
        );
    };

    const toggleLayout = (l: string) => {
        setLayout((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
    };

    return (
        <div className="nc-SearchPage container pb-24 lg:pb-32">
            <main className="pt-11">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl lg:text-4xl font-semibold">Search Results</h2>
                    <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                        {filteredProperties.length} properties found
                    </span>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                                Filters
                                <button
                                    onClick={() => {
                                        setLayout([]);
                                        setAmenities([]);
                                        setMinRent(0);
                                        setMaxRent(100000);
                                    }}
                                    className="text-sm text-primary-600 hover:underline"
                                >
                                    Clear All
                                </button>
                            </h3>

                            {/* Rent Range */}
                            <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                                <label className="text-sm font-medium mb-3 block">Rent Range</label>
                                <div className="space-y-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100000"
                                        step="5000"
                                        value={maxRent}
                                        onChange={(e) => setMaxRent(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">KES {minRent.toLocaleString()}</span>
                                        <span className="font-semibold">KES {maxRent.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Layout */}
                            <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                                <label className="text-sm font-medium mb-3 block">Layout</label>
                                <div className="space-y-2">
                                    {layouts.map((l) => (
                                        <label key={l} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={layout.includes(l)}
                                                onChange={() => toggleLayout(l)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">Amenities</label>
                                <div className="space-y-2">
                                    {amenitiesList.map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={amenities.includes(amenity)}
                                                onChange={() => toggleAmenity(amenity)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                Showing {filteredProperties.length} results
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg ${viewMode === "grid"
                                        ? "bg-primary-600 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700"
                                        }`}
                                >
                                    <i className="las la-th text-xl"></i>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg ${viewMode === "list"
                                        ? "bg-primary-600 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700"
                                        }`}
                                >
                                    <i className="las la-list text-xl"></i>
                                </button>
                            </div>
                        </div>

                        {/* No Results */}
                        {filteredProperties.length === 0 && (
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-12 text-center">
                                <i className="las la-home text-6xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                    Try adjusting your filters to see more results
                                </p>
                                <ButtonPrimary
                                    onClick={() => {
                                        setLayout([]);
                                        setAmenities([]);
                                        setMaxRent(100000);
                                    }}

                                >
                                    Clear Filters
                                </ButtonPrimary>
                            </div>
                        )}

                        {/* Grid View */}
                        {viewMode === "grid" && filteredProperties.length > 0 && (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProperties.map((property) => (
                                    <Link
                                        key={property.id}
                                        href={`/listing-stay-detail/${property.id}`}
                                        className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl transition-shadow"
                                    >
                                        <div className="aspect-w-4 aspect-h-3 relative">
                                            <Image
                                                fill
                                                src={property.images[0] as string}
                                                alt={property.title}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                                                {property.title}
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                                {property.location.generalArea}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-primary-600">
                                                    KES {property.rent.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-neutral-500">/month</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === "list" && filteredProperties.length > 0 && (
                            <div className="space-y-4">
                                {filteredProperties.map((property) => (
                                    <Link
                                        key={property.id}
                                        href={`/listing-stay-detail/${property.id}`}
                                        className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl transition-shadow flex"
                                    >
                                        <div className="w-64 relative flex-shrink-0">
                                            <Image
                                                fill
                                                src={property.images[0] as string}
                                                alt={property.title}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-6 flex-1">
                                            <h3 className="font-semibold text-xl mb-2">{property.title}</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                                {property.location.generalArea}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">
                                                <span>{property.layout}</span>
                                                <span>•</span>
                                                <span>{property.bathrooms} Bath</span>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-2xl font-bold text-primary-600">
                                                    KES {property.rent.toLocaleString()}/mo
                                                </span>
                                                <ButtonPrimary sizeClass="px-4 py-2 text-sm">
                                                    View Details
                                                </ButtonPrimary>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
