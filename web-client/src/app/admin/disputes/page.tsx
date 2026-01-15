"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Route } from "@/routers/types";

export default function AdminDisputes() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") {
            router.push("/" as Route);
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Disputes</h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Manage platform disputes and resolutions
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
                    <i className="las la-balance-scale text-6xl text-neutral-400 mb-4"></i>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        No Active Disputes
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        All disputes have been resolved
                    </p>
                </div>
            </div>
        </div>
    );
}
