import { redirect } from 'next/navigation';
import AuthForm from '../../../components/business/AuthForm';
import { hasSupabaseConfig } from '../../../lib/supabase/env';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function BusinessLoginPage() {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect('/business/dashboard');
  }

  return (
    <main className="business-auth-page">
      <div className="business-auth-card">
        <span className="business-eyebrow">WELCOME BACK</span>
        <h1>Sign in to your business account</h1>
        <p>Access your credit balance, service requests, and account history.</p>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
