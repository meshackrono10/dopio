"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import Image from "next/image";
import Link from "next/link";
import { Route } from "@/routers/types";

interface ViewingRequest {
    id: string;
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    requestedDate: string;
    status: "pending" | "approved" | "rejected" | "completed";
    message?: string;
    createdAt: string;
}

export default function ViewingRequestsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<ViewingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchViewingRequests();
    }, []);

    const fetchViewingRequests = async () => {
        try {
            const response = await api.get("/viewing-requests/haunter");
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch viewing requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        try {
            await api.put(`/viewing-requests/${requestId}/approve`);
            showToast("success", "Viewing request approved");
            fetchViewingRequests();
        } catch (error) {
            showToast("error", "Failed to approve request");
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await api.put(`/viewing-requests/${requestId}/reject`);
            showToast("success", "Viewing request rejected");
            fetchViewingRequests();
        } catch (error) {
            showToast("error", "Failed to reject request");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Viewing Requests</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Manage property viewing requests from tenants
                    </p>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {requests.length} total requests
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <i className="las la-eye text-6xl text-neutral-300 dark:text-neutral-600"></i>
                    <h3 className="text-xl font-semibold mt-4">No viewing requests</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Viewing requests from tenants will appear here
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Property Image */}
                                <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={request.propertyImage || "/placeholder.jpg"}
                                        alt={request.propertyTitle}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Request Details */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{request.propertyTitle}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                Requested by: {request.tenantName}
                                            </p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Phone: {request.tenantPhone}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${request.status === "approved"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : request.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        : request.status === "rejected"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                }`}
                                        >
                                            {request.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Requested Date</p>
                                            <p className="font-medium">{new Date(request.requestedDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Submitted</p>
                                            <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {request.message && (
                                        <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Message:</p>
                                            <p className="text-sm">{request.message}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {request.status === "pending" && (
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Reject
                                            </button>
                                            <Link
                                                href={`/haunter-dashboard/messages?partnerId=${request.tenantId}`}
                                                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium"
                                            >
                                                Message
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
