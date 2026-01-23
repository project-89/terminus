import { NextRequest, NextResponse } from "next/server";

// Default fallback secret if ADMIN_SECRET is not configured
const DEFAULT_ADMIN_SECRET = "project89";

export async function POST(req: NextRequest) {
  try {
    // Use ADMIN_SECRET as the canonical env var, fall back to default
    const adminSecret = process.env.ADMIN_SECRET || DEFAULT_ADMIN_SECRET;

    const { code } = await req.json();

    if (code === adminSecret) {
      // Return the secret so client can use it for subsequent API calls
      return NextResponse.json({ success: true, secret: adminSecret });
    }

    return NextResponse.json({ success: false, error: "Invalid access code" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
