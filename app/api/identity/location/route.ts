import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, lat, lng, accuracy } = await req.json();
    
    if (!userId || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.playerProfile.upsert({
      where: { userId },
      create: {
        userId,
        location: { lat, lng, accuracy, updatedAt: new Date().toISOString() },
      },
      update: {
        location: { lat, lng, accuracy, updatedAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Location update error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
