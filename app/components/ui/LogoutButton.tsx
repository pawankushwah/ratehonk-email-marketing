"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/app/trpc';

export default function LogoutButton() {
  const router = useRouter();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
      router.refresh(); // Force router refresh to re-evaluate middleware state
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
    >
      Save & Logout
    </button>
  );
}
