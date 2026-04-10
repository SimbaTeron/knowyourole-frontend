import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../../_lib/stripe';
import { supabaseAdmin } from '../../_lib/supabase';

export const config = { runtime: 'nodejs' };

// GET /api/stripe/config — public (returns publishable key + enabled state)
export async function GET() {
  return NextResponse.json({
    stripeEnabled: Boolean(STRIPE_SECRET_KEY),
    bypassActive: process.env.VITE_STRIPE_BYPASS === 'true' || !STRIPE_SECRET_KEY,
    message: STRIPE_SECRET_KEY
      ? 'Stripe is configured'
      : 'Stripe not yet configured — set STRIPE_SECRET_KEY in Vercel env vars',
  });
}

// POST /api/stripe/checkout — requires Auth0 (premium purchase)
export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, sessionId } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    const stripe = await getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe unavailable' }, { status: 503 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.PUBLIC_URL || 'https://knowyourole.com'}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL || 'https://knowyourole.com'}/checkout-cancel`,
      metadata: { sessionId: sessionId || '' },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[POST /api/stripe/checkout] Error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}