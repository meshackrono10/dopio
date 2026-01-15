"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Avatar from "@/shared/Avatar";

type TabType = "overview" | "hunters" | "tenants" | "listings";
type HunterFilterType = "all" | "pending" | "approved" | "rejected";

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [hunterFilter, setHunterFilter] = useState<HunterFilterType>("all");

    // State for data
    const [stats, setStats] = useState<any>(null);
    const [hunters, setHunters] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Check admin access
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        } else if (user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [isAuthenticated, user, router]);

    // Fetch data based on active tab
    useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") return;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === "overview") {
                    const response = await api.get("/admin/stats");
                    setStats(response.data);
                } else if (activeTab === "hunters") {
                    const status = hunterFilter === "all" ? "" : hunterFilter.toUpperCase();
                    const response = await api.get(`/admin/hunters${status ? `?status=${status}` : ""}`);
                    setHunters(response.data);
                } else if (activeTab === "tenants") {
                    const response = await api.get("/admin/tenants");
                    setTenants(response.data);
                } else if (activeTab === "listings") {
                    const response = await api.get("/admin/properties");
                    setProperties(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, hunterFilter, isAuthenticated, user]);

    const handleApproveHunter = async (hunterId: string) => {
        try {
            await api.patch(`/admin/hunters/${hunterId}/verification`, { status: "APPROVED" });
            alert("Hunter approved successfully!");
            // Refresh data
            const response = await api.get("/admin/hunters");
            setHunters(response.data);
        } catch (error) {
            console.error("Failed to approve hunter:", error);
            alert("Failed to approve hunter");
        }
    };

    const handleRejectHunter = async (hunterId: string) => {
        try {
            await api.patch(`/admin/hunters/${hunterId}/verification`, { status: "REJECTED" });
            alert("Hunter rejected");
            // Refresh data
            const response = await api.get("/admin/hunters");
            setHunters(response.data);
        } catch (error) {
            console.error("Failed to reject hunter:", error);
            alert("Failed to reject hunter");
        }
    };

    if (!isAuthenticated || user?.role !== "ADMIN") {
        return null;
    }

    const renderOverviewTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Users</p>
                            <p className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</p>
                        </div>
                        <i className="las la-users text-4xl text-primary-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Hunters</p>
                            <p className="text-3xl font-bold mt-2">{stats?.totalHunters || 0}</p>
                        </div>
                        <i className="las la-user-tie text-4xl text-blue-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Active Listings</p>
                            <p className="text-3xl font-bold mt-2">{stats?.activeListings || 0}</p>
                        </div>
                        <i className="las la-home text-4xl text-green-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Bookings</p>
                            <p className="text-3xl font-bold mt-2">{stats?.totalBookings || 0}</p>
                        </div>
                        <i className="las la-calendar-check text-4xl text-purple-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Pending Verifications</p>
                            <p className="text-3xl font-bold mt-2 text-orange-600">{stats?.pendingVerifications || 0}</p>
                        </div>
                        <i className="las la-clock text-4xl text-orange-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Revenue</p>
                            <p className="text-3xl font-bold mt-2">KSh {stats?.totalRevenue?.toLocaleString() || 0}</p>
                        </div>
                        <i className="las la-money-bill-wave text-4xl text-green-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Messages</p>
                            <p className="text-3xl font-bold mt-2">{stats?.totalMessages || 0}</p>
                        </div>
                        <i className="las la-comment-dots text-4xl text-indigo-600"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Recent Bookings (7d)</p>
                            <p className="text-3xl font-bold mt-2">{stats?.recentBookings || 0}</p>
                        </div>
                        <i className="las la-chart-line text-4xl text-teal-600"></i>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHuntersTab = () => {
        const filteredHunters = hunterFilter === "all"
            ? hunters
            : hunters.filter(h => h.verificationStatus?.toLowerCase() === hunterFilter);

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Hunters Management</h2>
                    <div className="flex space-x-2">
                        {(["all", "pending", "approved", "rejected"] as HunterFilterType[]).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setHunterFilter(filter)}
                                className={`px-4 py-2 rounded-lg capitalize ${hunterFilter === filter
                                        ? "bg-primary-600 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-800"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Hunter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Listings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Bookings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {filteredHunters.map((hunter) => (
                                <tr key={hunter.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar imgUrl={hunter.avatarUrl} sizeClass="h-10 w-10" />
                                            <span className="font-medium">{hunter.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{hunter.email}</p>
                                        <p className="text-sm text-neutral-500">{hunter.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{hunter.listingsCount} total</p>
                                        <p className="text-sm text-green-600">{hunter.activeListings} active</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{hunter.bookingsCount} total</p>
                                        <p className="text-sm text-green-600">{hunter.completedBookings} completed</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(hunter.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 text-xs rounded-full ${hunter.verificationStatus === "APPROVED"
                                                    ? "bg-green-100 text-green-800"
                                                    : hunter.verificationStatus === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {hunter.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {hunter.verificationStatus === "PENDING" && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApproveHunter(hunter.id)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectHunter(hunter.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTenantsTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Tenants Management</h2>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-100 dark:bg-neutral-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Tenant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Bookings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar imgUrl={tenant.avatarUrl} sizeClass="h-10 w-10" />
                                        <span className="font-medium">{tenant.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm">{tenant.email}</p>
                                    <p className="text-sm text-neutral-500">{tenant.phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p>{tenant.bookingsCount} total</p>
                                    <p className="text-sm text-green-600">{tenant.activeBookings} active</p>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {new Date(tenant.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderListingsTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Property Listings</h2>

            <div className="grid gap-4">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{property.title}</h3>
                                <p className="text-sm text-neutral-500 mt-1">{property.description}</p>
                                <div className="flex items-center space-x-4 mt-3">
                                    <span className="text-sm">
                                        <i className="las la-user mr-1"></i>
                                        {property.hunter.name}
                                    </span>
                                    <span className="text-sm font-semibold text-primary-600">
                                        KSh {property.rent?.toLocaleString()}/month
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-xs rounded-full ${property.status === "AVAILABLE"
                                                ? "bg-green-100 text-green-800"
                                                : property.status === "RENTED"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {property.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-neutral-500 mt-2">Manage users, listings, and platform operations</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-neutral-200 dark:border-neutral-700">
                {[
                    { id: "overview", label: "Overview", icon: "la-chart-bar" },
                    { id: "hunters", label: "Hunters", icon: "la-user-tie" },
                    { id: "tenants", label: "Tenants", icon: "la-users" },
                    { id: "listings", label: "Listings", icon: "la-home" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                                ? "border-b-2 border-primary-600 text-primary-600"
                                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                            }`}
                    >
                        <i className={`las ${tab.icon} mr-2`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {activeTab === "overview" && renderOverviewTab()}
                    {activeTab === "hunters" && renderHuntersTab()}
                    {activeTab === "tenants" && renderTenantsTab()}
                    {activeTab === "listings" && renderListingsTab()}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
