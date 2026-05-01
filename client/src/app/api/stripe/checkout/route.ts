import { NextRequest } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';
import { assertStripePriceId, cleanQueryValue, getAppOrigin, jsonResponse, noContentResponse } from '@/app/api/_lib/security';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return noContentResponse({
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const priceId = assertStripePriceId(body.priceId);
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : undefined;
    const sessionId = cleanQueryValue(body.sessionId);

    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const product = price.product as Stripe.Product;

    if (!price.active || !product.active) {
      return jsonResponse(
        { error: 'Price is not active' },
        { status: 400 }
      );
    }

    const baseUrl = getAppOrigin(request);
    const successUrl = `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${encodeURIComponent(sessionId)}`;
    const cancelUrl = `${baseUrl}/checkout-cancel`;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(email && { customer_email: email }),
      metadata: {
        quiz_session: sessionId,
        product_id: product.id,
      },
    } as Stripe.Checkout.SessionCreateParams);

    return jsonResponse({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error && error.message.includes('Invalid Stripe price ID')
      ? 'Invalid price ID'
      : 'Failed to create checkout session';
    return jsonResponse(
      { error: message },
      { status: message === 'Invalid price ID' ? 400 : 500 }
    );
  }
}
