import Link from 'next/link';
import { redirect } from 'next/navigation';
import BusinessSetupNotice from '../../components/business/BusinessSetupNotice';
import { hasSupabaseConfig } from '../../lib/supabase/env';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Business services',
  description:
    'Manage a Mineral Guide business account, prepaid service credits, and mineral research requests.',
  alternates: { canonical: '/business' },
};

export default async function BusinessLandingPage() {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect('/business/dashboard');
  }

  return (
    <main className="business-public-page">
      <section className="business-hero">
        <span className="business-eyebrow">MINERAL GUIDE FOR BUSINESS</span>
        <h1>Mineral research services, organized around your work.</h1>
        <p>
          Manage service requests, prepaid credits, and completed deliverables in one private
          account.
        </p>
        <div className="business-hero-actions">
          <Link className="business-button business-button-primary" href="/business/signup">
            Create an account
          </Link>
          <Link className="business-button business-button-secondary" href="/business/login">
            Sign in
          </Link>
        </div>
        {!hasSupabaseConfig() && (
          <BusinessSetupNotice>
            Add the Supabase project URL and publishable key to enable account registration.
          </BusinessSetupNotice>
        )}
      </section>
      <section className="business-public-features">
        <article>
          <span>01</span>
          <h2>One business account</h2>
          <p>Account activity, purchased credits, and service history stay together.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Prepaid service credits</h2>
          <p>Credit purchases and service charges appear in an account ledger.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Track each request</h2>
          <p>See request status and access completed deliverables from the portal.</p>
        </article>
      </section>
    </main>
  );
}
