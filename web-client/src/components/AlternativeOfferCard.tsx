"use client";

import React, { useState } from "react";
import Image from "next/image";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface AlternativeOffer {
    id: string;
    property: {
        id: string;
        title: string;
        rent: number;
        images: string[];
        location: any;
    };
    message?: string;
    viewingRequestId: string;
}

interface AlternativeOfferCardProps {
    bookingId: string;
    offer: AlternativeOffer;
    onUpdate: () => void;
}

export default function AlternativeOfferCard({
    bookingId,
    offer,
    onUpdate,
}: AlternativeOfferCardProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/accept-alternative`, {
                viewingRequestId: offer.viewingRequestId,
            });
            showToast("success", "Alternative property accepted! Escrow transferred.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept alternative");
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        const reason = prompt("Please provide a reason for declining (optional):");
        if (reason === null) return;

        setLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/decline-alternative`, {
                reason: reason || "Tenant declined alternative property",
            });
            showToast("success", "Alternative declined. Refund request submitted.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to decline alternative");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="las la-exchange-alt text-blue-600"></i>
                    Alternative Property Offered
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    The hunter has offered an alternative property for you to view.
                </p>
            </div>

            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 aspect-video md:aspect-square relative rounded-xl overflow-hidden">
                        <Image
                            fill
                            src={offer.property.images?.[0] || "/placeholder.jpg"}
                            alt={offer.property.title}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2">{offer.property.title}</h4>
                        <p className="text-2xl font-bold text-primary-600 mb-4">
                            KES {offer.property.rent.toLocaleString()} <span className="text-sm font-normal text-neutral-500">/ month</span>
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                <i className="las la-map-marker mr-2"></i>
                                {offer.property.location?.generalArea || "Location"}
                            </p>
                            {offer.message && (
                                <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-xl italic text-sm">
                                    &quot;{offer.message}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                        <i className="las la-info-circle mr-1"></i>
                        If you accept, your current payment will be transferred to this new property. If you decline, you can request a refund.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <ButtonPrimary
                        onClick={handleAccept}
                        loading={loading}
                        className="flex-1"
                    >
                        Accept & Transfer Escrow
                    </ButtonPrimary>
                    <button
                        onClick={handleDecline}
                        disabled={loading}
                        className="flex-1 px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        Decline & Request Refund
                    </button>
                </div>
            </div>
        </div>
    );
}
