import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { dispatchGlobalToast } from './ToastProvider';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          // Only called when a query completely fails AFTER all retries are exhausted
          onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Unable to load data. Please try again.';
            dispatchGlobalToast({
              type: 'error',
              title: 'Request Failed',
              message,
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes fresh data
            gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
            retry: (failureCount, error: unknown) => {
              // Extract HTTP status if available
              const status = (error as { status?: number })?.status;

              // 1. Never retry on 4xx client errors (400, 401, 403, 404, etc.)
              if (typeof status === 'number' && status >= 400 && status < 500) {
                return false;
              }

              // 2. Only retry on 5xx server errors or network drops (status 0), up to 2 retries
              const isServerOrNetwork = !status || status === 0 || status >= 500;
              if (isServerOrNetwork) {
                return failureCount < 2; // Initial attempt + 2 background retries = 3 total attempts
              }

              return false;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
