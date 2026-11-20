import { redirect } from 'next/navigation';
import AuthForm from '../../../components/business/AuthForm';
import { hasSupabaseConfig } from '../../../lib/supabase/env';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function BusinessSignupPage() {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect('/business/dashboard');
  }

  return (
    <main className="business-auth-page">
      <div className="business-auth-card">
        <span className="business-eyebrow">BUSINESS ACCOUNT</span>
        <h1>Create your account</h1>
        <p>Your account is for one business user and keeps its balance and requests private.</p>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
