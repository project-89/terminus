import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/agents/[id]/sessions
 *
 * Paginated sessions endpoint for efficient loading.
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 *   - sessionId: Load full messages for a specific session
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sessionId = searchParams.get("sessionId");

  try {
    // Verify agent exists
    const agent = await prisma.user.findUnique({
      where: { id },
      select: { id: true, handle: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // If requesting a specific session with messages
    if (sessionId) {
      const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!session || session.userId !== id) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({
        session: {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          status: session.status,
          messages: session.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })),
        },
      });
    }

    // Paginated sessions list (without messages for efficiency)
    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.gameSession.count({ where: { userId: id } }),
    ]);

    return NextResponse.json({
      sessions: sessions.map((s: any) => ({
        id: s.id,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        status: s.status,
        messageCount: s._count.messages,
        durationMinutes: Math.round(
          (new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime()) / 60000
        ),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin agent sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
