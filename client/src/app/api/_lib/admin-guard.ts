import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET_HEADER = 'x-admin-secret';

export const adminCorsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': `Content-Type, Authorization, ${ADMIN_SECRET_HEADER}`,
};

function getPresentedAdminSecret(req: NextRequest): string | null {
  const headerSecret = req.headers.get(ADMIN_SECRET_HEADER)?.trim();
  if (headerSecret) return headerSecret;

  const authHeader = req.headers.get('authorization')?.trim();
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice('bearer '.length).trim();
  }

  return null;
}

/**
 * Protects admin/data routes that use service-role privileges.
 *
 * Behavior:
 * - If ADMIN_API_SECRET is set: require x-admin-secret or Bearer token match in every env.
 * - If production and ADMIN_API_SECRET is missing: deny closed.
 * - If non-production and ADMIN_API_SECRET is missing: allow local/dev workflows.
 */
export function requireAdminRequest(req: NextRequest): NextResponse | null {
  const configuredSecret = process.env.ADMIN_API_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (!configuredSecret) {
    if (isProduction) {
      return NextResponse.json(
        { error: 'Admin route is disabled' },
        { status: 403, headers: adminCorsHeaders }
      );
    }

    return null;
  }

  const presentedSecret = getPresentedAdminSecret(req);
  if (presentedSecret !== configuredSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: adminCorsHeaders }
    );
  }

  return null;
}
