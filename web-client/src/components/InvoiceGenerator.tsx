"use client";

import React from "react";
import { SearchRequest } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface InvoiceProps {
    request: SearchRequest;
    bidPrice: number;
    hunterName: string;
}

export default function InvoiceGenerator({ request, bidPrice, hunterName }: InvoiceProps) {
    const handleDownload = () => {
        // Mock PDF generation
        alert("Invoice PDF would be generated here. In production, use jsPDF or similar library.");
        console.log("Invoice Details:", {
            requestId: request.id,
            tenantName: request.tenantName,
            hunterName,
            amount: bidPrice,
            serviceTier: request.serviceTier,
            date: new Date().toISOString(),
        });
    };

    const handleEmailInvoice = () => {
        alert("Invoice would be emailed to tenant. In production, integrate with email service.");
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold">Invoice</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Request #{request.id}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Date</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Billed To</p>
                        <p className="font-semibold">{request.tenantName}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{request.tenantPhone}</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Service Provider</p>
                        <p className="font-semibold">{hunterName}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">House Hunter</p>
                    </div>
                </div>

                {/* Line Items */}
                <div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <th className="text-left py-2 text-sm font-semibold">Service</th>
                                <th className="text-right py-2 text-sm font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-3">
                                    <p className="font-medium">Custom Property Search - {request.serviceTier}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {request.numberOfOptions} property options in {request.preferredAreas.join(", ")}
                                    </p>
                                </td>
                                <td className="text-right py-3 font-semibold">
                                    KES {bidPrice.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm">Subtotal</span>
                        <span className="font-semibold">KES {bidPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm">Platform Fee (15%)</span>
                        <span className="font-semibold">KES {(bidPrice * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="font-bold">Total</span>
                        <span className="text-xl font-bold text-primary-600">
                            KES {(bidPrice * 1.15).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <i className="las la-check-circle text-green-600 text-xl"></i>
                    <span className="font-semibold text-green-800 dark:text-green-300">Payment Received</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                    Paid via M-Pesa Escrow on {new Date(request.depositPaidAt || Date.now()).toLocaleDateString()}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <ButtonPrimary onClick={handleDownload} className="flex-1">
                    <i className="las la-file-pdf mr-2"></i>
                    Download PDF
                </ButtonPrimary>
                <button
                    onClick={handleEmailInvoice}
                    className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 transition-colors font-medium"
                >
                    <i className="las la-envelope mr-2"></i>
                    Email Invoice
                </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
                Invoice generated automatically upon bid acceptance
            </p>
        </div>
    );
}
