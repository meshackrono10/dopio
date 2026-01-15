"use client";

import React, { useState } from "react";
import { Issue } from "@/data/types";

interface CreateIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: "tenant" | "haunter";
    userName: string;
    userId: string;
}

export default function CreateIssueModal({
    isOpen,
    onClose,
    userRole,
    userName,
    userId,
}: CreateIssueModalProps) {
    const [issueType, setIssueType] = useState<Issue["type"]>("other");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Issue["priority"]>("medium");
    const [attachments, setAttachments] = useState<File[]>([]);

    const issueTypes: { value: Issue["type"]; label: string }[] = [
        { value: "booking_dispute", label: "Booking Dispute" },
        { value: "payment_problem", label: "Payment Problem" },
        { value: "property_mismatch", label: "Property Mismatch" },
        { value: "unprofessional_behavior", label: "Unprofessional Behavior" },
        { value: "platform_bug", label: "Platform Bug" },
        { value: "other", label: "Other" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");
            const isUnder10MB = file.size <= 10 * 1024 * 1024;
            return (isImage || isVideo) && isUnder10MB;
        });
        setAttachments([...attachments, ...validFiles].slice(0, 3)); // Max 3 files
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would upload files to Cloudinary first
        const newIssue: Issue = {
            id: `issue-${Date.now()}`,
            type: issueType,
            title,
            description,
            status: "pending",
            priority,
            createdBy: {
                id: userId,
                name: userName,
                role: userRole,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log("New issue created:", newIssue);
        console.log("Attachments:", attachments);
        alert(`Issue "${title}" has been submitted successfully with ${attachments.length} attachment(s)! Our admin team will review it shortly.`);

        // Reset form
        setTitle("");
        setDescription("");
        setIssueType("other");
        setPriority("medium");
        setAttachments([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Report an Issue</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
                        >
                            <i className="las la-times text-2xl"></i>
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                        Describe your issue and our admin team will review it as soon as possible.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    {/* Issue Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Issue Type *
                        </label>
                        <select
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value as Issue["type"])}
                            required
                            className="block w-full rounded-xl border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                        >
                            {issueTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Priority Level
                        </label>
                        <div className="flex gap-2">
                            {(["low", "medium", "high", "urgent"] as Issue["priority"][]).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors capitalize ${priority === p
                                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                        : "border-neutral-300 dark:border-neutral-600 hover:border-primary-400"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Issue Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Brief description of your issue"
                            required
                            maxLength={100}
                            className="block w-full rounded-xl border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                        />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {title.length}/100 characters
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Detailed Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide as much detail as possible about your issue. Include any relevant transaction IDs, dates, or other information that might help us resolve it."
                            required
                            rows={6}
                            className="block w-full rounded-xl border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Attachments (Optional)
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                            Upload images or videos to help explain your issue (Max 3 files, 10MB each)
                        </p>

                        <div className="space-y-3">
                            {/* File Input */}
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer bg-neutral-50 dark:bg-neutral-900/50">
                                <div className="text-center">
                                    <i className="las la-cloud-upload-alt text-4xl text-neutral-400 mb-2"></i>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                        Click to upload images or videos
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        PNG, JPG, MP4, MOV (max 10MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={attachments.length >= 3}
                                />
                            </label>

                            {/* Preview Uploaded Files */}
                            {attachments.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                                            >
                                                <i className="las la-times text-sm"></i>
                                            </button>
                                            <div className="flex flex-col items-center">
                                                {file.type.startsWith("image/") ? (
                                                    <i className="las la-image text-3xl text-primary-600 mb-1"></i>
                                                ) : (
                                                    <i className="las la-video text-3xl text-primary-600 mb-1"></i>
                                                )}
                                                <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate w-full text-center">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title || !description}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            <i className="las la-paper-plane mr-2"></i>
                            Submit Issue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
