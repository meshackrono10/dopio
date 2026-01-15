"use client";

import React, { useState } from "react";
import { MOCK_PROPERTIES } from "@/data/mockData";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useSearchParams } from "next/navigation";
import StartRating from "@/components/StartRating";

export default function BookingPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const packageId = searchParams.get("package");

    const property = MOCK_PROPERTIES.find((p) => p.id === params.id);
    const selectedPackage = property?.viewingPackages.find((pkg) => pkg.id === packageId);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!property || !selectedPackage) {
        return (
            <div className="container py-16">
                <h1 className="text-3xl font-semibold">Booking not found</h1>
            </div>
        );
    }

    const handleMpesaPayment = async () => {
        setIsProcessing(true);
        // Simulate M-Pesa STK push
        setTimeout(() => {
            alert("M-Pesa payment initiated! Check your phone for the payment prompt.");
            setIsProcessing(false);
        }, 1500);
    };

    const { houseHaunter } = property;

    return (
        <div className="nc-BookingPage container pb-24 lg:pb-32">
            <main className="max-w-4xl mx-auto pt-11">
                <div className="mb-11">
                    <h2 className="text-3xl lg:text-4xl font-semibold">Confirm Your Viewing</h2>
                    <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                        You&apos;re one step away from viewing your potential new home
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT - FORM */}
                    <div className="flex-1 space-y-8">
                        {/* Property Summary */}
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                            <div className="flex gap-4">
                                <div className="w-24 h-24 rounded-xl overflow-hidden relative flex-shrink-0">
                                    <Image
                                        fill
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg line-clamp-2">{property.title}</h4>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                                        {property.location.generalArea}
                                    </p>
                                    <p className="text-primary-600 font-semibold mt-2">
                                        KES {property.rent.toLocaleString()}/month
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Package Summary */}
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 bg-primary-50 dark:bg-primary-900/10">
                            <h3 className="text-xl font-semibold mb-4">Selected Package</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium capitalize">{selectedPackage.tier} Package</span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        KES {selectedPackage.price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                    {selectedPackage.description}
                                </p>
                                <div className="flex gap-4 text-sm text-neutral-500 dark:text-neutral-400 pt-2">
                                    <span>
                                        <i className="las la-home mr-1"></i>
                                        {selectedPackage.propertiesIncluded} properties
                                    </span>
                                    <span>
                                        <i className="las la-clock mr-1"></i>
                                        {selectedPackage.duration}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold mb-4">Your Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Phone Number (M-Pesa) *
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+254 712 345 678"
                                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preferred Schedule */}
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold mb-4">Preferred Viewing Time</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                After payment, you&apos;ll coordinate the exact time with your House Haunter via chat
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Preferred Date
                                    </label>
                                    <input
                                        type="date"
                                        value={preferredDate}
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Preferred Time
                                    </label>
                                    <select
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                        className="block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    >
                                        <option value="">Select time</option>
                                        <option value="morning">Morning (8AM - 12PM)</option>
                                        <option value="afternoon">Afternoon (12PM - 4PM)</option>
                                        <option value="evening">Evening (4PM - 7PM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - PAYMENT & SUMMARY */}
                    <div className="lg:w-96">
                        <div className="sticky top-24 space-y-6">
                            {/* House Haunter */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold mb-4">Your House Haunter</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                        <Image
                                            fill
                                            src={houseHaunter.profilePhoto}
                                            alt={houseHaunter.name}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1">
                                            <h4 className="font-semibold">{houseHaunter.name}</h4>
                                            {houseHaunter.isVerified && (
                                                <i className="las la-check-circle text-primary-600"></i>
                                            )}
                                        </div>
                                        <StartRating point={houseHaunter.rating} reviewCount={houseHaunter.reviewCount} />
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                                        <span>{selectedPackage.tier} Package</span>
                                        <span>KES {selectedPackage.price.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span className="text-primary-600">
                                                KES {selectedPackage.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <ButtonPrimary
                                onClick={handleMpesaPayment}
                                disabled={!name || !phone || !preferredDate || !preferredTime || isProcessing}
                                className="w-full"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center">
                                        <i className="las la-spinner la-spin mr-2"></i>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <i className="lab la-cc-paypal mr-2 text-xl"></i>
                                        Pay with M-Pesa
                                    </span>
                                )}
                            </ButtonPrimary>

                            <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                                <i className="las la-lock mr-1"></i>
                                Secure payment via M-Pesa. You&apos;ll receive a payment prompt on your phone.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
