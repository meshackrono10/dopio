export default function TermsPage() {
    return (
        <div className="nc-TermsPage container pb-24 lg:pb-32">
            <main className="pt-11">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                        Last updated: December 16, 2025
                    </p>

                    <div className="prose dark:prose-invert max-w-none">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Dapio, you accept and agree to be bound by the terms and
                            provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
                        </p>

                        <h2>2. Description of Service</h2>
                        <p>
                            Dapio is a platform that connects tenants seeking rental properties with verified agents
                            (Agents) who conduct in-person property viewings for a fee. We facilitate the booking and payment process
                            but do not own or manage the properties listed.
                        </p>

                        <h2>3. User Accounts</h2>
                        <h3>3.1 Registration</h3>
                        <p>
                            You must register for an account to use certain features. You agree to:
                        </p>
                        <ul>
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information</li>
                            <li>Maintain the security of your password</li>
                            <li>Notify us immediately of any unauthorized use</li>
                        </ul>

                        <h3>3.2 Account Types</h3>
                        <p>We offer two types of accounts:</p>
                        <ul>
                            <li><strong>Tenant Account:</strong> For individuals seeking rental properties</li>
                            <li><strong>Agent Account:</strong> For verified agents conducting property viewings</li>
                        </ul>

                        <h2>4. Agent Verification</h2>
                        <p>
                            All agents must undergo verification including:
                        </p>
                        <ul>
                            <li>National ID verification</li>
                            <li>Background check</li>
                            <li>Approval by our admin team</li>
                        </ul>

                        <h2>5. Payments and Fees</h2>
                        <h3>5.1 Viewing Fees</h3>
                        <p>
                            Tenants pay viewing fees for property viewings through our platform. Fees are non-refundable except in
                            cases where:
                        </p>
                        <ul>
                            <li>The agent fails to show up</li>
                            <li>The property does not exist or is misrepresented</li>
                            <li>Technical errors prevent service delivery</li>
                        </ul>

                        <h3>5.2 Agent Payments</h3>
                        <p>
                            Agents receive 80% of the viewing fee. Payments are processed via M-Pesa within 24 hours of
                            completing a viewing.
                        </p>

                        <h2>6. User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Provide false or misleading information</li>
                            <li>Impersonate any person or entity</li>
                            <li>Violate any laws or regulations</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Use the platform for fraudulent purposes</li>
                            <li>Share login credentials</li>
                        </ul>

                        <h2>7. Property Listings</h2>
                        <p>
                            Agents are responsible for the accuracy of property listings. We do not verify the accuracy
                            of property information and are not liable for inaccuracies or misrepresentations.
                        </p>

                        <h2>8. Reviews and Ratings</h2>
                        <p>
                            Users may leave reviews after viewings. Reviews must be:
                        </p>
                        <ul>
                            <li>Honest and based on personal experience</li>
                            <li>Free from offensive or defamatory content</li>
                            <li>Relevant to the viewing experience</li>
                        </ul>
                        <p>We reserve the right to remove reviews that violate these guidelines.</p>

                        <h2>9. Cancellations and Rescheduling</h2>
                        <ul>
                            <li>Tenants may reschedule viewings up to 24 hours before the scheduled time at no extra cost</li>
                            <li>Cancellations within 24 hours are non-refundable</li>
                            <li>Agents who repeatedly cancel may be suspended or removed</li>
                        </ul>

                        <h2>10. Disclaimer of Warranties</h2>
                        <p>
                            The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
                        </p>
                        <ul>
                            <li>Uninterrupted or error-free service</li>
                            <li>Accuracy of property information</li>
                            <li>Successful rental outcomes</li>
                        </ul>

                        <h2>11. Limitation of Liability</h2>
                        <p>
                            Dapio shall not be liable for any indirect, incidental, special, consequential, or punitive
                            damages resulting from your use of the platform.
                        </p>

                        <h2>12. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold Dapio harmless from any claims, damages, or expenses arising
                            from your use of the platform or violation of these terms.
                        </p>

                        <h2>13. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent
                            activity.
                        </p>

                        <h2>14. Governing Law</h2>
                        <p>
                            These Terms shall be governed by the laws of Kenya. Any disputes shall be resolved in Kenyan courts.
                        </p>

                        <h2>15. Changes to Terms</h2>
                        <p>
                            We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance
                            of the new terms.
                        </p>

                        <h2>16. Contact Information</h2>
                        <p>
                            For questions about these Terms, contact us at:
                            <br />
                            Email: legal@dapio.com
                            <br />
                            Phone: +254 700 123 456
                        </p>
                    </div>

                    <div className="mt-12 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-2xl">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            By using Dapio, you acknowledge that you have read, understood, and agree to be bound by
                            these Terms of Service.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
