import { getBusinessSession } from '../../../../lib/supabase/server';

export default async function BusinessOrdersPage() {
  const { supabase, account } = await getBusinessSession();
  if (!account) return null;
  const { data: orders } = await supabase
    .from('service_orders')
    .select('id, service_key, status, credits_charged, created_at, updated_at')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false });

  return (
    <main>
      <div className="business-page-heading">
        <div>
          <span className="business-eyebrow">WORK QUEUE</span>
          <h1>Service requests</h1>
          <p>Follow submitted work and review its status.</p>
        </div>
      </div>
      <section className="business-panel">
        {orders?.length ? (
          <div className="business-table-wrap">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Credits charged</th>
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
                    <td>{order.credits_charged.toLocaleString('en-US')}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="business-empty-state">
            <strong>No service requests yet.</strong>
            <p>When a service is available, its submissions and results will be listed here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
