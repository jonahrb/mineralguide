'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';

export default function CreditTestService({ userId, balance }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function runTest() {
    setPending(true);
    setMessage('');
    setIsError(false);

    const supabase = createSupabaseBrowserClient();
    const filePath = `${userId}/submissions/credit-test-${crypto.randomUUID()}.csv`;
    const sample = new Blob(['test,created_at\ncredit deduction check,'], { type: 'text/csv' });

    const { error: uploadError } = await supabase.storage
      .from('business-service-files')
      .upload(filePath, sample, { contentType: 'text/csv', upsert: false });

    if (uploadError) {
      setIsError(true);
      setMessage(`Could not prepare the test request: ${uploadError.message}`);
      setPending(false);
      return;
    }

    const { data: orderId, error: orderError } = await supabase.rpc('submit_service_order', {
      p_service_key: 'credit-test',
      p_submission_file_path: filePath,
    });

    if (orderError) {
      await supabase.storage.from('business-service-files').remove([filePath]);
      setIsError(true);
      setMessage(
        orderError.message.includes('Not enough credits')
          ? 'This account needs at least 1 credit to run the test.'
          : `The test request could not be submitted: ${orderError.message}`,
      );
      setPending(false);
      return;
    }

    setMessage(`Success. Request ${orderId} was created and 1 credit was charged.`);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="business-test-service-action">
      <button
        className="business-button business-button-primary"
        type="button"
        onClick={runTest}
        disabled={pending || balance < 1}
      >
        {pending ? 'Running test…' : 'Run 1-credit test'}
      </button>
      {balance < 1 && <p className="business-form-hint">Add at least 1 credit to run this test.</p>}
      {message && (
        <p className={isError ? 'business-form-error' : 'business-form-message'} role="status">
          {message}
        </p>
      )}
    </div>
  );
}
