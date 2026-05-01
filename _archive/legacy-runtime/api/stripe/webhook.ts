import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../../_lib/stripe';
import { supabaseAdmin } from '../../_lib/supabase';

export const config = { runtime: 'nodejs' };

// POST /api/stripe/webhook — Stripe webhook handler
// Called by Stripe on checkout.session.completed, customer.subscription.deleted, etc.
export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const stripe = await getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe unavailable' }, { status: 503 });
    }

    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const body = await req.text();

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('[POST /api/stripe/webhook] Signature error:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.customer_details?.email;
        if (userId) {
          await supabaseAdmin
            .from('users')
            .upsert({ id: userId, is_premium: true, premium_purchased_at: new Date().toISOString() });
          console.log(`[Stripe Webhook] Premium activated for user: ${userId}`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await supabaseAdmin
            .from('users')
            .update({ is_premium: false })
            .eq('id', userId);
          console.log(`[Stripe Webhook] Premium deactivated for user: ${userId}`);
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[POST /api/stripe/webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}