"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { bidOnSearchRequest } from "@/services/searchRequest";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Select from "@/shared/Select";

interface BidFormData {
    price: number;
    timeframe: number;
    bonuses: string[];
    message: string;
}

interface BidSubmissionFormProps {
    requestId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function BidSubmissionForm({ requestId, onSuccess, onCancel }: BidSubmissionFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<BidFormData>({
        price: 5000,
        timeframe: 72,
        bonuses: [],
        message: "",
    });

    const [customBonus, setCustomBonus] = useState("");

    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("You must be logged in to submit a bid");
            return;
        }

        try {
            await bidOnSearchRequest(
                requestId,
                formData.price,
                formData.message,
                formData.timeframe,
                formData.bonuses
            );

            alert("Bid submitted successfully!");

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/haunter-dashboard");
            }
        } catch (err: any) {
            alert(err.message || "Failed to submit bid");
        }
    };

    const addBonus = () => {
        if (customBonus.trim()) {
            setFormData({
                ...formData,
                bonuses: [...formData.bonuses, customBonus.trim()]
            });
            setCustomBonus("");
        }
    };

    const removeBonus = (index: number) => {
        setFormData({
            ...formData,
            bonuses: formData.bonuses.filter((_, i) => i !== index)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Submit Your Bid</h2>

            <div className="space-y-6">
                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Your Price (KES) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        min="1000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Set a competitive price to attract the tenant
                    </p>
                </div>

                {/* Timeframe */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Delivery Timeframe <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.timeframe}
                        onChange={(e) => setFormData({ ...formData, timeframe: parseInt(e.target.value) })}
                        required
                    >
                        <option value="24">24 hours (1 day)</option>
                        <option value="48">48 hours (2 days)</option>
                        <option value="72">72 hours (3 days)</option>
                        <option value="96">96 hours (4 days)</option>
                        <option value="120">120 hours (5 days)</option>
                        <option value="168">168 hours (7 days)</option>
                    </Select>
                    <p className="text-xs text-neutral-500 mt-1">
                        How quickly can you deliver the properties?
                    </p>
                </div>

                {/* Bonuses */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Bonuses (Optional) 🎁
                    </label>
                    <div className="flex gap-2 mb-2">
                        <Input
                            value={customBonus}
                            onChange={(e) => setCustomBonus(e.target.value)}
                            placeholder="e.g., 1 extra property option"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addBonus();
                                }
                            }}
                        />
                        <ButtonSecondary type="button" onClick={addBonus}>
                            Add
                        </ButtonSecondary>
                    </div>
                    {formData.bonuses.length > 0 && (
                        <div className="space-y-2">
                            {formData.bonuses.map((bonus, index) => (
                                <div key={index} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                    <i className="las la-gift text-green-600"></i>
                                    <span className="flex-1 text-sm">{bonus}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeBonus(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <i className="las la-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                        Add extra services to make your bid stand out
                    </p>
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Message to Tenant <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        placeholder="Explain why you're the best choice for this job..."
                        required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Highlight your experience and local knowledge
                    </p>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Bid Summary</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Price:</span>
                            <span className="font-bold">KES {formData.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span className="font-bold">{Math.floor(formData.timeframe / 24)} days ({formData.timeframe}h)</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Bonuses:</span>
                            <span className="font-bold">{formData.bonuses.length}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {onCancel && (
                        <ButtonSecondary type="button" onClick={onCancel} className="flex-1">
                            Cancel
                        </ButtonSecondary>
                    )}
                    <ButtonPrimary type="submit" className="flex-1">
                        <i className="las la-paper-plane mr-2"></i>
                        Submit Bid
                    </ButtonPrimary>
                </div>
            </div>
        </form>
    );
}
