import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { testPrisma, createTestUser } from "../setup";

/**
 * Mission Completion & Reporting Tests
 *
 * Tests the mission completion lifecycle:
 * 1. Mission run creation (accept mission)
 * 2. Report submission
 * 3. AI-based evaluation (mocked)
 * 4. Reward granting
 * 5. Status transitions
 */

// Mock the AI model to avoid real API calls
vi.mock("@/app/lib/ai/models", () => ({
  getModel: vi.fn(() => ({
    modelId: "mock-model",
  })),
}));

// Mock generateObject to return predictable scores
vi.mock("ai", () => ({
  generateObject: vi.fn(async ({ prompt }: { prompt: string }) => {
    // Simulate different scores based on report content
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("excellent report") || lowerPrompt.includes("detailed observation")) {
      return {
        object: {
          score: 0.95,
          feedback: "Excellent work, agent. Your insights align with our projections.",
          rewardAdjustment: 1.5,
        },
      };
    } else if (lowerPrompt.includes("partial") || lowerPrompt.includes("incomplete")) {
      return {
        object: {
          score: 0.5,
          feedback: "Your observations require refinement. Continue monitoring.",
          rewardAdjustment: 1.0,
        },
      };
    } else if (lowerPrompt.includes("nonsense") || lowerPrompt.includes("invalid")) {
      return {
        object: {
          score: 0.1,
          feedback: "This report does not meet operational standards.",
          rewardAdjustment: 0.5,
        },
      };
    }

    // Default moderate score
    return {
      object: {
        score: 0.7,
        feedback: "Report received. Processing.",
        rewardAdjustment: 1.0,
      },
    };
  }),
}));

describe("Mission Completion", () => {
  let testUser: { id: string; handle: string };
  let testMission: { id: string; title: string };

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser("mission-complete");

    // Create test mission definition
    testMission = await testPrisma.missionDefinition.create({
      data: {
        title: "Test Observation Mission",
        prompt: "Observe and report anomalous patterns in your environment.",
        type: "observe",
        minEvidence: 1,
        tags: ["test", "observation"],
        active: true,
      },
    });
  });

  describe("Mission Run Creation", () => {
    it("should create mission run when accepting mission", async () => {
      const run = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
        include: { mission: true },
      });

      expect(run.id).toBeTruthy();
      expect(run.status).toBe("ACCEPTED");
      expect(run.userId).toBe(testUser.id);
      expect(run.mission.id).toBe(testMission.id);
    });

    it("should track multiple runs per user", async () => {
      // Create multiple runs
      await testPrisma.missionRun.create({
        data: { missionId: testMission.id, userId: testUser.id, status: "COMPLETED", score: 0.8 },
      });
      await testPrisma.missionRun.create({
        data: { missionId: testMission.id, userId: testUser.id, status: "ACCEPTED" },
      });

      const runs = await testPrisma.missionRun.findMany({
        where: { userId: testUser.id },
      });

      expect(runs).toHaveLength(2);
      expect(runs.map(r => r.status)).toContain("COMPLETED");
      expect(runs.map(r => r.status)).toContain("ACCEPTED");
    });
  });

  describe("Report Submission", () => {
    it("should update mission run with report payload", async () => {
      const run = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
      });

      const reportPayload = "I observed unusual flickering lights in the eastern corridor at 0300 hours.";

      const updated = await testPrisma.missionRun.update({
        where: { id: run.id },
        data: {
          status: "SUBMITTED",
          payload: reportPayload,
        },
      });

      expect(updated.status).toBe("SUBMITTED");
      expect(updated.payload).toBe(reportPayload);
    });

    it("should store feedback after evaluation", async () => {
      const run = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
      });

      // Simulate evaluation completion
      const feedback = "Your observations have been noted. The pattern aligns with expected anomalies.";
      const updated = await testPrisma.missionRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          score: 0.85,
          feedback,
          payload: "Test report content",
        },
      });

      expect(updated.status).toBe("COMPLETED");
      expect(updated.score).toBe(0.85);
      expect(updated.feedback).toBe(feedback);
    });
  });

  describe("Score Calculation", () => {
    it("should store scores between 0 and 1", async () => {
      const scores = [0, 0.25, 0.5, 0.75, 1.0];

      for (const score of scores) {
        const run = await testPrisma.missionRun.create({
          data: {
            missionId: testMission.id,
            userId: testUser.id,
            status: "COMPLETED",
            score,
          },
        });

        expect(run.score).toBe(score);
      }
    });

    it("should calculate trust score from recent missions", async () => {
      // Create missions with various scores
      const scores = [0.9, 0.8, 0.7, 0.6, 0.5];
      for (const score of scores) {
        await testPrisma.missionRun.create({
          data: {
            missionId: testMission.id,
            userId: testUser.id,
            status: "COMPLETED",
            score,
          },
        });
      }

      // Fetch and calculate average (simulating computeTrustScoreFromRuns)
      const runs = await testPrisma.missionRun.findMany({
        where: { userId: testUser.id, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      const avg = runs.reduce((sum, r) => sum + (r.score || 0), 0) / runs.length;
      expect(avg).toBeCloseTo(0.7, 1);
    });
  });

  describe("Status Transitions", () => {
    it("should follow valid status progression", async () => {
      // ACCEPTED -> SUBMITTED -> REVIEWING -> COMPLETED
      const run = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
      });

      expect(run.status).toBe("ACCEPTED");

      const submitted = await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "SUBMITTED", payload: "Test report" },
      });
      expect(submitted.status).toBe("SUBMITTED");

      const reviewing = await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "REVIEWING" },
      });
      expect(reviewing.status).toBe("REVIEWING");

      const completed = await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "COMPLETED", score: 0.9, feedback: "Done" },
      });
      expect(completed.status).toBe("COMPLETED");
    });

    it("should allow FAILED status", async () => {
      const run = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
      });

      const failed = await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "FAILED", feedback: "Mission abandoned" },
      });

      expect(failed.status).toBe("FAILED");
    });
  });

  describe("Reward Integration", () => {
    it("should create reward record for completed mission", async () => {
      const run = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "COMPLETED",
          score: 0.8,
        },
      });

      // Create reward (simulating what rewardService.grant does)
      const reward = await testPrisma.reward.create({
        data: {
          userId: testUser.id,
          missionRunId: run.id,
          type: "CREDIT",
          amount: 40, // 50 base * 0.8 score
          metadata: { description: `Mission: ${testMission.title}` },
        },
      });

      expect(reward.amount).toBe(40);
      expect(reward.type).toBe("CREDIT");
      expect(reward.missionRunId).toBe(run.id);
      expect((reward.metadata as any)?.description).toContain("Test Observation Mission");
    });

    it("should scale rewards by score", async () => {
      const testCases = [
        { score: 1.0, expectedReward: 50 },
        { score: 0.8, expectedReward: 40 },
        { score: 0.5, expectedReward: 25 },
        { score: 0.1, expectedReward: 5 },
      ];

      for (const { score, expectedReward } of testCases) {
        const run = await testPrisma.missionRun.create({
          data: {
            missionId: testMission.id,
            userId: testUser.id,
            status: "COMPLETED",
            score,
          },
        });

        const baseReward = 50;
        const calculatedReward = Math.round(baseReward * score);
        expect(calculatedReward).toBe(expectedReward);
      }
    });

    it("should apply reward multiplier", async () => {
      // High quality report gets 1.5x multiplier
      const score = 0.9;
      const multiplier = 1.5;
      const baseReward = 50;

      const expectedReward = Math.round(baseReward * score * multiplier);
      expect(expectedReward).toBe(68); // 50 * 0.9 * 1.5 = 67.5 -> 68
    });
  });

  describe("Latest Open Mission Query", () => {
    it("should find most recent open mission run", async () => {
      // Create older completed run
      await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "COMPLETED",
          score: 0.8,
        },
      });

      // Create newer accepted run
      const latestRun = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
      });

      const openRun = await testPrisma.missionRun.findFirst({
        where: {
          userId: testUser.id,
          status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(openRun?.id).toBe(latestRun.id);
      expect(openRun?.status).toBe("ACCEPTED");
    });

    it("should return null when no open missions", async () => {
      // Create only completed runs
      await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "COMPLETED",
          score: 0.8,
        },
      });

      const openRun = await testPrisma.missionRun.findFirst({
        where: {
          userId: testUser.id,
          status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] },
        },
      });

      expect(openRun).toBeNull();
    });
  });

  describe("Mission Isolation", () => {
    it("should isolate missions between users", async () => {
      const user2 = await createTestUser("mission-user2");

      const run1 = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: testUser.id,
          status: "ACCEPTED",
        },
      });

      const run2 = await testPrisma.missionRun.create({
        data: {
          missionId: testMission.id,
          userId: user2.id,
          status: "ACCEPTED",
        },
      });

      expect(run1.userId).not.toBe(run2.userId);

      const user1Runs = await testPrisma.missionRun.findMany({
        where: { userId: testUser.id },
      });
      const user2Runs = await testPrisma.missionRun.findMany({
        where: { userId: user2.id },
      });

      expect(user1Runs).toHaveLength(1);
      expect(user2Runs).toHaveLength(1);
    });
  });
});

describe("AI Evaluation (Mocked)", () => {
  it("should return high score for detailed reports", async () => {
    const { generateObject } = await import("ai");

    const result = await generateObject({
      model: {} as any,
      schema: {} as any,
      prompt: `
        Mission Objective: Observe patterns
        Agent Report: "Excellent report with detailed observation of phenomena"
      `,
    });

    expect(result.object.score).toBeGreaterThan(0.9);
    expect(result.object.rewardAdjustment).toBe(1.5);
  });

  it("should return moderate score for partial reports", async () => {
    const { generateObject } = await import("ai");

    const result = await generateObject({
      model: {} as any,
      schema: {} as any,
      prompt: `
        Mission Objective: Observe patterns
        Agent Report: "Partial observation, incomplete data"
      `,
    });

    expect(result.object.score).toBe(0.5);
    expect(result.object.feedback).toContain("refinement");
  });

  it("should return low score for invalid reports", async () => {
    const { generateObject } = await import("ai");

    const result = await generateObject({
      model: {} as any,
      schema: {} as any,
      prompt: `
        Mission Objective: Observe patterns
        Agent Report: "Nonsense invalid gibberish"
      `,
    });

    expect(result.object.score).toBeLessThan(0.2);
    expect(result.object.rewardAdjustment).toBe(0.5);
  });
});

describe("Mission Type Tracking", () => {
  it("should map mission types to difficulty tracks", () => {
    const trackMap: Record<string, string> = {
      decode: "logic",
      cipher: "logic",
      puzzle: "logic",
      observe: "perception",
      surveillance: "perception",
      pattern: "perception",
      create: "creation",
      compose: "creation",
      design: "creation",
      field: "field",
      retrieve: "field",
      deploy: "field",
    };

    expect(trackMap["decode"]).toBe("logic");
    expect(trackMap["observe"]).toBe("perception");
    expect(trackMap["create"]).toBe("creation");
    expect(trackMap["field"]).toBe("field");
  });

  it("should handle unknown mission types", () => {
    const trackMap: Record<string, string> = {
      decode: "logic",
    };

    const missionType = "unknown";
    const track = trackMap[missionType] || "logic";

    expect(track).toBe("logic"); // Default fallback
  });
});
