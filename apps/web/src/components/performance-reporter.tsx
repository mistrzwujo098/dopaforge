'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { performanceMonitor } from '@/lib/performance';

export function PerformanceReporter() {
  const pathname = usePathname();

  useEffect(() => {
    // Record page load metrics
    const pageName = pathname === '/' ? 'home' : pathname.slice(1).replace(/\//g, '_');
    performanceMonitor.recordPageLoad(pageName);
  }, [pathname]);

  return null;
}