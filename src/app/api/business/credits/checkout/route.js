import { NextResponse } from 'next/server';
import { getSiteUrl } from '../../../../../lib/site';
import { getStripeClient } from '../../../../../lib/business/stripe';
import { hasSupabaseConfig } from '../../../../../lib/supabase/env';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!hasSupabaseConfig() || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Credit purchases are not configured yet.' },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Please sign in to purchase credits.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Choose a valid credit package.' }, { status: 400 });
  }
  if (typeof body.packageId !== 'string') {
    return NextResponse.json({ error: 'Choose a valid credit package.' }, { status: 400 });
  }

  const [{ data: account, error: accountError }, { data: creditPackage, error: packageError }] =
    await Promise.all([
      supabase.from('business_accounts').select('id').eq('user_id', authData.user.id).single(),
      supabase
        .from('credit_packages')
        .select('id, name, credits, amount_cents, currency, stripe_price_id')
        .eq('id', body.packageId)
        .eq('is_active', true)
        .single(),
    ]);

  if (accountError || !account) {
    return NextResponse.json(
      { error: 'Your business account could not be found.' },
      { status: 404 },
    );
  }
  if (packageError || !creditPackage) {
    return NextResponse.json({ error: 'That credit package is not available.' }, { status: 404 });
  }

  try {
    const stripe = getStripeClient();
    const stripePrice = await stripe.prices.retrieve(creditPackage.stripe_price_id);
    if (
      !stripePrice.active ||
      stripePrice.type !== 'one_time' ||
      stripePrice.unit_amount !== creditPackage.amount_cents ||
      stripePrice.currency.toLowerCase() !== creditPackage.currency.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'This credit package is not configured to match its Stripe price.' },
        { status: 409 },
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: creditPackage.stripe_price_id, quantity: 1 }],
      client_reference_id: account.id,
      metadata: {
        business_account_id: account.id,
        credit_package_id: creditPackage.id,
      },
      success_url: `${getSiteUrl()}/business/credits?purchase=success`,
      cancel_url: `${getSiteUrl()}/business/credits?purchase=cancelled`,
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL.');
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Credit checkout creation failed:', error.message);
    return NextResponse.json(
      { error: 'We could not start checkout. Please try again.' },
      { status: 502 },
    );
  }
}
