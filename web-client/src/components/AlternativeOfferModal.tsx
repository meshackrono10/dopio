"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface Property {
    id: string;
    title: string;
    rent: number;
    images: string[];
    location: any;
}

interface AlternativeOfferModalProps {
    bookingId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AlternativeOfferModal({
    bookingId,
    onClose,
    onSuccess,
}: AlternativeOfferModalProps) {
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHunterProperties();
    }, []);

    const fetchHunterProperties = async () => {
        try {
            // Fetch properties belonging to the hunter
            const response = await api.get("/properties/my-listings");
            // Filter out the property that was already viewed if possible, 
            // or just show all active properties
            setProperties(response.data.filter((p: any) => p.status === 'PUBLISHED'));
        } catch (error: any) {
            showToast("error", "Failed to load your properties");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPropertyId) {
            showToast("error", "Please select a property to offer");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/bookings/${bookingId}/offer-alternative`, {
                propertyId: selectedPropertyId,
                message: message || "I have an alternative property that might interest you.",
            });

            showToast("success", "Alternative property offered to tenant!");
            onSuccess();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to offer alternative");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Offer Alternative Property</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <i className="las la-times text-2xl"></i>
                        </button>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Select one of your other properties to offer as an alternative
                    </p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-700 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : properties.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {properties.map((property) => (
                                <button
                                    key={property.id}
                                    onClick={() => setSelectedPropertyId(property.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedPropertyId === property.id
                                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                            : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                                        }`}
                                >
                                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            fill
                                            src={property.images?.[0] || "/placeholder.jpg"}
                                            alt={property.title}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            KES {property.rent.toLocaleString()} / month
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            <i className="las la-map-marker mr-1"></i>
                                            {property.location?.generalArea || "Location"}
                                        </p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPropertyId === property.id
                                            ? "border-primary-500 bg-primary-500"
                                            : "border-neutral-300"
                                        }`}>
                                        {selectedPropertyId === property.id && (
                                            <i className="las la-check text-white text-sm"></i>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <i className="las la-home text-5xl text-neutral-300 mb-3"></i>
                            <p className="text-neutral-500">You don't have any other published properties to offer.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Message to Tenant (Optional)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Explain why this property might be a good fit..."
                            rows={3}
                            className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <ButtonPrimary
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={!selectedPropertyId}
                        className="flex-1"
                    >
                        Offer Property
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
