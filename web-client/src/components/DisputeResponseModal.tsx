"use client";

import React, { useState } from "react";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface DisputeResponseModalProps {
    disputeId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DisputeResponseModal({ disputeId, onClose, onSuccess }: DisputeResponseModalProps) {
    const { showToast } = useToast();
    const [response, setResponse] = useState("");
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
                formData.append("folder", "dispute_responses");

                const res = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return res.data.url;
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
        if (!response.trim()) {
            showToast("error", "Please provide a response");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/disputes/${disputeId}/respond`, {
                response,
                evidenceUrl: evidenceUrls.length > 0 ? evidenceUrls : undefined,
            });

            showToast("success", "Response submitted successfully");
            onSuccess();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to submit response");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Respond to Dispute</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <i className="las la-times text-2xl"></i>
                        </button>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Provide your side of the story and any supporting evidence
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Your Response *
                        </label>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Explain what happened..."
                            rows={6}
                            className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Upload Supporting Evidence (Optional)
                        </label>
                        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-6 text-center">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                id="dispute-evidence-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="dispute-evidence-upload"
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
                                        <img
                                            src={url}
                                            alt={`Evidence ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

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
                        disabled={!response.trim()}
                        className="flex-1"
                    >
                        Submit Response
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
