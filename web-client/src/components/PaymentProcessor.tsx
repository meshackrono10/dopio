"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface PaymentProcessorProps {
    amount: number;
    description: string;
    onPaymentComplete: (transactionId: string) => void;
}

export default function PaymentProcessor({ amount, description, onPaymentComplete }: PaymentProcessorProps) {
    const [phoneNumber, setPhoneNumber] = useState("+254");
    const [processing, setProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState<"input" | "processing" | "success">("input");

    const handlePayment = () => {
        if (phoneNumber.length < 12) {
            alert("Please enter a valid phone number");
            return;
        }

        setProcessing(true);
        setPaymentStep("processing");

        // Simulate M-Pesa STK Push response
        setTimeout(() => {
            const transactionId = `PAY${Date.now().toString().slice(-8)}`;
            setPaymentStep("success");
            setProcessing(false);

            setTimeout(() => {
                onPaymentComplete(transactionId);
            }, 1500);
        }, 2000);
    };

    if (paymentStep === "processing") {
        return (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-bold mb-2">Processing Payment</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Please check your phone for M-Pesa prompt...
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <i className="las la-mobile-alt mr-2"></i>
                        Enter your M-Pesa PIN on your phone
                    </p>
                </div>
            </div>
        );
    }

    if (paymentStep === "success") {
        return (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="las la-check text-4xl text-green-600"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-600">Payment Successful!</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    KES {amount.toLocaleString()} has been deposited to escrow
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm">
                    <p className="text-green-800 dark:text-green-300 mb-2">
                        <i className="las la-lock mr-2"></i>
                        <strong>Funds Secured in Escrow</strong>
                    </p>
                    <p className="text-green-700 dark:text-green-400 text-xs">
                        Your payment is protected and will be released to the hunter upon successful completion
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <i className="lab la-cc-mpesa text-2xl text-green-600"></i>
                </div>
                <div>
                    <h3 className="font-bold">M-Pesa Payment</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Lipa Na M-Pesa</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Description:</span>
                        <span className="font-medium">{description}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount:</span>
                        <span className="text-2xl font-bold text-primary-600">
                            KES {amount.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        M-Pesa Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+254 712 345 678"
                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Enter the number registered with M-Pesa
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <ButtonPrimary
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full"
                >
                    {processing ? (
                        <>
                            <span className="animate-pulse">Processing...</span>
                        </>
                    ) : (
                        <>
                            <i className="las la-lock mr-2"></i>
                            Pay KES {amount.toLocaleString()} to Escrow
                        </>
                    )}
                </ButtonPrimary>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                        <i className="las la-shield-alt mr-1"></i>
                        <strong>Escrow Protection:</strong> Your payment is held securely and only released when you confirm satisfactory service completion.
                    </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <i className="las la-info-circle mt-0.5"></i>
                    <p>
                        Secure transaction processed via M-Pesa. Ensure your phone is nearby and unlocked.
                    </p>
                </div>
            </div>
        </div>
    );
}
