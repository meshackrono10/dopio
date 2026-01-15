"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import avatar from "@/images/avatars/Image-1.png";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
    const router = useRouter();
    const [name, setName] = useState("Jane Doe");
    const [email, setEmail] = useState("jane.doe@example.com");
    const [phone, setPhone] = useState("+254 712 345 678");
    const [bio, setBio] = useState("Looking for a modern 2-bedroom apartment in Nairobi with good transport links.");
    const [profileImage, setProfileImage] = useState(avatar);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as any);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // In real app, save to backend
        alert("Profile updated successfully!");
        router.push("/profile");
    };

    return (
        <div className="nc-EditProfilePage container pb-24 lg:pb-32">
            <main className="pt-11">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl lg:text-4xl font-semibold">Edit Profile</h2>
                    <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                        Update your personal information
                    </span>
                </div>

                <div className="max-w-3xl">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8">
                        {/* Profile Picture Upload */}
                        <div className="mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-700">
                            <label className="text-sm font-medium mb-4 block">Profile Picture</label>
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                    <Image
                                        fill
                                        src={profileImage}
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <label className="cursor-pointer px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium inline-block">
                                        Change Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                        JPG, PNG or GIF (max. 2MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Email Address *
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        className="flex-1 rounded-lg border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                                    />
                                    <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                                        Verified
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Phone Number *
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+254 712 345 678"
                                        className="flex-1 rounded-lg border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                                    />
                                    <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                                        Verified
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us a bit about yourself and what you're looking for..."
                                    rows={4}
                                    maxLength={200}
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                                />
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    {bio.length}/200 characters
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <ButtonPrimary
                                onClick={handleSave}
                                className="flex-1"
                                sizeClass="px-6 py-3"
                            >
                                <i className="las la-save mr-2"></i>
                                Save Changes
                            </ButtonPrimary>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
