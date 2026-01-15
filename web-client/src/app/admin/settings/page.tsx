"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";

export default function Settings() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [isAuthenticated, user, router]);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert("Settings saved!");
        }, 1000);
    };

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Platform Settings</h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Configure platform preferences and policies
                    </p>
                </div>

                {/* General Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        General Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Platform Name
                            </label>
                            <input
                                type="text"
                                defaultValue="House Haunters"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Support Email
                            </label>
                            <input
                                type="email"
                                defaultValue="support@househaunters.com"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Commission Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Commission Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Platform Commission (%)
                            </label>
                            <input
                                type="number"
                                defaultValue="15"
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Minimum Booking Amount (KSh)
                            </label>
                            <input
                                type="number"
                                defaultValue="1000"
                                min="0"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Feature Toggles
                    </h2>
                    <div className="space-y-4">
                        <ToggleSwitch label="Enable Hunter Verification" defaultChecked />
                        <ToggleSwitch label="Allow Instant Booking" defaultChecked />
                        <ToggleSwitch label="Enable Messaging System" defaultChecked />
                        <ToggleSwitch label="Maintenance Mode" />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <ButtonPrimary onClick={handleSave} loading={saving}>
                        Save Changes
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}

function ToggleSwitch({
    label,
    defaultChecked = false,
}: {
    label: string;
    defaultChecked?: boolean;
}) {
    const [isChecked, setIsChecked] = React.useState(defaultChecked);

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
            <button
                onClick={() => setIsChecked(!isChecked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isChecked ? "bg-primary-600" : "bg-neutral-300 dark:bg-neutral-600"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
}
