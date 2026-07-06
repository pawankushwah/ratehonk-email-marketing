"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import Button from "@/app/components/ui/button";

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

export default function GeneralSettingsPage() {
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

  // Auto-detect system defaults on mount
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const locale = navigator.language || "en-US";
    
    // Naive currency detection based on locale (for demo purposes)
    let defaultCurrency = "USD";
    if (locale === "en-GB") defaultCurrency = "GBP";
    if (locale === "en-IN") defaultCurrency = "INR";
    if (locale.startsWith("fr") || locale.startsWith("de") || locale.startsWith("es")) defaultCurrency = "EUR";

    // Date Format detection based on locale standard
    // e.g., US uses MM/DD/YYYY, most others use DD/MM/YYYY
    const defaultDateFormat = locale === "en-US" ? "MM/DD/YYYY" : "DD/MM/YYYY";
    
    // Time Format detection (12h vs 24h)
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
        
        {/* Timezone */}
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
              className={`w-full max-w-sm h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${
                formik.touched.timezone && formik.errors.timezone ? 'border border-red-500' : ''
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

        {/* Date & Time Format */}
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
                className={`w-full h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${
                  formik.touched.dateFormat && formik.errors.dateFormat ? 'border border-red-500' : ''
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
                className={`w-full h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${
                  formik.touched.timeFormat && formik.errors.timeFormat ? 'border border-red-500' : ''
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

        {/* Currency */}
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
              className={`w-full max-w-sm h-11 px-4 bg-[#e0f4fc] rounded-lg text-sm text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${
                formik.touched.currency && formik.errors.currency ? 'border border-red-500' : ''
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
