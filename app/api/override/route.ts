import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // Check against environment variable
    const validCode = process.env.OVERRIDE_CODE;

    if (!validCode) {
      console.error("OVERRIDE_CODE not set in environment");
      return NextResponse.json({ valid: false }, { status: 500 });
    }

    const isValid = code === validCode;

    return NextResponse.json({ valid: isValid }, { status: 200 });
  } catch (error) {
    console.error("Error validating override code:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
