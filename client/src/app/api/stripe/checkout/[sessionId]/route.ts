import { NextRequest } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';
import { jsonResponse } from '@/app/api/_lib/security';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return jsonResponse(
        { error: 'Invalid checkout session ID' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return jsonResponse({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
    });
  } catch (error) {
    console.error('Checkout session fetch error:', error);
    return jsonResponse(
      { error: 'Failed to fetch checkout session' },
      { status: 500 }
    );
  }
}
