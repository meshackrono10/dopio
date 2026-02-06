"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { useToast } from "@/components/Toast";
import Image from "next/image";
import Link from "next/link";
import { Route } from "@/routers/types";
import Skeleton from "@/shared/Skeleton";
import api from "@/services/api";
import { useEffect } from "react";
import GoldPackageManagementCard from "@/components/GoldPackageManagementCard";
import UpgradePropertyModal from "@/components/UpgradePropertyModal";


export default function ListingsPage() {
    const { user } = useAuth();
    const { properties: allProperties, deleteProperty, refreshProperties } = useProperties();
    const { showToast } = useToast();
    const [propertyToDelete, setPropertyToDelete] = useState<string | number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [propertyToUpgrade, setPropertyToUpgrade] = useState<any | null>(null);
    const [packageGroups, setPackageGroups] = useState<Record<string, { tier: string, members: any[] }>>({});
    const [loadingPackages, setLoadingPackages] = useState(true);

    useEffect(() => {
        refreshProperties();
    }, [refreshProperties]);

    const haunterProperties = allProperties.filter((p) => p.agent.id === user?.id && p.status !== 'rented');

    // Group properties by package
    useEffect(() => {
        const groupProperties = async () => {
            setLoadingPackages(true);
            const groups: Record<string, { tier: string, members: any[] }> = {};
            const processedIds = new Set<string | number>();

            // First pass: Group by packageGroupId if it exists on the property objects
            haunterProperties.forEach(prop => {
                if (prop.packageGroupId && !processedIds.has(prop.id)) {
                    if (!groups[prop.packageGroupId]) {
                        // Find the tier from the listingPackage field or packages array
                        const tier = prop.listingPackage || prop.packages?.find((pkg: any) => pkg.tier !== 'BRONZE')?.tier || 'GOLD';
                        groups[prop.packageGroupId] = {
                            tier,
                            members: []
                        };
                    }
                    groups[prop.packageGroupId].members.push(prop);
                    processedIds.add(prop.id);
                }
            });

            setPackageGroups(groups);
            setLoadingPackages(false);
        };

        if (haunterProperties.length > 0) {
            groupProperties();
        } else {
            setLoadingPackages(false);
        }
    }, [haunterProperties.length]);

    // Get standalone properties (not part of any package)
    const standaloneProperties = haunterProperties.filter(
        (p) => !p.packageGroupId
    );


    const handleDeleteProperty = async () => {
        if (!propertyToDelete) return;

        setIsDeleting(true);
        try {
            await deleteProperty(propertyToDelete);
            showToast("success", "Property deleted successfully");
            setPropertyToDelete(null);
        } catch (error) {
            showToast("error", "Failed to delete property");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Listings</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Manage your property listings
                    </p>
                </div>
                <Link
                    href="/add-listing/1"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
                >
                    <i className="las la-plus"></i>
                    Add New Listing
                </Link>
            </div>

            {haunterProperties.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <i className="las la-home text-6xl text-neutral-300 dark:text-neutral-600"></i>
                    <h3 className="text-xl font-semibold mt-4">No listings yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
                        Start by adding your first property listing
                    </p>
                    <Link
                        href="/add-listing/1"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        <i className="las la-plus"></i>
                        Add Your First Listing
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Package Sections */}
                    {['GOLD', 'SILVER'].map(tier => {
                        const tierGroups = Object.entries(packageGroups).filter(([_, data]) => data.tier === tier);
                        if (tierGroups.length === 0) return null;

                        return (
                            <div key={tier}>
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${tier === 'GOLD' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gradient-to-br from-gray-300 to-gray-500'
                                        }`}>
                                        {tier === 'GOLD' ? '🏆' : '🥈'}
                                    </span>
                                    {tier === 'GOLD' ? 'Gold' : 'Silver'} Bundles ({tierGroups.length})
                                </h2>
                                <div className="space-y-6 mb-8">
                                    {tierGroups.map(([groupId, data]) => (
                                        <div key={groupId}>
                                            <GoldPackageManagementCard
                                                packageGroupId={groupId}
                                                packageMembers={data.members}
                                                onPackageUpdate={() => refreshProperties()}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Standalone Properties Section */}
                    {standaloneProperties.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Individual Listings ({standaloneProperties.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {standaloneProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="aspect-w-4 aspect-h-3 relative h-48">
                                            <Image
                                                fill
                                                src={property.images[0] || "/placeholder.jpg"}
                                                alt={property.title}
                                                className="object-cover"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${property.status === 'available' || property.status === 'AVAILABLE' ? 'bg-green-600' :
                                                    property.status === 'locked' ? 'bg-orange-500' :
                                                        property.status === 'rented' ? 'bg-neutral-600' :
                                                            'bg-primary-600'
                                                    } text-white`}>
                                                    {property.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                {property.location.generalArea}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xl font-bold text-primary-600">
                                                    KES {property.rent.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-neutral-500 dark:text-neutral-400">/month</span>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/listing-stay-detail/${property.id}`}
                                                        className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium text-center"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/edit-listing/${property.id}`}
                                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setPropertyToUpgrade(property)}
                                                        className="flex-[3] px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <i className="las la-level-up-alt text-lg"></i>
                                                        Upgrade to Bundle
                                                    </button>
                                                    <button
                                                        onClick={() => setPropertyToDelete(property.id)}
                                                        className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                                                        title="Delete Listing"
                                                    >
                                                        <i className="las la-trash-alt text-xl"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Delete Confirmation Modal */}
            {propertyToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Delete Property?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Are you sure you want to delete this property? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPropertyToDelete(null)}
                                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProperty}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {propertyToUpgrade && (
                <UpgradePropertyModal
                    property={propertyToUpgrade}
                    onClose={() => setPropertyToUpgrade(null)}
                    onUpgrade={() => refreshProperties()}
                />
            )}
        </div>
    );
}
