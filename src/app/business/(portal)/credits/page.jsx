import BuyCreditsButton from '../../../../components/business/BuyCreditsButton';
import { getBusinessSession } from '../../../../lib/supabase/server';

const formatPrice = (cents, currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
    cents / 100,
  );

export default async function BusinessCreditsPage({ searchParams }) {
  const query = await searchParams;
  const { supabase, account } = await getBusinessSession();
  if (!account) return null;

  const [{ data: balanceRow }, { data: packages }, { data: ledger }] = await Promise.all([
    supabase
      .from('business_credit_balances')
      .select('balance')
      .eq('account_id', account.id)
      .maybeSingle(),
    supabase
      .from('credit_packages')
      .select('id, name, description, credits, amount_cents, currency')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('credit_ledger')
      .select('id, amount, entry_type, description, created_at')
      .eq('account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  const balance = Number(balanceRow?.balance || 0);

  return (
    <main>
      <div className="business-page-heading">
        <div>
          <span className="business-eyebrow">CREDIT ACCOUNT</span>
          <h1>Credits and billing</h1>
          <p>Credits are prepaid and recorded in an account ledger.</p>
        </div>
        <div className="business-balance-chip">
          <span>Balance</span>
          <strong>{balance.toLocaleString('en-US')}</strong>
        </div>
      </div>
      {query?.purchase === 'success' && (
        <div className="business-banner" role="status">
          Checkout returned. Your balance updates after Stripe confirms the payment.
        </div>
      )}
      {query?.purchase === 'cancelled' && (
        <div className="business-banner business-banner-muted" role="status">
          Checkout was cancelled. No credits were purchased.
        </div>
      )}
      <section className="business-panel">
        <div className="business-panel-heading">
          <div>
            <span className="business-eyebrow">PREPAID PACKAGES</span>
            <h2>Choose a credit package</h2>
          </div>
        </div>
        {packages?.length ? (
          <div className="business-package-grid">
            {packages.map((creditPackage) => (
              <article className="business-package-card" key={creditPackage.id}>
                <h3>{creditPackage.name}</h3>
                <p>{creditPackage.description}</p>
                <strong>{creditPackage.credits.toLocaleString('en-US')} credits</strong>
                <span>{formatPrice(creditPackage.amount_cents, creditPackage.currency)}</span>
                <BuyCreditsButton packageId={creditPackage.id} />
              </article>
            ))}
          </div>
        ) : (
          <p className="business-empty-state">
            Credit packages will appear here after Stripe prices are configured for this account.
          </p>
        )}
      </section>
      <section className="business-panel">
        <div className="business-panel-heading">
          <div>
            <span className="business-eyebrow">LEDGER</span>
            <h2>Credit history</h2>
          </div>
        </div>
        {ledger?.length ? (
          <div className="business-table-wrap">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Type</th>
                  <th>Credits</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.description}</td>
                    <td>{entry.entry_type.replaceAll('_', ' ')}</td>
                    <td className={entry.amount > 0 ? 'business-credit-positive' : ''}>
                      {entry.amount > 0 ? '+' : ''}
                      {entry.amount.toLocaleString('en-US')}
                    </td>
                    <td>{new Date(entry.created_at).toLocaleDateString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="business-empty-state">
            Purchases, service charges, and refunds will be listed here.
          </p>
        )}
      </section>
    </main>
  );
}
