import { getStripe } from '@/app/api/_lib/stripe';
import { jsonResponse } from '@/app/api/_lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stripe = getStripe();

    // Fetch active products with prices from Stripe.
    const productsResponse = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const products = productsResponse.data.map((product) => {
      const defaultPrice = typeof product.default_price === 'object' && product.default_price
        ? product.default_price
        : null;
      const prices = defaultPrice && defaultPrice.active
        ? [{
            id: defaultPrice.id,
            unit_amount: defaultPrice.unit_amount,
            currency: defaultPrice.currency,
          }]
        : [];

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        active: product.active,
        prices,
      };
    });

    return jsonResponse({ products });
  } catch (error) {
    console.error('Products fetch error:', error);
    return jsonResponse(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
