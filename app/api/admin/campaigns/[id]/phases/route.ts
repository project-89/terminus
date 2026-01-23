import { NextResponse } from "next/server";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import { addPhase, updatePhaseStatus } from "@/app/lib/server/campaignService";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/campaigns/[id]/phases
 * List all phases for a campaign
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id: campaignId } = await params;

  try {
    const phases = await prisma.campaignPhase.findMany({
      where: { campaignId },
      orderBy: { order: "asc" },
      include: {
        objectives: {
          include: {
            contributions: {
              include: {
                user: {
                  select: { id: true, handle: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ phases });
  } catch (error: any) {
    console.error("Admin phases list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch phases" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/campaigns/[id]/phases
 * Add a new phase to a campaign
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id: campaignId } = await params;

  try {
    const body = await request.json();
    const { name, description, narrative, order, prerequisites, requireAll } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const phase = await addPhase({
      campaignId,
      name,
      description,
      narrative,
      order,
      prerequisites,
      requireAll,
    });

    return NextResponse.json({ success: true, phase });
  } catch (error: any) {
    console.error("Admin phase create error:", error);
    return NextResponse.json(
      { error: "Failed to create phase" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/campaigns/[id]/phases
 * Update a phase's status (body should include phaseId and status)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  await params; // Consume params

  try {
    const body = await request.json();
    const { phaseId, status } = body;

    if (!phaseId || !status) {
      return NextResponse.json(
        { error: "phaseId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["LOCKED", "AVAILABLE", "ACTIVE", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const phase = await updatePhaseStatus(phaseId, status);

    return NextResponse.json({ success: true, phase });
  } catch (error: any) {
    console.error("Admin phase update error:", error);
    return NextResponse.json(
      { error: "Failed to update phase" },
      { status: 500 }
    );
  }
}
