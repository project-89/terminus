import prisma from "@/app/lib/prisma";
import { Reward, RewardType } from "@prisma/client";

export type RedeemableItem = {
  id: string;
  name: string;
  cost: number;
  description: string;
  type: "LORE" | "TOOL" | "ACCESS";
  data: any; // The content or config unlocked
};

const CATALOG: RedeemableItem[] = [
  {
    id: "lore_origin_01",
    name: "File: FOUNDATION",
    cost: 100,
    description: "Recovered data fragment concerning the origins of Oneirocom.",
    type: "LORE",
    data: {
      title: "The Foundation",
      content: "Before the lattice, there was only the static. Oneirocom did not build the signal; they found it buried in the noise of the early internet. Project 89 was not an invention, but an excavation."
    }
  },
  {
    id: "glitch_stabilizer",
    name: "Visual Stabilizer v0.9",
    cost: 250,
    description: "Reduces local reality distortion (glitch intensity).",
    type: "TOOL",
    data: { effect: "reduce_glitch", value: 0.5 }
  },
  {
    id: "clearance_level_1",
    name: "Clearance: INITIATE",
    cost: 500,
    description: "Grant access to Level 1 Operations and restricted archives.",
    type: "ACCESS",
    data: { tier: 1 }
  }
];

export class RewardService {
  
  async getBalance(userId: string): Promise<number> {
    // Use referralPoints as the unified points ledger
    // This is incremented by both client award_points and covert award_points tools
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralPoints: true },
    });
    return user?.referralPoints ?? 0;
  }

  async getCatalog(): Promise<RedeemableItem[]> {
    return CATALOG;
  }

  async grant(userId: string, amount: number, reason: string, missionRunId?: string) {
    // Grant points: create reward record AND increment referralPoints
    const [reward] = await prisma.$transaction([
      prisma.reward.create({
        data: {
          userId,
          amount,
          type: "LOGOS_AWARD",
          metadata: { reason, source: "grant" },
          missionRunId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { referralPoints: { increment: amount } },
      }),
    ]);
    return reward;
  }

  async redeem(userId: string, itemId: string) {
    const balance = await this.getBalance(userId);
    const item = CATALOG.find(i => i.id === itemId);

    if (!item) throw new Error("Item not found");
    if (balance < item.cost) throw new Error("Insufficient funds");

    // Deduct cost from referralPoints and log the redemption
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { referralPoints: { decrement: item.cost } },
      }),
      prisma.reward.create({
        data: {
          userId,
          amount: -item.cost, // Negative for audit trail
          type: "LOGOS_AWARD",
          metadata: { action: "redeem", itemId, itemName: item.name },
        },
      }),
    ]);

    // Apply effect (Logic to actually 'give' the item goes here)
    // For LORE: Return the content.
    // For ACCESS: Update User AccessTier.

    if (item.type === "ACCESS") {
      // Example: Update user access tier
       // await prisma.user.update(...)
    }

    return { success: true, item };
  }
}

export const rewardService = new RewardService();
