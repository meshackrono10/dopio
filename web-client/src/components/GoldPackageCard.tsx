"use client";

import React, { FC, useState, useEffect } from "react";
import { Property } from "@/data/types";
import GallerySlider from "@/components/GallerySlider";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Badge from "@/shared/Badge";

export interface GoldPackageCardProps {
    className?: string;
    masterProperty: Property;
    packageMembers?: Property[];
}

const GoldPackageCard: FC<GoldPackageCardProps> = ({
    className = "",
    masterProperty,
    packageMembers = [],
}) => {
    const { user } = useAuth();
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If package members are provided, use them
        if (packageMembers.length > 0) {
            setAllProperties(packageMembers);
        } else {
            // Otherwise fetch them from the API
            fetchPackageMembers();
        }
    }, [masterProperty.id, packageMembers]);

    const fetchPackageMembers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/packages/properties/${masterProperty.id}/package-members`
            );
            if (response.ok) {
                const data = await response.json();
                setAllProperties(data.properties || []);
            }
        } catch (error) {
            console.error("Error fetching package members:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const location =
        typeof masterProperty.location === "string"
            ? JSON.parse(masterProperty.location)
            : masterProperty.location;

    const packagePrice = masterProperty.packages?.[0]?.price || 1500;

    const isOwner =
        user?.id &&
        masterProperty.agent?.id &&
        masterProperty.agent.id.toString() === user.id.toString();

    const renderPropertyCard = (property: Property, index: number) => {
        const propLoc =
            typeof property.location === "string"
                ? JSON.parse(property.location)
                : property.location;
        const images =
            typeof property.images === "string"
                ? JSON.parse(property.images)
                : property.images;

        return (
            <div
                key={property.id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700"
            >
                {/* Property image */}
                <div className="w-full sm:w-40 h-32 flex-shrink-0">
                    <GallerySlider
                        uniqueID={`gold-package-${property.id}`}
                        ratioClass="aspect-w-4 aspect-h-3"
                        galleryImgs={images.slice(0, 4)}
                        href={`/listing-stay-detail/${property.id}`}
                        galleryClass="rounded-lg overflow-hidden"
                    />
                </div>

                {/* Property details */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <Link
                                href={`/listing-stay-detail/${property.id}`}
                                className="text-base font-semibold hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                            >
                                {property.title}
                            </Link>
                            <Badge
                                name={`Property ${index + 1}`}
                                color="blue"
                                className="flex-shrink-0"
                            />
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                            {property.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                            KES {property.rent.toLocaleString()}/month
                        </span>
                        <Link
                            href={`/listing-stay-detail/${property.id}`}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            View Details →
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`nc-GoldPackageCard group relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-800 p-5 sm:p-6 rounded-3xl border-2 border-yellow-400 dark:border-yellow-600 ${className}`}
        >
            {/* Gold Package Header */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            Gold Package - 3 Properties
                        </h3>
                    </div>
                    {isOwner && (
                        <Badge name="Your Listing" color="green" className="text-xs" />
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <span>
                            {location.generalArea}, {location.county || "Nairobi"}
                        </span>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            View all 3 properties
                        </p>
                        <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            KES {packagePrice.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Properties List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-8 text-neutral-500">
                        Loading properties...
                    </div>
                ) : allProperties.length > 0 ? (
                    allProperties.map((property, index) =>
                        renderPropertyCard(property, index)
                    )
                ) : (
                    <div className="text-center py-8 text-neutral-500">
                        No properties found
                    </div>
                )}
            </div>

            {/* Book Viewing CTA */}
            {!isOwner && (
                <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                Book a Gold Package Viewing
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                View all 3 properties in one convenient session
                            </p>
                        </div>
                        <Link
                            href={`/listing-stay-detail/${masterProperty.id}`}
                            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Book Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Owner Management Options */}
            {isOwner && (
                <div className="mt-6 flex gap-3">
                    <Link
                        href={`/haunter-dashboard/packages?manage=${masterProperty.packageGroupId}`}
                        className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-xl font-medium text-center transition-colors"
                    >
                        Manage Package
                    </Link>
                    <Link
                        href={`/add-listing/edit/${masterProperty.id}`}
                        className="flex-1 px-4 py-3 border-2 border-neutral-800 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-xl font-medium text-center hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-600 transition-colors"
                    >
                        Edit Properties
                    </Link>
                </div>
            )}
        </div>
    );
};

export default GoldPackageCard;
