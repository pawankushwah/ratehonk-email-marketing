import { ShieldCheck } from "lucide-react";

export default function SenderSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Sender Authentication</h1>
        <p className="text-text-dim">Verify your domains and configure DKIM/SPF records to improve deliverability.</p>
      </div>
      <div className="bg-main-dim/50 rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <ShieldCheck className="w-12 h-12 text-main mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Sender Authentication Coming Soon</h3>
        <p className="text-text-dim text-sm max-w-sm">This module is currently under development.</p>
      </div>
    </div>
  );
}
