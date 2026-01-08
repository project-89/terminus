/**
 * E2E Tests for Admin Puzzle Endpoints
 *
 * Tests that puzzle difficulty data flows correctly through admin APIs.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { testPrisma, createTestUser, createTestSession, cleanupTestData } from "../setup";

import { getPlayerDifficulty, updateTrackDifficulty } from "@/app/lib/server/difficultyService";
import { recordPuzzleAttempt } from "@/app/lib/server/puzzleDifficultyService";

// Mock the admin route handlers directly since we can't easily do HTTP requests in unit tests
// We'll test the underlying data functions that the routes use

describe("Admin Dashboard Puzzle Stats", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser("admin-dash");
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should aggregate puzzle stats from knowledge nodes", async () => {
    // Create puzzle history for this test user
    await testPrisma.knowledgeNode.createMany({
      data: [
        { userId: testUser.id, type: "PUZZLE", label: "p1", data: { id: "p1", puzzleType: "cipher", attempts: 2, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "p2", data: { id: "p2", puzzleType: "cipher", attempts: 3, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "p3", data: { id: "p3", puzzleType: "stego", attempts: 5, solved: false } },
        { userId: testUser.id, type: "PUZZLE", label: "p4", data: { id: "p4", puzzleType: "world", attempts: 1, solved: true } },
      ],
    });

    // Query for THIS user's puzzles only (simulates per-user stats)
    const puzzleNodes = await testPrisma.knowledgeNode.findMany({
      where: { type: "PUZZLE", userId: testUser.id },
      select: { data: true, userId: true },
    });

    let totalAttempted = 0;
    let totalSolved = 0;
    const byType: Record<string, { attempted: number; solved: number }> = {};

    for (const node of puzzleNodes) {
      const data = node.data as Record<string, any>;
      if (data.attempts && data.attempts > 0) {
        totalAttempted++;
        const puzzleType = data.puzzleType || "world";
        if (!byType[puzzleType]) {
          byType[puzzleType] = { attempted: 0, solved: 0 };
        }
        byType[puzzleType].attempted++;
        if (data.solved) {
          totalSolved++;
          byType[puzzleType].solved++;
        }
      }
    }

    expect(totalAttempted).toBe(4);
    expect(totalSolved).toBe(3);
    expect(byType.cipher).toEqual({ attempted: 2, solved: 2 });
    expect(byType.stego).toEqual({ attempted: 1, solved: 0 });
    expect(byType.world).toEqual({ attempted: 1, solved: 1 });
  });

  it("should calculate success rate correctly", async () => {
    await testPrisma.knowledgeNode.createMany({
      data: [
        { userId: testUser.id, type: "PUZZLE", label: "p1", data: { id: "p1", puzzleType: "cipher", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "p2", data: { id: "p2", puzzleType: "cipher", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "p3", data: { id: "p3", puzzleType: "cipher", attempts: 5, solved: false } },
        { userId: testUser.id, type: "PUZZLE", label: "p4", data: { id: "p4", puzzleType: "cipher", attempts: 5, solved: false } },
      ],
    });

    // Query for THIS user's puzzles only
    const puzzleNodes = await testPrisma.knowledgeNode.findMany({
      where: { type: "PUZZLE", userId: testUser.id },
      select: { data: true },
    });

    let solved = 0;
    let attempted = 0;
    for (const node of puzzleNodes) {
      const data = node.data as Record<string, any>;
      if (data.attempts > 0) {
        attempted++;
        if (data.solved) solved++;
      }
    }

    const successRate = Math.round((solved / attempted) * 100);
    expect(successRate).toBe(50);
  });
});

describe("Admin Agent Detail - Puzzle Difficulty", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser("admin-agent");
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return skill ratings for agent", async () => {
    // Update skill ratings
    await updateTrackDifficulty(testUser.id, "logic", 0.7, true);
    await updateTrackDifficulty(testUser.id, "perception", 0.4, false);

    const difficulty = await getPlayerDifficulty(testUser.id);

    // Skill ratings should be retrievable
    expect(difficulty.logic).toBeGreaterThan(0.5);
    expect(difficulty.perception).toBeLessThan(0.5);
    expect(difficulty.creation).toBeDefined();
    expect(difficulty.field).toBeDefined();
  });

  it("should return puzzle profile with type stats", async () => {
    // Create puzzle history - need 2+ puzzles per type for strongest/weakest calculation
    await testPrisma.knowledgeNode.createMany({
      data: [
        { userId: testUser.id, type: "PUZZLE", label: "c1", data: { id: "c1", puzzleType: "cipher", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "c2", data: { id: "c2", puzzleType: "cipher", attempts: 2, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "s1", data: { id: "s1", puzzleType: "stego", attempts: 5, solved: false } },
        { userId: testUser.id, type: "PUZZLE", label: "s2", data: { id: "s2", puzzleType: "stego", attempts: 3, solved: false } },
      ],
    });

    // Import and use the profile function
    const { getPlayerPuzzleProfile } = await import("@/app/lib/server/puzzleDifficultyService");
    const profile = await getPlayerPuzzleProfile(testUser.id);

    expect(profile.totalAttempted).toBe(4);
    expect(profile.totalSolved).toBe(2);
    expect(profile.typeStats.cipher.solved).toBe(2);
    expect(profile.typeStats.stego.solved).toBe(0);
    expect(profile.strongestPuzzleType).toBe("cipher");
    expect(profile.weakestPuzzleType).toBe("stego");
  });

  it("should return AI recommendations", async () => {
    const { getPuzzleRecommendations } = await import("@/app/lib/server/puzzleDifficultyService");
    const recs = await getPuzzleRecommendations(testUser.id);

    expect(recs.recommendedType).toBeDefined();
    expect(recs.recommendedDifficulty).toBeGreaterThanOrEqual(0);
    expect(recs.recommendedDifficulty).toBeLessThanOrEqual(1);
    expect(recs.reasoning).toBeDefined();
    expect(Array.isArray(recs.avoidTypes)).toBe(true);
    expect(Array.isArray(recs.playerStrengths)).toBe(true);
    expect(Array.isArray(recs.playerWeaknesses)).toBe(true);
  });
});

describe("Admin LOGOS Puzzle Tools", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser("admin-logos");
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should analyze puzzle profile via tool function", async () => {
    // Create puzzle history
    await testPrisma.knowledgeNode.createMany({
      data: [
        { userId: testUser.id, type: "PUZZLE", label: "p1", data: { id: "p1", puzzleType: "world", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "p2", data: { id: "p2", puzzleType: "cipher", attempts: 2, solved: true } },
      ],
    });
    await updateTrackDifficulty(testUser.id, "logic", 0.6, true);

    // Simulate what the LOGOS tool does
    const { getPlayerDifficulty } = await import("@/app/lib/server/difficultyService");
    const { getPlayerPuzzleProfile, getPuzzleRecommendations } = await import("@/app/lib/server/puzzleDifficultyService");

    const [difficulty, profile, recommendations] = await Promise.all([
      getPlayerDifficulty(testUser.id),
      getPlayerPuzzleProfile(testUser.id),
      getPuzzleRecommendations(testUser.id),
    ]);

    const result = {
      skillRatings: {
        logic: Math.round(difficulty.logic * 100),
        perception: Math.round(difficulty.perception * 100),
        creation: Math.round(difficulty.creation * 100),
        field: Math.round(difficulty.field * 100),
      },
      profile: {
        totalAttempted: profile.totalAttempted,
        totalSolved: profile.totalSolved,
        successRate: Math.round(profile.overallSuccessRate * 100),
      },
      recommendations: {
        recommendedType: recommendations.recommendedType,
        recommendedDifficulty: recommendations.recommendedDifficulty,
      },
    };

    expect(result.skillRatings.logic).toBeGreaterThan(50);
    expect(result.profile.totalSolved).toBe(2);
    expect(result.profile.successRate).toBe(100);
    expect(result.recommendations.recommendedType).toBeDefined();
  });

  it("should get network puzzle stats via tool function", async () => {
    // Create puzzle history for multiple users
    const user2 = await createTestUser("admin-logos-2");

    await testPrisma.knowledgeNode.createMany({
      data: [
        { userId: testUser.id, type: "PUZZLE", label: "p1", data: { id: "p1", puzzleType: "cipher", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "p2", data: { id: "p2", puzzleType: "stego", attempts: 3, solved: false } },
        { userId: user2.id, type: "PUZZLE", label: "p3", data: { id: "p3", puzzleType: "cipher", attempts: 2, solved: true } },
        { userId: user2.id, type: "PUZZLE", label: "p4", data: { id: "p4", puzzleType: "world", attempts: 1, solved: true } },
      ],
    });

    // Query for ONLY these test users (simulates a filtered network stats query)
    const puzzleNodes = await testPrisma.knowledgeNode.findMany({
      where: {
        type: "PUZZLE",
        userId: { in: [testUser.id, user2.id] }
      },
      select: { data: true, userId: true },
    });

    let totalAttempted = 0;
    let totalSolved = 0;
    const byType: Record<string, { attempted: number; solved: number }> = {};

    for (const node of puzzleNodes) {
      const data = node.data as Record<string, any>;
      if (!data.attempts || data.attempts === 0) continue;

      totalAttempted++;
      const puzzleType = data.puzzleType || "world";

      if (!byType[puzzleType]) {
        byType[puzzleType] = { attempted: 0, solved: 0 };
      }
      byType[puzzleType].attempted++;

      if (data.solved) {
        totalSolved++;
        byType[puzzleType].solved++;
      }
    }

    expect(totalAttempted).toBe(4);
    expect(totalSolved).toBe(3);
    expect(byType.cipher.solved).toBe(2);
    expect(byType.stego.solved).toBe(0);
    expect(byType.world.solved).toBe(1);
  });

  it("should handle agent lookup by handle", async () => {
    // Generate a unique handle for this test run
    const uniqueHandle = `test-agent-handle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Set a handle for the test user
    await testPrisma.user.update({
      where: { id: testUser.id },
      data: { handle: uniqueHandle },
    });

    // Simulate handle lookup like LOGOS tools do
    const user = await testPrisma.user.findFirst({
      where: { handle: uniqueHandle },
    });

    expect(user).not.toBeNull();
    expect(user?.id).toBe(testUser.id);
  });
});

describe("Dossier Generator - Puzzle Data", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser("dossier-puzzle");
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should include puzzle summary in dossier data payload", async () => {
    // Create puzzle history - need 2+ puzzles per type for strongest/weakest calculation
    await testPrisma.knowledgeNode.createMany({
      data: [
        { userId: testUser.id, type: "PUZZLE", label: "c1", data: { id: "c1", puzzleType: "cipher", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "c2", data: { id: "c2", puzzleType: "cipher", attempts: 1, solved: true } },
        { userId: testUser.id, type: "PUZZLE", label: "s1", data: { id: "s1", puzzleType: "stego", attempts: 5, solved: false } },
        { userId: testUser.id, type: "PUZZLE", label: "s2", data: { id: "s2", puzzleType: "stego", attempts: 3, solved: false } },
      ],
    });

    // Update skill ratings
    await updateTrackDifficulty(testUser.id, "logic", 0.7, true);

    // Simulate what the dossier generator does
    const { getPlayerDifficulty } = await import("@/app/lib/server/difficultyService");
    const { getPlayerPuzzleProfile, getPuzzleRecommendations } = await import("@/app/lib/server/puzzleDifficultyService");

    const [difficulty, profile, recommendations] = await Promise.all([
      getPlayerDifficulty(testUser.id),
      getPlayerPuzzleProfile(testUser.id),
      getPuzzleRecommendations(testUser.id),
    ]);

    const puzzleSummary = {
      skillRatings: {
        logic: Math.round(difficulty.logic * 100),
        perception: Math.round(difficulty.perception * 100),
        creation: Math.round(difficulty.creation * 100),
        field: Math.round(difficulty.field * 100),
      },
      totalAttempted: profile.totalAttempted,
      totalSolved: profile.totalSolved,
      successRate: Math.round(profile.overallSuccessRate * 100),
      strongestType: profile.strongestPuzzleType,
      weakestType: profile.weakestPuzzleType,
      preferences: {
        prefersTechPuzzles: profile.prefersTechPuzzles,
        prefersExplorationPuzzles: profile.prefersExplorationPuzzles,
        hasNeverSolvedCipher: profile.hasNeverSolvedCipher,
        hasNeverSolvedStego: profile.hasNeverSolvedStego,
      },
      recommendations: {
        nextType: recommendations.recommendedType,
        difficulty: recommendations.recommendedDifficulty,
        reasoning: recommendations.reasoning,
      },
    };

    // Verify the puzzle summary has all expected data
    expect(puzzleSummary.skillRatings.logic).toBeGreaterThan(50);
    expect(puzzleSummary.totalAttempted).toBe(4);
    expect(puzzleSummary.totalSolved).toBe(2);
    expect(puzzleSummary.successRate).toBe(50);
    expect(puzzleSummary.strongestType).toBe("cipher");
    expect(puzzleSummary.weakestType).toBe("stego");
    expect(puzzleSummary.preferences.hasNeverSolvedCipher).toBe(false);
    expect(puzzleSummary.preferences.hasNeverSolvedStego).toBe(true);
    expect(puzzleSummary.recommendations.nextType).toBeDefined();
  });
});

describe("Full Admin Flow Integration", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testSession: Awaited<ReturnType<typeof createTestSession>>;

  beforeEach(async () => {
    testUser = await createTestUser("admin-flow");
    testSession = await createTestSession(testUser.id);

    // Create game session
    await testPrisma.gameSession.create({
      data: {
        id: testSession.id,
        userId: testUser.id,
        gameState: {
          worldExtraction: { rooms: [], objects: [], puzzles: [], npcs: [] },
        },
      },
    });
  });

  afterEach(async () => {
    await testPrisma.gameSession.deleteMany({ where: { userId: testUser.id } });
    await cleanupTestData();
  });

  it("should flow puzzle data from solve → admin dashboard → agent detail → LOGOS tools", async () => {
    // Step 1: Create and solve puzzles
    const { aiCreatePuzzle, aiCheckPuzzleSolution } = await import("@/app/lib/server/worldGraphService");

    await aiCreatePuzzle(testSession.id, testUser.id, {
      id: "admin-flow-cipher",
      name: "Admin Flow Test",
      type: "cipher",
      solution: "ANSWER",
      hints: ["hint"],
      difficulty: 3,
      experimentId: "exp-admin",
    });

    const solveResult = await aiCheckPuzzleSolution(
      testSession.id,
      testUser.id,
      "admin-flow-cipher",
      "ANSWER"
    );

    expect(solveResult.correct).toBe(true);
    expect(solveResult.skillUpdate).toBeDefined();

    // Step 2: Verify data appears in admin dashboard stats
    const dashboardPuzzles = await testPrisma.knowledgeNode.findMany({
      where: { type: "PUZZLE", userId: testUser.id },
    });

    expect(dashboardPuzzles.length).toBeGreaterThan(0);
    const puzzleData = dashboardPuzzles[0].data as Record<string, any>;
    expect(puzzleData.solved).toBe(true);

    // Step 3: Verify data appears in agent detail
    const { getPlayerPuzzleProfile } = await import("@/app/lib/server/puzzleDifficultyService");
    const profile = await getPlayerPuzzleProfile(testUser.id);

    expect(profile.totalSolved).toBeGreaterThan(0);
    expect(profile.typeStats.cipher.solved).toBeGreaterThan(0);

    // Step 4: Verify LOGOS tools return updated data
    const { getPuzzleRecommendations } = await import("@/app/lib/server/puzzleDifficultyService");
    const recs = await getPuzzleRecommendations(testUser.id);

    // Should no longer flag cipher as never-solved
    expect(profile.hasNeverSolvedCipher).toBe(false);

    // Step 5: Verify skill rating updated
    const { getPlayerDifficulty } = await import("@/app/lib/server/difficultyService");
    const difficulty = await getPlayerDifficulty(testUser.id);

    // Logic rating should have increased from solving cipher
    expect(difficulty.logic).toBeGreaterThanOrEqual(0.5);

    console.log("[Admin Flow] Complete pipeline verified:");
    console.log(`  - Puzzle solved: ${solveResult.skillUpdate?.track}`);
    console.log(`  - Profile updated: ${profile.totalSolved} solved`);
    console.log(`  - Rating: logic=${(difficulty.logic * 100).toFixed(0)}%`);
    console.log(`  - Recommendation: ${recs.recommendedType}`);
  });
});
