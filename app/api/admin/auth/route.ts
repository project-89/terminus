import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const adminCode = process.env.ADMIN_CODE;

    // SECURITY: Require ADMIN_CODE to be set in environment
    if (!adminCode) {
      console.error("[ADMIN AUTH] ADMIN_CODE environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Admin authentication not configured" },
        { status: 503 }
      );
    }

    const { code } = await req.json();

    if (code === adminCode) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid access code" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
