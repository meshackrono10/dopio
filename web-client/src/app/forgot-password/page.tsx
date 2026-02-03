"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Input from "@/shared/Input";
import { Route } from "@/routers/types";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }
        // Redirect to reset password page with email as query param
        router.push(`/reset-password?email=${encodeURIComponent(email)}` as Route);
    };

    return (
        <div className="nc-ForgotPasswordPage">
            <div className="container">
                <div className="max-w-md mx-auto py-16 lg:py-24">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Forgot Password?</h1>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Enter your email address and we&apos;ll help you reset your password.
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
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <ButtonPrimary type="submit" className="w-full">
                                Continue
                            </ButtonPrimary>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Remember your password?{" "}
                                <Link
                                    href={"/login" as Route}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Back to login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
