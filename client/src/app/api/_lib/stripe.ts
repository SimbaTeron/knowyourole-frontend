import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/**
 * Get or create Stripe instance (singleton pattern)
 * Use this in API routes for server-side Stripe operations
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return _stripe;
}

export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
