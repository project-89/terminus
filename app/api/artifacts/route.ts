import { NextResponse } from "next/server";
import {
  createArtifact,
  deployArtifact,
  getArtifact,
  getUserArtifacts,
  recordScan,
  getArtifactMap,
  getZoneStats,
  deactivateArtifact,
  generateArtifactQRData,
} from "@/app/lib/server/artifactService";
import { processArtifactReferral } from "@/app/lib/server/referralService";
import type { ArtifactType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  const code = searchParams.get("code");

  try {
    if (action === "map") {
      const north = searchParams.get("north");
      const south = searchParams.get("south");
      const east = searchParams.get("east");
      const west = searchParams.get("west");
      
      const bounds = north && south && east && west
        ? {
            north: parseFloat(north),
            south: parseFloat(south),
            east: parseFloat(east),
            west: parseFloat(west),
          }
        : undefined;

      const artifacts = await getArtifactMap(bounds);
      return NextResponse.json({ artifacts });
    }

    if (action === "zones") {
      const zones = await getZoneStats();
      return NextResponse.json({ zones });
    }

    if (code) {
      const artifact = await getArtifact(code);
      if (!artifact) {
        return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
      }
      return NextResponse.json({ artifact });
    }

    if (userId) {
      const artifacts = await getUserArtifacts(userId);
      return NextResponse.json({ artifacts });
    }

    return NextResponse.json({ error: "Provide userId or code" }, { status: 400 });
  } catch (error: any) {
    console.error("Artifacts GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { userId, type, name, description, payload } = body;
      
      if (!userId || !type) {
        return NextResponse.json(
          { error: "userId and type required" },
          { status: 400 }
        );
      }

      const artifact = await createArtifact({
        userId,
        type: type as ArtifactType,
        name,
        description,
        payload,
      });

      const qrData = await generateArtifactQRData(artifact);

      return NextResponse.json({ 
        artifact,
        qr: qrData,
        message: "Artifact created successfully"
      });
    }

    if (action === "deploy") {
      const { artifactId, userId, location, locationName, zone, imageUrl } = body;
      
      if (!artifactId || !userId || !location) {
        return NextResponse.json(
          { error: "artifactId, userId, and location required" },
          { status: 400 }
        );
      }

      const artifact = await deployArtifact({
        artifactId,
        userId,
        location,
        locationName,
        zone,
        imageUrl,
      });

      return NextResponse.json({ 
        artifact,
        message: "Artifact deployed successfully"
      });
    }

    if (action === "scan") {
      const { code, scannerId, location, userAgent, ipHash } = body;
      
      if (!code) {
        return NextResponse.json({ error: "code required" }, { status: 400 });
      }

      const result = await recordScan(code, scannerId, location, userAgent, ipHash);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      if (scannerId && !result.duplicate) {
        await processArtifactReferral(scannerId, code, location);
      }

      return NextResponse.json(result);
    }

    if (action === "deactivate") {
      const { artifactId, userId } = body;
      
      if (!artifactId || !userId) {
        return NextResponse.json(
          { error: "artifactId and userId required" },
          { status: 400 }
        );
      }

      await deactivateArtifact(artifactId, userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Artifacts POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
