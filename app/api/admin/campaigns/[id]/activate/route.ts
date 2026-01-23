import { NextResponse } from "next/server";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import {
  activateCampaign,
  pauseCampaign,
  completeCampaign,
} from "@/app/lib/server/campaignService";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/campaigns/[id]/activate
 * Activate, pause, or complete a campaign
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
    const { action } = body;

    let campaign;

    switch (action) {
      case "activate":
        campaign = await activateCampaign(campaignId);
        break;

      case "pause":
        campaign = await pauseCampaign(campaignId);
        break;

      case "complete":
        campaign = await completeCampaign(campaignId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be one of: activate, pause, complete" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: `Campaign ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Admin campaign activate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update campaign status" },
      { status: 500 }
    );
  }
}
