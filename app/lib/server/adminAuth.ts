import { NextResponse } from "next/server";

// Default fallback secret if ADMIN_SECRET is not configured
const DEFAULT_ADMIN_SECRET = "project89";

export type AdminAuthResult =
  | { authorized: true }
  | { authorized: false; response: NextResponse };

/**
 * Validates admin authentication for API routes.
 *
 * Uses ADMIN_SECRET env var if set, otherwise falls back to default "project89"
 *
 * Usage:
 * ```ts
 * const auth = validateAdminAuth(request);
 * if (!auth.authorized) return auth.response;
 * // ... proceed with handler
 * ```
 */
export function validateAdminAuth(request: Request): AdminAuthResult {
  const adminSecret = request.headers.get("x-admin-secret");
  const expectedSecret = process.env.ADMIN_SECRET || DEFAULT_ADMIN_SECRET;

  if (adminSecret !== expectedSecret) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { authorized: true };
}

/**
 * Simple boolean check for admin auth (for use in conditionals)
 */
export function isAdminAuthorized(request: Request): boolean {
  return validateAdminAuth(request).authorized;
}
