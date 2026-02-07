"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import api from "@/services/api";
import Image from "next/image";
import Link from "next/link";
import { Route } from "@/routers/types";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface SavedProperty {
    id: string;
    property: any;
}

export default function SavedPropertiesPage() {
    const { showToast } = useToast();
    const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedProperties();
    }, []);

    const fetchSavedProperties = async () => {
        try {
            const response = await api.get("/users/saved-properties");
            setSavedProperties(response.data);
        } catch (error) {
            console.error("Failed to fetch saved properties", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSaved = async (propertyId: string) => {
        try {
            await api.post(`/users/saved-properties/${propertyId}`);
            setSavedProperties(prev => prev.filter(p => p.property.id !== propertyId));
            showToast("success", "Property removed from saved list");
        } catch (error) {
            console.error("Failed to remove saved property", error);
            showToast("error", "Failed to remove property");
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 h-80 animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
                <p className="text-neutral-500">Properties you've bookmarked for later</p>
            </div>

            {savedProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <i className="las la-heart text-4xl text-neutral-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                        No saved properties
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
                        You haven&apos;t saved any properties yet. Browse our listings to find your next home.
                    </p>
                    <ButtonPrimary className="mt-6" href={"/listing-stay-map" as Route}>
                        Browse Properties
                    </ButtonPrimary>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((saved) => (
                        <div
                            key={saved.id}
                            className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="aspect-w-4 aspect-h-3 relative">
                                <Image
                                    fill
                                    src={saved.property.images[0]}
                                    alt={saved.property.title}
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-lg line-clamp-2">{saved.property.title}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    {saved.property.location.generalArea}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xl font-bold text-primary-600">
                                        KES {saved.property.rent.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">/month</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={`/property/${saved.property.id}` as Route}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveSaved(saved.property.id)}
                                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                                    >
                                        <i className="las la-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
