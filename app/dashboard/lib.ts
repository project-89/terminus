// Dashboard utility functions - separate file to avoid Next.js page export restrictions

const ADMIN_SECRET_KEY = "p89_admin_secret";

// Helper to get stored admin secret for API calls
export function getAdminSecret(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_SECRET_KEY);
}

// Helper for authenticated admin fetch
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const secret = getAdminSecret();
  const headers = new Headers(options.headers);
  if (secret) {
    headers.set("x-admin-secret", secret);
  }
  return fetch(url, { ...options, headers });
}
