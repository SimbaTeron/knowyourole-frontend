import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://knowyourole.com/api';

export interface AuthUser {
  sub: string;
  email?: string;
}

export interface TokenPayload extends JWTPayload {
  sub: string;
  email?: string;
  aud?: string | string[];
  iss?: string;
}

/**
 * Validate an Auth0 JWT token
 * Returns the decoded payload if valid, null if invalid
 */
export async function validateAuth0Token(token: string): Promise<AuthUser | null> {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
    // Auth not configured - return null (caller should handle)
    console.warn('Auth0 not configured: AUTH0_DOMAIN, AUTH0_CLIENT_ID, or AUTH0_CLIENT_SECRET missing');
    return null;
  }

  try {
    const jwksUrl = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    const tokenPayload = payload as TokenPayload;

    if (!tokenPayload.sub) {
      return null;
    }

    return {
      sub: tokenPayload.sub,
      email: tokenPayload.email,
    };
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}

/**
 * Extract user from a validated token
 * Returns { sub, email } or null if token is invalid/missing
 */
export function getAuthUser(token: string | null): AuthUser | null {
  if (!token) return null;

  try {
    // Decode JWT payload without verification (for getting user info)
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as TokenPayload;

    if (!decoded.sub) return null;

    return {
      sub: decoded.sub,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

/**
 * Middleware wrapper for API routes
 * Returns 401 NextResponse if not authenticated, otherwise calls handler
 *
 * Usage:
 * export const POST = requireAuth(async (req: NextRequest, ctx) => {
 *   const user = ctx.user;
 *   // ... handler logic
 * });
 */
export function requireAuth(
  handler: (req: NextRequest, ctx: { user: AuthUser }) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const user = await validateAuth0Token(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return handler(req, { user });
  };
}

/**
 * Alternative: Create a NextResponse error for unauthorized access
 * Use this in routes that need manual auth checking
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Extract Bearer token from request headers
 */
export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim() || null;
}
