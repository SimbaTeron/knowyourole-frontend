import type { VercelRequest, VercelResponse } from '@vercel/node';

// GET /api/stripe/products
// Returns Stripe products/prices if STRIPE_SECRET_KEY is set, otherwise demo product
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    // No Stripe configured — return a dummy product so the UI can still show prices
    res.status(200).json({
      products: [
        {
          id: 'prod_demo',
          name: 'KnowRole Pro',
          metadata: { tier: 'pro' },
          prices: [{ id: 'price_demo', unit_amount: 999 }],
        },
      ],
    });
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Stripe = (await import('stripe')).default as any;
    const stripe = new Stripe(stripeSecretKey);

    const products = await stripe.products.list({ active: true, limit: 20 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productIds = products.data.map((p: any) => p.id);

    const prices = await stripe.prices.list({
      product: productIds.join(','),
      active: true,
      limit: 20,
    });

    const productsWithPrices = products.data.map((product: any) => ({
      ...product,
      prices: prices.data.filter((price: any) => price.product === product.id),
    }));

    res.status(200).json({ products: productsWithPrices });
  } catch (err: unknown) {
    console.error('Stripe products error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch products';
    res.status(500).json({ error: message });
  }
}
