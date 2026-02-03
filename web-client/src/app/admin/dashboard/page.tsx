"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";

type AdminTab = "stats" | "users" | "properties" | "disputes";

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<AdminTab>("stats");
    const [stats, setStats] = useState<any>(null);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === "stats") {
                const res = await api.get("/admin/stats");
                setStats(res.data);
            } else if (activeTab === "disputes") {
                const res = await api.get("/admin/disputes");
                setDisputes(res.data);
            } else if (activeTab === "users") {
                const res = await api.get("/admin/users");
                setUsers(res.data);
            } else if (activeTab === "properties") {
                const res = await api.get("/admin/properties");
                setProperties(res.data);
            }
        } catch (error: any) {
            showToast("error", "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, [activeTab, showToast]);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "ADMIN")) {
            router.push("/");
            return;
        }
        fetchData();
    }, [user, authLoading, activeTab, router, fetchData]);

    const handleUpdateUserStatus = async (userId: string, status: string) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, { verificationStatus: status });
            showToast("success", "User status updated");
            fetchData();
        } catch (error: any) {
            showToast("error", "Failed to update user status");
        }
    };

    const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject') => {
        const reason = action === 'reject' ? prompt("Enter rejection reason:") : null;
        if (action === 'reject' && reason === null) return;

        try {
            await api.post(`/admin/properties/${propertyId}/${action}`, { reason });
            showToast("success", `Property ${action}ed`);
            fetchData();
        } catch (error: any) {
            showToast("error", `Failed to ${action} property`);
        }
    };

    const handleResolveDispute = async (disputeId: string, action: string) => {
        const resolution = prompt("Enter resolution details:");
        if (resolution === null) return;

        try {
            await api.post(`/admin/disputes/${disputeId}/resolve`, {
                resolution,
                action
            });
            showToast("success", "Dispute resolved");
            fetchData();
        } catch (error: any) {
            showToast("error", "Failed to resolve dispute");
        }
    };

    if (authLoading || !user || user.role !== "ADMIN") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="container py-8 lg:py-16">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="lg:w-1/4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab("stats")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "stats"
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                    }`}
                            >
                                <i className="las la-chart-bar text-xl"></i>
                                <span className="font-medium">Statistics</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("disputes")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "disputes"
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                    }`}
                            >
                                <i className="las la-exclamation-circle text-xl"></i>
                                <span className="font-medium">Disputes</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "users"
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                    }`}
                            >
                                <i className="las la-users text-xl"></i>
                                <span className="font-medium">Users</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("properties")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "properties"
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                    }`}
                            >
                                <i className="las la-home text-xl"></i>
                                <span className="font-medium">Properties</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === "stats" && stats && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold">Platform Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Users" value={stats.totalUsers} icon="la-users" color="blue" />
                                <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon="la-wallet" color="green" />
                                <StatCard title="Properties" value={stats.totalProperties} icon="la-home" color="purple" />
                                <StatCard title="Bookings" value={stats.totalBookings} icon="la-calendar-check" color="orange" />
                            </div>
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">User Management</h2>
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                                            <th className="px-6 py-4 font-bold text-sm uppercase">User</th>
                                            <th className="px-6 py-4 font-bold text-sm uppercase">Role</th>
                                            <th className="px-6 py-4 font-bold text-sm uppercase">Status</th>
                                            <th className="px-6 py-4 font-bold text-sm uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-neutral-100 rounded-full overflow-hidden relative">
                                                            <Image fill src={u.avatarUrl || "/placeholder.jpg"} alt={u.name} className="object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{u.name}</p>
                                                            <p className="text-xs text-neutral-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm">{u.role}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {u.verificationStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {u.role === 'HUNTER' && u.verificationStatus !== 'APPROVED' && (
                                                            <button onClick={() => handleUpdateUserStatus(u.id, 'APPROVED')} className="text-primary-600 hover:underline text-sm">Verify</button>
                                                        )}
                                                        <button onClick={() => handleUpdateUserStatus(u.id, 'SUSPENDED')} className="text-red-600 hover:underline text-sm">Suspend</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "properties" && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Property Management</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {properties.map(p => (
                                    <div key={p.id} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 flex gap-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden relative flex-shrink-0">
                                            <Image fill src={p.images?.[0] || "/placeholder.jpg"} alt={p.title} className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{p.title}</h3>
                                                    <p className="text-sm text-neutral-500">{p.hunter.name}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                {p.status === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button onClick={() => handlePropertyAction(p.id, 'approve')} className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">Approve</button>
                                                        <button onClick={() => handlePropertyAction(p.id, 'reject')} className="px-3 py-1 border border-red-500 text-red-500 rounded-lg text-sm">Reject</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "disputes" && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Dispute Resolution</h2>
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-700 animate-pulse rounded-2xl"></div>
                                    ))}
                                </div>
                            ) : disputes.length > 0 ? (
                                <div className="space-y-4">
                                    {disputes.map((dispute) => (
                                        <div key={dispute.id} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${dispute.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {dispute.status}
                                                    </span>
                                                    <h3 className="text-xl font-bold mt-2">{dispute.title}</h3>
                                                    <p className="text-neutral-500 text-sm">{new Date(dispute.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">Category: {dispute.category}</p>
                                                    <p className="text-sm text-neutral-500">Booking: {dispute.bookingId?.slice(0, 8)}...</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Reporter</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                                                            <i className="las la-user"></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{dispute.reporter.name}</p>
                                                            <p className="text-xs text-neutral-500">{dispute.reporter.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Against</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                                                            <i className="las la-user"></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{dispute.against?.name || "N/A"}</p>
                                                            <p className="text-xs text-neutral-500">{dispute.against?.email || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <p className="text-sm font-medium mb-2">Description:</p>
                                                <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700/30 p-4 rounded-xl">
                                                    {dispute.description}
                                                </p>
                                            </div>

                                            {dispute.status === 'OPEN' && (
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        onClick={() => handleResolveDispute(dispute.id, 'REFUND')}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                                    >
                                                        Refund Tenant
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolveDispute(dispute.id, 'RELEASE_PAYMENT')}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                                    >
                                                        Release to Hunter
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolveDispute(dispute.id, 'NONE')}
                                                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
                                                    >
                                                        Resolve (No Action)
                                                    </button>
                                                </div>
                                            )}

                                            {dispute.status === 'RESOLVED' && (
                                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl">
                                                    <p className="text-sm font-bold text-green-800 dark:text-green-200">Resolution:</p>
                                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">{dispute.resolution}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                                    <i className="las la-check-circle text-5xl text-neutral-300 mb-4"></i>
                                    <p className="text-neutral-500">No disputes found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
                <i className={`las ${icon} text-2xl`}></i>
            </div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
    );
}
