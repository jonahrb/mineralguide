'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './env';

let browserClient;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, key } = getSupabaseConfig();
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}
