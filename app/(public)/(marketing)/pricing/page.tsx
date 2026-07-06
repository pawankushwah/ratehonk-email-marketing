import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
                    <p className="text-xl text-gray-500">Choose the plan that fits your business needs.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                        <p className="text-gray-500 mb-6 font-oxygen">Perfect for getting started</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$0</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-gray-600 font-oxygen">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Up to 1,000 contacts
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                5,000 emails/month
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Basic templates
                            </li>
                        </ul>
                        <Link href="/register" className="w-full py-3 px-4 bg-sky-50 text-sky-600 font-bold rounded-lg hover:bg-sky-100 transition-colors text-center border border-sky-100">
                            Start Free
                        </Link>
                    </div>
                    
                    {/* Pro Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-sky-500 relative flex flex-col transform md:-translate-y-4">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                        <p className="text-gray-500 mb-6 font-oxygen">For growing businesses</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$29</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-gray-600 font-oxygen">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Up to 10,000 contacts
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Unlimited emails
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Advanced Automations
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                A/B Testing
                            </li>
                        </ul>
                        <Link href="/register" className="w-full py-3 px-4 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-colors text-center">
                            Start Free Trial
                        </Link>
                    </div>
                    
                    {/* Enterprise Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                        <p className="text-gray-500 mb-6 font-oxygen">For large scale operations</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$99</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-gray-600 font-oxygen">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Unlimited contacts
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Dedicated IP
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Dedicated support
                            </li>
                        </ul>
                        <Link href="/contact" className="w-full py-3 px-4 bg-gray-50 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center border border-gray-200">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
