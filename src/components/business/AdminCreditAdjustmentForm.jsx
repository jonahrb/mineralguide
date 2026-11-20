'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';

export default function AdminCreditAdjustmentForm({ accountId }) {
  const router = useRouter();
  const [action, setAction] = useState('grant');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submitAdjustment(event) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 1 || parsedAmount > 1000000) {
      setError('Enter a whole number from 1 to 1,000,000.');
      return;
    }
    if (reason.trim().length < 3) {
      setError('Add a reason so the credit ledger has a clear audit note.');
      return;
    }

    const adjustmentRequestId = requestId || crypto.randomUUID();
    setRequestId(adjustmentRequestId);
    setPending(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: adjustmentError } = await supabase.rpc('admin_adjust_credits', {
        p_account_id: accountId,
        p_amount: action === 'grant' ? parsedAmount : -parsedAmount,
        p_reason: reason.trim(),
        p_request_id: adjustmentRequestId,
      });
      if (adjustmentError) throw adjustmentError;

      setSuccess(
        `${action === 'grant' ? 'Granted' : 'Removed'} ${parsedAmount.toLocaleString('en-US')} credits.`,
      );
      setAmount('');
      setReason('');
      setRequestId(null);
      router.refresh();
    } catch (adjustmentError) {
      setError(adjustmentError.message || 'The credit adjustment could not be saved.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="business-adjustment-form" onSubmit={submitAdjustment}>
      <label>
        Adjustment
        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setRequestId(null);
          }}
        >
          <option value="grant">Add credits</option>
          <option value="remove">Remove credits</option>
        </select>
      </label>
      <label>
        Credits
        <input
          type="number"
          min="1"
          max="1000000"
          step="1"
          required
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setRequestId(null);
          }}
        />
      </label>
      <label className="business-adjustment-reason">
        Reason for adjustment
        <input
          type="text"
          minLength="3"
          maxLength="500"
          required
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setRequestId(null);
          }}
          placeholder="For example: introductory account credit"
        />
      </label>
      {error && (
        <p className="business-form-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="business-form-message" role="status">
          {success}
        </p>
      )}
      <button className="business-button business-button-primary" type="submit" disabled={pending}>
        {pending ? 'Saving adjustment…' : action === 'grant' ? 'Grant credits' : 'Remove credits'}
      </button>
    </form>
  );
}
