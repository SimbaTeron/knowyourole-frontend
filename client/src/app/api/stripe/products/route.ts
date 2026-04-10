import { NextResponse } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stripe = getStripe();

    // Fetch active products with prices from Stripe
    const productsResponse = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const products = productsResponse.data.map((product) => {
      const prices = 'prices' in product && Array.isArray(product.prices)
        ? product.prices
            .filter((p) => p.active)
            .map((price) => ({
              id: price.id,
              unit_amount: price.unit_amount,
              currency: price.currency,
            }))
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

    return NextResponse.json(
      { products },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
