import React from 'react';
import Image from 'next/image';
import LogoutButton from '@/app/components/ui/LogoutButton';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Image src="/ratehonk.png" alt="RateHonk Logo" width={150} height={50} className="object-contain" />
        </div>
        <LogoutButton />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
