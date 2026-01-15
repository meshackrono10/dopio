"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Avatar from "@/shared/Avatar";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";

export default function Verifications() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [hunters, setHunters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedHunter, setSelectedHunter] = useState<any>(null);
    const [showDocuments, setShowDocuments] = useState(false);
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

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") {
            router.push("/");
            return;
        }

        fetchHunters();
    }, [isAuthenticated, user]);

    const fetchHunters = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/hunters?status=PENDING");
            setHunters(response.data);
        } catch (error) {
            console.error("Failed to fetch hunters:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (hunterId: string) => {
        try {
            await api.patch(`/admin/hunters/${hunterId}/verification`, { status: "APPROVED" });
            toast.success("Hunter approved successfully!");
            fetchHunters();
            setShowDocuments(false);
            setSelectedHunter(null);
        } catch (error) {
            console.error("Failed to approve:", error);
            toast.error("Failed to approve hunter");
        }
    };

    const handleReject = async (hunterId: string, hunterName: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Reject Hunter Verification",
            message: `Are you sure you want to reject ${hunterName}'s verification? They will be able to re-submit documents.`,
            type: "warning",
            onConfirm: async () => {
                try {
                    await api.patch(`/admin/hunters/${hunterId}/verification`, { status: "REJECTED" });
                    toast.success("Hunter rejected");
                    fetchHunters();
                    setShowDocuments(false);
                    setSelectedHunter(null);
                } catch (error) {
                    console.error("Failed to reject:", error);
                    toast.error("Failed to reject hunter");
                }
            },
        });
    };

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Hunter Verifications
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Review and approve pending hunter applications
                    </p>
                </div>

                {/* Pending Count */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <i className="las la-clock text-2xl text-orange-600 mr-3"></i>
                        <div>
                            <p className="font-semibold text-orange-900 dark:text-orange-100">
                                {hunters.length} Pending Review{hunters.length !== 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Please review and take action
                            </p>
                        </div>
                    </div>
                </div>

                {/* Verifications List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : hunters.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
                        <i className="las la-check-circle text-6xl text-green-600 mb-4"></i>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            All Caught Up!
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            No pending hunter verifications at this time
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {hunters.map((hunter) => (
                            <div
                                key={hunter.id}
                                className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center flex-1">
                                        <Avatar imgUrl={hunter.avatarUrl} sizeClass="h-16 w-16" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                {hunter.name}
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{hunter.email}</p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{hunter.phone}</p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Applied: {new Date(hunter.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Documents */}
                                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                                    <h4 className="font-medium text-sm mb-3 text-neutral-900 dark:text-white">
                                        Verification Documents
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {hunter.idFrontUrl && (
                                            <div>
                                                <p className="text-xs text-neutral-500 mb-2">ID Front</p>
                                                <img
                                                    src={hunter.idFrontUrl}
                                                    alt="ID Front"
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-primary-500 transition-colors"
                                                    onClick={() => {
                                                        setSelectedHunter(hunter);
                                                        setShowDocuments(true);
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {hunter.idBackUrl && (
                                            <div>
                                                <p className="text-xs text-neutral-500 mb-2">ID Back</p>
                                                <img
                                                    src={hunter.idBackUrl}
                                                    alt="ID Back"
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-primary-500 transition-colors"
                                                    onClick={() => {
                                                        setSelectedHunter(hunter);
                                                        setShowDocuments(true);
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {hunter.selfieUrl && (
                                            <div>
                                                <p className="text-xs text-neutral-500 mb-2">Selfie</p>
                                                <img
                                                    src={hunter.selfieUrl}
                                                    alt="Selfie"
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-primary-500 transition-colors"
                                                    onClick={() => {
                                                        setSelectedHunter(hunter);
                                                        setShowDocuments(true);
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {!hunter.idFrontUrl && !hunter.idBackUrl && !hunter.selfieUrl && (
                                            <div className="col-span-3 text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                <i className="las la-exclamation-triangle text-yellow-600 text-2xl"></i>
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                                                    No verification documents uploaded yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {(hunter.idFrontUrl || hunter.idBackUrl || hunter.selfieUrl) && (
                                        <button
                                            onClick={() => {
                                                setSelectedHunter(hunter);
                                                setShowDocuments(true);
                                            }}
                                            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            View Full Size Documents →
                                        </button>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(hunter.id)}
                                        disabled={!hunter.idFrontUrl || !hunter.idBackUrl || !hunter.selfieUrl}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="las la-check mr-1"></i>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(hunter.id, hunter.name)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <i className="las la-times mr-1"></i>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Viewer Modal */}
            {showDocuments && selectedHunter && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {selectedHunter.name} - Verification Documents
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {selectedHunter.email}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDocuments(false);
                                    setSelectedHunter(null);
                                }}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
                            >
                                <i className="las la-times text-2xl"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {selectedHunter.idFrontUrl && (
                                <div>
                                    <h3 className="font-semibold mb-3">ID Front</h3>
                                    <img
                                        src={selectedHunter.idFrontUrl}
                                        alt="ID Front"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700"
                                    />
                                </div>
                            )}

                            {selectedHunter.idBackUrl && (
                                <div>
                                    <h3 className="font-semibold mb-3">ID Back</h3>
                                    <img
                                        src={selectedHunter.idBackUrl}
                                        alt="ID Back"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700"
                                    />
                                </div>
                            )}

                            {selectedHunter.selfieUrl && (
                                <div>
                                    <h3 className="font-semibold mb-3">Selfie with ID</h3>
                                    <img
                                        src={selectedHunter.selfieUrl}
                                        alt="Selfie"
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6 flex gap-4">
                            <button
                                onClick={() => handleApprove(selectedHunter.id)}
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                <i className="las la-check mr-2"></i>
                                Approve Hunter
                            </button>
                            <button
                                onClick={() => handleReject(selectedHunter.id, selectedHunter.name)}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                <i className="las la-times mr-2"></i>
                                Reject Application
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    );
}
