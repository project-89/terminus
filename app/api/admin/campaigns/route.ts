import { NextResponse } from "next/server";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import {
  createCampaign,
  listCampaigns,
  getCampaignStats,
} from "@/app/lib/server/campaignService";
import { CampaignStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/campaigns
 * List all campaigns with optional status filter
 */
export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as CampaignStatus | null;
  const includeDetails = searchParams.get("details") === "true";

  try {
    const campaigns = await listCampaigns({
      status: status ?? undefined,
      includeDetails,
    });

    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const stats = await getCampaignStats(campaign.id);
          return { ...campaign, stats };
        } catch {
          return { ...campaign, stats: null };
        }
      })
    );

    return NextResponse.json({
      campaigns: campaignsWithStats,
      total: campaigns.length,
    });
  } catch (error: any) {
    console.error("Admin campaigns list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/campaigns
 * Create a new campaign
 */
export async function POST(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

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
    } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const campaign = await createCampaign({
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
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Admin campaign create error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
