"use client";

import React, { useState } from "react";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";
import { Route } from "@/routers/types";
import Image from "next/image";

interface PostViewingModalProps {
    bookingId: string;
    hunterId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PostViewingModal({ bookingId, hunterId, onClose, onSuccess }: PostViewingModalProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
    const [feedback, setFeedback] = useState("");
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "evidence");

                const response = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.url;
            });

            const urls = await Promise.all(uploadPromises);
            setEvidenceUrls([...evidenceUrls, ...urls]);
            setEvidenceFiles([...evidenceFiles, ...files]);
            showToast("success", "Evidence uploaded successfully");
        } catch (error: any) {
            showToast("error", "Failed to upload evidence");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedOutcome) {
            showToast("error", "Please select an outcome");
            return;
        }

        if (selectedOutcome === "ISSUE_REPORTED" && evidenceUrls.length === 0) {
            showToast("error", "Please upload evidence for the issue");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/bookings/${bookingId}/outcome`, {
                outcome: selectedOutcome,
                feedback: feedback || undefined,
                evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
                evidenceDescription: selectedOutcome === "ISSUE_REPORTED" ? feedback : undefined,
            });

            showToast(
                "success",
                selectedOutcome === "COMPLETED_SATISFIED"
                    ? "Thank you! Payment has been released to the hunter."
                    : selectedOutcome === "ISSUE_REPORTED"
                        ? "Issue reported. Admin will review and contact you."
                        : "Alternative request submitted."
            );

            onSuccess();

            // Redirect to hunter profile if completed successfully
            if (selectedOutcome === "COMPLETED_SATISFIED") {
                router.push(`/haunter/${hunterId}?review=true&bookingId=${bookingId}` as Route);
            }
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to submit outcome");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Viewing Complete</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <i className="las la-times text-2xl"></i>
                        </button>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Please let us know how the viewing went
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Outcome Options */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium mb-3">
                            What would you like to do?
                        </label>

                        {/* Option 1: Satisfied */}
                        <button
                            onClick={() => setSelectedOutcome("COMPLETED_SATISFIED")}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOutcome === "COMPLETED_SATISFIED"
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-neutral-200 dark:border-neutral-700 hover:border-green-300"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedOutcome === "COMPLETED_SATISFIED"
                                    ? "border-green-500 bg-green-500"
                                    : "border-neutral-300"
                                    }`}>
                                    {selectedOutcome === "COMPLETED_SATISFIED" && (
                                        <i className="las la-check text-white text-sm"></i>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">✅ Viewing Completed Successfully</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                        The property matched the listing and I&apos;m satisfied with the service
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Report Issue */}
                        <button
                            onClick={() => setSelectedOutcome("ISSUE_REPORTED")}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOutcome === "ISSUE_REPORTED"
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : "border-neutral-200 dark:border-neutral-700 hover:border-red-300"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedOutcome === "ISSUE_REPORTED"
                                    ? "border-red-500 bg-red-500"
                                    : "border-neutral-300"
                                    }`}>
                                    {selectedOutcome === "ISSUE_REPORTED" && (
                                        <i className="las la-check text-white text-sm"></i>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">⚠️ Report an Issue</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                        The property doesn&apos;t match the listing or there were problems
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Option 3: Request Alternative */}
                        <button
                            onClick={() => setSelectedOutcome("ALTERNATIVE_REQUESTED")}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOutcome === "ALTERNATIVE_REQUESTED"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedOutcome === "ALTERNATIVE_REQUESTED"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-neutral-300"
                                    }`}>
                                    {selectedOutcome === "ALTERNATIVE_REQUESTED" && (
                                        <i className="las la-check text-white text-sm"></i>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">🔄 Request Alternative Property</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                        I&apos;d like to see a different property instead
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Feedback Text Area */}
                    {selectedOutcome && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {selectedOutcome === "COMPLETED_SATISFIED"
                                    ? "Additional Comments (Optional)"
                                    : selectedOutcome === "ISSUE_REPORTED"
                                        ? "Describe the Issue *"
                                        : "What are you looking for?"}
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={
                                    selectedOutcome === "COMPLETED_SATISFIED"
                                        ? "Share your experience..."
                                        : selectedOutcome === "ISSUE_REPORTED"
                                            ? "Please describe what didn't match or what issues you encountered..."
                                            : "Describe your ideal property..."
                                }
                                rows={4}
                                className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                    )}

                    {/* Evidence Upload (for Issue Reported) */}
                    {selectedOutcome === "ISSUE_REPORTED" && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Upload Evidence * (Photos/Videos)
                            </label>
                            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-6 text-center">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="evidence-upload"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="evidence-upload"
                                    className="cursor-pointer inline-flex flex-col items-center"
                                >
                                    <i className="las la-cloud-upload-alt text-5xl text-neutral-400 mb-2"></i>
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {uploading ? "Uploading..." : "Click to upload photos or videos"}
                                    </span>
                                </label>
                            </div>

                            {evidenceUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {evidenceUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                            <Image
                                                src={url}
                                                alt={`Evidence ${index + 1}`}
                                                fill
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <ButtonPrimary
                        onClick={handleSubmit}
                        loading={submitting || uploading}
                        disabled={!selectedOutcome}
                        className="flex-1"
                    >
                        Submit
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
