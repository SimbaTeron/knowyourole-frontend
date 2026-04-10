import { NextResponse } from 'next/server';
import { stripePublishableKey } from '@/app/api/_lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(
      { publishableKey: stripePublishableKey },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Stripe config error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe config' },
      { status: 500 }
    );
  }
}
