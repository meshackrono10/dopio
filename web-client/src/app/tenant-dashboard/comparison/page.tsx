"use client";

import React from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import Image from "next/image";
import Link from "next/link";
import { Route } from "@/routers/types";
import ButtonPrimary from "@/shared/ButtonPrimary";

export default function ComparisonPage() {
    const { comparisonList, removeFromComparison, clearComparison } = useComparison();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Property Comparison</h1>
                    <p className="text-neutral-500">
                        Compare up to 4 properties side by side
                    </p>
                </div>
                {comparisonList.length > 0 && (
                    <button
                        onClick={clearComparison}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <i className="las la-times mr-1"></i>
                        Clear All
                    </button>
                )}
            </div>

            {comparisonList.length > 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <th className="p-4 text-left font-semibold">Feature</th>
                                {comparisonList.map((property) => (
                                    <th key={property.id} className="p-4 text-left font-semibold min-w-[250px]">
                                        <div className="relative aspect-w-4 aspect-h-3 mb-3 rounded-xl overflow-hidden">
                                            <Image
                                                fill
                                                src={property.images[0]}
                                                alt={property.title}
                                                className="object-cover"
                                            />
                                        </div>
                                        <p className="line-clamp-2">{property.title}</p>
                                        <button
                                            onClick={() => removeFromComparison(property.id.toString())}
                                            className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <i className="las la-times mr-1"></i>
                                            Remove
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <td className="p-4 font-medium">Monthly Rent</td>
                                {comparisonList.map((property) => (
                                    <td key={property.id} className="p-4">
                                        <span className="text-lg font-bold text-primary-600">
                                            KES {property.rent.toLocaleString()}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <td className="p-4 font-medium">Deposit</td>
                                {comparisonList.map((property) => (
                                    <td key={property.id} className="p-4">
                                        KES {property.deposit.toLocaleString()}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <td className="p-4 font-medium">Layout</td>
                                {comparisonList.map((property) => (
                                    <td key={property.id} className="p-4 capitalize">
                                        {property.layout}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <td className="p-4 font-medium">Bathrooms</td>
                                {comparisonList.map((property) => (
                                    <td key={property.id} className="p-4">
                                        {property.bathrooms}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <td className="p-4 font-medium">Location</td>
                                {comparisonList.map((property) => (
                                    <td key={property.id} className="p-4">
                                        {property.location.generalArea}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <td className="p-4 font-medium">Amenities</td>
                                {comparisonList.map((property) => (
                                    <td key={property.id} className="p-4">
                                        <div className="space-y-1">
                                            {property.amenities.slice(0, 3).map((amenity: string) => (
                                                <div key={amenity} className="text-sm">
                                                    <i className="las la-check text-primary-600 mr-1"></i>
                                                    {amenity}
                                                </div>
                                            ))}
                                            {property.amenities.length > 3 && (
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    +{property.amenities.length - 3} more
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-16 text-center">
                    <i className="las la-balance-scale text-6xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">No Properties to Compare</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                        Add properties to your comparison list to see them side by side! Click the comparison icon on any property listing.
                    </p>
                    <Link href={"/listing-stay" as Route}>
                        <ButtonPrimary>
                            <i className="las la-search mr-2"></i>
                            Browse Properties
                        </ButtonPrimary>
                    </Link>
                </div>
            )}
        </div>
    );
}
