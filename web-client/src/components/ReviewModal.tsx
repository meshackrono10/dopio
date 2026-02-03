"use client";

import React, { FC, useState } from "react";
import NcModal from "@/shared/NcModal";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Textarea from "@/shared/Textarea";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (rating: number, comment: string) => Promise<void>;
    loading?: boolean;
    hunterName?: string;
}

const ReviewModal: FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    hunterName = "the House Hunter",
}) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const renderStars = () => {
        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl focus:outline-none transition-colors ${star <= rating ? "text-yellow-500" : "text-neutral-300 dark:text-neutral-600"
                            }`}
                    >
                        <i className={`las la-star ${star <= rating ? "block" : "block"}`}></i>
                    </button>
                ))}
            </div>
        );
    };

    const renderContent = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        How was your viewing?
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                        Share your experience with {hunterName}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2">
                    {renderStars()}
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                    </span>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Additional feedback (Optional)
                    </label>
                    <Textarea
                        placeholder="What did you think about the property and the hunter's assistance?"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <ButtonSecondary onClick={onClose} type="button">
                        Skip for now
                    </ButtonSecondary>
                    <ButtonPrimary
                        onClick={() => onConfirm(rating, comment)}
                        loading={loading}
                        type="button"
                    >
                        Submit Review
                    </ButtonPrimary>
                </div>
            </div>
        );
    };

    return (
        <NcModal
            isOpenProp={isOpen}
            onCloseModal={onClose}
            renderContent={renderContent}
            renderTrigger={() => null}
            modalTitle="Rate Your Experience"
        />
    );
};

export default ReviewModal;
