"use client";

import React, { useState } from "react";
import { format } from "date-fns";

interface LeaseAgreementProps {
    propertyTitle?: string;
    landlordName?: string;
    tenantName?: string;
    rent?: number;
    deposit?: number;
    startDate?: Date;
    className?: string;
}

const LeaseAgreement: React.FC<LeaseAgreementProps> = ({
    propertyTitle = "Property Name",
    landlordName = "Landlord Name",
    tenantName = "Tenant Name",
    rent = 0,
    deposit = 0,
    startDate = new Date(),
    className = "",
}) => {
    const [isSigned, setIsSigned] = useState(false);
    const [landlordSignature, setLandlordSignature] = useState("");
    const [tenantSignature, setTenantSignature] = useState("");

    return (
        <div className={`lease-agreement ${className}`}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8">
                {/* Header */}
                <div className="text-center mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-3xl font-bold mb-2">Residential Lease Agreement</h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Republic of Kenya
                    </p>
                </div>

                {/* Agreement Content */}
                <div className="space-y-6 mb-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">1. Parties</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            This Lease Agreement (&quot;Agreement&quot;) is entered into on{" "}
                            <strong>{format(startDate, "MMMM d, yyyy")}</strong> between:
                        </p>
                        <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li><strong>Landlord:</strong> {landlordName}</li>
                            <li><strong>Tenant:</strong> {tenantName}</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">2. Property</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            The Landlord agrees to lease to the Tenant the following premises:{" "}
                            <strong>{propertyTitle}</strong>
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">3. Term</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            The lease term shall commence on{" "}
                            <strong>{format(startDate, "MMMM d, yyyy")}</strong> and shall continue
                            for a period of <strong>12 months</strong>, unless terminated earlier
                            in accordance with this Agreement.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">4. Rent</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            The Tenant agrees to pay monthly rent of{" "}
                            <strong>KES {rent.toLocaleString()}</strong>, payable on or before the
                            5th day of each month.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">5. Security Deposit</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            The Tenant shall deposit with the Landlord a sum of{" "}
                            <strong>KES {deposit.toLocaleString()}</strong> as security deposit
                            to be held throughout the tenancy.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">6. Utilities</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            The Tenant shall be responsible for payment of all utilities including
                            electricity, water, and internet services during the tenancy period.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">7. Maintenance</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            The Landlord shall maintain the property in good condition. The Tenant
                            shall maintain the interior and notify the Landlord of any required
                            repairs.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">8. Termination</h3>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            Either party may terminate this Agreement by providing{" "}
                            <strong>30 days</strong> written notice to the other party.
                        </p>
                    </div>
                </div>

                {/* Signatures */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-8">
                    <h3 className="font-semibold text-lg mb-6">Signatures</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Landlord Signature */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Landlord Signature</label>
                            <input
                                type="text"
                                value={landlordSignature}
                                onChange={(e) => setLandlordSignature(e.target.value)}
                                placeholder="Type your name to sign"
                                className="w-full px-4 py-3 border-b-2 border-neutral-300 dark:border-neutral-600 bg-transparent font-serif text-2xl focus:outline-none focus:border-primary-500"
                                style={{ fontFamily: "'Brush Script MT', cursive" }}
                            />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                {landlordName}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Date: {format(new Date(), "MMM dd, yyyy")}
                            </p>
                        </div>

                        {/* Tenant Signature */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Tenant Signature</label>
                            <input
                                type="text"
                                value={tenantSignature}
                                onChange={(e) => setTenantSignature(e.target.value)}
                                placeholder="Type your name to sign"
                                className="w-full px-4 py-3 border-b-2 border-neutral-300 dark:border-neutral-600 bg-transparent font-serif text-2xl focus:outline-none focus:border-primary-500"
                                style={{ fontFamily: "'Brush Script MT', cursive" }}
                            />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                {tenantName}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Date: {format(new Date(), "MMM dd, yyyy")}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => setIsSigned(true)}
                            disabled={!landlordSignature || !tenantSignature}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            <i className="las la-check-circle mr-2"></i>
                            Finalize Agreement
                        </button>
                        <button className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-500 transition-colors font-medium">
                            <i className="las la-download mr-2"></i>
                            Download PDF
                        </button>
                        <button className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-500 transition-colors font-medium">
                            <i className="las la-print mr-2"></i>
                            Print
                        </button>
                    </div>

                    {isSigned && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <i className="las la-check-circle text-2xl"></i>
                                <span className="font-medium">
                                    Agreement finalized and ready for execution
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaseAgreement;
