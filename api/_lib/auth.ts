// Auth0 placeholders — replace with real credentials when available
// Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET in Vercel env vars

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://knowyourole.com/api';

// ─── Validate Auth0 JWT ───────────────────────────────────────────────────────
export async function validateAuth0Token(token: string): Promise<{
  sub: string;
  email?: string;
} | null> {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
    // Placeholder mode: auth not wired yet
    return null;
  }

  try {
    // Fetch JWKS from Auth0
    const jwksUrl = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
    const jwksRes = await fetch(jwksUrl);
    if (!jwksRes.ok) return null;
    const jwks = await jwksRes.json();

    // Decode the JWT header to get the key ID
    const [, header] = token.split('.');
    const { kid } = JSON.parse(atob(header));
    const key = jwks.keys?.find((k: any) => k.kid === kid);
    if (!key) return null;

    // Verify signature using jose library (or jsonwebtoken in Node)
    const { createRemoteJWKSet } = await import('jose');
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));

    const { payload } = await import('jose').jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    return { sub: payload.sub as string, email: payload.email as string | undefined };
  } catch {
    return null;
  }
}

// ─── Middleware wrapper ────────────────────────────────────────────────────────
export function requireAuth(
  handler: (req: Request, ctx: { user: { sub: string } }) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Missing authorization token' }, { status: 401 });
    }
    const user = await validateAuth0Token(token);
    if (!user) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return handler(req, { user });
  };
}