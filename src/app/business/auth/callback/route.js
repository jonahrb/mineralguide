import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig, hasSupabaseConfig } from '../../../../lib/supabase/env';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  if (!hasSupabaseConfig()) {
    return NextResponse.redirect(new URL('/business/login?error=setup', request.url));
  }
  const code = requestUrl.searchParams.get('code');
  const next = '/business/dashboard';
  if (!code)
    return NextResponse.redirect(new URL('/business/login?error=confirmation', request.url));

  const { url, key } = getSupabaseConfig();
  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL(next, request.url));
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(new URL('/business/login?error=confirmation', request.url));
  return response;
}
