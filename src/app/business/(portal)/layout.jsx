import Link from 'next/link';
import { redirect } from 'next/navigation';
import SignOutButton from '../../../components/business/SignOutButton';
import BusinessSetupNotice from '../../../components/business/BusinessSetupNotice';
import { Building2 } from 'lucide-react';
import { getBusinessSession } from '../../../lib/supabase/server';
import { hasSupabaseConfig } from '../../../lib/supabase/env';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function BusinessPortalLayout({ children }) {
  if (!hasSupabaseConfig()) {
    return (
      <main className="business-page-wrap">
        <BusinessSetupNotice>Add the Supabase project URL and publishable key.</BusinessSetupNotice>
      </main>
    );
  }

  const { supabase, user, account, accountError } = await getBusinessSession();
  if (!user) redirect('/business/login');
  if (accountError || !account) {
    return (
      <main className="business-page-wrap">
        <BusinessSetupNotice>
          Apply the business portal database migration so this user can access a business account.
        </BusinessSetupNotice>
      </main>
    );
  }
  const { data: isAdmin } = await supabase.rpc('is_business_admin');

  return (
    <div className="business-page-wrap">
      <div className="business-account-bar">
        <div className="business-account-identity">
          <span className="business-account-icon">
            <Building2 size={17} />
          </span>
          <span className="business-account-copy">
            <strong>{account.business_name}</strong>
            <span>{user.email}</span>
          </span>
        </div>
        <div className="business-account-actions">
          {isAdmin && <Link href="/business/admin">Admin controls</Link>}
          <SignOutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
