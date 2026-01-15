export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <div className="text-8xl mb-4">🔧</div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                        Under Maintenance
                    </h1>
                </div>

                <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-8">
                    We&apos;re currently performing scheduled maintenance to improve our services.
                    We&apos;ll be back shortly!
                </p>

                <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-8 mb-8">
                    <h3 className="font-semibold text-lg mb-3">Expected Downtime</h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                        2:00 AM - 4:00 AM EAT
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                        (Approximately 2 hours)
                    </p>
                </div>

                <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                    <p>
                        💡 <strong>Tip:</strong> Bookmark this page and check back later
                    </p>
                    <p>
                        📧 Questions? Email us at{" "}
                        <a href="mailto:support@househaunters.co.ke" className="text-primary-600 hover:underline">
                            support@househaunters.co.ke
                        </a>
                    </p>
                </div>

                <div className="mt-12">
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        Thank you for your patience!
                    </p>
                </div>
            </div>
        </div>
    );
}
