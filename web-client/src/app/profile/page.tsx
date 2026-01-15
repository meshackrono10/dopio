"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";

import { useToast } from "@/components/Toast";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("error", "Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("error", "New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            showToast("error", "New password must be at least 6 characters");
            return;
        }

        setChangingPassword(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword,
                newPassword
            });
            showToast("success", "Password updated successfully");
            setShowPasswordModal(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Failed to change password:", error);
            showToast("error", error.response?.data?.message || "Failed to update password");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") {
            showToast("error", "Please type DELETE to confirm");
            return;
        }

        setDeleting(true);
        try {
            await api.delete("/auth/account");
            showToast("success", "Account deleted successfully");
            logout();
            router.push("/");
        } catch (error: any) {
            console.error("Failed to delete account:", error);
            showToast("error", error.response?.data?.message || "Failed to delete account");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (!user) {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-2xl font-semibold">Please log in to view your profile</h2>
                <ButtonPrimary href={"/login" as any} className="mt-4">Log In</ButtonPrimary>
            </div>
        );
    }

    if (user.role === "HUNTER" && user.verificationStatus !== "APPROVED") {
        return (
            <div className="container py-24 text-center">
                <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="las la-clock text-4xl text-yellow-600"></i>
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">Verification Pending</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                        Your profile is currently under review. You will be able to access your full profile and manage listings once your account is approved.
                    </p>
                    <div className="flex justify-center gap-4">
                        <ButtonPrimary href={"/" as any} className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600">
                            Back to Home
                        </ButtonPrimary>
                        <button
                            onClick={logout}
                            className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="nc-ProfilePage container pb-24 lg:pb-32">
                <main className="pt-11">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl lg:text-4xl font-semibold">My Profile</h2>
                        <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                            Manage your account information
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-neutral-200 dark:border-neutral-700 mb-8">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "profile"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === "security"
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                Security
                            </button>
                        </nav>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="max-w-3xl">
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-700">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                                        {user.avatarUrl ? (
                                            <Image
                                                fill
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <i className="las la-user text-4xl text-neutral-400"></i>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                                            {user.name}
                                            {user.isVerified && (
                                                <i className="las la-check-circle text-primary-600"></i>
                                            )}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 capitalize">
                                            {user.role.toLowerCase()} Account • Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "recently"}
                                        </p>
                                        <ButtonPrimary href={"/profile/edit" as any} sizeClass="px-4 py-2 text-sm">
                                            Edit Profile
                                        </ButtonPrimary>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold">Contact Information</h4>

                                    <div>
                                        <label className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 block">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="flex-1 rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700"
                                            />
                                            <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 block">
                                            Phone Number
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="tel"
                                                value={user.phone || "Not provided"}
                                                disabled
                                                className="flex-1 rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700"
                                            />
                                            {user.phone && (
                                                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 block">
                                            Account Type
                                        </label>
                                        <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg capitalize">
                                            {user.role.toLowerCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="max-w-3xl">
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8">
                                <h4 className="text-lg font-semibold mb-6">Security Settings</h4>

                                <div className="space-y-6">
                                    {/* Password */}
                                    <div className="pb-6 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-medium mb-1">Password</h5>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    Last changed {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "recently"}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowPasswordModal(true)}
                                                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="pb-6 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-medium mb-1">Two-Factor Authentication</h5>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    Add an extra layer of security to your account
                                                </p>
                                            </div>
                                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                                Enable
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete Account */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-medium mb-1 text-red-600 dark:text-red-400">
                                                    Delete Account
                                                </h5>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    Permanently delete your account and all associated data
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="px-4 py-2 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
                        <div className="mb-4">
                            <i className="las la-exclamation-triangle text-5xl text-red-600 mb-2"></i>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                Delete Account?
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Type <span className="font-bold text-red-600">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-neutral-700"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText("");
                                }}
                                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== "DELETE" || deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                Change Password
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Enter your current password and a new password to update your account security.
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                disabled={changingPassword}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {changingPassword ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
