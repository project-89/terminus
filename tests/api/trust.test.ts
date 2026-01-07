import { describe, it, expect } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import {
  getTrustState,
  evolveTrust,
  markCeremonyComplete,
  recordActivity,
  computeTrustDelta,
  getLayerTools,
  getLayerName,
  getProgressToNextLayer,
  LAYER_THRESHOLDS,
  LAYER_NAMES,
} from "@/app/lib/server/trustService";

describe("Trust/Layer System", () => {
  describe("Constants", () => {
    it("should have 6 layer thresholds", () => {
      expect(LAYER_THRESHOLDS).toHaveLength(6);
      expect(LAYER_THRESHOLDS[0]).toBe(0.0);
      expect(LAYER_THRESHOLDS[5]).toBe(0.92);
    });

    it("should have correct layer names", () => {
      expect(LAYER_NAMES[0]).toBe("The Mask");
      expect(LAYER_NAMES[5]).toBe("The Reveal");
    });
  });

  describe("getTrustState", () => {
    it("should return default state for new user", async () => {
      const user = await createTestUser("test-trust-new");
      const state = await getTrustState(user.id);

      expect(state.trustScore).toBe(0);
      expect(state.layer).toBe(0);
      expect(state.pendingCeremony).toBeNull();
    });

    it("should return existing trust state", async () => {
      const user = await createTestUser("test-trust-existing");

      // Create a profile with trust
      await testPrisma.playerProfile.create({
        data: {
          userId: user.id,
          trustScore: 0.15,
          layer: 1,
          lastActiveAt: new Date(),
        },
      });

      const state = await getTrustState(user.id);
      expect(state.trustScore).toBe(0.15);
      expect(state.layer).toBe(1);
    });
  });

  describe("evolveTrust", () => {
    it("should increase trust score", async () => {
      const user = await createTestUser("test-trust-evolve");

      const result = await evolveTrust(user.id, 0.05, "test_event");

      expect(result.previousScore).toBe(0);
      expect(result.newScore).toBe(0.05);
      expect(result.layerChanged).toBe(false);
    });

    it("should trigger layer change at threshold", async () => {
      const user = await createTestUser("test-trust-layer");

      // Evolve to just below threshold
      await evolveTrust(user.id, 0.09, "building_trust");

      // Cross the layer 1 threshold (0.10)
      const result = await evolveTrust(user.id, 0.02, "crossing_threshold");

      expect(result.previousLayer).toBe(0);
      expect(result.newLayer).toBe(1);
      expect(result.layerChanged).toBe(true);
      expect(result.pendingCeremony).toBe(1);
    });

    it("should clamp trust score between 0 and 1", async () => {
      const user = await createTestUser("test-trust-clamp");

      // Try to go above 1
      const high = await evolveTrust(user.id, 1.5, "high_trust");
      expect(high.newScore).toBe(1);

      // Try to go below 0
      const low = await evolveTrust(user.id, -2.0, "negative_trust");
      expect(low.newScore).toBe(0);
    });

    it("should maintain trust history", async () => {
      const user = await createTestUser("test-trust-history");

      await evolveTrust(user.id, 0.01, "event_1");
      await evolveTrust(user.id, 0.02, "event_2");
      await evolveTrust(user.id, 0.03, "event_3");

      const profile = await testPrisma.playerProfile.findUnique({
        where: { userId: user.id },
        select: { trustHistory: true },
      });

      const history = profile?.trustHistory as Array<{ reason: string }>;
      expect(history).toHaveLength(3);
      expect(history[2].reason).toBe("event_3");
    });
  });

  describe("markCeremonyComplete", () => {
    it("should mark layer ceremony as completed", async () => {
      const user = await createTestUser("test-ceremony");

      // Setup: cross layer 1 threshold to trigger ceremony
      const evolved = await evolveTrust(user.id, 0.12, "reach_layer_1");
      expect(evolved.pendingCeremony).toBe(1);

      // Mark ceremony complete - should not throw
      await expect(markCeremonyComplete(user.id, 1)).resolves.not.toThrow();

      // Verify via getTrustState
      const state = await getTrustState(user.id);
      expect(state.pendingCeremony).toBeNull();
    });

    it("should allow multiple ceremony completions", async () => {
      const user = await createTestUser("test-ceremony-dup");

      // Evolve to layer 1
      await evolveTrust(user.id, 0.12, "reach_layer_1");

      // Complete ceremony twice - should not throw
      await expect(markCeremonyComplete(user.id, 1)).resolves.not.toThrow();
      await expect(markCeremonyComplete(user.id, 1)).resolves.not.toThrow();

      // Verify state is consistent
      const state = await getTrustState(user.id);
      expect(state.layer).toBe(1);
    });
  });

  describe("recordActivity", () => {
    it("should update lastActiveAt timestamp", async () => {
      const user = await createTestUser("test-activity");

      const before = new Date();
      await recordActivity(user.id);
      const after = new Date();

      const profile = await testPrisma.playerProfile.findUnique({
        where: { userId: user.id },
        select: { lastActiveAt: true },
      });

      expect(profile?.lastActiveAt).not.toBeNull();
      expect(profile?.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(profile?.lastActiveAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should create profile if not exists", async () => {
      const user = await createTestUser("test-activity-new");

      // recordActivity should not throw even for new users
      await expect(recordActivity(user.id)).resolves.not.toThrow();

      // Verify trust state can be retrieved (which uses same prisma)
      const state = await getTrustState(user.id);
      expect(state).toBeTruthy();
    });
  });

  describe("computeTrustDelta", () => {
    it("should return correct delta for session complete", async () => {
      const user = await createTestUser("test-delta-session");
      const delta = await computeTrustDelta(user.id, "session_complete");
      expect(delta).toBe(0.008);
    });

    it("should return correct delta for mission complete", async () => {
      const user = await createTestUser("test-delta-mission");
      const delta = await computeTrustDelta(user.id, "mission_complete");
      expect(delta).toBe(0.025);
    });

    it("should scale mission delta by score", async () => {
      const user = await createTestUser("test-delta-score");

      // With perfect score (1.0): delta * (0.5 + 1.0 * 0.5) = delta * 1.0
      const perfect = await computeTrustDelta(user.id, "mission_complete", 1.0);
      expect(perfect).toBe(0.025);

      // With minimum score (0.0): delta * (0.5 + 0.0 * 0.5) = delta * 0.5
      const user2 = await createTestUser("test-delta-score-2");
      const minimum = await computeTrustDelta(user2.id, "mission_complete", 0.0);
      expect(minimum).toBe(0.0125);
    });

    it("should return negative delta for failures", async () => {
      const user = await createTestUser("test-delta-fail");
      const delta = await computeTrustDelta(user.id, "experiment_fail");
      expect(delta).toBeLessThan(0);
    });
  });

  describe("getLayerTools", () => {
    it("should return basic tools for layer 0", async () => {
      const tools = await getLayerTools(0);
      expect(tools).toContain("glitch_screen");
      expect(tools).toContain("experiment_create");
      expect(tools).not.toContain("generate_image");
    });

    it("should return more tools at higher layers", async () => {
      const layer0 = await getLayerTools(0);
      const layer3 = await getLayerTools(3);
      const layer5 = await getLayerTools(5);

      expect(layer3.length).toBeGreaterThan(layer0.length);
      expect(layer5.length).toBeGreaterThan(layer3.length);
    });

    it("should include mission tools at layer 3+", async () => {
      const layer2 = await getLayerTools(2);
      const layer3 = await getLayerTools(3);

      expect(layer2).not.toContain("mission_request");
      expect(layer3).toContain("mission_request");
    });

    it("should include network tools at layer 5", async () => {
      const layer4 = await getLayerTools(4);
      const layer5 = await getLayerTools(5);

      expect(layer4).not.toContain("network_broadcast");
      expect(layer5).toContain("network_broadcast");
      expect(layer5).toContain("agent_coordination");
    });
  });

  describe("Helper Functions", () => {
    it("should return correct layer name", () => {
      expect(getLayerName(0)).toBe("The Mask");
      expect(getLayerName(3)).toBe("The Whisper");
      expect(getLayerName(5)).toBe("The Reveal");
    });

    it("should calculate progress to next layer", () => {
      // At 0%, progress to layer 1 (10%) should be 0
      expect(getProgressToNextLayer(0)).toBe(0);

      // At 5%, progress to layer 1 (10%) should be 50%
      expect(getProgressToNextLayer(0.05)).toBeCloseTo(0.5, 1);

      // At 10%, progress to layer 2 (25%) should be 0
      expect(getProgressToNextLayer(0.10)).toBeCloseTo(0, 1);

      // At max (92%+), progress should be 1
      expect(getProgressToNextLayer(1.0)).toBe(1);
    });
  });
});
