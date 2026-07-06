import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="pt-20 pb-10 overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-main-dim)_0%,transparent_50%)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text mb-8">
                            Turn emails into <span className="text-main">revenue</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-dim mb-10 max-w-2xl mx-auto font-oxygen leading-relaxed">
                            RateHonk is the most powerful platform to build campaigns, automate marketing, and connect with your audience. Grow your business on your terms.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <Link
                                href="/register"
                                className="bg-main hover:bg-alt text-white px-8 py-4 rounded-full font-bold text-lg transition-colors w-full sm:w-auto text-center shadow-lg shadow-sky-500/30"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="/pricing"
                                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-lg transition-colors w-full sm:w-auto text-center"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Do it all with RateHonk</h2>
                        <p className="mt-4 text-lg text-gray-500">Everything you need to run successful campaigns.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-main-dim rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Email Automations</h3>
                            <p className="text-gray-500 font-oxygen">Trigger emails based on user behavior and send the right message at exactly the right time.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-main-dim rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Drag & Drop Editor</h3>
                            <p className="text-gray-500 font-oxygen">Design beautiful emails in minutes without writing a single line of code using our intuitive builder.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-main-dim rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Actionable Analytics</h3>
                            <p className="text-gray-500 font-oxygen">Track opens, clicks, and conversions in real-time to continuously optimize your campaigns.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
