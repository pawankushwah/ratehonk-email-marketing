import { Building2 } from "lucide-react";

export default function OrganizationSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Organization</h1>
        <p className="text-text-dim">Manage your company profile and brand identity.</p>
      </div>
      <div className="bg-main-dim/50 rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Building2 className="w-12 h-12 text-main mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Organization Settings Coming Soon</h3>
        <p className="text-text-dim text-sm max-w-sm">This module is currently under development.</p>
      </div>
    </div>
  );
}
