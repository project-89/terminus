import { describe, it, expect, beforeEach } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import { awardPoints, getRewardAmount, isRewardEnabled, invalidateRewardCache } from "@/app/lib/server/rewardService";

describe("Points/Rewards System", () => {
  beforeEach(() => {
    // Clear the reward cache before each test
    invalidateRewardCache();
  });

  describe("Reward Configuration", () => {
    it("should check if reward is enabled from config", async () => {
      // Create a test reward config
      await testPrisma.rewardConfig.upsert({
        where: { taskType: "MISSION_COMPLETE" },
        update: { enabled: true, pointsAwarded: 100 },
        create: { taskType: "MISSION_COMPLETE", name: "Mission Complete", enabled: true, pointsAwarded: 100, firstTimeBonus: 50 },
      });
      invalidateRewardCache();

      const enabled = await isRewardEnabled("MISSION_COMPLETE");
      expect(enabled).toBe(true);
    });

    it("should return 0 for disabled reward types", async () => {
      await testPrisma.rewardConfig.upsert({
        where: { taskType: "SESSION_COMPLETE" },
        update: { enabled: false },
        create: { taskType: "SESSION_COMPLETE", name: "Session Complete", enabled: false, pointsAwarded: 10, firstTimeBonus: 0 },
      });
      invalidateRewardCache();

      const amount = await getRewardAmount("SESSION_COMPLETE");
      expect(amount).toBe(0);
    });

    it("should return configured points for enabled reward types", async () => {
      await testPrisma.rewardConfig.upsert({
        where: { taskType: "DREAM_SUBMIT" },
        update: { enabled: true, pointsAwarded: 25 },
        create: { taskType: "DREAM_SUBMIT", name: "Dream Submit", enabled: true, pointsAwarded: 25, firstTimeBonus: 10 },
      });
      invalidateRewardCache();

      const amount = await getRewardAmount("DREAM_SUBMIT");
      expect(amount).toBe(25);
    });
  });

  describe("awardPoints", () => {
    it("should award points to a user", async () => {
      const user = await createTestUser("test-points-award");

      // Create reward config
      await testPrisma.rewardConfig.upsert({
        where: { taskType: "PUZZLE_SOLVE" },
        update: { enabled: true, pointsAwarded: 50 },
        create: { taskType: "PUZZLE_SOLVE", name: "Puzzle Solve", enabled: true, pointsAwarded: 50, firstTimeBonus: 0 },
      });
      invalidateRewardCache();

      const result = await awardPoints(user.id, "PUZZLE_SOLVE");

      expect(result).not.toBeNull();
      expect(result?.awarded).toBe(50);
      expect(result?.newTotal).toBe(50);
    });

    it("should apply first-time bonus", async () => {
      const user = await createTestUser("test-points-bonus");

      await testPrisma.rewardConfig.upsert({
        where: { taskType: "DIRECT_REFERRAL" },
        update: { enabled: true, pointsAwarded: 100, firstTimeBonus: 50 },
        create: { taskType: "DIRECT_REFERRAL", name: "Direct Referral", enabled: true, pointsAwarded: 100, firstTimeBonus: 50 },
      });
      invalidateRewardCache();

      const result = await awardPoints(user.id, "DIRECT_REFERRAL", { isFirstTime: true });

      expect(result).not.toBeNull();
      expect(result?.awarded).toBe(150); // 100 + 50 bonus
    });

    it("should apply multiplier to points", async () => {
      const user = await createTestUser("test-points-mult");

      await testPrisma.rewardConfig.upsert({
        where: { taskType: "SECRET_DISCOVER" },
        update: { enabled: true, pointsAwarded: 20 },
        create: { taskType: "SECRET_DISCOVER", name: "Secret Discover", enabled: true, pointsAwarded: 20, firstTimeBonus: 0 },
      });
      invalidateRewardCache();

      const result = await awardPoints(user.id, "SECRET_DISCOVER", { multiplier: 2.5 });

      expect(result).not.toBeNull();
      expect(result?.awarded).toBe(50); // 20 * 2.5
    });

    it("should accumulate points across multiple awards", async () => {
      const user = await createTestUser("test-points-accum");

      await testPrisma.rewardConfig.upsert({
        where: { taskType: "SYNC_REPORT" },
        update: { enabled: true, pointsAwarded: 15 },
        create: { taskType: "SYNC_REPORT", name: "Sync Report", enabled: true, pointsAwarded: 15, firstTimeBonus: 0 },
      });
      invalidateRewardCache();

      await awardPoints(user.id, "SYNC_REPORT");
      await awardPoints(user.id, "SYNC_REPORT");
      const result = await awardPoints(user.id, "SYNC_REPORT");

      expect(result?.newTotal).toBe(45); // 15 * 3
    });

    it("should return null for disabled reward types", async () => {
      const user = await createTestUser("test-points-disabled");

      await testPrisma.rewardConfig.upsert({
        where: { taskType: "FIELD_MISSION_COMPLETE" },
        update: { enabled: false },
        create: { taskType: "FIELD_MISSION_COMPLETE", name: "Field Mission Complete", enabled: false, pointsAwarded: 100, firstTimeBonus: 0 },
      });
      invalidateRewardCache();

      const result = await awardPoints(user.id, "FIELD_MISSION_COMPLETE");
      expect(result).toBeNull();
    });
  });

  describe("Cache Invalidation", () => {
    it("should refresh cache after invalidation", async () => {
      const user = await createTestUser("test-cache-refresh");

      // Initial config
      await testPrisma.rewardConfig.upsert({
        where: { taskType: "KNOWLEDGE_NODE" },
        update: { enabled: true, pointsAwarded: 10 },
        create: { taskType: "KNOWLEDGE_NODE", name: "Knowledge Node", enabled: true, pointsAwarded: 10, firstTimeBonus: 0 },
      });
      invalidateRewardCache();

      // First award
      const first = await awardPoints(user.id, "KNOWLEDGE_NODE");
      expect(first?.awarded).toBe(10);

      // Update config
      await testPrisma.rewardConfig.update({
        where: { taskType: "KNOWLEDGE_NODE" },
        data: { pointsAwarded: 30 },
      });

      // Without invalidation, should still use cached value
      const cached = await awardPoints(user.id, "KNOWLEDGE_NODE");
      expect(cached?.awarded).toBe(10);

      // After invalidation, should use new value
      invalidateRewardCache();
      const refreshed = await awardPoints(user.id, "KNOWLEDGE_NODE");
      expect(refreshed?.awarded).toBe(30);
    });
  });
});
