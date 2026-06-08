'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackVisit } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // 拼接完整的路径（包含 query params）以便更精确分析
    const queryStr = searchParams.toString();
    const fullPath = queryStr ? `${pathname}?${queryStr}` : pathname;

    // 避免因为 React 严格模式（Strict Mode）双重挂载导致的重复上报
    if (lastTracked.current === fullPath) return;
    lastTracked.current = fullPath;

    trackVisit(fullPath);
  }, [pathname, searchParams]);

  return null;
}
