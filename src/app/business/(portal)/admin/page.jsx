import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminCreditAdjustmentForm from '../../../../components/business/AdminCreditAdjustmentForm';
import BusinessSetupNotice from '../../../../components/business/BusinessSetupNotice';
import { getBusinessSession } from '../../../../lib/supabase/server';

const dateTime = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));

export default async function BusinessAdminPage({ searchParams }) {
  const query = await searchParams;
  const search = typeof query?.q === 'string' ? query.q.trim().slice(0, 100) : '';
  const selectedAccountId = typeof query?.account === 'string' ? query.account : '';
  const { supabase } = await getBusinessSession();

  const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_business_admin');
  if (adminCheckError) {
    return (
      <main>
        <BusinessSetupNotice>
          Apply the business admin migration before using account administration.
        </BusinessSetupNotice>
      </main>
    );
  }
  if (!isAdmin) redirect('/business/dashboard');

  const { data: accounts, error: accountsError } = await supabase.rpc(
    'admin_list_business_accounts',
    { p_search: search || null },
  );
  const selectedAccount = accounts?.find((account) => account.account_id === selectedAccountId);
  const { data: history, error: historyError } = selectedAccount
    ? await supabase.rpc('admin_get_credit_history', { p_account_id: selectedAccount.account_id })
    : { data: null, error: null };

  return (
    <main>
      <div className="business-page-heading">
        <div>
          <span className="business-eyebrow">ADMINISTRATION</span>
          <h1>Business accounts</h1>
          <p>Review account balances and record reasoned credit adjustments.</p>
        </div>
      </div>

      <section className="business-panel">
        <div className="business-panel-heading">
          <div>
            <span className="business-eyebrow">CUSTOMER ACCOUNTS</span>
            <h2>Find an account</h2>
          </div>
          <span className="business-admin-limit">Showing up to 100 matches</span>
        </div>
        <form className="business-admin-search" action="/business/admin" method="get">
          <label htmlFor="business-account-search">Business name or sign-in email</label>
          <div>
            <input
              id="business-account-search"
              type="search"
              name="q"
              maxLength="100"
              defaultValue={search}
              placeholder="Search accounts"
            />
            <button className="business-button business-button-secondary" type="submit">
              Search
            </button>
          </div>
        </form>
        {accountsError ? (
          <p className="business-form-error" role="alert">
            Accounts could not be loaded. Check the admin migration and try again.
          </p>
        ) : accounts?.length ? (
          <div className="business-table-wrap">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Sign-in email</th>
                  <th>Credits</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.account_id}>
                    <td>{account.business_name}</td>
                    <td>{account.email || 'No active user'}</td>
                    <td>{Number(account.credit_balance).toLocaleString('en-US')}</td>
                    <td>
                      <Link
                        className="business-table-action"
                        href={`/business/admin?${new URLSearchParams({
                          ...(search ? { q: search } : {}),
                          account: account.account_id,
                        })}`}
                      >
                        Manage credits
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="business-empty-state">No business accounts match that search.</p>
        )}
      </section>

      {selectedAccount && (
        <section className="business-panel" aria-labelledby="selected-account-title">
          <div className="business-panel-heading">
            <div>
              <span className="business-eyebrow">CREDIT LEDGER</span>
              <h2 id="selected-account-title">{selectedAccount.business_name}</h2>
            </div>
            <div className="business-balance-chip">
              <span>Current balance</span>
              <strong>{Number(selectedAccount.credit_balance).toLocaleString('en-US')}</strong>
            </div>
          </div>
          <AdminCreditAdjustmentForm accountId={selectedAccount.account_id} />
          <div className="business-panel-heading business-history-heading">
            <div>
              <span className="business-eyebrow">ACCOUNT HISTORY</span>
              <h2>Recent ledger entries</h2>
            </div>
          </div>
          {historyError ? (
            <p className="business-form-error" role="alert">
              Credit history could not be loaded.
            </p>
          ) : history?.length ? (
            <div className="business-table-wrap">
              <table className="business-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entry</th>
                    <th>Reason</th>
                    <th>Credits</th>
                    <th>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.entry_id}>
                      <td>{dateTime(entry.created_at)}</td>
                      <td>{entry.entry_type.replaceAll('_', ' ')}</td>
                      <td>{entry.description}</td>
                      <td className={entry.credit_amount > 0 ? 'business-credit-positive' : ''}>
                        {entry.credit_amount > 0 ? '+' : ''}
                        {entry.credit_amount.toLocaleString('en-US')}
                      </td>
                      <td>{entry.admin_email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="business-empty-state">No credits have been recorded for this account.</p>
          )}
        </section>
      )}
    </main>
  );
}
