import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/points/route";
import { testPrisma, createTestUser } from "../setup";

/**
 * Points API Route Tests
 *
 * Tests the /api/points endpoint:
 * - GET: Get points and recent rewards by handle
 * - POST: Award points to a user
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

describe("Points API Routes", () => {
  describe("GET /api/points", () => {
    it("should return points for a user by handle", async () => {
      const user = await createTestUser("points-get");

      const response = await GET(
        createRequest("GET", `http://localhost/api/points?handle=${user.handle}`)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.points).toBe(0); // New user starts with 0
      expect(data.recentRewards).toEqual([]);
    });

    it("should return 400 without handle", async () => {
      const response = await GET(
        createRequest("GET", "http://localhost/api/points")
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("handle required");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await GET(
        createRequest(
          "GET",
          "http://localhost/api/points?handle=nonexistent-user-12345"
        )
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("User not found");
    });

    it("should return recent rewards", async () => {
      const user = await createTestUser("points-rewards");

      // Add some rewards manually
      await testPrisma.reward.createMany({
        data: [
          {
            userId: user.id,
            amount: 10,
            type: "LOGOS_AWARD",
            metadata: { reason: "First reward" },
          },
          {
            userId: user.id,
            amount: 25,
            type: "LOGOS_AWARD",
            metadata: { reason: "Second reward" },
          },
        ],
      });

      // Update user points to match
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referralPoints: 35 },
      });

      const response = await GET(
        createRequest("GET", `http://localhost/api/points?handle=${user.handle}`)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.points).toBe(35);
      expect(data.recentRewards.length).toBe(2);
    });
  });

  describe("POST /api/points", () => {
    it("should award points to a user", async () => {
      const user = await createTestUser("points-award");

      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: 50,
          reason: "Completed a mission",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.awarded).toBe(50);
      expect(data.newTotal).toBe(50);
      expect(data.rewardId).toBeTruthy();
    });

    it("should clamp amount to max 500", async () => {
      const user = await createTestUser("points-clamp-max");

      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: 1000,
          reason: "Large reward",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.awarded).toBe(500); // Clamped to max
    });

    it("should clamp amount to min 1", async () => {
      const user = await createTestUser("points-clamp-min");

      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: -50,
          reason: "Negative reward",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.awarded).toBe(1); // Clamped to min
    });

    it("should accumulate points across awards", async () => {
      const user = await createTestUser("points-accumulate");

      // First award
      await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: 20,
          reason: "First award",
        })
      );

      // Second award
      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: 30,
          reason: "Second award",
        })
      );
      const data = await response.json();

      expect(data.newTotal).toBe(50); // 20 + 30
    });

    it("should return 400 without required fields", async () => {
      const user = await createTestUser("points-missing");

      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          // Missing amount and reason
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: "nonexistent-user-12345",
          amount: 10,
          reason: "Test",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("User not found");
    });

    it("should return 400 for unknown action", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "unknown",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Unknown action");
    });

    it("should create reward record in database", async () => {
      const user = await createTestUser("points-db-record");

      await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: 42,
          reason: "Database test",
          category: "test",
        })
      );

      const reward = await testPrisma.reward.findFirst({
        where: { userId: user.id },
      });

      expect(reward).toBeTruthy();
      expect(reward?.amount).toBe(42);
      expect(reward?.type).toBe("LOGOS_AWARD");
      expect((reward?.metadata as any)?.reason).toBe("Database test");
      expect((reward?.metadata as any)?.category).toBe("test");
    });

    it("should update user referralPoints in database", async () => {
      const user = await createTestUser("points-db-update");

      await POST(
        createRequest("POST", "http://localhost/api/points", {
          action: "award",
          handle: user.handle,
          amount: 100,
          reason: "Points update test",
        })
      );

      const updatedUser = await testPrisma.user.findUnique({
        where: { id: user.id },
        select: { referralPoints: true },
      });

      expect(updatedUser?.referralPoints).toBe(100);
    });
  });
});
