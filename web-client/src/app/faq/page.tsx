"use client";

import React, { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQS: FAQItem[] = [
    {
        category: "General",
        question: "What is House Haunters?",
        answer: "House Haunters is a platform that connects tenants looking for rental properties with verified house haunters (agents) who conduct in-person property viewings on your behalf for a fee.",
    },
    {
        category: "General",
        question: "How does it work?",
        answer: "Simply browse properties on our platform, select one you like, choose a viewing package, pay via M-Pesa, and our verified house haunter will meet you at the property for a detailed tour.",
    },
    {
        category: "Pricing",
        question: "How much does a viewing cost?",
        answer: "We offer three packages: Silver (KES 1,500) for 30-minute viewings, Gold (KES 2,500) for 1-hour comprehensive viewings, and Platinum (KES 5,000) for 2-hour premium viewings with video recording and inspection reports.",
    },
    {
        category: "Pricing",
        question: "Can I get a refund if I don't like the property?",
        answer: "Viewing fees are non-refundable as they cover the house haunter's time and service. However, if the house haunter doesn't show up or the property doesn't exist, you'll receive a full refund.",
    },
    {
        category: "Payments",
        question: "What payment methods do you accept?",
        answer: "We currently accept M-Pesa payments only. More payment options coming soon!",
    },
    {
        category: "Payments",
        question: "Is my payment secure?",
        answer: "Yes! All payments are processed through Safaricom's secure M-Pesa system. We never store your payment information.",
    },
    {
        category: "Viewings",
        question: "How do I schedule a viewing?",
        answer: "After selecting a property and package, you'll be asked to choose your preferred date and time. You'll receive a confirmation via SMS with the exact location (unlocked after payment).",
    },
    {
        category: "Viewings",
        question: "Can I reschedule a viewing?",
        answer: "Yes, you can reschedule up to 24 hours before your scheduled viewing at no extra cost. Contact support or use your dashboard to reschedule.",
    },
    {
        category: "Viewings",
        question: "What happens during a viewing?",
        answer: "Your house haunter will meet you at the property, show you around all rooms and amenities, answer your questions, and provide information about the neighborhood and landlord terms.",
    },
    {
        category: "For Haunters",
        question: "How do I become a house haunter?",
        answer: "Sign up on our platform, upload your National ID for verification, complete your profile, and once approved by our admin team, you can start listing properties and conducting viewings.",
    },
    {
        category: "For Haunters",
        question: "How much can I earn as a house haunter?",
        answer: "You earn 80% of the viewing fee. For example, on a Gold package (KES 2,500), you earn KES 2,000. Most active haunters conduct 10-15 viewings per month.",
    },
    {
        category: "For Haunters",
        question: "How do I get paid?",
        answer: "Payments are processed via M-Pesa within 24 hours after you mark a viewing as completed. Minimum payout is KES 1,000.",
    },
    {
        category: "Trust & Safety",
        question: "Are house haunters verified?",
        answer: "Yes! All house haunters must submit their National ID and undergo verification by our admin team before they can conduct viewings.",
    },
    {
        category: "Trust & Safety",
        question: "What if I have a bad experience?",
        answer: "You can rate and review house haunters after each viewing. If you encounter Issues, report them through your dashboard and our team will investigate and resolve them.",
    },
    {
        category: "Trust & Safety",
        question: "Are the properties real?",
        answer: "All properties are submitted by verified house haunters. However, we recommend viewing the property in person before making any rental agreements with landlords.",
    },
];

export default function FAQPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const categories = ["All", ...Array.from(new Set(FAQS.map((faq) => faq.category)))];

    const filteredFAQs = FAQS.filter((faq) => {
        const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
        const matchesSearch =
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <div className="nc-FAQPage">
            {/* Hero Section */}
            <div className="bg-primary-50 dark:bg-primary-900/10 py-16 lg:py-24">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
                            Find answers to common questions about House Haunters
                        </p>

                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <i className="las la-search absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-neutral-400"></i>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for questions..."
                                className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container py-16 lg:py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-3 mb-12 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2 rounded-full border-2 transition-colors font-medium ${activeCategory === category
                                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                    : "border-neutral-300 dark:border-neutral-600 hover:border-primary-400"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Accordion */}
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="las la-search text-6xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                No questions found. Try a different search term.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFAQs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleItem(index)}
                                        className="w-full px-6 py-5 flex items-start justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                                    >
                                        <div className="flex-1 pr-4">
                                            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-2 block">
                                                {faq.category}
                                            </span>
                                            <h3 className="font-semibold text-lg">{faq.question}</h3>
                                        </div>
                                        <i
                                            className={`las la-angle-down text-2xl text-neutral-400 transition-transform flex-shrink-0 ${openItems.has(index) ? "rotate-180" : ""
                                                }`}
                                        ></i>
                                    </button>
                                    {openItems.has(index) && (
                                        <div className="px-6 pb-5">
                                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Still have questions */}
                    <div className="mt-16 bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-semibold mb-3">Still have questions?</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
                        </p>
                        <a
                            href="/contact"
                            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                        >
                            <i className="las la-envelope mr-2"></i>
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
