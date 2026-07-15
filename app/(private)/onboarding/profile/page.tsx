"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { trpc } from '@/app/trpc';
import { useToast } from '@/app/hooks/useToast';
import { UserCircle } from 'lucide-react';

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Fetch user session to get userId
  const { data: sessionData, isLoading: isSessionLoading } = trpc.auth.refreshToken.useQuery(undefined, {
    staleTime: Infinity,
    retry: false
  });

  const updateProfileMutation = trpc.onboarding.updateProfile.useMutation({
    onSuccess: () => {
      addToast("Profile saved!", "success");
      router.push('/onboarding/brand');
    },
    onError: (err) => {
      addToast(err.message || "Failed to save profile. Proceeding anyway for demo.", "error");
      setTimeout(() => router.push('/onboarding/brand'), 1500);
    }
  });

  const handleNext = () => {
    if (!firstName || !lastName) {
      addToast("Please enter both your first and last name.", "error");
      return;
    }

    const userId = sessionData?.user?.id || sessionData?.user?.userId;
    if (!userId) {
      addToast("Session expired or user not found. Please log in again.", "error");
      return;
    }

    updateProfileMutation.mutate({
      userId,
      firstName,
      lastName
    });
  };

  return (
    <div className="flex flex-col p-8 sm:p-12 h-full">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full w-fit mb-6 shadow-sm border border-blue-100">
          <UserCircle className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Personal Details</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Welcome to RateHonk</h1>

        <p className="text-gray-600 mb-8 font-oxygen text-sm leading-relaxed">
          Let's start by getting to know you. What is your name?
        </p>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Input
            name="firstName"
            label="First Name"
            placeholder="e.g. Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            name="lastName"
            label="Last Name"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="mt-10 flex items-center justify-end gap-4">
          <button
            onClick={() => router.push('/onboarding/brand')}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Skip
          </button>
          <Button
            onClick={handleNext}
            disabled={updateProfileMutation.isPending || isSessionLoading}
            className="text-sm py-2 px-4 w-1/2"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
