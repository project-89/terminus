import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, path } = body;

    // Here you would typically save the content
    // For now, we'll just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
