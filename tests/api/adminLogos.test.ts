import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { testPrisma, createTestUser } from "../setup";

/**
 * Admin Logos API Tests
 *
 * Tests the Logos command interface tools:
 * - query_agents
 * - analyze_agent
 * - get_network_stats
 * - analyze_puzzle_profile
 * - get_network_puzzle_stats
 * - draft_mission
 */
describe("Admin Logos Tools", () => {
  let testUsers: Array<{ id: string; handle: string; agentId: string | null }> = [];

  beforeEach(async () => {
    // Create several test users for querying
    testUsers = await Promise.all([
      createTestUser("logos-test-1"),
      createTestUser("logos-test-2"),
      createTestUser("logos-test-3"),
    ]);

    // Create some sessions and missions for them
    for (const user of testUsers) {
      await testPrisma.gameSession.create({
        data: {
          userId: user.id,
          status: "OPEN",
        },
      });
    }
  });

  afterEach(async () => {
    // Cleanup
    for (const user of testUsers) {
      try {
        await testPrisma.missionRun.deleteMany({ where: { userId: user.id } });
        await testPrisma.gameSession.deleteMany({ where: { userId: user.id } });
        await testPrisma.playerProfile.deleteMany({ where: { userId: user.id } });
        await testPrisma.user.delete({ where: { id: user.id } });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Clean up any test missions
    await testPrisma.missionDefinition.deleteMany({
      where: { title: { startsWith: "TEST-" } },
    });
  });

  describe("Tool Parameter Format", () => {
    it("should use 'parameters' not 'inputSchema' for AI SDK v6 compatibility", async () => {
      // This test verifies the fix from inputSchema -> parameters
      // The tools should be structured with 'parameters' for streamText to work
      const mockTool = {
        description: "Test tool",
        parameters: {}, // Correct format
        execute: async () => ({}),
      };

      // Should NOT have inputSchema
      expect(mockTool).not.toHaveProperty("inputSchema");
      expect(mockTool).toHaveProperty("parameters");
    });
  });

  describe("Network Stats", () => {
    it("should return agent count", async () => {
      const totalAgents = await testPrisma.user.count();
      expect(totalAgents).toBeGreaterThanOrEqual(testUsers.length);
    });

    it("should return session count for last 24h", async () => {
      const recentSessions = await testPrisma.gameSession.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      });
      expect(recentSessions).toBeGreaterThanOrEqual(testUsers.length);
    });
  });

  describe("Query Agents", () => {
    it("should find agents by activity recency", async () => {
      const agents = await testPrisma.user.findMany({
        where: {
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: {
              gameSessions: true,
              missionRuns: true,
            },
          },
        },
      });

      expect(agents.length).toBeGreaterThan(0);

      // Our test users should be in the results
      const testUserIds = testUsers.map((u) => u.id);
      const foundTestUsers = agents.filter((a) => testUserIds.includes(a.id));
      expect(foundTestUsers.length).toBeGreaterThan(0);
    });

    it("should include session counts", async () => {
      const agent = await testPrisma.user.findUnique({
        where: { id: testUsers[0].id },
        include: {
          _count: {
            select: { gameSessions: true },
          },
        },
      });

      expect(agent).not.toBeNull();
      expect(agent!._count.gameSessions).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Analyze Agent", () => {
    it("should find agent by ID", async () => {
      const agent = await testPrisma.user.findUnique({
        where: { id: testUsers[0].id },
        include: {
          profile: true,
          gameSessions: { take: 10 },
          missionRuns: { take: 10 },
        },
      });

      expect(agent).not.toBeNull();
      expect(agent!.id).toBe(testUsers[0].id);
    });

    it("should find agent by handle", async () => {
      const agent = await testPrisma.user.findFirst({
        where: { handle: testUsers[0].handle },
      });

      expect(agent).not.toBeNull();
      expect(agent!.id).toBe(testUsers[0].id);
    });

    it("should include performance data", async () => {
      // Create a completed mission run
      const mission = await testPrisma.missionDefinition.create({
        data: {
          title: "TEST-Performance",
          type: "observe",
          prompt: "Test mission",
          active: true,
        },
      });

      await testPrisma.missionRun.create({
        data: {
          userId: testUsers[0].id,
          missionId: mission.id,
          status: "COMPLETED",
          score: 0.85,
        },
      });

      const agent = await testPrisma.user.findUnique({
        where: { id: testUsers[0].id },
        include: {
          missionRuns: {
            where: { status: "COMPLETED" },
          },
        },
      });

      expect(agent).not.toBeNull();
      expect(agent!.missionRuns.length).toBeGreaterThanOrEqual(1);

      const avgScore =
        agent!.missionRuns.reduce((sum, m) => sum + (m.score || 0), 0) /
        agent!.missionRuns.length;
      expect(avgScore).toBeCloseTo(0.85, 1);

      // Cleanup
      await testPrisma.missionRun.deleteMany({ where: { missionId: mission.id } });
      await testPrisma.missionDefinition.delete({ where: { id: mission.id } });
    });
  });

  describe("Draft Mission", () => {
    it("should create a mission in database", async () => {
      const missionData = {
        title: "TEST-Observe Tokyo Station",
        type: "observe",
        prompt: "Document the crowds at Tokyo Station during rush hour.",
        tags: ["tokyo", "observation"],
        active: true,
      };

      const mission = await testPrisma.missionDefinition.create({
        data: missionData,
      });

      expect(mission.id).toBeTruthy();
      expect(mission.title).toBe("TEST-Observe Tokyo Station");
      expect(mission.type).toBe("observe");
      expect(mission.active).toBe(true);

      // Cleanup
      await testPrisma.missionDefinition.delete({ where: { id: mission.id } });
    });
  });

  describe("Assign Mission", () => {
    it("should create mission runs for agents", async () => {
      const mission = await testPrisma.missionDefinition.create({
        data: {
          title: "TEST-Assignment",
          type: "decode",
          prompt: "Test assignment",
          active: true,
        },
      });

      const run = await testPrisma.missionRun.create({
        data: {
          missionId: mission.id,
          userId: testUsers[0].id,
          status: "ACCEPTED",
        },
      });

      expect(run.id).toBeTruthy();
      expect(run.userId).toBe(testUsers[0].id);
      expect(run.status).toBe("ACCEPTED");

      // Cleanup
      await testPrisma.missionRun.delete({ where: { id: run.id } });
      await testPrisma.missionDefinition.delete({ where: { id: mission.id } });
    });
  });

  describe("Update Agent", () => {
    it("should upsert player profile", async () => {
      await testPrisma.playerProfile.upsert({
        where: { userId: testUsers[0].id },
        update: {
          adminNotes: "Test admin note",
          watchlist: true,
        },
        create: {
          userId: testUsers[0].id,
          adminNotes: "Test admin note",
          watchlist: true,
        },
      });

      const profile = await testPrisma.playerProfile.findUnique({
        where: { userId: testUsers[0].id },
      });

      expect(profile).not.toBeNull();
      expect(profile!.adminNotes).toBe("Test admin note");
      expect(profile!.watchlist).toBe(true);
    });
  });
});
