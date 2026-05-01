import { jsonResponse } from '@/app/api/_lib/security';
import { stripePublishableKey } from '@/app/api/_lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return jsonResponse({ publishableKey: stripePublishableKey });
  } catch (error) {
    console.error('Stripe config error:', error);
    return jsonResponse(
      { error: 'Failed to get Stripe config' },
      { status: 500 }
    );
  }
}
