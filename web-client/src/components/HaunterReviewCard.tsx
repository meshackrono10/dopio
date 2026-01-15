import { StarIcon } from "@heroicons/react/24/solid";
import React, { FC } from "react";
import Avatar from "@/shared/Avatar";

export interface HaunterReview {
    id: string;
    haunterId: string;
    tenantId?: string;
    tenantName: string;
    tenantAvatar?: string;
    isVerifiedTenant?: boolean;
    rating: number;
    professionalismRating?: number;
    accuracyRating?: number;
    comment: string;
    propertyId: string;
    propertyTitle: string;
    bookingId: string;
    createdAt: string;
    haunterResponse?: string;
    haunterResponseDate?: string;
    helpfulCount?: number;
}

export interface HaunterReviewCardProps {
    className?: string;
    review: HaunterReview;
}

const HaunterReviewCard: FC<HaunterReviewCardProps> = ({
    className = "",
    review,
}) => {
    const renderStars = (rating: number) => {
        return (
            <div className="flex text-yellow-500">
                {[...Array(5)].map((_, index) => (
                    <StarIcon
                        key={index}
                        className={`w-4 h-4 ${index < rating ? "text-yellow-500" : "text-neutral-300 dark:text-neutral-600"
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            className={`nc-HaunterReviewCard flex space-x-4 ${className}`}
            data-nc-id="HaunterReviewCard"
        >
            <div className="pt-0.5">
                <Avatar
                    sizeClass="h-10 w-10 text-lg"
                    radius="rounded-full"
                    userName={review.tenantName}
                    imgUrl={review.tenantAvatar}
                />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between space-x-3">
                    <div className="flex flex-col">
                        <div className="text-sm font-semibold flex items-center gap-2">
                            <span>{review.tenantName}</span>
                            {review.isVerifiedTenant && (
                                <i className="las la-check-circle text-primary-600" title="Verified Tenant"></i>
                            )}
                        </div>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Viewing: {review.propertyTitle}
                        </span>
                    </div>
                    {renderStars(review.rating)}
                </div>

                {/* Rating breakdown */}
                {(review.professionalismRating || review.accuracyRating) && (
                    <div className="mt-3 flex gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                        {review.professionalismRating && (
                            <div className="flex items-center gap-1">
                                <span>Professionalism:</span>
                                <span className="font-semibold">{review.professionalismRating}/5</span>
                            </div>
                        )}
                        {review.accuracyRating && (
                            <div className="flex items-center gap-1">
                                <span>Accuracy:</span>
                                <span className="font-semibold">{review.accuracyRating}/5</span>
                            </div>
                        )}
                    </div>
                )}

                <span className="block mt-3 text-neutral-6000 dark:text-neutral-300">
                    {review.comment}
                </span>

                {/* Haunter Response */}
                {review.haunterResponse && (
                    <div className="mt-4 pl-4 border-l-2 border-primary-500">
                        <div className="text-sm">
                            <span className="font-semibold text-primary-600">House Haunter Response</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                                {review.haunterResponseDate && new Date(review.haunterResponseDate).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                            {review.haunterResponse}
                        </p>
                    </div>
                )}

                {/* Helpful count */}
                {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
                    <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <i className="las la-thumbs-up mr-1"></i>
                        {review.helpfulCount} {review.helpfulCount === 1 ? "person" : "people"} found this helpful
                    </div>
                )}
            </div>
        </div>
    );
};

export default HaunterReviewCard;
