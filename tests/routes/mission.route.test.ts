import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/mission/route";
import { POST as createSession } from "@/app/api/session/route";
import { testPrisma } from "../setup";

/**
 * Mission API Route Tests
 *
 * Tests the /api/mission endpoint:
 * - GET: Get next available mission
 * - POST: Accept a mission
 */

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

describe("Mission API Routes", () => {
  let testSession: { sessionId: string; userId: string; handle: string };

  beforeEach(async () => {
    // Create a session for testing
    const handle = `mission-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const res = await createSession(
      createRequest("POST", "http://localhost/api/session", { handle })
    );
    testSession = await res.json();
  });

  describe("GET /api/mission", () => {
    it("should return next mission for session", async () => {
      const response = await GET(
        createRequest(
          "GET",
          `http://localhost/api/mission?sessionId=${testSession.sessionId}`
        )
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mission || data.message).toBeTruthy();

      if (data.mission) {
        expect(data.mission.id).toBeTruthy();
        expect(data.mission.title).toBeTruthy();
        expect(data.mission.prompt).toBeTruthy();
        expect(data.mission.type).toBeTruthy();
      }
    });

    it("should return mission by handle", async () => {
      const response = await GET(
        createRequest(
          "GET",
          `http://localhost/api/mission?handle=${testSession.handle}`
        )
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mission || data.message).toBeTruthy();
    });

    it("should return 400 without session identifier", async () => {
      const response = await GET(
        createRequest("GET", "http://localhost/api/mission")
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("session");
    });

    it("should return 400 for invalid session", async () => {
      const response = await GET(
        createRequest(
          "GET",
          "http://localhost/api/mission?sessionId=invalid-session-id"
        )
      );
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/mission", () => {
    it("should accept a mission", async () => {
      // First get a mission
      const getRes = await GET(
        createRequest(
          "GET",
          `http://localhost/api/mission?sessionId=${testSession.sessionId}`
        )
      );
      const { mission } = await getRes.json();

      if (!mission) {
        // Skip if no missions available
        return;
      }

      // Accept the mission
      const acceptRes = await POST(
        createRequest("POST", "http://localhost/api/mission", {
          sessionId: testSession.sessionId,
          missionId: mission.id,
        })
      );
      const data = await acceptRes.json();

      expect(acceptRes.status).toBe(200);
      expect(data.missionRun).toBeDefined();
      expect(data.missionRun.id).toBeTruthy();
      expect(data.missionRun.mission.id).toBe(mission.id);
      expect(data.missionRun.status).toBe("ACCEPTED");
    });

    it("should auto-select mission if not specified", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/mission", {
          sessionId: testSession.sessionId,
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.missionRun).toBeDefined();
      expect(data.missionRun.status).toBe("ACCEPTED");
    });

    it("should accept mission by handle", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/mission", {
          handle: testSession.handle,
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.missionRun).toBeDefined();
    });

    it("should return 400 without session identifier", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/mission", {})
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("session");
    });

    it("should create mission run in database", async () => {
      const acceptRes = await POST(
        createRequest("POST", "http://localhost/api/mission", {
          sessionId: testSession.sessionId,
        })
      );
      const { missionRun } = await acceptRes.json();

      // Verify in database
      const dbRun = await testPrisma.missionRun.findUnique({
        where: { id: missionRun.id },
        include: { mission: true },
      });

      expect(dbRun).toBeTruthy();
      expect(dbRun?.status).toBe("ACCEPTED");
      expect(dbRun?.userId).toBe(testSession.userId);
      expect(dbRun?.sessionId).toBe(testSession.sessionId);
    });
  });

  describe("userId Fallback Resolution", () => {
    it("should return mission by userId when no session exists", async () => {
      // Create user directly without session
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const user = await testPrisma.user.create({
        data: {
          id: `direct-user-${uniqueSuffix}`,
          handle: `direct-${uniqueSuffix}`,
          agentId: `D${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),
        },
      });

      const response = await GET(
        createRequest(
          "GET",
          `http://localhost/api/mission?userId=${user.id}`
        )
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mission || data.message).toBeTruthy();
    });

    it("should accept mission by userId", async () => {
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const user = await testPrisma.user.create({
        data: {
          id: `direct-accept-${uniqueSuffix}`,
          handle: `direct-accept-${uniqueSuffix}`,
          agentId: `D${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),
        },
      });

      const response = await POST(
        createRequest("POST", "http://localhost/api/mission", {
          userId: user.id,
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.missionRun).toBeDefined();
      expect(data.missionRun.status).toBe("ACCEPTED");
    });

    it("should prioritize sessionId over handle over userId", async () => {
      // This test verifies the priority chain works correctly
      const response = await POST(
        createRequest("POST", "http://localhost/api/mission", {
          sessionId: testSession.sessionId,
          handle: "different-handle",
          userId: "different-user-id",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should use the sessionId, not the other values
      const run = await testPrisma.missionRun.findUnique({
        where: { id: data.missionRun.id },
      });
      expect(run?.userId).toBe(testSession.userId);
    });
  });

  describe("Mission Assignment Isolation", () => {
    it("should track missions per user", async () => {
      // Accept mission for first user
      await POST(
        createRequest("POST", "http://localhost/api/mission", {
          sessionId: testSession.sessionId,
        })
      );

      // Create second user
      const handle2 = `mission-user2-${Date.now()}`;
      const session2Res = await createSession(
        createRequest("POST", "http://localhost/api/session", {
          handle: handle2,
        })
      );
      const session2 = await session2Res.json();

      // Accept mission for second user
      await POST(
        createRequest("POST", "http://localhost/api/mission", {
          sessionId: session2.sessionId,
        })
      );

      // Check runs are separate
      const user1Runs = await testPrisma.missionRun.findMany({
        where: { userId: testSession.userId },
      });
      const user2Runs = await testPrisma.missionRun.findMany({
        where: { userId: session2.userId },
      });

      expect(user1Runs.length).toBeGreaterThanOrEqual(1);
      expect(user2Runs.length).toBeGreaterThanOrEqual(1);
      expect(user1Runs[0].userId).not.toBe(user2Runs[0].userId);
    });
  });
});
