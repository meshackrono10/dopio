"use client";

import React, { useState } from "react";
import { PropertyEvidence } from "@/data/types";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface EvidenceUploadProps {
    requestId: string;
    currentEvidence: PropertyEvidence[];
    onUpload: (evidence: PropertyEvidence) => void;
}

export default function EvidenceUpload({ requestId, currentEvidence, onUpload }: EvidenceUploadProps) {
    const [newProperty, setNewProperty] = useState<Partial<PropertyEvidence>>({
        photos: [],
        videos: [],
        description: "",
        generalArea: "",
        matchScore: 0,
    });

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Mock upload - in production, upload to Cloudinary
        const newPhotos: string[] = [];
        const newPreviews: string[] = [];

        Array.from(files).forEach((file, index) => {
            const mockUrl = `https://images.unsplash.com/photo-${1600000000000 + (currentEvidence.length * 10) + index}?w=800`;
            newPhotos.push(mockUrl);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    newPreviews.push(event.target.result as string);
                    if (newPreviews.length === files.length) {
                        setPreviewUrls([...previewUrls, ...newPreviews]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });

        setNewProperty({
            ...newProperty,
            photos: [...(newProperty.photos || []), ...newPhotos],
        });
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Mock video upload
        const mockVideoUrls = Array.from(files).map((_, index) =>
            `https://player.vimeo.com/video/${500000000 + (currentEvidence.length * 5) + index}`
        );

        setNewProperty({
            ...newProperty,
            videos: [...(newProperty.videos || []), ...mockVideoUrls],
        });
        setVideoUrls([...videoUrls, ...mockVideoUrls]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newProperty.photos || newProperty.photos.length < 3) {
            alert("Please upload at least 3 photos");
            return;
        }

        if (!newProperty.description) {
            alert("Please add a description");
            return;
        }

        // Calculate mock match score
        const matchScore = Math.floor(Math.random() * 20) + 80; // 80-100%

        const evidence: PropertyEvidence = {
            propertyId: `prop-${Date.now()}`,
            photos: newProperty.photos,
            videos: newProperty.videos || [],
            description: newProperty.description,
            generalArea: newProperty.generalArea || "Area not specified",
            matchScore: matchScore,
            uploadedAt: new Date().toISOString(),
        };

        onUpload(evidence);

        // Reset form
        setNewProperty({
            photos: [],
            videos: [],
            description: "",
            generalArea: "",
            matchScore: 0,
        });
        setPreviewUrls([]);
        setVideoUrls([]);

        alert(`Property evidence submitted! Match Score: ${matchScore}%`);
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">
                Upload Property Evidence
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                    ({currentEvidence.length}/3 properties submitted)
                </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photos */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Photos <span className="text-red-500">*</span>
                        <span className="text-xs text-neutral-500 ml-2">(Minimum 3 required)</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="block w-full text-sm text-neutral-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary-50 file:text-primary-700
                            hover:file:bg-primary-100
                            dark:file:bg-primary-900/20 dark:file:text-primary-400"
                    />
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-3">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                        {newProperty.photos?.length || 0} photo(s) uploaded
                    </p>
                </div>

                {/* Videos */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Videos (Optional)
                        <span className="text-xs text-neutral-500 ml-2">(Walkthrough recommended)</span>
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="block w-full text-sm text-neutral-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary-50 file:text-primary-700
                            hover:file:bg-primary-100
                            dark:file:bg-primary-900/20 dark:file:text-primary-400"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        {newProperty.videos?.length || 0} video(s) uploaded
                    </p>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Property Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={newProperty.description}
                        onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                        rows={4}
                        placeholder="Describe the property, its condition, amenities, and why it matches the request..."
                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-auto px-4 py-3"
                        required
                    />
                </div>

                {/* General Area */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        General Area/Neighborhood
                    </label>
                    <input
                        type="text"
                        value={newProperty.generalArea}
                        onChange={(e) => setNewProperty({ ...newProperty, generalArea: e.target.value })}
                        placeholder="e.g., Westlands, Kilimani"
                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        <i className="las la-shield-alt mr-1"></i>
                        Exact address remains private - only general area is shown
                    </p>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                    <ButtonPrimary type="submit" className="flex-1">
                        <i className="las la-upload mr-2"></i>
                        Submit Property
                    </ButtonPrimary>
                </div>

                {/* Progress Indicator */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold text-primary-600">
                            {currentEvidence.length}/3 Properties
                        </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${(currentEvidence.length / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </form>
        </div>
    );
}
