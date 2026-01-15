import React from "react";
import { SearchRequest } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { Route } from "@/routers/types";
import Link from "next/link";

interface SearchRequestCardProps {
    request: SearchRequest;
    viewType: "hunter" | "tenant";
    onBidClick?: () => void;
}

export default function SearchRequestCard({ request, viewType, onBidClick }: SearchRequestCardProps) {
    const getStatusConfig = () => {
        const configs = {
            draft: { color: "bg-neutral-500", icon: "las la-edit", text: "Draft" },
            pending_payment: { color: "bg-amber-500", icon: "las la-wallet", text: "Payment Pending" },
            pending_assignment: { color: "bg-blue-500", icon: "las la-users", text: "Open for Bids" },
            in_progress: { color: "bg-purple-500", icon: "las la-tasks", text: "In Progress" },
            pending_review: { color: "bg-orange-500", icon: "las la-eye", text: "Review Pending" },
            completed: { color: "bg-green-500", icon: "las la-check-circle", text: "Completed" },
            cancelled: { color: "bg-red-500", icon: "las la-times-circle", text: "Cancelled" },
            forfeited: { color: "bg-red-700", icon: "las la-ban", text: "Forfeited" },
        };
        return configs[request.status];
    };

    const statusConfig = getStatusConfig();

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Link href={`/request-search/${request.id}` as Route}>
                        <h3 className="font-bold text-lg hover:text-primary-600 transition-colors">
                            {request.propertyType} in {request.preferredAreas.slice(0, 2).join(", ")}
                            {request.preferredAreas.length > 2 && " +more"}
                        </h3>
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Budget: KES {request.minRent.toLocaleString()} - {request.maxRent.toLocaleString()}
                    </p>
                </div>
                <span className={`${statusConfig.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                    <i className={statusConfig.icon}></i>
                    {statusConfig.text}
                </span>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <i className="las la-bed text-primary-600"></i>
                    <span>{request.propertyType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <i className="las la-bath text-primary-600"></i>
                    <span>{request.bathrooms} Bath{request.bathrooms > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <i className="las la-couch text-primary-600"></i>
                    <span className="capitalize">{request.furnished}</span>
                </div>
                {request.parkingRequired && (
                    <div className="flex items-center gap-2 text-sm">
                        <i className="las la-car text-primary-600"></i>
                        <span>Parking</span>
                    </div>
                )}
            </div>

            {/* Service Tier */}
            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Service Tier:</span>
                    <span className="font-semibold capitalize">{request.serviceTier}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-neutral-600 dark:text-neutral-400">Deposit:</span>
                    <span className="font-bold text-primary-600">KES {request.depositAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Footer Actions */}
            {viewType === "hunter" && request.status === "pending_assignment" ? (
                <div className="flex gap-3">
                    <ButtonPrimary onClick={onBidClick} className="flex-1">
                        <i className="las la-hand-pointer mr-2"></i>
                        Submit Bid
                    </ButtonPrimary>
                    <Link href={`/request-search/${request.id}` as Route} className="flex-1">
                        <button className="w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                            View Details
                        </button>
                    </Link>
                </div>
            ) : viewType === "tenant" ? (
                <Link href={`/request-search/${request.id}` as Route}>
                    <ButtonPrimary className="w-full">
                        View Details
                        <i className="las la-arrow-right ml-2"></i>
                    </ButtonPrimary>
                </Link>
            ) : viewType === "hunter" && request.status === "in_progress" ? (
                <Link href={`/request-search/${request.id}` as Route}>
                    <ButtonPrimary className="w-full">
                        <i className="las la-upload mr-2"></i>
                        Upload Evidence
                    </ButtonPrimary>
                </Link>
            ) : (
                <Link href={`/request-search/${request.id}` as Route}>
                    <button className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors">
                        View Details
                    </button>
                </Link>
            )}

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs text-neutral-500">
                <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
