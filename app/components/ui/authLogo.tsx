import Link from "next/link";
import Image from "next/image";

export default function AuthLogo() {
    return (
        <Link
            href="/"
            className="relative flex items-center h-[45px] w-[146px] overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
        >
            <div className="absolute inset-0 flex items-center justify-start transition-transform duration-300 ease-in-out -translate-x-full group-hover:translate-x-0">
                <span className="flex items-center text-main hover:text-alt font-bold text-lg whitespace-nowrap transition-colors">
                    <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Home
                </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-start transition-transform duration-300 ease-in-out translate-x-0 group-hover:translate-x-full">
                <Image
                    src="/ratehonk.png"
                    alt="RateHonk Brand"
                    width={146}
                    height={45}
                    priority
                />
            </div>
        </Link>
    );
}
