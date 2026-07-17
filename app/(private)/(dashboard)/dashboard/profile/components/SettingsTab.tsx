"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import Button from "@/app/components/ui/button";
import { SETTINGS_MENUS } from "@/app/config/settings-sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, CreditCard, ShieldCheck, Users, Webhook, Trash2, Edit2, Plus, Key, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { trpc } from '@/app/trpc';
import Image from "next/image";

// --- GENERAL SETTINGS COMPONENT ---
const generalSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  timeFormat: z.string().min(1, "Time format is required"),
  currency: z.string().min(1, "Currency is required"),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

const validateWithZod = (schema: z.ZodSchema) => (values: any) => {
  try {
    schema.parse(values);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.formErrors.fieldErrors;
    }
    return {};
  }
};

function GeneralSettings() {
  const [mounted, setMounted] = useState(false);

  const formik = useFormik<GeneralSettingsValues>({
    initialValues: {
      timezone: "",
      dateFormat: "",
      timeFormat: "",
      currency: "",
    },
    validate: validateWithZod(generalSettingsSchema),
    onSubmit: (values) => {
      console.log("Settings saved:", values);
      // alert or toast could go here
    },
  });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const locale = navigator.language || "en-US";

    let defaultCurrency = "USD";
    if (locale === "en-GB") defaultCurrency = "GBP";
    if (locale === "en-IN") defaultCurrency = "INR";
    if (locale.startsWith("fr") || locale.startsWith("de") || locale.startsWith("es")) defaultCurrency = "EUR";

    const defaultDateFormat = locale === "en-US" ? "MM/DD/YYYY" : "DD/MM/YYYY";
    const timeString = new Date().toLocaleTimeString(locale);
    const defaultTimeFormat = timeString.includes("AM") || timeString.includes("PM") ? "12h" : "24h";

    formik.setValues({
      timezone: tz,
      dateFormat: defaultDateFormat,
      timeFormat: defaultTimeFormat,
      currency: defaultCurrency,
    });

    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return <div className="p-8 text-text-dim">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">General Settings</h1>
        <p className="text-text-dim">Manage your global preferences like timezone, date formats, and currency.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="border-b border-border pb-8">
          <label htmlFor="timezone" className="block text-[15px] font-bold text-text mb-1">
            Timezone
          </label>
          <p className="text-sm text-text-dim mb-4">
            Select the primary timezone for scheduling your email campaigns.
          </p>
          <div className="relative">
            <select
              id="timezone"
              name="timezone"
              value={formik.values.timezone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full max-w-sm h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${formik.touched.timezone && formik.errors.timezone ? 'border border-red-500' : ''
                }`}
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Central European Time</option>
              <option value="Asia/Kolkata">India Standard Time</option>
              <option value={formik.values.timezone}>{formik.values.timezone} (Detected)</option>
            </select>
            {formik.touched.timezone && formik.errors.timezone && (
              <p className="mt-1 text-sm text-red-500">{String(formik.errors.timezone)}</p>
            )}
          </div>
        </div>

        <div className="border-b border-border pb-8">
          <label className="block text-[15px] font-bold text-text mb-1">
            Date & Time Format
          </label>
          <p className="text-sm text-text-dim mb-4">
            How dates and times should be displayed across the dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-sm">
            <div className="flex-1">
              <select
                name="dateFormat"
                value={formik.values.dateFormat}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${formik.touched.dateFormat && formik.errors.dateFormat ? 'border border-red-500' : ''
                  }`}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
              {formik.touched.dateFormat && formik.errors.dateFormat && (
                <p className="mt-1 text-sm text-red-500">{String(formik.errors.dateFormat)}</p>
              )}
            </div>

            <div className="flex-1">
              <select
                name="timeFormat"
                value={formik.values.timeFormat}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${formik.touched.timeFormat && formik.errors.timeFormat ? 'border border-red-500' : ''
                  }`}
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
              {formik.touched.timeFormat && formik.errors.timeFormat && (
                <p className="mt-1 text-sm text-red-500">{String(formik.errors.timeFormat)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-border pb-8">
          <label htmlFor="currency" className="block text-[15px] font-bold text-text mb-1">
            Currency
          </label>
          <p className="text-sm text-text-dim mb-4">
            The default currency used for reports, carts, and billing metrics.
          </p>
          <div className="relative">
            <select
              id="currency"
              name="currency"
              value={formik.values.currency}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full max-w-sm h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${formik.touched.currency && formik.errors.currency ? 'border border-red-500' : ''
                }`}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
            </select>
            {formik.touched.currency && formik.errors.currency && (
              <p className="mt-1 text-sm text-red-500">{String(formik.errors.currency)}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

// --- PLACEHOLDER COMPONENTS ---
function OrganizationSettings() {
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

function BillingSettings() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Billing & Plans</h1>
        <p className="text-text-dim">Manage your subscription, payment methods, and billing history.</p>
      </div>
      <div className="bg-main-dim/50 rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <CreditCard className="w-12 h-12 text-main mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Billing Settings Coming Soon</h3>
        <p className="text-text-dim text-sm max-w-sm">This module is currently under development.</p>
      </div>
    </div>
  );
}

function TeamSettings() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Team Management</h1>
        <p className="text-text-dim">Invite users, manage roles, and control access permissions.</p>
      </div>
      <div className="bg-main-dim/50 rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Users className="w-12 h-12 text-main mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Team Settings Coming Soon</h3>
        <p className="text-text-dim text-sm max-w-sm">This module is currently under development.</p>
      </div>
    </div>
  );
}

function SenderSettings() {
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
      </div>
    </div>
  );
}

const apiKeySchema = z.object({
  name: z.string().optional(),
  key: z.string().min(1, 'API Key is required'),
});

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', img: "/images/ai/chatgpt.svg" },
  { id: 'gemini', name: 'Google Gemini', img: "/images/ai/gemini.svg" },
  { id: 'anthropic', name: 'Anthropic Claude', img: "/images/ai/claude.svg" },
  { id: 'mistral', name: 'Mistral AI', img: "/images/ai/mistral.svg" },
];

function ApiSettings() {
  const { data: apiKeysData, refetch } = trpc.apiKeys.getApiKeys.useQuery();
  const apiKeys = apiKeysData?.apiKeys || [];

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = trpc.apiKeys.createApiKey.useMutation({
    onSuccess: () => {
      refetch();
      setIsAdding(false);
      formik.resetForm();
    }
  });

  const updateMutation = trpc.apiKeys.updateApiKey.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setIsAdding(false);
      formik.resetForm();
    }
  });

  const deleteMutation = trpc.apiKeys.deleteApiKey.useMutation({
    onSuccess: () => refetch()
  });

  const setActiveMutation = trpc.apiKeys.setActiveKey.useMutation({
    onSuccess: () => refetch()
  });

  const formik = useFormik({
    initialValues: { provider: '', name: '', key: '' },
    validate: validateWithZod(apiKeySchema),
    onSubmit: (values) => {
      if (editingId) {
        updateMutation.mutate({ id: editingId, ...values });
      } else {
        createMutation.mutate({ ...values, provider: selectedProvider || '' });
      }
    }
  });

  const handleEdit = (k: any) => {
    setEditingId(k.id);
    formik.setValues({ provider: k.provider, name: k.name || '', key: k.key });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    formik.resetForm();
  };

  if (!selectedProvider) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text mb-1">API & Integrations</h1>
          <p className="text-sm text-text-dim">Connect and manage your AI models and third-party services.</p>
        </div>
        <div className="flex flex-col gap-3">
          {AI_PROVIDERS.map((provider) => {
            const isConnected = apiKeys.some((k: any) => k.provider === provider.id);
            return (
              <div
                key={provider.id}
                onClick={() => { setSelectedProvider(provider.id); setIsAdding(true); }}
                className="bg-white border border-border rounded-xl p-4 flex items-center justify-between hover:border-main/50 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-main/5 transition-colors">
                    <Image
                      src={provider.img}
                      alt={provider.name}
                      width={20}
                      height={20}
                    />
                  </div>
                  <h3 className="font-semibold text-text text-sm">{provider.name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-md text-[11px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">
                      Disabled
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-main transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const activeProviderObj = AI_PROVIDERS.find(p => p.id === selectedProvider);
  const providerKeys = apiKeys.filter((k: any) => k.provider === selectedProvider);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => { setSelectedProvider(null); handleCancel(); }}
          className="text-sm text-text-dim hover:text-text font-medium mb-4 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Integrations
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              {activeProviderObj && <activeProviderObj.icon className="w-5 h-5 text-gray-600" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{activeProviderObj?.name} Integration</h1>
              <p className="text-sm text-text-dim">Manage your API keys for {activeProviderObj?.name}</p>
            </div>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Key
            </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-border rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-text mb-4">
            {editingId ? 'Edit API Key' : `Add New ${activeProviderObj?.name} Key`}
          </h3>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Label / Name (Optional)"
                name="name"
                placeholder="e.g. Production Key"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </div>
            <div>
              <Input
                label="API Key"
                name="key"
                type="password"
                placeholder="sk-..."
                value={formik.values.key}
                onChange={formik.handleChange}
                error={formik.touched.key && formik.errors.key ? String(formik.errors.key) : undefined}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button size="sm" type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Save Changes' : 'Add Key'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && providerKeys.length === 0 ? (
        <div className="bg-main-dim/30 rounded-xl border border-border border-dashed p-8 flex flex-col items-center justify-center text-center">
          <Key className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="text-sm font-bold text-text mb-1">No Keys Configured</h3>
          <p className="text-text-dim text-xs max-w-sm mb-4">Add your {activeProviderObj?.name} API key to start using its AI models.</p>
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {!isAdding && providerKeys.map((k: any) => (
            <div key={k.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
              <div>
                <h4 className="font-bold text-text text-sm flex items-center gap-2">
                  {k.name || 'Unnamed Key'}
                  {k.isActive && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] uppercase font-bold tracking-wider ml-2">Active</span>
                  )}
                </h4>
                <p className="text-xs text-text-dim font-mono mt-1">
                  {k.key.substring(0, 4)}••••••••{k.key.substring(k.key.length - 4)}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {!k.isActive && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveMutation.mutate({ id: k.id, provider: k.provider })}
                    disabled={setActiveMutation.isPending}
                    className="mr-2 !py-1 !px-2 text-[11px] h-7"
                  >
                    Set Active
                  </Button>
                )}
                <button
                  onClick={() => handleEdit(k)}
                  className="p-1.5 text-gray-400 hover:text-main hover:bg-main-dim rounded-md transition-colors"
                  title="Edit Key"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this key?')) {
                      deleteMutation.mutate({ id: k.id });
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// --- MAIN SETTINGS TAB WRAPPER ---
export function SettingsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settingQuery = searchParams.get("setting") || "general";

  const handleMenuClick = (id: string) => {
    router.push(`/dashboard/profile?tab=settings&setting=${id}`);
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden w-full p-0">
      {/* Settings Inner Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-border p-4 flex flex-col hidden md:flex shrink-0 border-y-0 rounded-bl-2xl overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-text mb-6 px-4 pt-2">Settings</h2>
        <div className="space-y-1">
          {SETTINGS_MENUS.map((menu) => {
            const isActive = settingQuery === menu.id;
            const Icon = menu.icon;

            return (
              <button
                key={menu.id}
                onClick={() => handleMenuClick(menu.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] ${isActive
                  ? "bg-white text-main shadow-sm border border-gray-100"
                  : "text-text hover:bg-gray-100 hover:text-main"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-main" : "text-text-dim"}`} />
                  <span>{menu.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 bg-white overflow-y-auto custom-scrollbar p-8 rounded-br-2xl relative">
        {settingQuery === "general" && <GeneralSettings />}
        {settingQuery === "organization" && <OrganizationSettings />}
        {settingQuery === "billing" && <BillingSettings />}
        {settingQuery === "team" && <TeamSettings />}
        {settingQuery === "sender" && <SenderSettings />}
        {settingQuery === "api" && <ApiSettings />}
      </div>
    </div>
  );
}
