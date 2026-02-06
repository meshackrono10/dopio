"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/Toast";
import api from "@/services/api";

interface Property {
    id: string | number;
    title: string;
    rent: number;
    images: string[] | string;
    location: any;
}

interface UpgradePropertyModalProps {
    property: Property;
    onClose: () => void;
    onUpgrade: () => void;
}

export default function UpgradePropertyModal({
    property,
    onClose,
    onUpgrade
}: UpgradePropertyModalProps) {
    const { showToast } = useToast();
    const [selectedTier, setSelectedTier] = useState<'GOLD' | 'SILVER'>('GOLD');
    const [upgradeType, setUpgradeType] = useState<'NEW' | 'EXISTING'>('NEW');
    const [existingGroups, setExistingGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);

    const images = Array.isArray(property.images) ? property.images :
        typeof property.images === 'string' ? JSON.parse(property.images) : [];
    const location = typeof property.location === 'string' ? JSON.parse(property.location) : property.location;

    useEffect(() => {
        if (upgradeType === 'EXISTING') {
            fetchExistingGroups();
        }
    }, [upgradeType, selectedTier]);

    const fetchExistingGroups = async () => {
        setLoadingGroups(true);
        try {
            const response = await api.get('/properties');
            const allProperties = response.data;

            // Extract unique groups of the selected tier that match our location
            const groupsMap = new Map();
            allProperties.forEach((p: any) => {
                const pLocation = typeof p.location === 'string' ? JSON.parse(p.location) : p.location;
                const isSameArea = pLocation?.generalArea === location?.generalArea;

                if (isSameArea) {
                    p.packages?.forEach((pkg: any) => {
                        if (pkg.tier === selectedTier && pkg.packageGroupId) {
                            if (!groupsMap.has(pkg.packageGroupId)) {
                                groupsMap.set(pkg.packageGroupId, {
                                    id: pkg.packageGroupId,
                                    tier: pkg.tier,
                                    memberCount: 0,
                                    sampleTitle: p.title
                                });
                            }
                            groupsMap.get(pkg.packageGroupId).memberCount += 1;
                        }
                    });
                }
            });

            setExistingGroups(Array.from(groupsMap.values()));
        } catch (error) {
            showToast("error", "Failed to load existing bundles");
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleUpgrade = async () => {
        if (upgradeType === 'EXISTING' && !selectedGroupId) {
            showToast("warning", "Please select an existing bundle to join");
            return;
        }

        setIsLoading(true);
        try {
            const targetGroupId = upgradeType === 'NEW' ? crypto.randomUUID() : selectedGroupId;

            await api.post(`/packages/${targetGroupId}/add-property`, {
                propertyIds: [String(property.id)]
            });

            showToast("success", `Property successfully upgraded to ${selectedTier.toLowerCase()} bundle!`);
            onUpgrade();
            onClose();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to upgrade property");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700">
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800 z-10">
                    <div>
                        <h2 className="text-2xl font-bold">Upgrade Listing</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                            Promote {property.title} to a premium bundle
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
                        <i className="las la-times text-2xl"></i>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Property Summary */}
                    <div className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={images[0] || "/placeholder.jpg"} alt={property.title} fill className="object-cover" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">{property.title}</h4>
                            <p className="text-primary-600 font-semibold">KES {property.rent.toLocaleString()}/mo</p>
                            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                                <i className="las la-map-marker text-lg"></i>
                                {location?.generalArea}, {location?.county}
                            </p>
                        </div>
                    </div>

                    {/* Step 1: Select Tier */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm">1</span>
                            Choose Bundle Tier
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedTier('GOLD')}
                                className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${selectedTier === 'GOLD'
                                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-yellow-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">🏆</span>
                                    <span className="font-bold text-yellow-900 dark:text-yellow-100 text-lg">Gold</span>
                                </div>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">5+ properties bundle for maximum visibility & higher booking rates.</p>
                                {selectedTier === 'GOLD' && <i className="las la-check-circle absolute top-2 right-2 text-yellow-600 text-xl"></i>}
                            </button>

                            <button
                                onClick={() => setSelectedTier('SILVER')}
                                className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${selectedTier === 'SILVER'
                                    ? 'border-gray-400 bg-gray-50 dark:bg-gray-900/10'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">🥈</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Silver</span>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300">3-4 properties bundle for improved regional discoverability.</p>
                                {selectedTier === 'SILVER' && <i className="las la-check-circle absolute top-2 right-2 text-gray-600 text-xl"></i>}
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Select Action */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm">2</span>
                            Bundle Configuration
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setUpgradeType('NEW')}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${upgradeType === 'NEW'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-200'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                    <i className="las la-plus-circle text-2xl"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">Start a New {selectedTier.toLowerCase()} Bundle</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">Initialize a fresh group. You can add more houses later.</p>
                                </div>
                                {upgradeType === 'NEW' && <i className="las la-check text-primary-600 text-xl"></i>}
                            </button>

                            <button
                                onClick={() => setUpgradeType('EXISTING')}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${upgradeType === 'EXISTING'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-200'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                    <i className="las la-layer-group text-2xl"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">Join Existing {selectedTier.toLowerCase()} Bundle</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">Add this house to one of your current {selectedTier.toLowerCase()} groups in {location?.generalArea}.</p>
                                </div>
                                {upgradeType === 'EXISTING' && <i className="las la-check text-primary-600 text-xl"></i>}
                            </button>
                        </div>

                        {/* Existing Groups Selection */}
                        {upgradeType === 'EXISTING' && (
                            <div className="mt-4 pl-14 space-y-3">
                                {loadingGroups ? (
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 py-4">
                                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                        Finding your bundles in {location?.generalArea}...
                                    </div>
                                ) : existingGroups.length === 0 ? (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-sm text-amber-700 flex gap-2">
                                        <i className="las la-exclamation-triangle text-lg"></i>
                                        No existing {selectedTier.toLowerCase()} bundles found in {location?.generalArea}.
                                    </div>
                                ) : (
                                    existingGroups.map(group => (
                                        <button
                                            key={group.id}
                                            onClick={() => setSelectedGroupId(group.id)}
                                            className={`w-full p-3 rounded-lg border transition-all text-left flex items-center justify-between ${selectedGroupId === group.id
                                                ? 'border-primary-500 bg-white dark:bg-neutral-800 shadow-sm ring-2 ring-primary-500/20'
                                                : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-semibold text-sm">Bundle: {group.sampleTitle}</p>
                                                <p className="text-xs text-neutral-500">{group.memberCount} members currently</p>
                                            </div>
                                            {selectedGroupId === group.id && <i className="las la-check-circle text-primary-600"></i>}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Location Locking Notice */}
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl flex gap-3 text-sm text-primary-800 dark:text-primary-300">
                        <i className="las la-info-circle text-xl flex-shrink-0"></i>
                        <p>
                            <strong>Important</strong>: Properties in a bundle must be in the same general area ({location?.generalArea}). This ensures valid tour packages for viewers.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-700 flex gap-3 sticky bottom-0 bg-white dark:bg-neutral-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpgrade}
                        className="flex-[2] py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={isLoading || (upgradeType === 'EXISTING' && !selectedGroupId)}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Upgrading...
                            </>
                        ) : (
                            <>
                                <i className="las la-level-up-alt text-xl"></i>
                                Confirm Upgrade
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
