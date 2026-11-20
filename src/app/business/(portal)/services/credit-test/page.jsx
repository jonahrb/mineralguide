import Link from 'next/link';
import CreditTestService from '../../../../../components/business/CreditTestService';
import { getBusinessSession } from '../../../../../lib/supabase/server';

export default async function CreditTestPage() {
  const { supabase, user, account } = await getBusinessSession();
  if (!account || !user) return null;

  const { data: balanceRow } = await supabase
    .from('business_credit_balances')
    .select('balance')
    .eq('account_id', account.id)
    .maybeSingle();
  const balance = Number(balanceRow?.balance || 0);

  return (
    <main>
      <div className="business-page-heading">
        <div>
          <span className="business-eyebrow">SAMPLE SERVICE</span>
          <h1>Credit deduction test</h1>
          <p>
            Submit a generated sample request to validate the service order and credit ledger flow.
          </p>
        </div>
        <Link className="business-button business-button-secondary" href="/business/dashboard">
          Back to dashboard
        </Link>
      </div>
      <section className="business-panel">
        <div className="business-test-service-summary">
          <div>
            <span className="business-eyebrow">TEST PRICE</span>
            <strong>1 credit</strong>
          </div>
          <div>
            <span className="business-eyebrow">CURRENT BALANCE</span>
            <strong>{balance.toLocaleString('en-US')} credits</strong>
          </div>
        </div>
        <p>
          Running this test creates a service request, deducts one credit, and records the charge in
          your credit history. It does not start any mineral or ROFR research.
        </p>
        <CreditTestService userId={user.id} balance={balance} />
      </section>
    </main>
  );
}
