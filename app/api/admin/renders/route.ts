import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

type AdminRenderItem = {
  id: string;
  createdAt: string;
  roomId?: string;
  roomName?: string;
  region?: string;
  quality?: string;
  aspectRatio?: string;
  resolution?: string;
  mode?: string;
  intensity?: number;
  model?: string;
  referencesUsed?: number;
  prompt?: string;
  clueInjected?: boolean;
  sessionId: string;
  userId: string;
  handle: string | null;
  codename: string | null;
};

function extractRenderHistory(state: unknown): any[] {
  if (!state || typeof state !== "object") return [];
  const value = (state as Record<string, unknown>).renderHistory;
  return Array.isArray(value) ? value : [];
}

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const userId = searchParams.get("userId");
  const limitParam = Number(searchParams.get("limit") || "200");
  const limit = Number.isNaN(limitParam) ? 200 : Math.max(1, Math.min(1000, limitParam));

  try {
    const sessions = await prisma.gameSession.findMany({
      where: {
        ...(sessionId ? { id: sessionId } : {}),
        ...(userId ? { userId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        userId: true,
        gameState: true,
        user: {
          select: {
            handle: true,
            profile: { select: { codename: true } },
          },
        },
      },
    });

    const renders: AdminRenderItem[] = [];
    for (const session of sessions) {
      const entries = extractRenderHistory(session.gameState);
      for (const item of entries) {
        if (!item || typeof item !== "object") continue;
        const entry = item as Record<string, any>;
        renders.push({
          id: String(entry.id || `render-${session.id}`),
          createdAt: String(entry.createdAt || new Date().toISOString()),
          roomId: typeof entry.roomId === "string" ? entry.roomId : undefined,
          roomName: typeof entry.roomName === "string" ? entry.roomName : undefined,
          region: typeof entry.region === "string" ? entry.region : undefined,
          quality: typeof entry.quality === "string" ? entry.quality : undefined,
          aspectRatio:
            typeof entry.aspectRatio === "string" ? entry.aspectRatio : undefined,
          resolution:
            typeof entry.resolution === "string" ? entry.resolution : undefined,
          mode: typeof entry.mode === "string" ? entry.mode : undefined,
          intensity:
            typeof entry.intensity === "number" ? entry.intensity : undefined,
          model: typeof entry.model === "string" ? entry.model : undefined,
          referencesUsed:
            typeof entry.referencesUsed === "number" ? entry.referencesUsed : undefined,
          prompt: typeof entry.prompt === "string" ? entry.prompt : undefined,
          clueInjected:
            typeof entry.clueInjected === "boolean" ? entry.clueInjected : undefined,
          sessionId: session.id,
          userId: session.userId,
          handle: session.user.handle,
          codename: session.user.profile?.codename || null,
        });
      }
    }

    renders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      count: Math.min(renders.length, limit),
      renders: renders.slice(0, limit),
    });
  } catch (error) {
    console.error("[admin/renders] failed", error);
    return NextResponse.json({ error: "Failed to load render telemetry" }, { status: 500 });
  }
}
