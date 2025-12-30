import prisma from "@/app/lib/prisma";
import { customAlphabet } from "nanoid";
import { awardPoints, getRewardAmount } from "./rewardService";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  let code: string;
  let attempts = 0;
  do {
    code = `P89-${generateCode()}`;
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export async function getReferralStats(userId: string) {
  const [user, directReferrals, artifacts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referralPoints: true,
        referrals: {
          select: {
            id: true,
            handle: true,
            createdAt: true,
            profile: { select: { codename: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.user.count({
      where: { referredById: userId },
    }),
    prisma.artifact.findMany({
      where: { userId },
      select: {
        id: true,
        code: true,
        type: true,
        name: true,
        deployed: true,
        scanCount: true,
        recruitsGenerated: true,
        pointsEarned: true,
        zone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalScans = artifacts.reduce((sum: any, a: any) => sum + a.scanCount, 0);
  const totalRecruits = artifacts.reduce((sum: any, a: any) => sum + a.recruitsGenerated, 0);
  const deployedCount = artifacts.filter((a: any) => a.deployed).length;

  const zoneStats = artifacts.reduce((acc: any, a: any) => {
    if (a.zone) {
      acc[a.zone] = (acc[a.zone] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    referralCode: user?.referralCode,
    points: user?.referralPoints || 0,
    directReferrals,
    totalReferrals: directReferrals,
    artifacts: artifacts,
    stats: {
      artifactsCreated: artifacts.length,
      artifactsDeployed: deployedCount,
      totalScans,
      totalRecruits,
      zonesActive: Object.keys(zoneStats).length,
      zoneBreakdown: zoneStats,
    },
  };
}

export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<{ success: boolean; referrerId?: string; error?: string }> {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });

  if (!referrer) {
    return { success: false, error: "Invalid referral code" };
  }

  if (referrer.id === newUserId) {
    return { success: false, error: "Cannot refer yourself" };
  }

  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { referredById: true },
  });

  if (newUser?.referredById) {
    return { success: false, error: "User already has a referrer" };
  }

  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  });

  await awardPoints(referrer.id, "DIRECT_REFERRAL");

  return { success: true, referrerId: referrer.id };
}

export async function processArtifactReferral(
  newUserId: string,
  artifactCode: string,
  scanLocation?: { lat: number; lng: number }
): Promise<{ success: boolean; artifactId?: string; referrerId?: string; error?: string }> {
  const artifact = await prisma.artifact.findUnique({
    where: { code: artifactCode },
    select: { id: true, userId: true, active: true },
  });

  if (!artifact) {
    return { success: false, error: "Invalid artifact code" };
  }

  if (!artifact.active) {
    return { success: false, error: "Artifact is no longer active" };
  }

  if (artifact.userId === newUserId) {
    return { success: false, error: "Cannot use your own artifact" };
  }

  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { referredById: true },
  });

  const isNewRecruit = !newUser?.referredById;
  const scanPoints = await getRewardAmount("ARTIFACT_SCAN");
  const recruitPoints = await getRewardAmount("ARTIFACT_RECRUIT");

  await prisma.artifactScan.create({
    data: {
      artifactId: artifact.id,
      scannerId: newUserId,
      location: scanLocation,
      resultedInSignup: isNewRecruit,
      newUserId: isNewRecruit ? newUserId : undefined,
    },
  });

  await prisma.artifact.update({
    where: { id: artifact.id },
    data: {
      scanCount: { increment: 1 },
      lastScannedAt: new Date(),
      recruitsGenerated: isNewRecruit ? { increment: 1 } : undefined,
      pointsEarned: { increment: isNewRecruit ? recruitPoints : scanPoints },
    },
  });

  if (isNewRecruit) {
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredById: artifact.userId },
    });
    await awardPoints(artifact.userId, "ARTIFACT_RECRUIT");
  } else {
    await awardPoints(artifact.userId, "ARTIFACT_SCAN");
  }

  return { 
    success: true, 
    artifactId: artifact.id, 
    referrerId: !newUser?.referredById ? artifact.userId : undefined 
  };
}

export async function getLeaderboard(limit = 20) {
  const [topRecruiters, topDeployers, topZones] = await Promise.all([
    prisma.user.findMany({
      where: { referralPoints: { gt: 0 } },
      select: {
        id: true,
        handle: true,
        referralPoints: true,
        profile: { select: { codename: true } },
        _count: { select: { referrals: true } },
      },
      orderBy: { referralPoints: "desc" },
      take: limit,
    }),
    prisma.user.findMany({
      where: { artifacts: { some: { deployed: true } } },
      select: {
        id: true,
        handle: true,
        profile: { select: { codename: true } },
        artifacts: {
          where: { deployed: true },
          select: { scanCount: true, recruitsGenerated: true },
        },
      },
      take: limit,
    }),
    prisma.artifact.groupBy({
      by: ["zone"],
      where: { zone: { not: null }, deployed: true },
      _count: { id: true },
      _sum: { scanCount: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    }),
  ]);

  const deployerStats = topDeployers.map((u: any) => ({
    id: u.id,
    handle: u.handle,
    codename: u.profile?.codename,
    artifactsDeployed: u.artifacts.length,
    totalScans: u.artifacts.reduce((sum: any, a: any) => sum + a.scanCount, 0),
    totalRecruits: u.artifacts.reduce((sum: any, a: any) => sum + a.recruitsGenerated, 0),
  })).sort((a: any, b: any) => b.totalScans - a.totalScans);

  return {
    topRecruiters: topRecruiters.map((u: any) => ({
      id: u.id,
      handle: u.handle,
      codename: u.profile?.codename,
      points: u.referralPoints,
      referrals: u._count.referrals,
    })),
    topDeployers: deployerStats,
    topZones: topZones.map((z: any) => ({
      zone: z.zone,
      artifactCount: z._count.id,
      totalScans: z._sum.scanCount || 0,
    })),
  };
}
