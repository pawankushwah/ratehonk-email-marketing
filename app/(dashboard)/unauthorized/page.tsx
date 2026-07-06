import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-red-dim rounded-full flex items-center justify-center mb-8">
        <ShieldAlert className="w-12 h-12 text-red" />
      </div>
      <h2 className="text-3xl font-bold text-text mb-4">Access Denied</h2>
      <p className="text-text-dim max-w-md mx-auto mb-8 leading-relaxed">
        You don't have the required permissions to view this module. Please contact your administrator if you believe this is a mistake.
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
