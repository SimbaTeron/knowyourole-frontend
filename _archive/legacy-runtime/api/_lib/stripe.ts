// Stripe placeholders — replace with real keys when available
// Set STRIPE_SECRET_KEY in Vercel env vars

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

interface StripeLib {
  default: typeof Stripe;
}

interface Stripe {
  checkout: {
    sessions: {
      create: (params: any) => Promise<{ url: string; id: string }>;
      retrieve: (id: string) => Promise<any>;
    };
  };
  webhooks: {
    constructEvent: (body: string, sig: string, secret: string) => any;
  };
}

// Lazy load Stripe only when secret key is available
let _stripe: Stripe | null = null;
async function getStripe(): Promise<Stripe | null> {
  if (!STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    const Stripe = (await import('stripe')).default as unknown as Stripe;
    _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' }) as unknown as Stripe;
  }
  return _stripe;
}

export { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET };
export async function getStripeClient(): Promise<Stripe | null> {
  return getStripe();
}