import prisma from "@/app/lib/prisma";
import type { RewardTaskType } from "@prisma/client";

const rewardCache = new Map<RewardTaskType, { points: number; bonus: number; enabled: boolean }>();
let cacheExpiry = 0;

async function getRewardConfig(taskType: RewardTaskType) {
  if (Date.now() > cacheExpiry) {
    rewardCache.clear();
    const configs = await prisma.rewardConfig.findMany();
    for (const c of configs) {
      rewardCache.set(c.taskType, {
        points: c.pointsAwarded,
        bonus: c.firstTimeBonus,
        enabled: c.enabled,
      });
    }
    cacheExpiry = Date.now() + 60000;
  }
  return rewardCache.get(taskType);
}

export async function awardPoints(
  userId: string,
  taskType: RewardTaskType,
  options?: { isFirstTime?: boolean; multiplier?: number }
): Promise<{ awarded: number; newTotal: number } | null> {
  const config = await getRewardConfig(taskType);
  
  if (!config || !config.enabled) {
    return null;
  }

  let points = config.points;
  
  if (options?.isFirstTime && config.bonus > 0) {
    points += config.bonus;
  }
  
  if (options?.multiplier) {
    points = Math.floor(points * options.multiplier);
  }

  if (points <= 0) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { referralPoints: { increment: points } },
    select: { referralPoints: true },
  });

  return { awarded: points, newTotal: user.referralPoints };
}

export async function getRewardAmount(taskType: RewardTaskType): Promise<number> {
  const config = await getRewardConfig(taskType);
  return config?.enabled ? config.points : 0;
}

export async function isRewardEnabled(taskType: RewardTaskType): Promise<boolean> {
  const config = await getRewardConfig(taskType);
  return config?.enabled ?? false;
}

export function invalidateRewardCache() {
  cacheExpiry = 0;
  rewardCache.clear();
}
