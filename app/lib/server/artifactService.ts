import prisma from "@/app/lib/prisma";
import { customAlphabet } from "nanoid";
import type { ArtifactType } from "@prisma/client";

const generateArtifactCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

export type CreateArtifactInput = {
  userId: string;
  type: ArtifactType;
  name?: string;
  description?: string;
  payload?: Record<string, any>;
};

export type DeployArtifactInput = {
  artifactId: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
  };
  locationName?: string;
  zone?: string;
  imageUrl?: string;
};

export async function createArtifact(input: CreateArtifactInput) {
  let code: string;
  let attempts = 0;
  
  do {
    code = `P89-${generateArtifactCode()}`;
    const existing = await prisma.artifact.findUnique({
      where: { code },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  const artifact = await prisma.artifact.create({
    data: {
      userId: input.userId,
      code: code!,
      type: input.type,
      name: input.name,
      description: input.description,
      payload: input.payload,
    },
  });

  await prisma.user.update({
    where: { id: input.userId },
    data: { referralPoints: { increment: 10 } },
  });

  return artifact;
}

export async function deployArtifact(input: DeployArtifactInput) {
  const artifact = await prisma.artifact.findUnique({
    where: { id: input.artifactId },
    select: { userId: true, deployed: true },
  });

  if (!artifact) {
    throw new Error("Artifact not found");
  }

  if (artifact.userId !== input.userId) {
    throw new Error("Not authorized to deploy this artifact");
  }

  if (artifact.deployed) {
    throw new Error("Artifact already deployed");
  }

  const zone = input.zone || await inferZone(input.location.lat, input.location.lng);

  const updated = await prisma.artifact.update({
    where: { id: input.artifactId },
    data: {
      deployed: true,
      deployedAt: new Date(),
      location: input.location,
      locationName: input.locationName,
      zone,
      imageUrl: input.imageUrl,
    },
  });

  await prisma.user.update({
    where: { id: input.userId },
    data: { referralPoints: { increment: 25 } },
  });

  return updated;
}

async function inferZone(lat: number, lng: number): Promise<string> {
  const latZone = Math.floor(lat);
  const lngZone = Math.floor(lng);
  return `zone-${latZone}-${lngZone}`;
}

export async function getArtifact(code: string) {
  return prisma.artifact.findUnique({
    where: { code },
    include: {
      user: {
        select: {
          id: true,
          handle: true,
          profile: { select: { codename: true } },
        },
      },
      scans: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          resultedInSignup: true,
        },
      },
    },
  });
}

export async function getUserArtifacts(userId: string) {
  return prisma.artifact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { scans: true } },
    },
  });
}

export async function recordScan(
  artifactCode: string,
  scannerId?: string,
  location?: { lat: number; lng: number },
  userAgent?: string,
  ipHash?: string
) {
  const artifact = await prisma.artifact.findUnique({
    where: { code: artifactCode },
    select: { id: true, userId: true, active: true },
  });

  if (!artifact || !artifact.active) {
    return { success: false, error: "Artifact not found or inactive" };
  }

  const recentScan = scannerId
    ? await prisma.artifactScan.findFirst({
        where: {
          artifactId: artifact.id,
          scannerId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })
    : ipHash
    ? await prisma.artifactScan.findFirst({
        where: {
          artifactId: artifact.id,
          ipHash,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      })
    : null;

  if (recentScan) {
    return { success: true, duplicate: true, artifactId: artifact.id };
  }

  const [scan] = await prisma.$transaction([
    prisma.artifactScan.create({
      data: {
        artifactId: artifact.id,
        scannerId,
        location,
        userAgent,
        ipHash,
      },
    }),
    prisma.artifact.update({
      where: { id: artifact.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
        pointsEarned: { increment: 5 },
      },
    }),
    prisma.user.update({
      where: { id: artifact.userId },
      data: { referralPoints: { increment: 5 } },
    }),
  ]);

  return { success: true, scanId: scan.id, artifactId: artifact.id, creatorId: artifact.userId };
}

export async function getArtifactMap(bounds?: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  const where: any = { deployed: true, active: true };

  const artifacts = await prisma.artifact.findMany({
    where,
    select: {
      id: true,
      code: true,
      type: true,
      name: true,
      location: true,
      locationName: true,
      zone: true,
      scanCount: true,
      deployedAt: true,
      verified: true,
      user: {
        select: {
          handle: true,
          profile: { select: { codename: true } },
        },
      },
    },
  });

  if (bounds) {
    return artifacts.filter(a => {
      const loc = a.location as { lat: number; lng: number } | null;
      if (!loc) return false;
      return (
        loc.lat >= bounds.south &&
        loc.lat <= bounds.north &&
        loc.lng >= bounds.west &&
        loc.lng <= bounds.east
      );
    });
  }

  return artifacts;
}

export async function getZoneStats() {
  const zones = await prisma.artifact.groupBy({
    by: ["zone"],
    where: { deployed: true, zone: { not: null } },
    _count: { id: true },
    _sum: { scanCount: true, recruitsGenerated: true },
  });

  return zones.map(z => ({
    zone: z.zone,
    artifactCount: z._count.id,
    totalScans: z._sum.scanCount || 0,
    totalRecruits: z._sum.recruitsGenerated || 0,
  }));
}

export async function verifyArtifact(artifactId: string, verified: boolean) {
  return prisma.artifact.update({
    where: { id: artifactId },
    data: { verified },
  });
}

export async function deactivateArtifact(artifactId: string, userId: string) {
  const artifact = await prisma.artifact.findUnique({
    where: { id: artifactId },
    select: { userId: true },
  });

  if (!artifact || artifact.userId !== userId) {
    throw new Error("Not authorized");
  }

  return prisma.artifact.update({
    where: { id: artifactId },
    data: { active: false },
  });
}

export async function generateArtifactQRData(artifact: {
  code: string;
  type: string;
  payload?: any;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://project89.org";
  
  return {
    url: `${baseUrl}/a/${artifact.code}`,
    code: artifact.code,
    data: JSON.stringify({
      p89: true,
      c: artifact.code,
      t: artifact.type,
      ...artifact.payload,
    }),
  };
}
