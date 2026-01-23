import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    
    const [fieldMissions, total] = await Promise.all([
      prisma.fieldMission.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      include: {
        user: {
          select: {
            id: true,
            handle: true,
            profile: {
              select: {
                codename: true,
              },
            },
          },
        },
      },
    }),
      prisma.fieldMission.count(),
    ]);

    // Count missions by status - note EVIDENCE_SUBMITTED and UNDER_REVIEW are both "pending review"
    const byStatus = {
      ASSIGNED: fieldMissions.filter((m: any) => m.status === "ASSIGNED").length,
      ACCEPTED: fieldMissions.filter((m: any) => m.status === "ACCEPTED").length,
      IN_PROGRESS: fieldMissions.filter((m: any) => m.status === "IN_PROGRESS").length,
      EVIDENCE_SUBMITTED: fieldMissions.filter((m: any) => m.status === "EVIDENCE_SUBMITTED").length,
      UNDER_REVIEW: fieldMissions.filter((m: any) => m.status === "UNDER_REVIEW").length,
      COMPLETED: fieldMissions.filter((m: any) => m.status === "COMPLETED").length,
      FAILED: fieldMissions.filter((m: any) => m.status === "FAILED").length,
      EXPIRED: fieldMissions.filter((m: any) => m.status === "EXPIRED").length,
    };

    // Add combined pending review count for dashboard convenience
    const pendingReviewCount = byStatus.EVIDENCE_SUBMITTED + byStatus.UNDER_REVIEW;

    const byType: Record<string, number> = {};
    for (const m of fieldMissions) {
      byType[m.type] = (byType[m.type] || 0) + 1;
    }

    return NextResponse.json({
      fieldMissions: fieldMissions.map((m: any) => ({
        id: m.id,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        type: m.type,
        status: m.status,
        title: m.title,
        briefing: m.briefing,
        objectives: m.objectives,
        location: m.location,
        deadline: m.deadline,
        evidence: m.evidence,
        report: m.report,
        evaluation: m.evaluation,
        score: m.score,
        agent: {
          id: m.user.id,
          handle: m.user.handle,
          codename: m.user.profile?.codename,
        },
      })),
      stats: {
        total,
        byStatus,
        byType,
        pendingReview: pendingReviewCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin fieldops error:", error);
    return NextResponse.json({ error: "Failed to fetch field operations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action, id, evaluation, score, status } = body;

    switch (action) {
      case "evaluate": {
        const mission = await prisma.fieldMission.update({
          where: { id },
          data: {
            evaluation,
            score,
            status: score >= 0.6 ? "COMPLETED" : "FAILED",
          },
        });
        return NextResponse.json(mission);
      }

      case "updateStatus": {
        const mission = await prisma.fieldMission.update({
          where: { id },
          data: { status },
        });
        return NextResponse.json(mission);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin fieldops POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
