'use client';

import { useState } from 'react';

export default function BuyCreditsButton({ packageId }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function beginCheckout() {
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/business/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Checkout could not be started.');
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(checkoutError.message || 'Checkout could not be started.');
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="business-button business-button-primary"
        onClick={beginCheckout}
        disabled={pending}
      >
        {pending ? 'Opening checkout…' : 'Buy credits'}
      </button>
      {error && (
        <p className="business-form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
