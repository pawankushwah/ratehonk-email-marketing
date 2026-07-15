import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-main-dim rounded-full flex items-center justify-center mb-8">
        <FileQuestion className="w-12 h-12 text-main" />
      </div>
      <h2 className="text-3xl font-bold text-text mb-4">Module Not Found</h2>
      <p className="text-text-dim max-w-md mx-auto mb-8 leading-relaxed">
        The dashboard module or page you're trying to access doesn't exist or is currently under construction.
      </p>
      <Link 
        href="/dashboard"
        className="bg-main hover:bg-alt text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-sky-500/20"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
