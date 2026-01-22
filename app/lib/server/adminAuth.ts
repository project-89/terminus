import { NextResponse } from "next/server";

export type AdminAuthResult =
  | { authorized: true }
  | { authorized: false; response: NextResponse };

/**
 * Validates admin authentication for API routes.
 *
 * In production: Requires ADMIN_SECRET env var and matching x-admin-secret header
 * In development: Allows requests without auth if ADMIN_SECRET is not set
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
  const expectedSecret = process.env.ADMIN_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  // In production, ADMIN_SECRET must be configured
  if (!isDev && !expectedSecret) {
    console.error("[ADMIN AUTH] ADMIN_SECRET not configured in production");
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 503 }
      ),
    };
  }

  // If ADMIN_SECRET is set, validate it
  if (expectedSecret && adminSecret !== expectedSecret) {
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
