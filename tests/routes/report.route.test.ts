import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as submitReport } from "@/app/api/report/route";
import { POST as createSession } from "@/app/api/session/route";
import { POST as acceptMission } from "@/app/api/mission/route";
import { testPrisma } from "../setup";

/**
 * Report API Route Tests
 *
 * Tests the /api/report endpoint:
 * - POST: Submit mission report
 *
 * Note: AI evaluation is mocked for these tests.
 * See missionEvaluation.integration.test.ts for real AI tests.
 */

// Mock AI model
vi.mock("@/app/lib/ai/models", () => ({
  getModel: vi.fn(() => ({
    modelId: "mock-model",
  })),
}));

// Mock generateObject for predictable evaluation
vi.mock("ai", () => ({
  generateObject: vi.fn(async () => ({
    object: {
      score: 0.75,
      feedback: "Report acknowledged. The signal grows stronger.",
      rewardAdjustment: 1.0,
    },
  })),
}));

function createRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>
): Request {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return new Request(url, options);
}

describe("Report API Routes", () => {
  let testSession: { sessionId: string; userId: string; handle: string };
  let testMissionRun: { id: string };

  beforeEach(async () => {
    // Create session
    const handle = `report-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sessionRes = await createSession(
      createRequest("POST", "http://localhost/api/session", { handle })
    );
    testSession = await sessionRes.json();

    // Accept a mission
    const missionRes = await acceptMission(
      createRequest("POST", "http://localhost/api/mission", {
        sessionId: testSession.sessionId,
      })
    );
    const { missionRun } = await missionRes.json();
    testMissionRun = missionRun;
  });

  describe("POST /api/report", () => {
    it("should submit report for mission", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          missionRunId: testMissionRun.id,
          content: "I observed strange patterns in the static. The signal was clear at 0300 hours.",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(testMissionRun.id);
      expect(data.status).toBe("COMPLETED");
      expect(data.score).toBeDefined();
      expect(data.feedback).toBeTruthy();
    });

    it("should include reward in response", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          missionRunId: testMissionRun.id,
          content: "Detailed observation report with specific findings.",
        })
      );
      const data = await response.json();

      expect(data.reward).toBeDefined();
      expect(data.reward.type).toBe("CREDIT");
      expect(data.reward.amount).toBeGreaterThanOrEqual(0);
    });

    it("should auto-detect latest mission run", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          content: "Report content without specifying missionRunId.",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(testMissionRun.id);
    });

    it("should submit by handle", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          handle: testSession.handle,
          content: "Report submitted via handle.",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("COMPLETED");
    });

    it("should return 400 without session identifier", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          content: "Report without session.",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("session");
    });

    it("should return 400 without content", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("content required");
    });

    it("should return 400 for empty content", async () => {
      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          content: "   ",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("content required");
    });

    it("should return 404 when no active mission", async () => {
      // Create new session without accepting mission
      const handle = `no-mission-${Date.now()}`;
      const sessionRes = await createSession(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const newSession = await sessionRes.json();

      const response = await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: newSession.sessionId,
          content: "Report for non-existent mission.",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("No active mission");
    });

    it("should update mission run status in database", async () => {
      await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          content: "Database verification report.",
        })
      );

      const dbRun = await testPrisma.missionRun.findUnique({
        where: { id: testMissionRun.id },
      });

      expect(dbRun?.status).toBe("COMPLETED");
      expect(dbRun?.score).toBeDefined();
      expect(dbRun?.feedback).toBeTruthy();
      expect(dbRun?.payload).toBe("Database verification report.");
    });

    it("should create reward record in database", async () => {
      await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          content: "Reward verification report.",
        })
      );

      const rewards = await testPrisma.reward.findMany({
        where: { missionRunId: testMissionRun.id },
      });

      expect(rewards.length).toBeGreaterThanOrEqual(1);
      expect(rewards[0].type).toBe("CREDIT");
      expect(rewards[0].userId).toBe(testSession.userId);
    });
  });

  describe("Report Validation", () => {
    it("should trim whitespace from content", async () => {
      await submitReport(
        createRequest("POST", "http://localhost/api/report", {
          sessionId: testSession.sessionId,
          content: "  Trimmed content report.  ",
        })
      );

      const dbRun = await testPrisma.missionRun.findUnique({
        where: { id: testMissionRun.id },
      });

      expect(dbRun?.payload).toBe("Trimmed content report.");
    });
  });
});
