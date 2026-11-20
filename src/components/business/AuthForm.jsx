'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { hasSupabaseConfig } from '../../lib/supabase/env';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));

    try {
      const supabase = createSupabaseBrowserClient();
      if (isSignup) {
        const businessName = String(form.get('businessName')).trim();
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { business_name: businessName },
            emailRedirectTo: `${window.location.origin}/business/auth/callback?next=/business/dashboard`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push('/business/dashboard');
          router.refresh();
        } else
          setMessage('Check your email for a confirmation link to finish creating your account.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push('/business/dashboard');
        router.refresh();
      }
    } catch (submitError) {
      setError(submitError.message || 'We could not complete that request. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (!hasSupabaseConfig()) {
    return (
      <div className="business-setup-notice" role="status">
        <strong>Business accounts are not connected yet.</strong>
        <p>
          Set up Supabase and add its public URL and publishable key to the environment to enable
          account access.
        </p>
      </div>
    );
  }

  return (
    <form className="business-auth-form" onSubmit={handleSubmit}>
      {isSignup && (
        <label>
          Business name
          <input name="businessName" required maxLength={160} autoComplete="organization" />
        </label>
      )}
      <label>
        Work email
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
      </label>
      {error && (
        <p className="business-form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="business-form-message" role="status">
          {message}
        </p>
      )}
      <button className="business-button business-button-primary" disabled={pending} type="submit">
        {pending ? 'Please wait…' : isSignup ? 'Create business account' : 'Sign in'}
      </button>
      <p className="business-auth-switch">
        {isSignup ? 'Already have an account?' : 'New to Mineral Guide business services?'}{' '}
        <Link href={isSignup ? '/business/login' : '/business/signup'}>
          {isSignup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
