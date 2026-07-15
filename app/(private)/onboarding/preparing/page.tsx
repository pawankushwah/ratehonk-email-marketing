"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Settings, Sparkles, UserCheck } from 'lucide-react';
import { trpc } from '@/app/trpc';
import Image from 'next/image';

const steps = [
  { id: 1, text: "Personalizing your setup", icon: UserCheck },
  { id: 2, text: "Optimizing your experience", icon: Settings },
  { id: 3, text: "Generating tips and recommendations", icon: Sparkles }
];

export default function PreparingOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const completeMutation = trpc.onboarding.completeOnboarding.useMutation();
  const { data: sessionData } = trpc.auth.getSession.useQuery();

  useEffect(() => {
    // Simulate loading steps
    const timer1 = setTimeout(() => setActiveStep(1), 1000);
    const timer2 = setTimeout(() => setActiveStep(2), 2500);
    const timer3 = setTimeout(() => setActiveStep(3), 4000);
    
    // Redirect when all steps are done
    const timer4 = setTimeout(() => {
      // Mark complete in backend (fire & forget for demo)
      const businessId = sessionData?.user?.businessId;
      if (businessId) {
        completeMutation.mutate({ businessId });
      }
      
      // Go to dashboard
      router.push('/dashboard');
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-[500px]">
      {/* Left Side - Checkmarks */}
      <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 tracking-tight">
          Preparing your account...
        </h1>
        
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = activeStep > index;
            const isCurrent = activeStep === index;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center justify-between transition-all duration-500 \${
                  isCompleted ? 'text-gray-900' : isCurrent ? 'text-gray-900 animate-pulse' : 'text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <step.icon className={`w-5 h-5 \${isCompleted ? 'text-main' : isCurrent ? 'text-gray-500' : 'text-gray-300'}`} />
                  <span className="font-oxygen text-sm font-medium">{step.text}</span>
                </div>
                {isCompleted && (
                  <Check className="w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-xs text-gray-400 font-oxygen">
          If you are not redirected, click <button onClick={() => router.push('/dashboard')} className="underline hover:text-gray-600">here</button>.
        </div>
      </div>

      {/* Right Side - Graphic */}
      <div className="hidden md:flex flex-1 bg-blue-50/50 relative overflow-hidden items-center justify-center border-l border-gray-100 p-8">
        {/* We use a beautiful generic illustration placeholder that fits the brand aesthetic */}
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-white/40 transform rotate-2 hover:rotate-0 transition-transform duration-700 bg-white p-4">
           {/* Fallback to CSS grid if no image provided */}
           <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-2">
              <div className="bg-gray-100 rounded-lg row-span-2 col-span-1 animate-pulse delay-75"></div>
              <div className="bg-blue-100 rounded-lg row-span-1 col-span-1 animate-pulse delay-150"></div>
              <div className="bg-purple-100 rounded-lg row-span-1 col-span-1 animate-pulse delay-300"></div>
              <div className="bg-green-100 rounded-lg row-span-1 col-span-2 animate-pulse delay-500"></div>
           </div>
           
           {/* Floating badge to mimic the image reference */}
           <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white p-3 rounded-xl shadow-lg border border-gray-100 animate-[bounce_3s_infinite]">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="font-bold text-gray-700 font-serif">A</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-lg font-bold">
                +
              </div>
           </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
}
