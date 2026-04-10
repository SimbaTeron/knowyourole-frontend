import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json(
      {
        status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Checkout session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checkout session' },
      { status: 500 }
    );
  }
}
