'use client';

import { useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';

export default function useTrackCalculator(toolSlug, hasValidResult) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasValidResult || hasTracked.current) return;
    hasTracked.current = true;
    track('Calculator Used', { tool: toolSlug });
  }, [hasValidResult, toolSlug]);
}
