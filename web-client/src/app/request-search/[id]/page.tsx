"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { getSearchRequestById, acceptBid } from "@/services/searchRequest";
import { SearchRequest } from "@/data/types";
import BidCard from "@/components/BidCard";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import { useToast } from "@/components/Toast";
import { Route } from "@/routers/types";

export default function RequestDetailPage() {
    const params = useParams();
    const requestId = params.id as string;
    const { showToast } = useToast();

    const [request, setRequest] = useState<SearchRequest | null>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchRequest = async () => {
            try {
                const data = await getSearchRequestById(requestId);
                setRequest(data);
                if (data.bids) {
                    setBids(data.bids);
                    const selected = data.bids.find((b: any) => b.status === 'ACCEPTED');
                    if (selected) {
                        setSelectedBidId(selected.id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch request:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [requestId]);

    if (loading) {
        return <div className="container py-16 text-center">Loading...</div>;
    }

    if (!request) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Request Not Found</h1>
                <ButtonPrimary href={"/tenant-dashboard" as Route}>
                    Back to Dashboard
                </ButtonPrimary>
            </div>
        );
    }

    const handleAcceptBid = async (bidId: string) => {
        try {
            await acceptBid(requestId, bidId);
            setBids(bids.map(bid => ({
                ...bid,
                status: bid.id === bidId ? "ACCEPTED" : "REJECTED"
            })));
            setSelectedBidId(bidId);
            const bidder = bids.find(b => b.id === bidId);
            showToast("success", `Bid accepted! ${bidder?.haunterName} will begin work soon.`, 5000);
        } catch (err) {
            console.error("Failed to accept bid:", err);
            showToast("error", "Failed to accept bid", 3000);
        }
    };

    const handleRejectBid = (bidId: string) => {
        // Optimistic update for now
        setBids(bids.map(bid =>
            bid.id === bidId ? { ...bid, status: "REJECTED" } : bid
        ));
        showToast("info", "Bid declined", 3000);
    };

    const getStatusBadge = () => {
        const statusConfig: any = {
            DRAFT: { color: "bg-neutral-500", text: "Draft" },
            PENDING_PAYMENT: { color: "bg-amber-500", text: "Awaiting Payment" },
            PENDING_BIDS: { color: "bg-blue-500", text: "Open for Bids" },
            IN_PROGRESS: { color: "bg-purple-500", text: "In Progress" },
            PENDING_REVIEW: { color: "bg-orange-500", text: "Awaiting Review" },
            COMPLETED: { color: "bg-green-500", text: "Completed" },
            CANCELLED: { color: "bg-red-500", text: "Cancelled" },
            FORFEITED: { color: "bg-red-700", text: "Forfeited" },
        };

        const config = statusConfig[request.status] || statusConfig.PENDING_BIDS;
        return (
            <span className={`${config.color} text-white px-4 py-1.5 rounded-full text-sm font-semibold`}>
                {config.text}
            </span>
        );
    };

    return (
        <div className="nc-RequestDetailPage">
            <div className="container py-8 lg:py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <ButtonSecondary href={"/tenant-dashboard" as Route}>
                                    <i className="las la-arrow-left mr-2"></i>
                                    Back
                                </ButtonSecondary>
                                {getStatusBadge()}
                            </div>
                            <div className="text-sm text-neutral-500">
                                Request ID: {request.id}
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                            {request.propertyType} in {request.preferredAreas.join(", ")}
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Budget: KES {request.minRent.toLocaleString()} - {request.maxRent.toLocaleString()} •
                            Service: {request.serviceTier} •
                            Deposit: KES {request.depositAmount.toLocaleString()}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Requirements */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4">Requirements</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Location</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {request.preferredAreas.map(area => (
                                                <span key={area} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold mb-1">Property Type</h3>
                                            <p className="text-neutral-600 dark:text-neutral-300">{request.propertyType}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Bathrooms</h3>
                                            <p className="text-neutral-600 dark:text-neutral-300">{request.bathrooms}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Furnished</h3>
                                            <p className="text-neutral-600 dark:text-neutral-300 capitalize">{request.furnished}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Pet Friendly</h3>
                                            <p className="text-neutral-600 dark:text-neutral-300">{request.petFriendly ? "Yes" : "No"}</p>
                                        </div>
                                    </div>

                                    {request.mustHaveFeatures.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Must-Have Features</h3>
                                            <ul className="space-y-1">
                                                {request.mustHaveFeatures.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                                        <i className="las la-check text-green-600"></i>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {request.dealBreakers.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Deal-Breakers</h3>
                                            <ul className="space-y-1">
                                                {request.dealBreakers.map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                                        <i className="las la-times text-red-600"></i>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bids Section */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">
                                    Received Bids ({bids.length})
                                </h2>

                                {bids.length > 0 ? (
                                    <div className="space-y-4">
                                        {bids.map(bid => (
                                            <BidCard
                                                key={bid.id}
                                                bid={bid}
                                                selected={bid.status === "ACCEPTED"}
                                                showActions={!selectedBidId && bid.status === "PENDING"}
                                                onAccept={() => handleAcceptBid(bid.id.toString())}
                                                onReject={() => handleRejectBid(bid.id.toString())}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-12 text-center">
                                        <i className="las la-inbox text-6xl text-neutral-400 mb-4"></i>
                                        <h3 className="font-semibold mb-2">No Bids Yet</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                            Hunters will start submitting bids soon. Check back later!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Invoice Display */}
                            {selectedBidId && (() => {
                                const selectedBid = bids.find(b => b.id.toString() === selectedBidId);
                                return selectedBid ? (
                                    <div className="mt-6">
                                        <InvoiceGenerator
                                            request={request as SearchRequest}
                                            bidPrice={selectedBid.price}
                                            hunterName={selectedBid.haunterName}
                                        />
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timeline */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Timeline</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <i className="las la-calendar text-primary-600"></i>
                                        <span className="font-medium">Created:</span>
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="las la-clock text-primary-600"></i>
                                        <span className="font-medium">Deadline:</span>
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            {new Date(request.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {request.depositPaidAt && (
                                        <div className="flex items-center gap-2">
                                            <i className="las la-check-circle text-green-600"></i>
                                            <span className="font-medium">Paid:</span>
                                            <span className="text-neutral-600 dark:text-neutral-400">
                                                {new Date(request.depositPaidAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Payment</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Deposit Amount</span>
                                        <span className="font-bold">KES {request.depositAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                        {request.depositPaid ? (
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                                                <i className="las la-lock text-green-600 text-xl mr-2"></i>
                                                <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                                                    Held in Escrow
                                                </span>
                                            </div>
                                        ) : (
                                            <ButtonPrimary className="w-full">
                                                Pay Deposit
                                            </ButtonPrimary>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors text-sm">
                                        <i className="las la-edit mr-2"></i>
                                        Edit Request
                                    </button>
                                    <button className="w-full px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
                                        <i className="las la-times mr-2"></i>
                                        Cancel Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
