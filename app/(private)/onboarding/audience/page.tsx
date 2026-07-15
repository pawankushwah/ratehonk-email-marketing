"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/button';
import { trpc } from '@/app/trpc';
import { useToast } from '@/app/hooks/useToast';

const contactOptions = [
  "0 - 500",
  "500 - 2,000",
  "2,000 - 10,000",
  "10,000 - 50,000",
  "50,000+"
];

export default function AudienceOnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedRange, setSelectedRange] = useState('');

  // Fetch user session to get businessId
  const { data: sessionData } = trpc.auth.refreshToken.useQuery(undefined, {
    staleTime: Infinity,
    retry: false
  });
  const contactsMutation = trpc.onboarding.saveContacts.useMutation({
    onSuccess: () => {
      router.push('/onboarding/preparing');
    },
    onError: (err) => {
      // Ignore database errors if businessId doesn't exist yet, we still want to show the flow
      addToast(err.message || "Failed to save data. Proceeding anyway for demo.", "error");
      setTimeout(() => router.push('/onboarding/preparing'), 1500);
    }
  });

  const handleNext = () => {
    if (!selectedRange) {
      addToast("Please select a contact range or skip.", "error");
      return;
    }
    const businessId = sessionData?.user?.businessId;
    if (!businessId) {
      addToast("Session expired. Please log in again.", "error");
      return;
    }
    contactsMutation.mutate({ businessId, contactCount: selectedRange });
  };

  return (
    <div className="flex flex-col p-8 sm:p-12 h-full">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          How many email contacts do you have?
        </h1>

        <p className="text-gray-600 mb-8 font-oxygen text-sm leading-relaxed">
          An estimate will do. We'll recommend ways to grow and manage your audience based on your answer.
        </p>

        <div className="space-y-2 mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Select your contact range
          </label>
          <div className="relative">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-main focus:border-main block p-3.5 pr-10 cursor-pointer outline-none transition-all hover:border-gray-400 font-oxygen"
            >
              <option value="" disabled>Choose an option</option>
              {contactOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6">
          <button
            onClick={() => router.push('/onboarding/preparing')}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            I'll do this later
          </button>
          <Button
            onClick={handleNext}
            disabled={contactsMutation.isPending}
            className="w-24 text-sm py-2 px-4"
          >
            {contactsMutation.isPending ? "Saving..." : "Next"}
          </Button>

        </div>
      </div>
    </div>
  );
}
