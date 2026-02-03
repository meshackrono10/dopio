"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Avatar from "@/shared/Avatar";
import ButtonPrimary from "@/shared/ButtonPrimary";

export default function Users() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUsers = React.useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== "all" ? `?role=${filter.toUpperCase()}` : "";
            const response = await api.get(`/admin/users${params}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") {
            router.push("/");
            return;
        }

        fetchUsers();
    }, [isAuthenticated, user, filter, fetchUsers, router]);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSuspend = async (userId: string) => {
        if (!confirm("Suspend this user?")) return;

        try {
            await api.patch(`/admin/users/${userId}/status`, { verificationStatus: "REJECTED" });
            fetchUsers();
        } catch (error) {
            console.error("Failed to suspend user:", error);
        }
    };

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Users Management</h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Manage all platform users
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700"
                            />
                        </div>
                        <div className="flex gap-2">
                            {["all", "tenant", "hunter", "admin"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg capitalize ${filter === f
                                        ? "bg-primary-600 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Avatar imgUrl={u.avatarUrl} sizeClass="h-10 w-10" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                        {u.name}
                                                    </div>
                                                    <div className="text-sm text-neutral-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.verificationStatus === "APPROVED"
                                                    ? "bg-green-100 text-green-800"
                                                    : u.verificationStatus === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {u.verificationStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleSuspend(u.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Suspend
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-neutral-500">Total Users</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{users.length}</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-neutral-500">Hunters</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {users.filter((u) => u.role === "HUNTER").length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-neutral-500">Tenants</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {users.filter((u) => u.role === "TENANT").length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
