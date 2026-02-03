import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import haunterHero from "@/images/hero-right-3.png";

export default function ForHauntersPage() {
    return (
        <div className="nc-ForHauntersPage">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="container relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                                Earn Money Helping People Find Homes
                            </h1>
                            <p className="text-xl text-primary-100 mb-8">
                                Join Dapio and turn your local knowledge into income.
                                Conduct property viewings and earn up to KES 4,000 per viewing.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <ButtonPrimary className="bg-white text-primary-600 hover:bg-primary-50">
                                    Sign Up Now
                                </ButtonPrimary>
                                <ButtonPrimary className="bg-transparent border-2 border-white hover:bg-white/10">
                                    Learn More
                                </ButtonPrimary>
                            </div>
                            <div className="mt-8 flex gap-8">
                                <div>
                                    <div className="text-3xl font-bold">500+</div>
                                    <div className="text-primary-200 text-sm">Active Agents</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">KES 2,000</div>
                                    <div className="text-primary-200 text-sm">Avg. per viewing</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">80%</div>
                                    <div className="text-primary-200 text-sm">Your earnings</div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <Image
                                src={haunterHero}
                                alt="Agent"
                                width={500}
                                height={500}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="container py-16 lg:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-semibold mb-4">
                        Why Become a Dapio Agent?
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                        Flexible hours, great earnings, and the satisfaction of helping people find their dream homes
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="las la-wallet text-3xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Great Earnings</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Earn KES 1,200 - 4,000 per viewing. Active agents make KES 20,000 - 60,000/month.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="las la-clock text-3xl text-blue-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Flexible Schedule</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Work when it suits you. Accept viewings that fit your schedule.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="las la-shield-alt text-3xl text-purple-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Verified Platform</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Secure payments, verified tenants, and 24/7 support from our team.
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-neutral-100 dark:bg-neutral-800 py-16 lg:py-24">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-semibold mb-4">
                            How to Get Started
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            {/* Step 1 */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">Sign Up & Verify</h3>
                                    <p className="text-neutral-600 dark:text-neutral-300">
                                        Create your account and upload your National ID. Our team will verify you within 24 hours.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">Add Properties</h3>
                                    <p className="text-neutral-600 dark:text-neutral-300">
                                        List rental properties you have access to. Add quality photos and videos for better bookings.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">Accept Bookings</h3>
                                    <p className="text-neutral-600 dark:text-neutral-300">
                                        Get notified when tenants book viewings. Accept those that fit your schedule.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">Conduct Viewing & Get Paid</h3>
                                    <p className="text-neutral-600 dark:text-neutral-300">
                                        Meet the tenant, show the property, answer questions. Receive payment via M-Pesa within 24 hours.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Requirements */}
            <div className="container py-16 lg:py-24">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-semibold mb-8 text-center">Requirements</h2>

                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <i className="las la-check-circle text-2xl text-green-600 mt-0.5"></i>
                                <span>Must be 18 years or older</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="las la-check-circle text-2xl text-green-600 mt-0.5"></i>
                                <span>Valid Kenyan National ID</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="las la-check-circle text-2xl text-green-600 mt-0.5"></i>
                                <span>M-Pesa registered phone number</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="las la-check-circle text-2xl text-green-600 mt-0.5"></i>
                                <span>Access to rental properties in your area</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="las la-check-circle text-2xl text-green-600 mt-0.5"></i>
                                <span>Good communication skills</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="las la-check-circle text-2xl text-green-600 mt-0.5"></i>
                                <span>Smartphone with camera</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-primary-600 py-16">
                <div className="container text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Ready to Start Earning?
                    </h2>
                    <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                        Join hundreds of Kenyans already earning with Dapio
                    </p>
                    <ButtonPrimary className="bg-white text-primary-600 hover:bg-primary-50">
                        Apply Now  →
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
}
