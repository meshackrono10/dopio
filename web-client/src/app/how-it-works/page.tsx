import React from "react";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { Route } from "@/routers/types";

export default function HowItWorksPage() {
    return (
        <div className="nc-HowItWorksPage">
            {/* HERO */}
            <div className="relative py-16 lg:py-24 bg-primary-50 dark:bg-black/20">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold">
                            How House Haunters Works
                        </h1>
                        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300">
                            Finding your perfect rental home in Kenya is now easier, safer, and more transparent.
                            Here&apos;s how our platform connects you with verified House Haunters.
                        </p>
                    </div>
                </div>
            </div>

            {/* FOR TENANTS */}
            <div className="container py-16 lg:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-semibold">For Home Seekers</h2>
                    <p className="mt-4 text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        Your journey to finding a home, simplified and secured
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Step 1 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary-600">1</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Search Properties</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Browse verified properties across Kenyan cities. Filter by location, rent range, layout, and amenities.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary-600">2</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Choose a Viewing Package</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Select from Bronze (single property), Gold (up to 5), or Platinum (up to 8) viewing packages based on your needs.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary-600">3</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Pay Securely with M-Pesa</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Complete your booking with M-Pesa. Your payment is held securely until the viewing is completed.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary-600">4</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Chat & Coordinate</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            After payment, unlock in-app chat with your House Haunter. Get the exact location and coordinate the viewing time.
                        </p>
                    </div>

                    {/* Step 5 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary-600">5</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">View Your Homes</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Meet your House Haunter and tour the properties. They&apos;ll show you exactly what you paid to see.
                        </p>
                    </div>

                    {/* Step 6 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary-600">6</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Leave a Review</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Rate your experience and help future tenants make informed decisions about House Haunters.
                        </p>
                    </div>
                </div>
            </div>

            {/* FOR HOUSE HAUNTERS */}
            <div className="bg-neutral-100 dark:bg-neutral-900 py-16 lg:py-24">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-semibold">For House Haunters</h2>
                        <p className="mt-4 text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                            Build your business, earn income, and help people find homes
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Step 1 */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                                <i className="las la-user-check text-2xl text-primary-600"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Get Verified</h3>
                            <p className="text-neutral-600 dark:text-neutral-300">
                                Register with your phone number and submit your National ID for verification. We ensure only legitimate agents join our platform.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                                <i className="las la-home text-2xl text-primary-600"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">List Properties</h3>
                            <p className="text-neutral-600 dark:text-neutral-300">
                                Create detailed listings with photos, videos, and accurate descriptions. High-quality listings get more bookings.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                                <i className="las la-tags text-2xl text-primary-600"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Set Your Packages</h3>
                            <p className="text-neutral-600 dark:text-neutral-300">
                                Create custom viewing packages with your own pricing. Offer single property viewings or comprehensive area tours.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                                <i className="las la-wallet text-2xl text-primary-600"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Earn Income</h3>
                            <p className="text-neutral-600 dark:text-neutral-300">
                                Receive 85% of every booking (we take 15%). Get paid directly to your M-Pesa within 24 hours after each viewing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* VALUE PROPOSITIONS */}
            <div className="container py-16 lg:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-semibold">Why Choose House Haunters?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="las la-shield-alt text-4xl text-primary-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Verified Agents Only</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Every House Haunter is ID-verified by our team. No more dealing with unvetted agents.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="las la-video text-4xl text-primary-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Video Tours Required</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            See every property before you book. All listings must include a video tour - no surprises.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="las la-mobile text-4xl text-primary-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">M-Pesa Powered</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Pay securely with M-Pesa. Your money is protected until the service is delivered.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="relative py-16 lg:py-24 bg-primary-600 dark:bg-primary-700">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h2 className="text-3xl lg:text-4xl font-semibold mb-6">
                            Ready to Find Your Home?
                        </h2>
                        <p className="text-lg mb-8 text-primary-100">
                            Join thousands of Kenyans using House Haunters to find quality rental properties
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <ButtonPrimary
                                href="/listing-stay-map"
                                className="bg-white text-primary-600 hover:bg-primary-50"
                            >
                                Search Properties
                            </ButtonPrimary>
                            <ButtonPrimary
                                href={"/add-listing" as Route}
                                className="bg-primary-800 hover:bg-primary-900 border-2 border-white"
                            >
                                Become a House Haunter
                            </ButtonPrimary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
