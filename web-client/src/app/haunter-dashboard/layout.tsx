"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Route } from "@/routers/types";

const HaunterDashboardLayout = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    const tabs = [
        { name: "Overview", href: "/haunter-dashboard", icon: "la-chart-line" },
        { name: "Bookings", href: "/haunter-dashboard/bookings", icon: "la-calendar-check" },
        { name: "Listings", href: "/haunter-dashboard/listings", icon: "la-home" },
        { name: "Viewing Requests", href: "/haunter-dashboard/viewing-requests", icon: "la-eye" },
        { name: "Reviews", href: "/haunter-dashboard/reviews", icon: "la-star" },
        { name: "Messages", href: "/haunter-dashboard/messages", icon: "la-comments" },
        { name: "Wallet", href: "/haunter-dashboard/wallet", icon: "la-wallet" },
        { name: "Notifications", href: "/haunter-dashboard/notifications", icon: "la-bell" },
    ];

    const isActive = (href: string) => {
        if (href === "/haunter-dashboard") {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-neutral-200 dark:border-neutral-700">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                                    transition-colors
                                    ${isActive(tab.href)
                                        ? "border-primary-600 text-primary-600 dark:text-primary-500"
                                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                                    }
                                `}
                            >
                                <i className={`las ${tab.icon} text-xl`}></i>
                                <span className="hidden sm:inline">{tab.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Page Content */}
            <div>{children}</div>
        </div>
    );
};

export default HaunterDashboardLayout;
