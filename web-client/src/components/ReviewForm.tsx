"use client";

import React, { FC, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Textarea from "@/shared/Textarea";

export interface ReviewFormProps {
    bookingId: string;
    haunterId: string;
    haunterName: string;
    propertyId: string;
    propertyTitle: string;
    onSubmit?: (reviewData: ReviewFormData) => void;
    onCancel?: () => void;
}

export interface ReviewFormData {
    bookingId: string;
    haunterId: string;
    propertyId: string;
    propertyTitle: string;
    rating: number;
    professionalismRating: number;
    accuracyRating: number;
    comment: string;
}

const ReviewForm: FC<ReviewFormProps> = ({
    bookingId,
    haunterId,
    haunterName,
    propertyId,
    propertyTitle,
    onSubmit,
    onCancel,
}) => {
    const [rating, setRating] = useState(0);
    const [professionalismRating, setProfessionalismRating] = useState(0);
    const [accuracyRating, setAccuracyRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { [key: string]: string } = {};
        if (rating === 0) newErrors.rating = "Please select an overall rating";
        if (professionalismRating === 0) newErrors.professionalismRating = "Please rate professionalism";
        if (accuracyRating === 0) newErrors.accuracyRating = "Please rate accuracy";
        if (!comment.trim()) newErrors.comment = "Please write a review";
        if (comment.trim().length < 20) newErrors.comment = "Review must be at least 20 characters";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit the review
        const reviewData: ReviewFormData = {
            bookingId,
            haunterId,
            propertyId,
            propertyTitle,
            rating,
            professionalismRating,
            accuracyRating,
            comment: comment.trim(),
        };

        if (onSubmit) {
            onSubmit(reviewData);
        }
    };

    const renderStarRating = (
        currentRating: number,
        setRatingFunc: (rating: number) => void,
        label: string,
        error?: string
    ) => {
        return (
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{label}</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRatingFunc(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <StarIcon
                                className={`w-8 h-8 ${star <= (hoveredStar || currentRating)
                                    ? "text-yellow-500"
                                    : "text-neutral-300 dark:text-neutral-600"
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {currentRating > 0 ? `${currentRating} / 5` : "No rating"}
                    </span>
                </div>
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>
        );
    };

    return (
        <div className="nc-ReviewForm bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Review {haunterName}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Viewing: {propertyTitle}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Overall Rating */}
                {renderStarRating(rating, setRating, "Overall Rating *", errors.rating)}

                {/* Professionalism Rating */}
                {renderStarRating(
                    professionalismRating,
                    setProfessionalismRating,
                    "Professionalism *",
                    errors.professionalismRating
                )}

                {/* Accuracy Rating */}
                {renderStarRating(
                    accuracyRating,
                    setAccuracyRating,
                    "Property Accuracy *",
                    errors.accuracyRating
                )}

                {/* Comment */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Your Review *</label>
                    <Textarea
                        rows={5}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this agent. Was the viewing helpful? Did the property match the listing? Was the agent professional and knowledgeable?"
                        className="w-full"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Minimum 20 characters
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {comment.length} characters
                        </p>
                    </div>
                    {errors.comment && <p className="text-sm text-red-600 mt-1">{errors.comment}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    )}
                    <ButtonPrimary type="submit">
                        Submit Review
                    </ButtonPrimary>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
