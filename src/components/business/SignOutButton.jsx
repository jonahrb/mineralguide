'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.push('/business/login');
    router.refresh();
  }

  return (
    <button className="business-button business-button-quiet" type="button" onClick={signOut}>
      Sign out
    </button>
  );
}
