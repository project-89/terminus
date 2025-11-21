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
    const rewards = await prisma.reward.findMany({
      where: { userId, type: RewardType.CREDIT },
    });
    
    // In a real ledger, we'd have debits too. 
    // For now, let's assume we track "spent" as negative rewards or a separate table.
    // Actually, let's just sum them. If we want to "spend", we add a negative reward row.
    const balance = rewards.reduce((acc: number, r: Reward) => acc + r.amount, 0);
    return balance;
  }

  async getCatalog(): Promise<RedeemableItem[]> {
    return CATALOG;
  }

  async grant(userId: string, amount: number, reason: string, missionRunId?: string) {
    return await prisma.reward.create({
      data: {
        userId,
        amount,
        type: RewardType.CREDIT,
        metadata: { reason },
        missionRunId
      }
    });
  }

  async redeem(userId: string, itemId: string) {
    const balance = await this.getBalance(userId);
    const item = CATALOG.find(i => i.id === itemId);

    if (!item) throw new Error("Item not found");
    if (balance < item.cost) throw new Error("Insufficient funds");

    // Deduct cost
    await prisma.reward.create({
      data: {
        userId,
        amount: -item.cost, // Negative amount = debit
        type: RewardType.CREDIT,
        metadata: { action: "redeem", itemId, itemName: item.name }
      }
    });

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
