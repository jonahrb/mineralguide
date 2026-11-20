import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin';
import { getStripeClient } from '../../../../../lib/business/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function creditCompletedSession(session) {
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;
  const accountId = session.metadata?.business_account_id;
  const packageId = session.metadata?.credit_package_id;
  if (!accountId || !packageId || session.client_reference_id !== accountId) {
    throw new Error('Checkout session is missing valid business metadata.');
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: creditPackage, error: packageError }, { data: account, error: accountError }] =
    await Promise.all([
      supabase
        .from('credit_packages')
        .select('id, name, credits, amount_cents, currency')
        .eq('id', packageId)
        .single(),
      supabase.from('business_accounts').select('id').eq('id', accountId).single(),
    ]);

  if (packageError || !creditPackage || accountError || !account) {
    throw new Error('The purchased credit package or business account could not be verified.');
  }
  if (
    session.amount_total !== creditPackage.amount_cents ||
    session.currency?.toLowerCase() !== creditPackage.currency.toLowerCase()
  ) {
    throw new Error('The paid amount did not match the configured credit package.');
  }

  const { error: ledgerError } = await supabase.from('credit_ledger').insert({
    account_id: account.id,
    amount: creditPackage.credits,
    entry_type: 'purchase',
    description: `${creditPackage.name} credit package`,
    source_id: `stripe_checkout:${session.id}`,
    amount_cents: session.amount_total,
    currency: session.currency.toLowerCase(),
    stripe_payment_intent_id:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id,
  });
  if (ledgerError && ledgerError.code !== '23505') throw ledgerError;
}

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe webhooks are not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });

  let event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await creditCompletedSession(event.data.object);
    } catch (error) {
      console.error('Credit fulfillment failed:', error.message);
      return NextResponse.json({ error: 'Credit fulfillment failed.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
