"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [professionalism, setProfilessionalism] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In real app, submit to backend
        alert("Review submitted successfully!");
        router.push("/tenant-dashboard");
    };

    const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
        <div>
            <label className="text-sm font-medium mb-2 block">{label}</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <i
                            className={`las la-star text-3xl ${star <= value ? "text-yellow-500" : "text-neutral-300 dark:text-neutral-600"
                                }`}
                        ></i>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="nc-ReviewPage container pb-24 lg:pb-32">
            <main className="pt-11">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="text-6xl mb-4">⭐</div>
                        <h2 className="text-3xl lg:text-4xl font-semibold">Rate Your Experience</h2>
                        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
                            Help other tenants by sharing your viewing experience
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Viewing Info */}
                            <div className="pb-6 border-b border-neutral-200 dark:border-neutral-700">
                                <h3 className="font-semibold text-lg mb-2">Viewing Details</h3>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    Modern 2-Bedroom Apartment in Kasarani
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    House Haunter: John Kamau • Date: Dec 18, 2025
                                </p>
                            </div>

                            {/* Overall Rating */}
                            <StarRating
                                value={rating}
                                onChange={setRating}
                                label="Overall Rating *"
                            />

                            {/* Accuracy Rating */}
                            <StarRating
                                value={accuracy}
                                onChange={setAccuracy}
                                label="Accuracy (Property matched description)"
                            />

                            {/* Professionalism Rating */}
                            <StarRating
                                value={professionalism}
                                onChange={setProfilessionalism}
                                label="Professionalism (House Haunter behavior)"
                            />

                            {/* Comment */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Your Review *
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share details about your experience. What did you like? What could be improved?"
                                    rows={6}
                                    required
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                                />
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    Minimum 50 characters
                                </p>
                            </div>

                            {/* Guidelines */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-300">
                                    Review Guidelines
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• Be honest and specific</li>
                                    <li>• No personal information (phone numbers, emails)</li>
                                    <li>• No offensive language</li>
                                    <li>• Focus on the property and viewing experience</li>
                                </ul>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <ButtonPrimary
                                    type="submit"
                                    disabled={rating === 0 || comment.length < 50}
                                    className="flex-1"
                                    sizeClass="px-6 py-3"
                                >
                                    Submit Review
                                </ButtonPrimary>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
