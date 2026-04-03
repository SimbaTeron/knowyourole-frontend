import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/stripe/checkout
// Body: { priceId: string, sessionId?: string, promoCode?: string }
// Promo code 'freefree' bypasses payment and returns a special bypass URL
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { priceId, sessionId, promoCode } = req.body || {};

  // Admin promo code bypass — no payment needed
  if (promoCode === 'freefree') {
    res.status(200).json({ url: '/results?page=3&bypassed=true', bypassed: true });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    // Demo mode: go to page 3 directly (Stripe not configured)
    res.status(200).json({ url: '/results?page=3&demo=true', demo: true });
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Stripe = (await import('stripe')).default as any;
    const stripe = new Stripe(stripeSecretKey);

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:5173`;

    const successUrl = `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout-cancel`;

    const sessionParams: Record<string, unknown> = {
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {},
    };

    if (sessionId) {
      (sessionParams.metadata as Record<string, string>).sessionId = sessionId;
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    res.status(200).json({ url: checkoutSession.url });
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    res.status(500).json({ error: message });
  }
}
