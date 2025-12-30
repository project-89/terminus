import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const adminCode = process.env.ADMIN_CODE || "project89";
    
    if (code === adminCode) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: "Invalid access code" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
