"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from './trpc';
import { ToastProvider } from './hooks/useToast';
import { redirect } from 'next/navigation';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SER_BASE_URL) return process.env.NEXT_PUBLIC_SER_BASE_URL;
  if (process.env.NEXT_PUBLIC_SER_DEV_PORT) return `http://localhost:${process.env.NEXT_PUBLIC_SER_DEV_PORT}`;
  return 'http://localhost:5000';
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const doRequest = () => fetch(url, { ...options, credentials: 'include', cache: 'no-store' });

  let response = await doRequest();

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = fetch(`${getBaseUrl()}/trpc/auth.refreshToken`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      }).then(res => {
        isRefreshing = false;
        refreshPromise = null;
        return res.ok;
      }).catch(() => {
        isRefreshing = false;
        refreshPromise = null;
        return false;
      });
    }

    if (refreshPromise) {
      const refreshed = await refreshPromise;
      if (refreshed) {
        response = await doRequest();
      } else {
        redirect("/login");
      }
    }
  }

  return response;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          fetch: customFetch,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

