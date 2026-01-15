"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_SEARCH_REQUESTS } from "@/data/mockData";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Image from "next/image";

import { SearchRequest } from "@/data/types";

export default function AdminDisputeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;

    const foundRequest = MOCK_SEARCH_REQUESTS.find(r => r.id === requestId);
    // Type assertion to access optional dispute properties
    const request = foundRequest as SearchRequest;
    const [decision, setDecision] = useState<"full_refund" | "full_payment" | "split_payment" | "">("");
    const [splitPercentage, setSplitPercentage] = useState(50);
    const [notes, setNotes] = useState("");

    if (!request) {
        return <div className="container py-16 text-center">Request not found</div>;
    }

    const handleSubmitDecision = () => {
        if (!decision) {
            alert("Please select a decision");
            return;
        }

        console.log("Admin Decision:", {
            requestId,
            decision,
            splitPercentage: decision === "split_payment" ? splitPercentage : null,
            notes,
            reviewedBy: "Admin User",
            reviewedAt: new Date().toISOString(),
        });

        alert("Decision submitted successfully! (Mock - would update database)");
        router.push("/admin/disputes");
    };

    return (
        <div className="container py-8 lg:py-16">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center text-neutral-600 dark:text-neutral-400 hover:text-primary-600"
                    >
                        <i className="las la-arrow-left mr-2"></i>
                        Back to Disputes
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Dispute Review</h1>
                    <p className="text-neutral-600 dark:text-neutral-300">
                        Request ID: {request.id}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Request Brief */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">Original Request Brief</h2>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Property Type</p>
                                        <p className="font-semibold">{request.propertyType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Budget</p>
                                        <p className="font-semibold">
                                            KES {request.minRent.toLocaleString()} - {request.maxRent.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Areas</p>
                                        <p className="font-semibold">{request.preferredAreas.join(", ")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Service Tier</p>
                                        <p className="font-semibold capitalize">{request.serviceTier}</p>
                                    </div>
                                </div>

                                {request.mustHaveFeatures.length > 0 && (
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Must-Have Features</p>
                                        <div className="flex flex-wrap gap-2">
                                            {request.mustHaveFeatures.map((feature, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {request.dealBreakers.length > 0 && (
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Deal-Breakers</p>
                                        <div className="flex flex-wrap gap-2">
                                            {request.dealBreakers.map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dispute Details */}
                        {"disputeReason" in request && request.disputeReason && (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4">Dispute Details</h2>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                                        Tenant&apos;s Complaint
                                    </h3>
                                    <p className="text-red-700 dark:text-red-400">{request.disputeReason}</p>
                                    <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                                        Submitted: {"refundRequestedAt" in request && request.refundRequestedAt ? new Date(request.refundRequestedAt).toLocaleString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submitted Evidence */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Submitted Properties ({"uploadedEvidence" in request && request.uploadedEvidence?.length || 0}/3)
                            </h2>

                            {"uploadedEvidence" in request && request.uploadedEvidence && request.uploadedEvidence.length > 0 ? (
                                <div className="space-y-6">
                                    {request.uploadedEvidence.map((evidence, idx) => (
                                        <div
                                            key={idx}
                                            className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold">Property #{idx + 1}</h3>
                                                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                                                    {evidence.matchScore}% Match
                                                </span>
                                            </div>

                                            {/* Photos */}
                                            {evidence.photos.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    {evidence.photos.map((photo, photoIdx) => (
                                                        <div
                                                            key={photoIdx}
                                                            className="relative aspect-square rounded-lg overflow-hidden"
                                                        >
                                                            <Image
                                                                fill
                                                                src={photo}
                                                                alt={`Property ${idx + 1} - Photo ${photoIdx + 1}`}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                                {evidence.description}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                <i className="las la-map-marker-alt mr-1"></i>
                                                {evidence.generalArea}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                                    <i className="las la-inbox text-5xl mb-2"></i>
                                    <p>No evidence submitted</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Admin Decision */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                            <h3 className="font-bold mb-4">Case Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">Deposit:</span>
                                    <span className="font-bold">KES {request.depositAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">Properties:</span>
                                    <span className="font-bold">{request.uploadedEvidence?.length || 0}/3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">Hunter:</span>
                                    <span className="font-bold">{request.haunterId || "Unknown"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">Tenant:</span>
                                    <span className="font-bold">{request.tenantId}</span>
                                </div>
                            </div>
                        </div>

                        {!("adminReview" in request && request.adminReview) ? (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Make Decision</h3>

                                <div className="space-y-4">
                                    {/* Decision Options */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Decision *</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-primary-500">
                                                <input
                                                    type="radio"
                                                    name="decision"
                                                    value="full_refund"
                                                    checked={decision === "full_refund"}
                                                    onChange={(e) => setDecision(e.target.value as any)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">Full Refund to Tenant</p>
                                                    <p className="text-xs text-neutral-500">Hunter violated terms</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-primary-500">
                                                <input
                                                    type="radio"
                                                    name="decision"
                                                    value="full_payment"
                                                    checked={decision === "full_payment"}
                                                    onChange={(e) => setDecision(e.target.value as any)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">Full Payment to Hunter</p>
                                                    <p className="text-xs text-neutral-500">Service completed satisfactorily</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-primary-500">
                                                <input
                                                    type="radio"
                                                    name="decision"
                                                    value="split_payment"
                                                    checked={decision === "split_payment"}
                                                    onChange={(e) => setDecision(e.target.value as any)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">Split Payment</p>
                                                    <p className="text-xs text-neutral-500">Partial completion</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Split Percentage */}
                                    {decision === "split_payment" && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Hunter&apos;s Share: {splitPercentage}%
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={splitPercentage}
                                                onChange={(e) => setSplitPercentage(parseInt(e.target.value))}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                                <span>Hunter: KES {((request.depositAmount * splitPercentage) / 100).toLocaleString()}</span>
                                                <span>Tenant: KES {((request.depositAmount * (100 - splitPercentage)) / 100).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Admin Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                            placeholder="Explain your decision..."
                                            className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal px-4 py-3"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <ButtonPrimary onClick={handleSubmitDecision} className="w-full">
                                        <i className="las la-gavel mr-2"></i>
                                        Submit Decision
                                    </ButtonPrimary>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                                <h3 className="font-bold mb-2 text-green-800 dark:text-green-300">
                                    <i className="las la-check-circle mr-2"></i>
                                    Case Resolved
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                                    Decision: {"adminReview" in request && request.adminReview?.decision}
                                </p>
                                {"adminReview" in request && request.adminReview?.reasoning && (
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Notes: {request.adminReview.reasoning}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
