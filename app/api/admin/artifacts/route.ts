import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { verifyArtifact } from "@/app/lib/server/artifactService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [artifacts, zoneStats, recentScans, topDeployers] = await Promise.all([
      prisma.artifact.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              handle: true,
              profile: { select: { codename: true } },
            },
          },
          _count: { select: { scans: true } },
        },
        take: 100,
      }),
      prisma.artifact.groupBy({
        by: ["zone"],
        where: { deployed: true, zone: { not: null } },
        _count: { id: true },
        _sum: { scanCount: true, recruitsGenerated: true },
        orderBy: { _sum: { scanCount: "desc" } },
      }),
      prisma.artifactScan.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          artifact: { select: { code: true, type: true, name: true } },
          scanner: {
            select: {
              handle: true,
              profile: { select: { codename: true } },
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { artifacts: { some: {} } },
        select: {
          id: true,
          handle: true,
          referralPoints: true,
          profile: { select: { codename: true } },
          _count: { select: { artifacts: true, referrals: true } },
          artifacts: {
            select: { scanCount: true, recruitsGenerated: true, deployed: true },
          },
        },
        orderBy: { referralPoints: "desc" },
        take: 20,
      }),
    ]);

    const stats = {
      totalArtifacts: artifacts.length,
      deployedArtifacts: artifacts.filter(a => a.deployed).length,
      verifiedArtifacts: artifacts.filter(a => a.verified).length,
      totalScans: artifacts.reduce((sum, a) => sum + a.scanCount, 0),
      totalRecruits: artifacts.reduce((sum, a) => sum + a.recruitsGenerated, 0),
      activeZones: zoneStats.length,
      byType: artifacts.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      artifacts: artifacts.map(a => ({
        id: a.id,
        code: a.code,
        type: a.type,
        name: a.name,
        deployed: a.deployed,
        deployedAt: a.deployedAt,
        location: a.location,
        locationName: a.locationName,
        zone: a.zone,
        scanCount: a.scanCount,
        recruitsGenerated: a.recruitsGenerated,
        pointsEarned: a.pointsEarned,
        verified: a.verified,
        active: a.active,
        createdAt: a.createdAt,
        agent: {
          id: a.user.id,
          handle: a.user.handle,
          codename: a.user.profile?.codename,
        },
      })),
      zoneStats: zoneStats.map(z => ({
        zone: z.zone,
        artifactCount: z._count.id,
        totalScans: z._sum.scanCount || 0,
        totalRecruits: z._sum.recruitsGenerated || 0,
      })),
      recentScans: recentScans.map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        artifactCode: s.artifact.code,
        artifactType: s.artifact.type,
        artifactName: s.artifact.name,
        scanner: s.scanner
          ? { handle: s.scanner.handle, codename: s.scanner.profile?.codename }
          : null,
        resultedInSignup: s.resultedInSignup,
        location: s.location,
      })),
      topDeployers: topDeployers.map(u => ({
        id: u.id,
        handle: u.handle,
        codename: u.profile?.codename,
        points: u.referralPoints,
        artifactCount: u._count.artifacts,
        referralCount: u._count.referrals,
        deployedCount: u.artifacts.filter(a => a.deployed).length,
        totalScans: u.artifacts.reduce((sum, a) => sum + a.scanCount, 0),
        totalRecruits: u.artifacts.reduce((sum, a) => sum + a.recruitsGenerated, 0),
      })),
      stats,
    });
  } catch (error: any) {
    console.error("Admin artifacts error:", error);
    return NextResponse.json({ error: "Failed to fetch artifacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, artifactId, verified } = body;

    if (action === "verify") {
      await verifyArtifact(artifactId, verified);
      return NextResponse.json({ success: true });
    }

    if (action === "deactivate") {
      await prisma.artifact.update({
        where: { id: artifactId },
        data: { active: false },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin artifacts POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
