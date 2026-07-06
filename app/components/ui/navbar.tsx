"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <Image
                                    src="/ratehonk.png"
                                    alt="RateHonk Brand"
                                    width={146}
                                    height={45}
                                    priority
                                />
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Features
                            </Link>
                            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Pricing
                            </Link>
                        </nav>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Login
                            </Link>
                            <Link href="/register" className="bg-main hover:bg-alt text-white px-5 py-2.5 rounded-full font-semibold transition-colors">
                                Sign Up Free
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {!isOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Full-screen Mobile menu panel */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col justify-center items-center overflow-y-auto">
                    <div className="absolute top-0 w-full h-20 px-4 sm:px-6 flex justify-end items-center">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                        >
                            <span className="sr-only">Close main menu</span>
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-8 w-full px-6 min-h-screen py-24">
                        <Link href="/features" onClick={() => setIsOpen(false)} className="block text-2xl font-bold text-gray-700 hover:text-main transition-colors">
                            Features
                        </Link>
                        <Link href="/pricing" onClick={() => setIsOpen(false)} className="block text-2xl font-bold text-gray-700 hover:text-main transition-colors">
                            Pricing
                        </Link>
                        <Link href="/login" onClick={() => setIsOpen(false)} className="block text-2xl font-bold text-gray-700 hover:text-main transition-colors">
                            Login
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full max-w-[200px] text-center bg-main hover:bg-alt text-white px-6 py-4 rounded-full text-xl font-bold transition-colors mt-4">
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
