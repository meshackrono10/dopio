"use client";

import React, { FC } from "react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { TrashIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";

export interface PageAddListingManagePropertiesProps { }

const PageAddListingManageProperties: FC<PageAddListingManagePropertiesProps> = () => {
    const { formData, removePackageProperty, editPackageProperty, getPackageProgress } = usePropertyForm();
    const properties = formData.packageProperties || [];
    const progress = getPackageProgress();
    const isComplete = (properties.length + 1) >= progress.required;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold">Manage Package Properties</h2>
                <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    Review and manage all properties included in your {formData.selectedPackage} package.
                    {progress.required > 1 && !isComplete && (
                        <span className="text-primary-600 block mt-1 font-medium">
                            You need to add {progress.required - (properties.length + 1)} more property to complete this package.
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
                            onClick={() => {
                                /* Logic is handled by the Continue button in layout.tsx */
                                (window as any).nextStepTrigger = true;
                                const continueBtn = document.querySelector('button.nc-ButtonPrimary') as HTMLButtonElement;
                                continueBtn?.click();
                            }}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Save & Add Another Property
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
                    <p>All properties in the {formData.selectedPackage} package must be located in the same area ({formData.areaName || "the location of the first property"}).</p>
                </div>
            </div>
        </div>
    );
};

export default PageAddListingManageProperties;
