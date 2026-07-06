import { Webhook } from "lucide-react";

export default function ApiSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">API & Integrations</h1>
        <p className="text-text-dim">Manage your API keys, webhooks, and third-party connected apps.</p>
      </div>
      <div className="bg-main-dim/50 rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Webhook className="w-12 h-12 text-main mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">API Settings Coming Soon</h3>
        <p className="text-text-dim text-sm max-w-sm">This module is currently under development.</p>
      </div>
    </div>
  );
}
