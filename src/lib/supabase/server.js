import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './env';

export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The proxy refreshes sessions when Server Components cannot write cookies.
        }
      },
    },
  });
}

export async function getBusinessSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null, account: null };
  const { data: account, error: accountError } = await supabase
    .from('business_accounts')
    .select('id, business_name')
    .eq('user_id', data.user.id)
    .maybeSingle();
  return { supabase, user: data.user, account, accountError };
}
