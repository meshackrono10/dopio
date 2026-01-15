"use client";

import React from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { Route } from "@/routers/types";
import Image from "next/image";

export default function RequestSearchPage() {
    return (
        <div className="nc-RequestSearchPage">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-100 via-primary-50 to-white dark:from-primary-900/20 dark:via-neutral-900 dark:to-neutral-900 py-16 lg:py-24">
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            Can&apos;t Find Your Perfect Home?
                        </h1>
                        <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
                            Let professional house hunters compete to find exactly what you need.
                            Post your requirements, review bids, and get matched with 3 perfect options.
                        </p>
                        <ButtonPrimary
                            href={"/request-search/create" as Route}
                            sizeClass="px-8 py-4 text-lg"
                        >
                            <i className="las la-search mr-2 text-xl"></i>
                            Start Your Custom Search
                        </ButtonPrimary>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                            💪 Only pay when you find your home
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="container py-16 lg:py-24">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
                        How It Works
                    </h2>

                    <div className="space-y-12">
                        {/* Step 1 */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3">
                                    📝 Post Your Requirements
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                                    Tell us exactly what you need: location, budget, amenities, number of options.
                                    Example: &quot;I need 3 options for a 2-bedroom with a balcony in Syokimau, budget 35k&quot;
                                </p>
                                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-2">You Specify:</p>
                                    <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                                        <li>• Area/Neighborhood</li>
                                        <li>• Budget range</li>
                                        <li>• Property type & features</li>
                                        <li>• Must-haves & deal-breakers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">2</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3">
                                    🏆 Hunters Compete for Your Job
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                                    Verified house hunters in your area receive your request and submit competitive bids.
                                </p>
                                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-2">Hunters Bid With:</p>
                                    <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                                        <li>💰 <strong>Price</strong>: &quot;I can do this for 2,500 KES&quot;</li>
                                        <li>⚡ <strong>Speed</strong>: &quot;I&apos;ll deliver in 12 hours&quot;</li>
                                        <li>🎁 <strong>Bonuses</strong>: &quot;1 extra house included for free&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3">
                                    ✅ Choose Your Winner
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                                    Review bids, check hunter ratings, and select the best offer. Your money is held in escrow for safety.
                                </p>
                                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-2">You See:</p>
                                    <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                                        <li>⭐ Hunter&apos;s star rating</li>
                                        <li>📊 Success rate percentage</li>
                                        <li>💬 Previous client reviews</li>
                                        <li>🏅 Completion history</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">4</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3">
                                    📸 Receive Photo & Video Evidence
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                                    Hunter uploads photos and videos of matching properties within the agreed timeframe.
                                    All evidence is saved to your private dashboard.
                                </p>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-2 text-amber-900 dark:text-amber-100">
                                        🔒 Your Privacy Protected
                                    </p>
                                    <ul className="text-sm space-y-1 text-amber-800 dark:text-amber-200">
                                        <li>• No exact addresses shown (500m radius only)</li>
                                        <li>• Hunter shares meeting point via chat</li>
                                        <li>• Physical escort to all properties</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">5</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3">
                                    🏠 View & Decide
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                                    Hunter escorts you to view the properties. If you like one, proceed with booking.
                                    Hunter gets paid. If not satisfied, request a review.
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">
                                        ✅ 100% Accountability
                                    </p>
                                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                                        <li>• Evidence-based quality control</li>
                                        <li>• Admin reviews disputes</li>
                                        <li>• Refund if hunter didn&apos;t deliver</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-neutral-100 dark:bg-neutral-800 py-16 lg:py-24">
                <div className="container">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
                            Simple, Fair Pricing
                        </h2>
                        <p className="text-center text-neutral-600 dark:text-neutral-300 mb-12">
                            Choose the service that fits your urgency
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Standard */}
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-primary-500 transition-all">
                                <h3 className="text-2xl font-bold mb-2">Standard</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">For flexible timelines</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">KES 5,000</span>
                                    <span className="text-neutral-500 dark:text-neutral-400"> deposit</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>3 property options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>7 days delivery</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>Photo evidence</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>Physical viewings</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Premium */}
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border-2 border-primary-500 relative transform scale-105">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        POPULAR
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">Faster delivery</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-primary-600">KES 8,000</span>
                                    <span className="text-neutral-500 dark:text-neutral-400"> deposit</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>3 property options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span><strong>5 days</strong> delivery</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>Photo + <strong>video</strong> evidence</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>Priority matching</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Urgent */}
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-primary-500 transition-all">
                                <h3 className="text-2xl font-bold mb-2">Urgent</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">Need it fast</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">KES 12,000</span>
                                    <span className="text-neutral-500 dark:text-neutral-400"> deposit</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>3 property options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span><strong>3 days</strong> delivery</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>Photo + video evidence</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span><strong>Highest priority</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="las la-check text-green-600 text-xl"></i>
                                        <span>Dedicated support</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="container py-16 lg:py-24">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-2">What if I don&apos;t like any of the options?</h3>
                            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                                Our admin team reviews the evidence. If the hunter delivered properties matching your requirements,
                                the deposit is earned. If not, you get a full refund.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-2">How does the location privacy work?</h3>
                            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                                We never show exact addresses. You&apos;ll see a 500m radius neighborhood circle. The hunter shares
                                a public meeting point (like a petrol station) and escorts you to each property personally.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-2">When do I pay?</h3>
                            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                                You pay the deposit upfront via M-Pesa. The money is held in escrow and only released to the
                                hunter after you confirm the viewing OR the agreed timeframe expires.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-2">Can I extend the timeframe?</h3>
                            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                                Yes! If the hunter needs more time, they can request an extension. You can approve or deny it
                                directly in your dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-600 dark:bg-primary-700 py-16">
                <div className="container text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Ready to Find Your Perfect Home?
                    </h2>
                    <p className="text-white/90 text-lg mb-8">
                        Join thousands of satisfied tenants who found their dream homes
                    </p>
                    <ButtonPrimary
                        href={"/request-search/create" as Route}
                        sizeClass="px-8 py-4 text-lg"
                        className="bg-white text-primary-600 hover:bg-neutral-100"
                    >
                        Get Started Now
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
