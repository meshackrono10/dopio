"use client";

import React, { FC, useState, useEffect } from "react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { TrashIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Route } from "@/routers/types";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export interface PageAddListingManagePropertiesProps { }

const PageAddListingManageProperties: FC<PageAddListingManagePropertiesProps> = () => {
    const { formData, removePackageProperty, editPackageProperty, getPackageProgress, updateFormData } = usePropertyForm();
    const properties = formData.packageProperties || [];
    const [showTierSelect, setShowTierSelect] = useState(false);
    const [existingBundles, setExistingBundles] = useState<any[]>([]);
    const [loadingBundles, setLoadingBundles] = useState(false);
    const progress = getPackageProgress();
    const isComplete = progress.current >= progress.required;
    const router = useRouter();
    const { user } = useAuth(); // Get user from AuthContext

    // Determine tier name for display
    let tierName = "Bronze";
    if (formData.viewingPackages?.some(p => p.tier === 'GOLD')) tierName = "Gold";
    else if (formData.viewingPackages?.some(p => p.tier === 'SILVER')) tierName = "Silver";

    useEffect(() => {
        const fetchExistingBundles = async () => {
            if (!user) return;
            setLoadingBundles(true);
            try {
                const response = await api.get('/properties');
                const hunterProps = response.data.filter((p: any) => p.hunterId === user.id);

                const bundles: any[] = [];
                const seenGroups = new Set();

                for (const prop of hunterProps) {
                    const groupPkgs = (prop.packages || []).filter((pkg: any) =>
                        pkg.packageGroupId && (pkg.tier === 'GOLD' || pkg.tier === 'SILVER')
                    );

                    for (const pkg of groupPkgs) {
                        if (!seenGroups.has(pkg.packageGroupId)) {
                            seenGroups.add(pkg.packageGroupId);
                            bundles.push({
                                id: pkg.packageGroupId,
                                tier: pkg.tier,
                                name: `${pkg.tier.charAt(0) + pkg.tier.slice(1).toLowerCase()} Bundle (${pkg.propertiesIncluded} props)`,
                                mainPropName: prop.title
                            });
                        }
                    }
                }
                setExistingBundles(bundles);
            } catch (err) {
                console.error('Error fetching bundles:', err);
            } finally {
                setLoadingBundles(false);
            }
        };

        if (showTierSelect) {
            fetchExistingBundles();
        }
    }, [showTierSelect, user?.id]);

    const handleSelectBundle = (bundleId: string) => {
        updateFormData('targetPackageGroupId', bundleId);
        // Also set the correct tier package as selected in formData
        const bundle = existingBundles.find((b: any) => b.id === bundleId);
        if (bundle) {
            updateFormData('selectedPackage', bundle.tier);
        }
        router.push("/add-listing/1" as Route);
    };

    const handleCreateNewPackage = (tier: 'SILVER' | 'GOLD' | 'BRONZE') => {
        updateFormData('selectedPackage', tier);
        updateFormData('targetPackageGroupId', undefined);
        router.push("/add-listing/1" as Route);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold">Manage Package Properties</h2>
                <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    Review and manage all properties included in your {tierName} bundle.
                    {progress.required > 1 && !isComplete && (
                        <span className="text-primary-600 block mt-1 font-medium">
                            You need to add {progress.required - progress.current} more house(s) to complete this bundle.
                        </span>
                    )}
                </span>

            </div>

            <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

            <div className="space-y-4">
                {/* CURRENT PROPERTY (The one being edited/filled) */}
                <div className="p-5 border-2 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 rounded-2xl relative">
                    <div className="absolute top-4 right-4 bg-primary-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                        Editing Now
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{formData.propertyName || "Untitled Property"}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Primary Listing • {formData.propertyType || "Type not set"} • {formData.areaName || "Area not set"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ALREADY ADDED PROPERTIES */}
                {properties.map((prop, index) => (
                    <div key={index} className="p-5 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{prop.propertyName}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Property {index + 1} of {progress.required} • {prop.propertyType} • {prop.areaName}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => editPackageProperty(index)}
                                className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors"
                                title="Edit Property"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => removePackageProperty(index)}
                                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Remove Property"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {!isComplete && (
                    <div className="mt-8 p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-2xl text-center">
                        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                            Ready to add the next property to this package?
                        </p>
                        <ButtonSecondary
                            className="!rounded-xl"
                            onClick={() => setShowTierSelect(true)}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Another Property
                        </ButtonSecondary>
                    </div>
                )}
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-start space-x-3">
                <div className="text-yellow-600 mt-0.5 text-xl">
                    <i className="las la-exclamation-triangle"></i>
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Location Requirement</p>
                    <p>All properties in the {tierName} bundle must be located in the same area ({formData.areaName || "the location of the first property"}).</p>
                </div>
            </div>
            {/* Package Choice Modal */}
            {showTierSelect && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 border-b border-neutral-100 dark:border-neutral-700 pb-4">
                            <div>
                                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                                    New Listing Setup
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1">Choose how to categorize this property</p>
                            </div>
                            <button
                                onClick={() => setShowTierSelect(false)}
                                className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <i className="las la-times text-2xl"></i>
                            </button>
                        </div>

                        <div className="overflow-y-auto space-y-8 pr-2 custom-scrollbar flex-grow">
                            {/* Create New Option */}
                            <section>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Start New Bundle</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleCreateNewPackage('GOLD')}
                                        className="p-5 border-2 border-yellow-200 dark:border-yellow-900/30 rounded-2xl hover:border-yellow-400 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 text-left transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏆</div>
                                            <div>
                                                <span className="font-bold text-yellow-800 dark:text-yellow-400 block text-lg">Gold Tier</span>
                                                <span className="text-xs text-yellow-600 font-medium">Earn more + 5 slots</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-neutral-500">Perfect for high-value properties requiring maximum exposure.</p>
                                    </button>

                                    <button
                                        onClick={() => handleCreateNewPackage('SILVER')}
                                        className="p-5 border-2 border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/10 text-left transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🥈</div>
                                            <div>
                                                <span className="font-bold text-gray-800 dark:text-gray-300 block text-lg">Silver Tier</span>
                                                <span className="text-xs text-gray-500 font-medium">Standard + 3 slots</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-neutral-500">The balanced choice for standard listings and small bundles.</p>
                                    </button>
                                </div>
                            </section>

                            {/* Add to Existing Option */}
                            {existingBundles.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Add to Existing Bundle</h4>
                                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-bold rounded-md">Save Money</span>
                                    </div>
                                    <div className="space-y-3">
                                        {existingBundles.map((bundle) => (
                                            <button
                                                key={bundle.id}
                                                onClick={() => handleSelectBundle(bundle.id)}
                                                className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all hover:border-primary-500 hover:shadow-md hover:translate-x-1 group ${bundle.tier === 'GOLD' ? 'border-yellow-100 bg-yellow-50/20' : 'border-gray-100 bg-gray-50/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${bundle.tier === 'GOLD' ? 'bg-yellow-100' : 'bg-gray-100'
                                                        }`}>
                                                        {bundle.tier === 'GOLD' ? '🏆' : '🥈'}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-neutral-800 dark:text-neutral-200">{bundle.name}</p>
                                                        <p className="text-[11px] text-neutral-400 font-medium">Primary: {bundle.mainPropName}</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <i className="las la-plus text-primary-600"></i>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex flex-col gap-3">
                            {loadingBundles && (
                                <div className="flex items-center justify-center gap-2 text-primary-600 text-sm font-medium">
                                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    Syncing bundles...
                                </div>
                            )}
                            <button
                                onClick={() => handleCreateNewPackage('BRONZE')}
                                className="w-full py-4 text-sm font-bold text-neutral-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-all border border-transparent hover:border-primary-100"
                            >
                                <span className="mr-2">🥉</span> Skip bundle and list as Individual (Bronze)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageAddListingManageProperties;
