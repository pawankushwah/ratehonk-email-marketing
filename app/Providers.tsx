"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from './trpc';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SER_BASE_URL) return process.env.NEXT_PUBLIC_SER_BASE_URL;
  if (process.env.NEXT_PUBLIC_SER_DEV_PORT) return `http://localhost:${process.env.NEXT_PUBLIC_SER_DEV_PORT}`;
  return 'http://localhost:5000';
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
