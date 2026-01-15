"use client";

import React, { useState } from "react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import Input from "@/shared/Input";
import Checkbox from "@/shared/Checkbox";

interface PackageConfig {
    tier: "BRONZE" | "SILVER" | "GOLD";
    name: string;
    defaultPrice: number;
    propertiesIncluded: number;
    features: string[];
    enabled: boolean;
    customPrice?: number;
}

const PACKAGE_DEFAULTS: Omit<PackageConfig, "enabled" | "customPrice">[] = [
    {
        tier: "BRONZE",
        name: "Bronze Package",
        defaultPrice: 1500,
        propertiesIncluded: 1,
        features: [
            "1 property viewing",
            "Property photos",
            "Standard response (48 hours)",
            "Basic viewing service",
        ],
    },
    {
        tier: "SILVER",
        name: "Silver Package",
        defaultPrice: 2500,
        propertiesIncluded: 3,
        features: [
            "Up to 3 property viewings",
            "Photos + videos",
            "Priority response (24 hours)",
            "Personalized recommendations",
        ],
    },
    {
        tier: "GOLD",
        name: "Gold Package",
        defaultPrice: 4500,
        propertiesIncluded: 5,
        features: [
            "Up to 5 property viewings",
            "Photos, videos + inspection report",
            "Immediate response (same day)",
            "Dedicated hunter support",
            "Flexible viewing schedule",
        ],
    },
];

export default function PageAddListingPackages() {
    const { formData, updateFormData } = usePropertyForm();
    const [packages, setPackages] = useState<PackageConfig[]>(() => {
        // If we have saved packages in formData, use them to initialize state
        if (formData.viewingPackages && formData.viewingPackages.length > 0) {
            return PACKAGE_DEFAULTS.map((defaultPkg) => {
                const savedPkg = formData.viewingPackages?.find(p => p.tier === defaultPkg.tier);
                if (savedPkg) {
                    return {
                        ...defaultPkg,
                        enabled: true,
                        customPrice: savedPkg.price,
                        // We could also restore other fields if they were editable
                    };
                } else {
                    return {
                        ...defaultPkg,
                        enabled: false,
                        customPrice: defaultPkg.defaultPrice,
                    };
                }
            });
        }

        // Otherwise use defaults
        return PACKAGE_DEFAULTS.map((pkg) => ({
            ...pkg,
            enabled: true,
            customPrice: pkg.defaultPrice,
        }));
    });

    const handleTogglePackage = (tier: string) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.tier === tier ? { ...pkg, enabled: !pkg.enabled } : pkg
            )
        );
    };

    const handlePriceChange = (tier: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.tier === tier ? { ...pkg, customPrice: numValue } : pkg
            )
        );
    };

    const handleSavePackages = () => {
        const enabledPackages = packages
            .filter((pkg) => pkg.enabled)
            .map((pkg) => ({
                tier: pkg.tier,
                name: pkg.name,
                price: pkg.customPrice || pkg.defaultPrice,
                propertiesIncluded: pkg.propertiesIncluded,
                features: pkg.features,
            }));

        updateFormData("viewingPackages", enabledPackages);
    };

    React.useEffect(() => {
        handleSavePackages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [packages]);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "BRONZE":
                return "from-orange-400 to-orange-600";
            case "SILVER":
                return "from-gray-300 to-gray-500";
            case "GOLD":
                return "from-yellow-400 to-yellow-600";
            default:
                return "from-primary-500 to-primary-700";
        }
    };

    return (
        <>
            <div>
                <h2 className="text-2xl font-semibold">Viewing Package Pricing</h2>
                <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    Configure your viewing packages. Prices are based on Kenyan market rates (KSh 500-3,000 per viewing).
                </span>
            </div>

            <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div
                        key={pkg.tier}
                        className={`relative border-2 rounded-xl p-6 transition-all ${pkg.enabled
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                            : "border-neutral-200 dark:border-neutral-700 opacity-50"
                            }`}
                    >
                        <div
                            className={`absolute -top-3 left-6 px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                                pkg.tier
                            )} text-white text-xs font-bold`}
                        >
                            {pkg.tier}
                        </div>

                        <div className="flex justify-end mb-4">
                            <Checkbox
                                label="Enable"
                                name={`enable-${pkg.tier}`}
                                checked={pkg.enabled}
                                onChange={() => handleTogglePackage(pkg.tier)}
                            />
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Price (KSh)
                                <span className="text-neutral-500 dark:text-neutral-400 text-xs ml-2">
                                    (Recommended: {pkg.defaultPrice})
                                </span>
                            </label>
                            <Input
                                type="number"
                                value={pkg.customPrice || pkg.defaultPrice}
                                onChange={(e) => handlePriceChange(pkg.tier, e.target.value)}
                                disabled={!pkg.enabled}
                                min={100}
                                step={100}
                            />
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                {pkg.propertiesIncluded}{" "}
                                {pkg.propertiesIncluded === 1 ? "viewing" : "viewings"} included
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Features:</p>
                            <ul className="space-y-1.5">
                                {pkg.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start text-sm text-neutral-600 dark:text-neutral-400"
                                    >
                                        <i className="las la-check-circle text-primary-600 mr-2 mt-0.5"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {pkg.enabled && pkg.customPrice && (
                            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Value per viewing:{" "}
                                    <span className="font-semibold text-primary-600">
                                        KSh {Math.round(pkg.customPrice / pkg.propertiesIncluded)}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex items-start">
                    <i className="las la-info-circle text-2xl text-primary-600 mr-3"></i>
                    <div>
                        <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
                            Pricing Tips
                        </h4>
                        <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
                            <li>• Market range: KSh 500 - 3,000 per viewing</li>
                            <li>• Multi-property packages offer better value</li>
                            <li>• Consider your target market</li>
                            <li>• Update pricing anytime from dashboard</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-8">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {packages.filter((p) => p.enabled).length} package(s) enabled
                </p>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Changes saved automatically
                </div>
            </div>
        </>
    );
}
