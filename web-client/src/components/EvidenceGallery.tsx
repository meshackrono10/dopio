import React from "react";
import { PropertyEvidence } from "@/data/types";
import Image from "next/image";

interface EvidenceGalleryProps {
    evidence: PropertyEvidence[];
    onAccept?: (propertyId: string) => void;
    onReject?: (propertyId: string) => void;
    showActions?: boolean;
}

export default function EvidenceGallery({ evidence, onAccept, onReject, showActions = false }: EvidenceGalleryProps) {
    if (evidence.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center">
                <i className="las la-images text-6xl text-neutral-400 mb-4"></i>
                <h3 className="font-semibold mb-2">No Properties Submitted Yet</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                    The hunter is working on finding suitable properties for you.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {evidence.map((item, index) => (
                <div
                    key={item.propertyId}
                    className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Property #{index + 1}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                <i className="las la-map-marker-alt mr-1"></i>
                                {item.generalArea}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="px-4 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">Match Score</p>
                                <p className="text-2xl font-bold text-primary-600">{item.matchScore}%</p>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Photos Grid */}
                    {item.photos.length > 0 && (
                        <div className="p-4">
                            <h4 className="font-semibold mb-3">Photos ({item.photos.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {item.photos.map((photo, photoIdx) => (
                                    <div
                                        key={photoIdx}
                                        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                                    >
                                        <Image
                                            fill
                                            src={photo}
                                            alt={`Property ${index + 1} - Photo ${photoIdx + 1}`}
                                            className="object-cover group-hover:scale-110 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <i className="las la-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Videos */}
                    {item.videos.length > 0 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <h4 className="font-semibold mb-3">
                                <i className="las la-video mr-2"></i>
                                Video Walkthrough ({item.videos.length})
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-primary-600">
                                <i className="las la-play-circle text-xl"></i>
                                <span>Click to view walkthrough video</span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                            <button
                                onClick={() => item.propertyId && onAccept?.(String(item.propertyId))}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <i className="las la-check mr-2"></i>
                                Accept Property
                            </button>
                            <button
                                onClick={() => item.propertyId && onReject?.(String(item.propertyId))}
                                className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                            >
                                <i className="las la-times mr-2"></i>
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
