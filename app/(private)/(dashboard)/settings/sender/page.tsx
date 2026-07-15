import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SenderSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Sender Authentication</h1>
        <p className="text-text-dim">Verify your domains and configure DKIM/SPF records to improve deliverability.</p>
      </div>
      <div className="bg-main-dim/50 rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <ShieldCheck className="w-12 h-12 text-main mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Domain Settings Have Moved</h3>
        <p className="text-text-dim text-sm max-w-sm mb-6">You can now manage and verify your email and website domains from your profile settings.</p>
        <Link href="/dashboard/profile?tab=domains" className="inline-flex items-center justify-center px-4 py-2 font-semibold bg-main text-white rounded-lg hover:bg-main-hover transition-colors">
          Go to Domains Tab <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
