import Link from "next/link";
import Navbar from "@/app/components/ui/navbar";
import { Ghost } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <h1 className="text-[150px] font-bold text-main-dim leading-none select-none">404</h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <Ghost className="w-24 h-24 text-main animate-bounce" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-text mb-6">Page Not Found</h2>
          <p className="text-lg text-text-dim mb-10 max-w-lg mx-auto">
            Oops! The page you are looking for seems to have vanished into thin air. It might have been moved or deleted.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="bg-main hover:brightness-95 text-white px-4 py-2.5 rounded-full font-bold text-lg transition-all shadow-lg shadow-sky-500/30"
            >
              Back to Home
            </Link>
            {/* <Link
              href="/support"
              className="bg-white border-2 border-border hover:border-gray-300 text-text px-4 py-2.5 rounded-full font-bold text-lg transition-colors"
            >
              Contact Support
            </Link> */}
          </div>
        </div>
      </main>
    </div>
  );
}
