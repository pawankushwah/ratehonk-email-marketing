import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/ui/navbar";

export default function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-1">
                            <Image
                                src="/ratehonk.png"
                                alt="RateHonk Brand"
                                width={120}
                                height={37}
                            />
                            <p className="mt-4 text-sm text-gray-500">
                                Empowering businesses to grow through smarter email marketing.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><Link href="/features" className="hover:text-main">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-main">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><Link href="#" className="hover:text-main">Blog</Link></li>
                                <li><Link href="#" className="hover:text-main">Help Center</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><Link href="#" className="hover:text-main">About Us</Link></li>
                                <li><Link href="#" className="hover:text-main">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-400">
                        © {new Date().getFullYear()} RateHonk. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
