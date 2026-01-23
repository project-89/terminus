import { NextResponse } from "next/server";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import {
  getCampaign,
  updateCampaign,
  getCampaignStats,
} from "@/app/lib/server/campaignService";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/campaigns/[id]
 * Get full campaign details including phases, objectives, and events
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const campaign = await getCampaign(id);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const stats = await getCampaignStats(id);

    return NextResponse.json({ campaign, stats });
  } catch (error: any) {
    console.error("Admin campaign detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/campaigns/[id]
 * Update campaign details
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      name,
      codename,
      description,
      narrative,
      minTrust,
      maxAgents,
      autoAssign,
      deadline,
      triggers,
      tags,
      metadata,
      status,
    } = body;

    const campaign = await updateCampaign(id, {
      name,
      codename,
      description,
      narrative,
      minTrust,
      maxAgents,
      autoAssign,
      deadline: deadline ? new Date(deadline) : undefined,
      triggers,
      tags,
      metadata,
      status,
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Admin campaign update error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/campaigns/[id]
 * Delete a campaign (only if DRAFT or ARCHIVED)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (!["DRAFT", "ARCHIVED"].includes(campaign.status)) {
      return NextResponse.json(
        { error: "Can only delete DRAFT or ARCHIVED campaigns" },
        { status: 400 }
      );
    }

    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: `Campaign ${id} deleted` });
  } catch (error: any) {
    console.error("Admin campaign delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
