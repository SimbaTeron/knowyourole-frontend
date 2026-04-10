import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, email, sessionId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const baseUrl = `${protocol}://${host}`;

    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${sessionId || ''}`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;

    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(email && { customer_email: email }),
    } as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json(
      { url: checkoutSession.url },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
