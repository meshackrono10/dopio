"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Route } from "@/routers/types";
import api from "@/services/api";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import ResolutionModal from "@/components/ResolutionModal";
import Avatar from "@/shared/Avatar";

type TabType = "overview" | "users" | "hunters" | "tenants" | "properties" | "verifications" | "disputes";

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [hunters, setHunters] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [pendingHunters, setPendingHunters] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: "danger" | "warning" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });
    const [resolutionModal, setResolutionModal] = useState<{
        isOpen: boolean;
        disputeId: string;
        disputeTitle: string;
    }>({
        isOpen: false,
        disputeId: "",
        disputeTitle: "",
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login" as Route);
        } else if (user && user.role !== "ADMIN") {
            router.push("/" as Route);
        }
    }, [user, router, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") return;
        fetchData();
    }, [isAuthenticated, user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, huntersRes, tenantsRes, pendingRes, disputesRes] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/users"),
                api.get("/admin/hunters"),
                api.get("/admin/tenants"),
                api.get("/admin/hunters?status=PENDING"),
                api.get("/disputes"),
            ]);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setHunters(huntersRes.data);
            setTenants(tenantsRes.data);
            setPendingHunters(pendingRes.data);
            setDisputes(disputesRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendUser = (userId: string, userName: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Suspend User",
            message: `Are you sure you want to suspend ${userName}? They will lose access to the platform.`,
            type: "danger",
            onConfirm: async () => {
                try {
                    await api.patch(`/admin/users/${userId}/status`, {
                        verificationStatus: "REJECTED",
                    });
                    toast.success("User suspended successfully");
                    fetchData();
                } catch (error) {
                    toast.error("Failed to suspend user");
                }
            },
        });
    };

    const handleApproveHunter = (hunterId: string, hunterName: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Approve Hunter",
            message: `Approve ${hunterName} as a verified hunter? They will gain access to all hunter features.`,
            type: "info",
            onConfirm: async () => {
                try {
                    await api.patch(`/admin/hunters/${hunterId}/verification`, { status: "APPROVED" });
                    toast.success("Hunter approved successfully!");
                    fetchData();
                } catch (error) {
                    toast.error("Failed to approve hunter");
                }
            },
        });
    };

    const handleRejectHunter = (hunterId: string, hunterName: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Reject Hunter",
            message: `Reject ${hunterName}'s verification? They will be able to re-submit documents.`,
            type: "warning",
            onConfirm: async () => {
                try {
                    await api.patch(`/admin/hunters/${hunterId}/verification`, { status: "REJECTED" });
                    toast.success("Hunter rejected");
                    fetchData();
                } catch (error) {
                    toast.error("Failed to reject hunter");
                }
            },
        });
    };

    if (!user || user.role !== "ADMIN") {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const tabs = [
        { id: "overview" as TabType, name: "Overview", icon: "las la-chart-line", count: null },
        { id: "users" as TabType, name: "Users", icon: "las la-users", count: users.length },
        { id: "hunters" as TabType, name: "Hunters", icon: "las la-user-tie", count: hunters.length },
        { id: "tenants" as TabType, name: "Tenants", icon: "las la-user", count: tenants.length },
        {
            id: "verifications" as TabType,
            name: "Verifications",
            icon: "las la-user-check",
            count: pendingHunters.length,
        },
        {
            id: "disputes" as TabType,
            name: "Disputes",
            icon: "las la-exclamation-triangle",
            count: disputes.filter((d: any) => d.status === "OPEN").length,
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        Manage your platform and monitor activity
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-200 dark:border-neutral-700 mb-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${activeTab === tab.id
                                        ? "border-primary-600 text-primary-600"
                                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                                    }
                                `}
                            >
                                <i className={`${tab.icon} text-xl`}></i>
                                {tab.name}
                                {tab.count !== null && (
                                    <span
                                        className={`
                                            ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${activeTab === tab.id
                                                ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                                                : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                            }
                                        `}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {/* Overview Tab */}
                    {activeTab === "overview" && stats && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title="Total Users"
                                    value={stats.totalUsers}
                                    icon="las la-users"
                                    color="blue"
                                />
                                <StatCard
                                    title="Active Listings"
                                    value={stats.activeListings}
                                    icon="las la-home"
                                    color="green"
                                />
                                <StatCard
                                    title="Total Bookings"
                                    value={stats.totalBookings}
                                    icon="las la-calendar-check"
                                    color="purple"
                                />
                                <StatCard
                                    title="Pending Verifications"
                                    value={stats.pendingVerifications}
                                    icon="las la-clock"
                                    color="orange"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-semibold mb-4">Platform Stats</h3>
                                    <div className="space-y-3">
                                        <StatRow label="Hunters" value={stats.totalHunters} />
                                        <StatRow label="Tenants" value={stats.totalTenants} />
                                        <StatRow label="Properties" value={stats.totalProperties} />
                                        <StatRow label="Messages" value={stats.totalMessages} />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                                    <div className="space-y-3">
                                        <StatRow label="Bookings (7 days)" value={stats.recentBookings} />
                                        <StatRow
                                            label="Total Revenue"
                                            value={`KSh ${stats.totalRevenue.toLocaleString()}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                        {users.map((usr) => (
                                            <tr key={usr.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Avatar imgUrl={usr.avatarUrl} sizeClass="h-10 w-10" />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                {usr.name}
                                                            </div>
                                                            <div className="text-sm text-neutral-500">{usr.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {usr.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usr.verificationStatus === "APPROVED"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            : usr.verificationStatus === "PENDING"
                                                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                            }`}
                                                    >
                                                        {usr.verificationStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                    {new Date(usr.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSuspendUser(usr.id, usr.name)}
                                                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                                    >
                                                        Suspend
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Hunters Tab */}
                    {activeTab === "hunters" && (
                        <div className="grid grid-cols-1 gap-4">
                            {hunters.map((hunter) => (
                                <div
                                    key={hunter.id}
                                    className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar imgUrl={hunter.avatarUrl} sizeClass="h-12 w-12" />
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                    {hunter.name}
                                                </h3>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {hunter.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                    {hunter.listingsCount || 0}
                                                </p>
                                                <p className="text-xs text-neutral-500">Listings</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                    {hunter.bookingsCount || 0}
                                                </p>
                                                <p className="text-xs text-neutral-500">Bookings</p>
                                            </div>
                                            <div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${hunter.verificationStatus === "APPROVED"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-orange-100 text-orange-800"
                                                        }`}
                                                >
                                                    {hunter.verificationStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tenants Tab */}
                    {activeTab === "tenants" && (
                        <div className="grid grid-cols-1 gap-4">
                            {tenants.map((tenant) => (
                                <div
                                    key={tenant.id}
                                    className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar imgUrl={tenant.avatarUrl} sizeClass="h-12 w-12" />
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                    {tenant.name}
                                                </h3>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {tenant.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {tenant.bookingsCount || 0}
                                            </p>
                                            <p className="text-xs text-neutral-500">Bookings</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Verifications Tab */}
                    {activeTab === "verifications" && (
                        <div className="space-y-4">
                            {pendingHunters.length === 0 ? (
                                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
                                    <i className="las la-check-circle text-6xl text-green-600 mb-4"></i>
                                    <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        No pending verifications
                                    </p>
                                </div>
                            ) : (
                                pendingHunters.map((hunter) => (
                                    <div
                                        key={hunter.id}
                                        className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar imgUrl={hunter.avatarUrl} sizeClass="h-16 w-16" />
                                                <div>
                                                    <h3 className="text-lg font-semibold">{hunter.name}</h3>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {hunter.email}
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {hunter.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documents Preview */}
                                        {(hunter.idFrontUrl || hunter.idBackUrl || hunter.selfieUrl) && (
                                            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                                <p className="text-sm font-medium mb-2">Verification Documents</p>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {hunter.idFrontUrl && (
                                                        <div>
                                                            <p className="text-xs text-neutral-500 mb-1">ID Front</p>
                                                            <img
                                                                src={hunter.idFrontUrl}
                                                                alt="ID Front"
                                                                className="w-full h-24 object-cover rounded border"
                                                            />
                                                        </div>
                                                    )}
                                                    {hunter.idBackUrl && (
                                                        <div>
                                                            <p className="text-xs text-neutral-500 mb-1">ID Back</p>
                                                            <img
                                                                src={hunter.idBackUrl}
                                                                alt="ID Back"
                                                                className="w-full h-24 object-cover rounded border"
                                                            />
                                                        </div>
                                                    )}
                                                    {hunter.selfieUrl && (
                                                        <div>
                                                            <p className="text-xs text-neutral-500 mb-1">Selfie</p>
                                                            <img
                                                                src={hunter.selfieUrl}
                                                                alt="Selfie"
                                                                className="w-full h-24 object-cover rounded border"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveHunter(hunter.id, hunter.name)}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                <i className="las la-check mr-1"></i>
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectHunter(hunter.id, hunter.name)}
                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                <i className="las la-times mr-1"></i>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Disputes Tab */}
                    {activeTab === "disputes" && (
                        <div className="space-y-4">
                            {/* Filter buttons */}
                            <div className="flex gap-2 mb-4">
                                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            if (status === "ALL") {
                                                fetchData();
                                            } else {
                                                api.get(`/disputes?status=${status}`)
                                                    .then((res) => setDisputes(res.data))
                                                    .catch((err) => toast.error("Failed to filter disputes"));
                                            }
                                        }}
                                        className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm"
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {disputes.length === 0 ? (
                                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
                                    <i className="las la-check-circle text-6xl text-green-600 mb-4"></i>
                                    <h3 className="text-lg font-semibold mb-2">No Disputes</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        All disputes have been resolved
                                    </p>
                                </div>
                            ) : (
                                disputes.map((dispute) => (
                                    <div
                                        key={dispute.id}
                                        className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{dispute.title}</h3>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${dispute.status === "OPEN"
                                                            ? "bg-red-100 text-red-800"
                                                            : dispute.status === "IN_PROGRESS"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : dispute.status === "RESOLVED"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {dispute.status}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${dispute.priority === "high"
                                                            ? "bg-red-50 text-red-700"
                                                            : dispute.priority === "medium"
                                                                ? "bg-orange-50 text-orange-700"
                                                                : "bg-blue-50 text-blue-700"
                                                            }`}
                                                    >
                                                        {dispute.priority} priority
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                                    {dispute.description}
                                                </p>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            imgUrl={dispute.reporter?.avatarUrl}
                                                            sizeClass="h-6 w-6"
                                                        />
                                                        <span className="text-neutral-600 dark:text-neutral-400">
                                                            Reporter: {dispute.reporter?.name}
                                                        </span>
                                                    </div>
                                                    {dispute.against && (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar
                                                                imgUrl={dispute.against?.avatarUrl}
                                                                sizeClass="h-6 w-6"
                                                            />
                                                            <span className="text-neutral-600 dark:text-neutral-400">
                                                                Against: {dispute.against?.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="text-neutral-500 dark:text-neutral-400">
                                                        Category: {dispute.category}
                                                    </span>
                                                    <span className="text-neutral-500 dark:text-neutral-400">
                                                        {new Date(dispute.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {dispute.resolution && (
                                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                                                            Resolution:
                                                        </p>
                                                        <p className="text-sm text-green-800 dark:text-green-200">
                                                            {dispute.resolution}
                                                        </p>
                                                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                                                            Resolved on{" "}
                                                            {new Date(dispute.resolvedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {dispute.status !== "RESOLVED" && dispute.status !== "CLOSED" && (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.patch(`/disputes/${dispute.id}`, {
                                                                status: "IN_PROGRESS",
                                                            });
                                                            toast.success("Dispute marked as in progress");
                                                            fetchData();
                                                        } catch (error) {
                                                            toast.error("Failed to update dispute");
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                                                >
                                                    Mark In Progress
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setResolutionModal({
                                                            isOpen: true,
                                                            disputeId: dispute.id,
                                                            disputeTitle: dispute.title,
                                                        });
                                                    }}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                                >
                                                    Resolve
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.patch(`/disputes/${dispute.id}`, {
                                                                status: "CLOSED",
                                                            });
                                                            toast.success("Dispute closed");
                                                            fetchData();
                                                        } catch (error) {
                                                            toast.error("Failed to close dispute");
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />

            {/* Resolution Modal */}
            <ResolutionModal
                isOpen={resolutionModal.isOpen}
                onClose={() => setResolutionModal((prev) => ({ ...prev, isOpen: false }))}
                onSubmit={(resolution) => {
                    api.patch(`/disputes/${resolutionModal.disputeId}`, {
                        resolution,
                        status: "RESOLVED",
                    })
                        .then(() => {
                            toast.success("Dispute resolved successfully");
                            fetchData();
                        })
                        .catch(() => toast.error("Failed to resolve dispute"));
                }}
                disputeTitle={resolutionModal.disputeTitle}
            />
        </div>
    );
}

// Helper Components
function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
        green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
        purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
        orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
                </div>
                <div className={`${colors[color]} p-3 rounded-lg`}>
                    <i className={`${icon} text-2xl`}></i>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{value}</span>
        </div>
    );
}
