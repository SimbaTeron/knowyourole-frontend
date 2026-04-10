import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';

// In-memory rate limiting store (per IP)
// For production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown';
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limit: 5 donation attempts per 10 minutes
  if (!checkRateLimit(clientIP, 5, 600000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 5 donation attempts per 10 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { amount, sessionId } = body;

    // Validate amount: minimum $1.00 (100 cents) and must be integer
    if (!amount || amount < 100 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: 'Invalid donation amount. Minimum $1.00 (100 cents)' },
        { status: 400 }
      );
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const baseUrl = `${protocol}://${host}`;

    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${sessionId || ''}&donation=true`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;

    const stripe = getStripe();
    const donationAmount = (amount / 100).toFixed(2);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `KnowRole Donation - $${donationAmount}`,
              description: 'Thank you for supporting KnowRole development!',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json(
      { url: checkoutSession.url },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Donation checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create donation checkout' },
      { status: 500 }
    );
  }
}
