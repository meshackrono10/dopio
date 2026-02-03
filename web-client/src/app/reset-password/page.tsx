"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Input from "@/shared/Input";
import { Route } from "@/routers/types";
import axios from "axios";
import { useToast } from "@/components/Toast";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const { showToast } = useToast();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!newPassword || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            await axios.post(`${apiUrl}/auth/reset-password`, {
                email,
                newPassword,
            });

            showToast("success", "Password reset successfully! You can now log in.");
            router.push("/login" as Route);
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="container py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
                <p className="mb-8">Please go back to the forgot password page and try again.</p>
                <Link href={"/forgot-password" as Route}>
                    <ButtonPrimary>Go Back</ButtonPrimary>
                </Link>
            </div>
        );
    }

    return (
        <div className="nc-ResetPasswordPage">
            <div className="container">
                <div className="max-w-md mx-auto py-16 lg:py-24">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Reset Password</h1>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Enter a new password for <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
                                    <i className="las la-exclamation-circle mr-2"></i>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            <ButtonPrimary type="submit" loading={loading} className="w-full">
                                Reset Password
                            </ButtonPrimary>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
