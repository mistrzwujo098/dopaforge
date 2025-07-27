'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { ObservabilityProvider } from '@/components/observability-provider';
import { Toaster } from '@/components/toaster';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ObservabilityProvider>
        {children}
        <Toaster />
      </ObservabilityProvider>
    </ErrorBoundary>
  );
}