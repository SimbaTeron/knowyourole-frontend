import { NextRequest, NextResponse } from 'next/server';

export const jsonSecurityHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

export function jsonResponse<T>(body: T, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...jsonSecurityHeaders,
      ...(init.headers || {}),
    },
  });
}

export function noContentResponse(init: ResponseInit = {}): NextResponse {
  return new NextResponse(null, {
    status: init.status ?? 204,
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(init.headers || {}),
    },
  });
}

export function getAppOrigin(req: NextRequest): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  const rawOrigin = configuredOrigin || req.nextUrl.origin;
  const origin = new URL(rawOrigin);

  if (origin.protocol !== 'https:' && origin.protocol !== 'http:') {
    throw new Error('Invalid app origin protocol');
  }

  if (isProductionRuntime() && origin.protocol !== 'https:') {
    throw new Error('Production app origin must use https');
  }

  return origin.origin;
}

export function cleanQueryValue(value: unknown, maxLength = 128): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, maxLength);
}

export function assertStripePriceId(value: unknown): string {
  if (typeof value !== 'string' || !/^price_[A-Za-z0-9_]+$/.test(value)) {
    throw new Error('Invalid Stripe price ID');
  }
  return value;
}
