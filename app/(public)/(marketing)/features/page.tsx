import Link from "next/link";

export default function FeaturesPage() {
    return (
        <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Powerful Features for Growing Brands</h1>
                <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-16">
                    Everything you need to create, send, and analyze your email campaigns in one intuitive platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Drag-and-Drop Builder</h3>
                        <p className="text-gray-600 mb-6 font-oxygen">
                            Create stunning, responsive emails without writing code. Choose from dozens of pre-built templates or design your own from scratch.
                        </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Automation</h3>
                        <p className="text-gray-600 mb-6 font-oxygen">
                            Set up complex customer journeys with a visual builder. Trigger emails based on purchases, clicks, or any custom event.
                        </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">A/B Testing</h3>
                        <p className="text-gray-600 mb-6 font-oxygen">
                            Optimize your campaigns by testing subject lines, content, and send times to see what resonates best with your audience.
                        </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Analytics</h3>
                        <p className="text-gray-600 mb-6 font-oxygen">
                            Track your performance in real-time. View open rates, click maps, and revenue attribution to understand your ROI.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
