"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

import { PropertyListing } from "@/data/types";

interface GoldPackageManagementCardProps {
    packageGroupId: string;
    packageMembers: PropertyListing[];
    onPackageUpdate: () => void;
    isCompact?: boolean;
}

export default function GoldPackageManagementCard({
    packageGroupId,
    packageMembers,
    onPackageUpdate,
    isCompact = false
}: GoldPackageManagementCardProps) {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
    const [showBreakConfirm, setShowBreakConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [availableProperties, setAvailableProperties] = useState<PropertyListing[]>([]);
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);

    const sortedMembers = [...packageMembers].sort((a, b) =>
        (a.packagePosition || 0) - (b.packagePosition || 0)
    );

    const firstMemberPkg = packageMembers[0] as any;
    const currentTier = firstMemberPkg?.listingPackage || firstMemberPkg?.packages?.find((p: any) => p.packageGroupId === packageGroupId)?.tier || 'GOLD';
    const isGold = currentTier === 'GOLD';

    // Fetch available properties when modal opens
    useEffect(() => {
        if (showAddPropertyModal) {
            fetchAvailableProperties();
        }
    }, [showAddPropertyModal]);

    const fetchAvailableProperties = async () => {
        setLoadingProperties(true);
        try {
            const response = await api.get('/properties');
            const allProperties = response.data;
            const available = allProperties.filter((p: any) => {
                const isOwner = p.agent?.id === user?.id; // Fixed to p.agent?.id to match backend response structure
                const inSameTierGroup = p.packageGroupId; // If it has a group ID, it's already in a bundle
                return isOwner && !inSameTierGroup;
            });
            setAvailableProperties(available);
        } catch (error: any) {
            showToast("error", "Failed to fetch available properties");
        } finally {
            setLoadingProperties(false);
        }
    };

    const handleAddProperty = async () => {
        if (selectedPropertyIds.length === 0) {
            showToast("warning", "Please select at least one property to add");
            return;
        }

        setIsLoading(true);
        try {
            await api.post(`/packages/${packageGroupId}/add-property`, {
                propertyIds: selectedPropertyIds
            });
            showToast("success", `${selectedPropertyIds.length} properties added to bundle`);
            setShowAddPropertyModal(false);
            setSelectedPropertyIds([]);
            onPackageUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to add properties");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveProperty = async (propertyId: string | number) => {
        setIsLoading(true);
        try {
            const requiredCount = isGold ? 5 : 3;
            if (packageMembers.length <= requiredCount) {
                showToast("warning", `Removing this property will break the ${currentTier} bundle. Use 'Break Bundle' instead.`);
                setShowRemoveConfirm(null);
                return;
            }

            await api.delete(`/packages/properties/${propertyId}/remove`);
            showToast("success", "Property removed from package");
            setShowRemoveConfirm(null);
            onPackageUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to remove property");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBreakPackage = async () => {
        setIsLoading(true);
        try {
            await api.post('/packages/break-package', { packageGroupId });
            showToast("success", `${currentTier} bundle broken into individual listings`);
            setShowBreakConfirm(false);
            onPackageUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to break package");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCompact && !isExpanded) {
        return (
            <div
                className={`bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border-2 transition-all hover:shadow-xl cursor-pointer group flex flex-col h-full ${isGold ? 'border-yellow-400 dark:border-yellow-600' : 'border-gray-200 dark:border-gray-700'
                    }`}
                onClick={() => setIsExpanded(true)}
            >
                <div className="h-40 relative">
                    <Image
                        fill
                        src={sortedMembers[0]?.images[0] || "/placeholder.jpg"}
                        alt="Bundle preview"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isGold ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-gradient-to-br from-gray-300 to-gray-500"
                                }`}>
                                <span className="text-xl">{isGold ? "🏆" : "🥈"}</span>
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px] opacity-80">{isGold ? "Gold" : "Silver"} Bundle</h4>
                                <p className="text-white font-bold text-xs">{packageMembers.length} Houses</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-primary-600 shadow-sm">
                            Manage
                        </span>
                    </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1">{sortedMembers[0]?.title} & More</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                            <i className="las la-map-marker text-primary-500"></i>
                            {sortedMembers[0]?.location?.generalArea || 'Nairobi'}
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400">ID: {packageGroupId.substring(0, 8)}</span>
                        <div className="flex -space-x-2">
                            {sortedMembers.slice(0, 3).map((m, idx) => (
                                <div key={idx} className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 overflow-hidden relative">
                                    <Image fill src={m.images[0] || "/placeholder.jpg"} alt="thumb" className="object-cover" />
                                </div>
                            ))}
                            {packageMembers.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-100 flex items-center justify-center text-[8px] font-bold">
                                    +{packageMembers.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-3xl border-2 overflow-hidden transition-all duration-300 shadow-xl ${isGold
            ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-400 dark:border-yellow-600"
            : "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10 border-gray-300 dark:border-gray-700"
            } ${isExpanded ? 'col-span-full' : ''}`}>
            {/* Header */}
            <div
                className="p-6 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${isGold ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-gradient-to-br from-gray-300 to-gray-500"
                            }`}>
                            <span className="text-3xl">{isGold ? "🏆" : "🥈"}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`text-2xl font-bold ${isGold ? "text-yellow-900 dark:text-yellow-100" : "text-gray-900 dark:text-gray-100"}`}>
                                    {isGold ? "Gold" : "Silver"} Bundle
                                </h3>
                                <span className={`px-3 py-1 text-white text-sm font-semibold rounded-full ${isGold ? "bg-yellow-600" : "bg-gray-600"}`}>
                                    {packageMembers.length} Properties
                                </span>
                            </div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Premium bundle · Package ID: {packageGroupId.substring(0, 8)}...
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                Click to {isExpanded ? 'collapse' : 'manage properties'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-lg transition-colors"
                        >
                            <i className={`las la-chevron-${isExpanded ? 'up' : 'down'} text-2xl text-yellow-800 dark:text-yellow-200`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="px-6 pb-6 space-y-4 border-t border-yellow-300 dark:border-yellow-700 pt-4">
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddPropertyModal(true)}
                            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isGold ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-600 hover:bg-gray-700"
                                }`}
                        >
                            <i className="las la-plus"></i>
                            Add Property
                        </button>
                        <button
                            onClick={() => setShowBreakConfirm(true)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <i className="las la-unlink"></i>
                            Break Bundle
                        </button>
                    </div>

                    {/* Properties List */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Properties in Package:</h4>
                        {sortedMembers.map((property) => {
                            const images = Array.isArray(property.images) ? property.images :
                                typeof property.images === 'string' ? JSON.parse(property.images) : [];
                            const location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;

                            return (
                                <div
                                    key={property.id}
                                    className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        {/* Property Image */}
                                        <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden">
                                            <Image
                                                src={images[0] || "/placeholder.jpg"}
                                                alt={property.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-1 left-1">
                                                <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded">
                                                    #{property.packagePosition}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Property Info */}
                                        <div className="flex-grow">
                                            <h5 className="font-semibold text-base line-clamp-1">{property.title}</h5>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                {location?.generalArea || 'Nairobi'}
                                            </p>
                                            <p className="text-sm font-semibold text-primary-600 mt-1">
                                                KES {property.rent?.toLocaleString()}/month
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 justify-center">
                                            <Link
                                                href={`/listing-stay-detail/${property.id}`}
                                                className="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-center"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => setShowRemoveConfirm(String(property.id))}
                                                className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Remove Property Confirmation Modal */}
            {showRemoveConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Remove Property from Package?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            This will remove the property from the Gold package. The property will become an individual Bronze listing.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRemoveConfirm(null)}
                                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveProperty(showRemoveConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Break Package Confirmation Modal */}
            {showBreakConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Break Gold Package?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            This will break the Gold package into {packageMembers.length} individual Bronze listings. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBreakConfirm(false)}
                                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBreakPackage}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? "Breaking..." : "Break Package"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Property Modal */}
            {showAddPropertyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Add Properties to {isGold ? 'Gold' : 'Silver'} Bundle</h3>
                            <button
                                onClick={() => {
                                    setShowAddPropertyModal(false);
                                    setSelectedPropertyIds([]);
                                }}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <i className="las la-times text-2xl"></i>
                            </button>
                        </div>

                        {loadingProperties ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading available properties...</p>
                            </div>
                        ) : availableProperties.length === 0 ? (
                            <div className="text-center py-8">
                                <i className="las la-home text-6xl text-neutral-300"></i>
                                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                                    No available properties to add. All your Bronze/Silver properties are already in packages or you don't have any listings.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    Select one or more properties from your Bronze/Silver listings to add to this Gold package:
                                </p>

                                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                                    {availableProperties.map((property) => {
                                        const images = Array.isArray(property.images) ? property.images :
                                            typeof property.images === 'string' ? JSON.parse(property.images) : [];
                                        const location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;

                                        return (
                                            <div
                                                key={property.id}
                                                onClick={() => {
                                                    const id = String(property.id);
                                                    setSelectedPropertyIds(prev =>
                                                        prev.includes(id)
                                                            ? prev.filter(item => item !== id)
                                                            : [...prev, id]
                                                    );
                                                }}
                                                className={`flex gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPropertyIds.includes(String(property.id))
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden">
                                                    <Image
                                                        src={images[0] || "/placeholder.jpg"}
                                                        alt={property.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-semibold text-base">{property.title}</h4>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                        {location?.generalArea || 'Nairobi'}
                                                    </p>
                                                    <p className="text-sm font-semibold text-primary-600 mt-1">
                                                        KES {property.rent?.toLocaleString()}/month
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPropertyIds.includes(String(property.id))
                                                        ? 'border-primary-500 bg-primary-500'
                                                        : 'border-neutral-300'
                                                        }`}>
                                                        {selectedPropertyIds.includes(String(property.id)) && (
                                                            <i className="las la-check text-white text-sm"></i>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mb-6 text-center">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                                        Don't see the property you want to add?
                                    </p>
                                    <Link
                                        href={`/add-listing/1?targetPackageGroupId=${packageGroupId}`}
                                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center justify-center gap-1"
                                    >
                                        <i className="las la-plus-circle text-lg"></i>
                                        Create a new listing to add to this Gold package directly
                                    </Link>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowAddPropertyModal(false);
                                            setSelectedPropertyIds([]);
                                        }}
                                        className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddProperty}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        disabled={isLoading || selectedPropertyIds.length === 0}
                                    >
                                        {isLoading ? "Adding..." : `Add ${selectedPropertyIds.length > 0 ? selectedPropertyIds.length : ''} Properties`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
