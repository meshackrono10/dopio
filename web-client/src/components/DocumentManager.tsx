"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Document, MOCK_DOCUMENTS } from "@/data/mockDocuments";
import { format } from "date-fns";

interface DocumentManagerProps {
    userType?: "tenant" | "haunter" | "admin";
    className?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
    userType = "tenant",
    className = "",
}) => {
    const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
    const [filter, setFilter] = useState<string>("all");
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Handle file upload
        acceptedFiles.forEach((file) => {
            const newDoc: Document = {
                id: `doc-${Date.now()}`,
                name: file.name,
                type: "other",
                fileUrl: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString(),
                uploadedBy: "current-user",
                size: file.size,
                mimeType: file.type,
                status: "pending",
            };
            setDocuments(prev => [newDoc, ...prev]);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
    });

    const filteredDocs = filter === "all"
        ? documents
        : documents.filter(doc => doc.type === filter);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "id": return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
            case "contract": return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
            case "receipt": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
            case "lease": return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300";
            case "verification": return "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300";
            default: return "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300";
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "approved": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
            case "pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";
            case "rejected": return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
            default: return "";
        }
    };

    return (
        <div className={`document-manager ${className}`}>
            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center cursor-pointer transition-colors ${isDragActive
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                        : "border-neutral-300 dark:border-neutral-600 hover:border-primary-400"
                    }`}
            >
                <input {...getInputProps()} />
                <i className="las la-cloud-upload-alt text-6xl text-neutral-400 dark:text-neutral-500 mb-3"></i>
                <p className="text-lg font-medium mb-2">
                    {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    or click to browse • PDF, DOC, DOCX, JPG, PNG • Max 10MB
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {["all", "id", "contract", "lease", "receipt", "verification", "other"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize whitespace-nowrap ${filter === type
                                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                : "border-neutral-300 dark:border-neutral-600 hover:border-primary-400"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                    <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize mb-2 ${getTypeColor(doc.type)}`}>
                                    {doc.type}
                                </span>
                                {doc.status && (
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ml-2 ${getStatusColor(doc.status)}`}>
                                        {doc.status}
                                    </span>
                                )}
                            </div>
                            <i className="las la-file-pdf text-3xl text-red-500"></i>
                        </div>

                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">{doc.name}</h4>

                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{format(new Date(doc.uploadedAt), "MMM dd, yyyy")}</span>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                <i className="las la-eye mr-1"></i>
                                View
                            </button>
                            <button className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors">
                                <i className="las la-download"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                    <i className="las la-folder-open text-6xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        No documents found in this category
                    </p>
                </div>
            )}

            {/* Document Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedDoc(null)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800 z-10">
                            <h3 className="text-xl font-semibold">{selectedDoc.name}</h3>
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
                            >
                                <i className="las la-times text-2xl"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-12 flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <i className="las la-file-pdf text-8xl text-neutral-400 mb-4"></i>
                                    <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                                        Document preview would appear here
                                    </p>
                                    <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                        <i className="las la-download mr-2"></i>
                                        Download Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
