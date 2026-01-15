"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import Select from "@/shared/Select";
import { PropertyLayout } from "@/data/types";
import { createSearchRequest } from "@/services/searchRequest";

interface FormData {
    // Location & Budget
    preferredAreas: string[];
    minRent: number;
    maxRent: number;
    moveInDate: string;
    leaseDuration: string;

    // Property Requirements
    propertyType: PropertyLayout | "";
    bathrooms: number;
    furnished: "yes" | "no" | "semi" | "flexible" | "";
    petFriendly: boolean;

    // Amenities
    parkingRequired: boolean;
    parkingSpaces: number;
    securityFeatures: string[];
    utilitiesIncluded: string[];
    amenities: string[];

    // Additional
    mustHaveFeatures: string[];
    niceToHaveFeatures: string[];
    dealBreakers: string[];
    additionalNotes: string;

    // Service
    serviceTier: "standard" | "premium" | "urgent" | "";
    numberOfOptions: number;
}

export default function CreateSearchRequestPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        preferredAreas: [],
        minRent: 15000,
        maxRent: 50000,
        moveInDate: "",
        leaseDuration: "yearly",
        propertyType: "",
        bathrooms: 1,
        furnished: "",
        petFriendly: false,
        parkingRequired: false,
        parkingSpaces: 1,
        securityFeatures: [],
        utilitiesIncluded: [],
        amenities: [],
        mustHaveFeatures: [],
        niceToHaveFeatures: [],
        dealBreakers: [],
        additionalNotes: "",
        serviceTier: "",
        numberOfOptions: 3,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalSteps = 5;

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (formData.preferredAreas.length === 0 || (formData.preferredAreas.length === 1 && !formData.preferredAreas[0])) {
                newErrors.preferredAreas = "Please enter at least one preferred area";
            }
            if (formData.minRent >= formData.maxRent) {
                newErrors.rent = "Maximum rent must be greater than minimum rent";
            }
        }

        if (step === 2) {
            if (!formData.propertyType) {
                newErrors.propertyType = "Please select a property type";
            }
        }

        if (step === 5) {
            if (!formData.serviceTier) {
                newErrors.serviceTier = "Please select a service tier";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            setErrors({});
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            await createSearchRequest(formData as any);
            alert("Search request created successfully! Hunters will now be able to bid on your request.");
            router.push("/tenant-dashboard?tab=search-requests");
        } catch (err: any) {
            alert(err.message || "Failed to create search request");
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = () => (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step <= currentStep
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                }`}
                        >
                            {step}
                        </div>
                        {step < 5 && (
                            <div
                                className={`flex-1 h-1 mx-2 ${step < currentStep
                                    ? "bg-primary-600"
                                    : "bg-neutral-200 dark:bg-neutral-700"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                Step {currentStep} of {totalSteps}
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Location & Budget</h2>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Preferred Areas <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="e.g., Westlands, Kilimani, Parklands (comma separated)"
                    value={formData.preferredAreas.join(", ")}
                    onChange={(e) => updateFormData("preferredAreas", e.target.value.split(",").map(a => a.trim()))}
                />
                {errors.preferredAreas && (
                    <p className="text-red-500 text-sm mt-1">
                        <i className="las la-exclamation-circle mr-1"></i>
                        {errors.preferredAreas}
                    </p>
                )}
                <p className="text-xs text-neutral-500 mt-1">Enter multiple areas separated by commas</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Minimum Rent (KES)
                    </label>
                    <Input
                        type="number"
                        value={formData.minRent}
                        onChange={(e) => updateFormData("minRent", parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Maximum Rent (KES)
                    </label>
                    <Input
                        type="number"
                        value={formData.maxRent}
                        onChange={(e) => updateFormData("maxRent", parseInt(e.target.value))}
                    />
                </div>
            </div>
            {errors.rent && (
                <p className="text-red-500 text-sm">
                    <i className="las la-exclamation-circle mr-1"></i>
                    {errors.rent}
                </p>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Preferred Move-in Date
                    </label>
                    <Input
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => updateFormData("moveInDate", e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Lease Duration
                    </label>
                    <Select
                        value={formData.leaseDuration}
                        onChange={(e) => updateFormData("leaseDuration", e.target.value)}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="flexible">Flexible</option>
                    </Select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Property Requirements</h2>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Property Type <span className="text-red-500">*</span>
                </label>
                <Select
                    value={formData.propertyType}
                    onChange={(e) => updateFormData("propertyType", e.target.value)}
                >
                    <option value="">Select property type</option>
                    <option value="bedsitter">Bedsitter</option>
                    <option value="studio">Studio</option>
                    <option value="1-bedroom">1 Bedroom</option>
                    <option value="2-bedroom">2 Bedrooms</option>
                    <option value="3-bedroom">3 Bedrooms</option>
                    <option value="4-bedroom+">4+ Bedrooms</option>
                </Select>
            </div>



            <div>
                <label className="block text-sm font-medium mb-2">
                    Furnished
                </label>
                <Select
                    value={formData.furnished}
                    onChange={(e) => updateFormData("furnished", e.target.value)}
                >
                    <option value="">Select option</option>
                    <option value="yes">Yes - Fully Furnished</option>
                    <option value="semi">Semi-Furnished</option>
                    <option value="no">No - Unfurnished</option>
                    <option value="flexible">Flexible</option>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="petFriendly"
                    checked={formData.petFriendly}
                    onChange={(e) => updateFormData("petFriendly", e.target.checked)}
                    className="w-5 h-5"
                />
                <label htmlFor="petFriendly" className="text-sm font-medium cursor-pointer">
                    Pet-Friendly Required
                </label>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Amenities & Features</h2>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <input
                        type="checkbox"
                        id="parkingRequired"
                        checked={formData.parkingRequired}
                        onChange={(e) => updateFormData("parkingRequired", e.target.checked)}
                        className="w-5 h-5"
                    />
                    <label htmlFor="parkingRequired" className="text-sm font-medium cursor-pointer">
                        Parking Required
                    </label>
                </div>
                {formData.parkingRequired && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Number of Parking Spaces
                        </label>
                        <Select
                            value={formData.parkingSpaces}
                            onChange={(e) => updateFormData("parkingSpaces", parseInt(e.target.value))}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3+</option>
                        </Select>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Security Features (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {["CCTV", "Security Guard", "Gate", "Alarm System", "Perimeter Wall"].map((feature) => (
                        <label key={feature} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.securityFeatures.includes(feature)}
                                onChange={(e) => {
                                    const updated = e.target.checked
                                        ? [...formData.securityFeatures, feature]
                                        : formData.securityFeatures.filter(f => f !== feature);
                                    updateFormData("securityFeatures", updated);
                                }}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{feature}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Other Amenities (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {["Gym", "Swimming Pool", "Backup Generator", "Elevator", "Playground", "Laundry"].map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity)}
                                onChange={(e) => {
                                    const updated = e.target.checked
                                        ? [...formData.amenities, amenity]
                                        : formData.amenities.filter(a => a !== amenity);
                                    updateFormData("amenities", updated);
                                }}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Additional Requirements</h2>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Must-Have Features
                </label>
                <Textarea
                    placeholder="e.g., Modern kitchen, Balcony, Natural lighting (one per line)"
                    value={formData.mustHaveFeatures.join("\n")}
                    onChange={(e) => updateFormData("mustHaveFeatures", e.target.value.split("\n").filter(f => f.trim()))}
                    rows={4}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Nice-to-Have Features (Optional)
                </label>
                <Textarea
                    placeholder="e.g., City view, Elevator (one per line)"
                    value={formData.niceToHaveFeatures.join("\n")}
                    onChange={(e) => updateFormData("niceToHaveFeatures", e.target.value.split("\n").filter(f => f.trim()))}
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Deal-Breakers (What you absolutely DO NOT want)
                </label>
                <Textarea
                    placeholder="e.g., Ground floor, Noisy area (one per line)"
                    value={formData.dealBreakers.join("\n")}
                    onChange={(e) => updateFormData("dealBreakers", e.target.value.split("\n").filter(f => f.trim()))}
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Additional Notes
                </label>
                <Textarea
                    placeholder="Any other specific requests or information..."
                    value={formData.additionalNotes}
                    onChange={(e) => updateFormData("additionalNotes", e.target.value)}
                    rows={4}
                />
            </div>
        </div>
    );

    const renderStep5 = () => {
        const pricingTiers = {
            standard: { price: 5000, days: 7, name: "Standard" },
            premium: { price: 8000, days: 5, name: "Premium" },
            urgent: { price: 12000, days: 3, name: "Urgent" }
        };

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Service Selection</h2>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Number of Property Options
                    </label>
                    <Select
                        value={formData.numberOfOptions}
                        onChange={(e) => updateFormData("numberOfOptions", parseInt(e.target.value))}
                    >
                        <option value="3">3 Options (Recommended)</option>
                        <option value="5">5 Options (+2,000 KES)</option>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-4">
                        Select Service Tier <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                        {(Object.keys(pricingTiers) as Array<keyof typeof pricingTiers>).map((tier) => {
                            const info = pricingTiers[tier];
                            return (
                                <div
                                    key={tier}
                                    onClick={() => updateFormData("serviceTier", tier)}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.serviceTier === tier
                                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                                        : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                                        }`}
                                >
                                    <div className="text-center">
                                        <h3 className="font-bold text-lg mb-2">{info.name}</h3>
                                        <div className="text-2xl font-bold text-primary-600 mb-1">
                                            KES {info.price.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {info.days} days delivery
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {errors.serviceTier && (
                    <p className="text-red-500 text-sm">
                        <i className="las la-exclamation-circle mr-1"></i>
                        {errors.serviceTier}
                    </p>
                )}

                {/* Deposit Calculator */}
                {formData.serviceTier && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-3">
                            <i className="las la-calculator mr-2"></i>
                            💰 Deposit Required
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Service Fee:</span>
                                <span className="font-semibold">
                                    KES {pricingTiers[formData.serviceTier as keyof typeof pricingTiers].price.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Property Options:</span>
                                <span className="font-semibold">×{formData.numberOfOptions}</span>
                            </div>
                            {formData.numberOfOptions > 3 && (
                                <div className="flex justify-between">
                                    <span>Extra Options Fee:</span>
                                    <span className="font-semibold">+KES 2,000</span>
                                </div>
                            )}
                            <div className="border-t border-green-300 dark:border-green-700 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">Total Deposit:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        KES {(
                                            pricingTiers[formData.serviceTier as keyof typeof pricingTiers].price +
                                            (formData.numberOfOptions > 3 ? 2000 : 0)
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                <i className="las la-info-circle mr-1"></i>
                                Deposit will be held in escrow until service completion
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">📋 Request Summary</h3>
                    <ul className="text-sm space-y-1 text-blue-900 dark:text-blue-100">
                        <li>• Areas: {formData.preferredAreas.join(", ") || "Not specified"}</li>
                        <li>• Budget: KES {formData.minRent.toLocaleString()} - {formData.maxRent.toLocaleString()}</li>
                        <li>• Type: {formData.propertyType || "Not specified"}</li>
                        <li>• Options: {formData.numberOfOptions} properties</li>
                        {formData.serviceTier && (
                            <li>• Service: {pricingTiers[formData.serviceTier as keyof typeof pricingTiers].name} - {pricingTiers[formData.serviceTier as keyof typeof pricingTiers].days} days</li>
                        )}
                    </ul>
                </div>
            </div>
        );
    };

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const handlePaymentAndSubmit = async () => {
        setPaymentProcessing(true);
        // Simulate M-Pesa STK Push
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Create request with deposit info (simulated)
            await createSearchRequest({
                ...formData,
                depositAmount: formData.serviceTier === 'standard' ? 5000 : formData.serviceTier === 'premium' ? 8000 : 12000,
            } as any);

            setPaymentProcessing(false);
            setShowPaymentModal(false);
            alert("Payment Received! Your search request is now live.");
            router.push("/tenant-dashboard?tab=search-requests");
        } catch (err: any) {
            setPaymentProcessing(false);
            alert(err.message || "Failed to create search request");
        }
    };

    const renderPaymentModal = () => {
        if (!showPaymentModal) return null;

        const amount = formData.serviceTier === 'standard' ? 5000 : formData.serviceTier === 'premium' ? 8000 : 12000;
        const totalAmount = amount + (formData.numberOfOptions > 3 ? 2000 : 0);

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4">Complete Payment</h3>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                        <p className="text-sm text-green-800 dark:text-green-200 mb-1">Total Deposit Required</p>
                        <p className="text-3xl font-bold text-green-600">KES {totalAmount.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                            An M-Pesa STK push will be sent to your phone number. Please enter your PIN to complete the transaction.
                        </p>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                M
                            </div>
                            <div>
                                <p className="font-semibold">M-Pesa Express</p>
                                <p className="text-xs text-neutral-500">07XX XXX XXX</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <ButtonSecondary
                            className="flex-1"
                            onClick={() => setShowPaymentModal(false)}
                            disabled={paymentProcessing}
                        >
                            Cancel
                        </ButtonSecondary>
                        <ButtonPrimary
                            className="flex-1"
                            onClick={handlePaymentAndSubmit}
                            loading={paymentProcessing}
                        >
                            {paymentProcessing ? "Processing..." : "Pay Now"}
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="nc-CreateSearchRequestPage">
            {renderPaymentModal()}
            <div className="container py-8 lg:py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                            Create Custom Search Request
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Tell us what you&apos;re looking for and let hunters compete for your job
                        </p>
                    </div>

                    {renderProgressBar()}

                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 lg:p-8">
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                        {currentStep === 5 && renderStep5()}

                        <div className="flex gap-4 mt-8">
                            {currentStep > 1 && (
                                <ButtonSecondary onClick={handleBack} className="flex-1">
                                    <i className="las la-arrow-left mr-2"></i>
                                    Back
                                </ButtonSecondary>
                            )}
                            {currentStep < totalSteps ? (
                                <ButtonPrimary
                                    onClick={handleNext}
                                    className="flex-1"
                                >
                                    Next
                                    <i className="las la-arrow-right ml-2"></i>
                                </ButtonPrimary>
                            ) : (
                                <ButtonPrimary
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex-1"
                                    loading={loading}
                                >
                                    <i className="las la-check mr-2"></i>
                                    Proceed to Payment
                                </ButtonPrimary>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
