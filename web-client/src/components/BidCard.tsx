import React from "react";
import { Bid } from "@/data/types";
import Avatar from "@/shared/Avatar";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

interface BidCardProps {
    bid: Bid;
    onAccept?: () => void;
    onReject?: () => void;
    showActions?: boolean;
    selected?: boolean;
}

export default function BidCard({ bid, onAccept, onReject, showActions = true, selected = false }: BidCardProps) {
    return (
        <div className={`bg-white dark:bg-neutral-800 rounded-2xl border-2 p-6 transition-all ${selected
                ? "border-primary-600 shadow-xl"
                : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300 hover:shadow-lg"
            }`}>
            {/* Hunter Info */}
            <div className="flex items-start gap-4 mb-4">
                <Avatar
                    imgUrl={bid.haunterAvatar}
                    sizeClass="h-16 w-16"
                    radius="rounded-full"
                    userName={bid.haunterName}
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{bid.haunterName}</h3>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <i className="las la-star text-yellow-500"></i>
                            <span className="font-medium">{bid.hunterRating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <i className="las la-check-circle text-green-600"></i>
                            <span>{bid.hunterSuccessRate}% Success Rate</span>
                        </div>
                    </div>
                </div>
                {selected && (
                    <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-semibold">
                        Selected
                    </div>
                )}
            </div>

            {/* Bid Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Price</div>
                    <div className="text-2xl font-bold text-primary-600">
                        KES {bid.price.toLocaleString()}
                    </div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Delivery Time</div>
                    <div className="text-2xl font-bold">
                        {Math.floor(bid.timeframe / 24)} days
                    </div>
                    <div className="text-xs text-neutral-500">
                        ({bid.timeframe} hours)
                    </div>
                </div>
            </div>

            {/* Bonuses */}
            {bid.bonuses && bid.bonuses.length > 0 && (
                <div className="mb-4">
                    <div className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                        🎁 Bonuses Included:
                    </div>
                    <div className="space-y-1">
                        {bid.bonuses.map((bonus, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <i className="las la-check text-green-600 mt-0.5"></i>
                                <span>{bonus}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message */}
            {bid.message && (
                <div className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                        Message from Hunter:
                    </div>
                    <p className="text-sm">{bid.message}</p>
                </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-neutral-500 mb-4">
                Submitted {new Date(bid.submittedAt).toLocaleString()}
            </div>

            {/* Actions */}
            {showActions && bid.status === "pending" && (
                <div className="flex gap-3">
                    <ButtonPrimary
                        onClick={onAccept}
                        className="flex-1"
                    >
                        <i className="las la-check mr-2"></i>
                        Accept Bid
                    </ButtonPrimary>
                    <ButtonSecondary
                        onClick={onReject}
                        className="flex-1"
                    >
                        Decline
                    </ButtonSecondary>
                </div>
            )}

            {bid.status === "selected" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                    <i className="las la-check-circle text-green-600 text-xl mr-2"></i>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                        Bid Accepted - Work in Progress
                    </span>
                </div>
            )}

            {bid.status === "rejected" && (
                <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-3 text-center">
                    <span className="text-neutral-600 dark:text-neutral-400">Bid Declined</span>
                </div>
            )}
        </div>
    );
}
