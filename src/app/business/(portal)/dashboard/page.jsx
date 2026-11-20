import Link from 'next/link';
import { ArrowRight, ClipboardList, Coins, FileSearch, FlaskConical } from 'lucide-react';
import { getBusinessSession } from '../../../../lib/supabase/server';

export default async function BusinessDashboardPage() {
  const { supabase, account } = await getBusinessSession();
  if (!account) return null;

  const [{ data: balanceRow }, { data: orders }] = await Promise.all([
    supabase
      .from('business_credit_balances')
      .select('balance')
      .eq('account_id', account.id)
      .maybeSingle(),
    supabase
      .from('service_orders')
      .select('id, service_key, status, credits_charged, created_at')
      .eq('account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const balance = Number(balanceRow?.balance || 0);
  return (
    <main>
      <div className="business-page-heading">
        <div>
          <span className="business-eyebrow">ACCOUNT OVERVIEW</span>
          <h1>Business dashboard</h1>
          <p>Manage prepaid credits and keep track of your service requests.</p>
        </div>
        <Link className="business-button business-button-primary" href="/business/credits">
          Add credits
        </Link>
      </div>
      <section className="business-dashboard-grid">
        <article className="business-stat-card business-credit-card">
          <span className="business-stat-icon">
            <Coins size={20} />
          </span>
          <span className="business-stat-label">Available credits</span>
          <strong>{balance.toLocaleString('en-US')}</strong>
          <Link href="/business/credits">
            Manage credits <ArrowRight size={14} />
          </Link>
        </article>
        <article className="business-stat-card">
          <span className="business-stat-icon business-stat-icon-blue">
            <ClipboardList size={20} />
          </span>
          <span className="business-stat-label">Service requests</span>
          <strong>{orders?.length || 0}</strong>
          <Link href="/business/orders">
            View request history <ArrowRight size={14} />
          </Link>
        </article>
      </section>
      <section className="business-panel">
        <div className="business-panel-heading">
          <div>
            <span className="business-eyebrow">SERVICE CATALOG</span>
            <h2>Services for your mineral research</h2>
          </div>
        </div>
        <article className="business-service-card">
          <span className="business-service-icon">
            <FlaskConical size={21} />
          </span>
          <div className="business-service-copy">
            <span className="business-status-pill">Available</span>
            <h3>Credit deduction test</h3>
            <p>Run a sample request to confirm service submission and ledger deductions.</p>
          </div>
          <div className="business-service-card-action">
            <span className="business-service-price">
              1 <small>credit</small>
            </span>
            <Link
              className="business-button business-button-secondary"
              href="/business/services/credit-test"
            >
              Run test <ArrowRight size={14} />
            </Link>
          </div>
        </article>
        <article className="business-service-card">
          <span className="business-service-icon business-service-icon-muted">
            <FileSearch size={21} />
          </span>
          <div className="business-service-copy">
            <span className="business-status-pill">In development</span>
            <h3>Bulk ROFR search</h3>
            <p>
              Submit a spreadsheet of rights of first refusal for transaction research and review.
            </p>
          </div>
          <span className="business-service-cost">Credit pricing to be announced</span>
        </article>
      </section>
      <section className="business-panel">
        <div className="business-panel-heading">
          <div>
            <span className="business-eyebrow">RECENT ACTIVITY</span>
            <h2>Latest service requests</h2>
          </div>
          <Link href="/business/orders">See all</Link>
        </div>
        {orders?.length ? (
          <div className="business-table-wrap">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Credits</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.service_key.replaceAll('-', ' ')}</td>
                    <td>
                      <span className="business-status-pill">
                        {order.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td>{order.credits_charged}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="business-empty-state">
            Service requests will appear here after you submit one.
          </p>
        )}
      </section>
    </main>
  );
}
