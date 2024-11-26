import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CSP headers
  response.headers.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self';
      connect-src 'self' 
        https://solana-mainnet.g.alchemy.com
        wss://solana-mainnet.g.alchemy.com
        https://*.solana.com
        wss://*.solana.com
        https://api.mainnet-beta.solana.com
        wss://api.mainnet-beta.solana.com
        https://solana-api.projectserum.com
        wss://solana-api.projectserum.com
        https://rpc.ankr.com/solana
        wss://rpc.ankr.com/solana
        https://*.solflare.com
        wss://*.solflare.com;
      frame-src 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim()
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
