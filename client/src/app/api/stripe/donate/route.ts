import { NextRequest } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';
import { cleanQueryValue, getAppOrigin, jsonResponse, noContentResponse } from '@/app/api/_lib/security';

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

export async function OPTIONS() {
  return noContentResponse({
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limit: 5 donation attempts per 10 minutes
  if (!checkRateLimit(clientIP, 5, 600000)) {
    return jsonResponse(
      { error: 'Rate limit exceeded. Maximum 5 donation attempts per 10 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { amount } = body;
    const sessionId = cleanQueryValue(body.sessionId);

    // Validate amount: $1.00 to $500.00, cents integer only.
    if (!amount || amount < 100 || amount > 50000 || !Number.isInteger(amount)) {
      return jsonResponse(
        { error: 'Invalid donation amount. Amount must be between $1.00 and $500.00.' },
        { status: 400 }
      );
    }

    const baseUrl = getAppOrigin(request);
    const successUrl = `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${encodeURIComponent(sessionId)}&donation=true`;
    const cancelUrl = `${baseUrl}/checkout-cancel`;

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
      metadata: {
        quiz_session: sessionId,
        donation: 'true',
      },
    });

    return jsonResponse({ url: checkoutSession.url });
  } catch (error) {
    console.error('Donation checkout error:', error);
    return jsonResponse(
      { error: 'Failed to create donation checkout' },
      { status: 500 }
    );
  }
}
