/**
 * E2E Test: Puzzle → Solve → Rating → Director Flow
 *
 * Tests the complete integration of:
 * 1. AI creates a puzzle with difficulty check
 * 2. Player attempts to solve it
 * 3. Elo rating updates based on outcome
 * 4. Director context reflects updated puzzle profile
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { testPrisma, createTestUser, createTestSession, cleanupTestData } from "../setup";

// Import all the services we're testing
import {
  aiCreatePuzzle,
  aiCheckPuzzleSolution,
  getSessionWorld,
  type AICreatedPuzzle,
} from "@/app/lib/server/worldGraphService";

import {
  getPlayerDifficulty,
} from "@/app/lib/server/difficultyService";

import {
  getPuzzleRecommendations,
  getPlayerPuzzleProfile,
} from "@/app/lib/server/puzzleDifficultyService";

import { buildDirectorContext } from "@/app/lib/server/directorService";

describe("Puzzle Difficulty E2E Flow", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testSession: Awaited<ReturnType<typeof createTestSession>>;

  beforeEach(async () => {
    testUser = await createTestUser("e2e-puzzle");
    testSession = await createTestSession(testUser.id);

    // Create a GameSession for the session (required by worldGraphService)
    // worldExtraction is stored inside gameState JSON field
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
    // Clean up game sessions first
    await testPrisma.gameSession.deleteMany({
      where: { userId: testUser.id },
    });
    await cleanupTestData();
  });

  describe("Complete Puzzle Flow", () => {
    it("should track full puzzle lifecycle: create → solve → rating update → director awareness", async () => {
      // === STEP 1: Get initial state ===
      const initialDifficulty = await getPlayerDifficulty(testUser.id);
      const initialLogicRating = initialDifficulty.logic;
      console.log(`[E2E] Initial logic rating: ${(initialLogicRating * 100).toFixed(1)}%`);

      const initialDirectorCtx = await buildDirectorContext({ userId: testUser.id });
      expect(initialDirectorCtx.puzzleProfile).toBeDefined();

      // === STEP 2: AI creates a cipher puzzle ===
      const puzzle: AICreatedPuzzle = {
        id: "e2e-test-cipher",
        name: "The E2E Test Cipher",
        description: "A test puzzle for E2E validation",
        type: "cipher",
        solution: "SECRETCODE",
        hints: ["Think about patterns", "Look at the letters"],
        difficulty: 3, // Medium difficulty
        multimedia: {
          cipher: {
            type: "caesar",
            key: "3",
            message: "SECRETCODE",
          },
        },
        pointsReward: 50,
        experimentId: "exp-e2e-test",
      };

      const createResult = await aiCreatePuzzle(
        testSession.id,
        testUser.id,
        puzzle
      );

      expect(createResult.success).toBe(true);
      expect(createResult.puzzleId).toBeDefined();
      console.log(`[E2E] Puzzle created: ${createResult.puzzleId}`);

      // Check if warnings were generated (player hasn't solved ciphers before)
      if (createResult.warnings && createResult.warnings.length > 0) {
        console.log(`[E2E] Difficulty warnings: ${createResult.warnings.join(", ")}`);
        expect(createResult.warnings.some(w => w.includes("never"))).toBe(true);
      }

      // === STEP 3: Verify puzzle exists in world ===
      const world = await getSessionWorld(testSession.id);
      expect(world.puzzles.some(p => p.name === puzzle.name)).toBe(true);

      // === STEP 4: Player attempts wrong answer ===
      const wrongResult = await aiCheckPuzzleSolution(
        testSession.id,
        testUser.id,
        puzzle.id,
        "WRONGANSWER"
      );

      expect(wrongResult.correct).toBe(false);
      expect(wrongResult.hint).toBeDefined(); // Should get a hint
      console.log(`[E2E] Wrong answer result: ${wrongResult.message}`);

      // === STEP 5: Player solves puzzle correctly ===
      const correctResult = await aiCheckPuzzleSolution(
        testSession.id,
        testUser.id,
        puzzle.id,
        "SECRETCODE"
      );

      expect(correctResult.correct).toBe(true);
      expect(correctResult.pointsAwarded).toBe(50);
      expect(correctResult.skillUpdate).toBeDefined();
      console.log(`[E2E] Correct answer! Points: ${correctResult.pointsAwarded}`);

      // === STEP 6: Verify Elo rating updated ===
      expect(correctResult.skillUpdate?.track).toBe("logic"); // cipher → logic
      expect(correctResult.skillUpdate?.change).toBeGreaterThan(0); // Rating increased

      const newDifficulty = await getPlayerDifficulty(testUser.id);
      expect(newDifficulty.logic).toBeGreaterThan(initialLogicRating);
      console.log(`[E2E] Logic rating: ${(initialLogicRating * 100).toFixed(1)}% → ${(newDifficulty.logic * 100).toFixed(1)}%`);

      // === STEP 7: Verify puzzle profile updated ===
      const profile = await getPlayerPuzzleProfile(testUser.id);
      expect(profile.totalSolved).toBeGreaterThan(0);
      expect(profile.typeStats.cipher.solved).toBeGreaterThan(0);
      expect(profile.hasNeverSolvedCipher).toBe(false); // No longer true!

      // === STEP 8: Verify director context reflects changes ===
      const finalDirectorCtx = await buildDirectorContext({ userId: testUser.id });
      expect(finalDirectorCtx.puzzleProfile).toBeDefined();

      // Context should now mention cipher experience
      const contextString = finalDirectorCtx.puzzleProfile?.context || "";
      console.log(`[E2E] Final puzzle profile context: ${contextString}`);

      // Should no longer warn about never solving ciphers
      expect(contextString.includes("never solved a cipher")).toBe(false);

      // === STEP 9: Verify recommendations adapted ===
      const recommendations = await getPuzzleRecommendations(testUser.id);
      console.log(`[E2E] New recommendation: ${recommendations.recommendedType} (${recommendations.reasoning})`);

      // Recommendations should factor in the successful cipher solve
      expect(recommendations.avoidTypes).not.toContain("cipher"); // Shouldn't avoid what we succeeded at
    });

    it("should handle failed puzzle attempts and update rating downward", async () => {
      // Get initial rating
      const initialDifficulty = await getPlayerDifficulty(testUser.id);
      const initialLogicRating = initialDifficulty.logic;

      // Create a hard puzzle
      const hardPuzzle: AICreatedPuzzle = {
        id: "e2e-hard-puzzle",
        name: "The Hard Puzzle",
        description: "A deliberately difficult puzzle",
        type: "cipher",
        solution: "IMPOSSIBLE",
        hints: ["Good luck"],
        difficulty: 5, // Max difficulty
        experimentId: "exp-e2e-hard",
      };

      await aiCreatePuzzle(testSession.id, testUser.id, hardPuzzle);

      // Fail multiple times
      for (let i = 0; i < 5; i++) {
        await aiCheckPuzzleSolution(
          testSession.id,
          testUser.id,
          hardPuzzle.id,
          `WRONG${i}`
        );
      }

      // Check rating decreased (or stayed same due to floor)
      const newDifficulty = await getPlayerDifficulty(testUser.id);
      expect(newDifficulty.logic).toBeLessThanOrEqual(initialLogicRating);
      console.log(`[E2E] After failures: ${(initialLogicRating * 100).toFixed(1)}% → ${(newDifficulty.logic * 100).toFixed(1)}%`);
    });

    it("should generate appropriate warnings for mismatched difficulty", async () => {
      // Create player history showing they struggle with perception
      await testPrisma.knowledgeNode.createMany({
        data: [
          { userId: testUser.id, type: "PUZZLE", label: "s1", data: { id: "s1", puzzleType: "stego", attempts: 5, solved: false } },
          { userId: testUser.id, type: "PUZZLE", label: "s2", data: { id: "s2", puzzleType: "stego", attempts: 3, solved: false } },
          { userId: testUser.id, type: "PUZZLE", label: "s3", data: { id: "s3", puzzleType: "stego", attempts: 4, solved: false } },
        ],
      });

      // Try to create another stego puzzle
      const stegoPuzzle: AICreatedPuzzle = {
        id: "e2e-stego-puzzle",
        name: "Another Stego Challenge",
        description: "Testing warning generation",
        type: "stego",
        solution: "HIDDEN",
        hints: ["Look closer"],
        difficulty: 4,
        multimedia: {
          stego: {
            imagePrompt: "A mysterious image",
            hiddenMessage: "HIDDEN",
          },
        },
        experimentId: "exp-e2e-stego",
      };

      const result = await aiCreatePuzzle(testSession.id, testUser.id, stegoPuzzle);

      // Should succeed but with warnings
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);

      // Should warn about repeated failures at this type
      expect(result.warnings!.some(w =>
        w.includes("attempted") && w.includes("solved none")
      )).toBe(true);

      console.log(`[E2E] Warnings generated: ${result.warnings!.join("; ")}`);

      // Should have suggestions for the AI
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
      console.log(`[E2E] Suggestions: ${result.suggestions!.join("; ")}`);
    });

    it("should track multiple puzzle types and update recommendations", async () => {
      // Solve a cipher puzzle
      const cipherPuzzle: AICreatedPuzzle = {
        id: "e2e-cipher-multi",
        name: "Cipher Multi Test",
        type: "cipher",
        solution: "ANSWER1",
        hints: ["hint"],
        difficulty: 2,
        experimentId: "exp-multi",
      };
      await aiCreatePuzzle(testSession.id, testUser.id, cipherPuzzle);
      await aiCheckPuzzleSolution(testSession.id, testUser.id, cipherPuzzle.id, "ANSWER1");

      // Solve a world puzzle
      const worldPuzzle: AICreatedPuzzle = {
        id: "e2e-world-multi",
        name: "World Multi Test",
        type: "world",
        solution: "ANSWER2",
        hints: ["hint"],
        difficulty: 2,
        experimentId: "exp-multi",
      };
      await aiCreatePuzzle(testSession.id, testUser.id, worldPuzzle);
      await aiCheckPuzzleSolution(testSession.id, testUser.id, worldPuzzle.id, "ANSWER2");

      // Check profile reflects both
      const profile = await getPlayerPuzzleProfile(testUser.id);
      expect(profile.typeStats.cipher.solved).toBeGreaterThan(0);
      expect(profile.typeStats.world.solved).toBeGreaterThan(0);
      expect(profile.totalSolved).toBe(2);

      // Check recommendations adapt
      const recs = await getPuzzleRecommendations(testUser.id);
      console.log(`[E2E] After 2 types: recommend ${recs.recommendedType}, reasoning: ${recs.reasoning}`);

      // After 2 easy puzzles, may not have enough data for strengths/weaknesses yet
      // But should have a recommendation and reasoning
      expect(recs.recommendedType).toBeDefined();
      expect(recs.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe("Director Context Integration", () => {
    it("should include puzzle profile in all director phases", async () => {
      // Test that puzzle profile appears regardless of director phase
      const context = await buildDirectorContext({
        userId: testUser.id,
        sessionId: testSession.id,
      });

      expect(context.puzzleProfile).toBeDefined();
      expect(context.puzzleProfile?.recommendations).toBeDefined();
      expect(context.puzzleProfile?.context).toContain("difficulty");
    });

    it("should provide actionable context string for AI", async () => {
      // Create some history
      await testPrisma.knowledgeNode.create({
        data: {
          userId: testUser.id,
          type: "PUZZLE",
          label: "p1",
          data: { id: "p1", puzzleType: "cipher", attempts: 1, solved: true },
        },
      });

      const context = await buildDirectorContext({ userId: testUser.id });
      const puzzleContext = context.puzzleProfile?.context || "";

      // Context should be human/AI readable
      expect(puzzleContext).toContain("Best puzzle type:");
      expect(puzzleContext).toContain("Recommended difficulty:");

      // Should mention strengths or weaknesses if applicable
      console.log(`[E2E] Director puzzle context:\n${puzzleContext}`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle puzzle with no solution gracefully", async () => {
      const openPuzzle: AICreatedPuzzle = {
        id: "e2e-open-puzzle",
        name: "Open Ended Puzzle",
        type: "meta",
        // No solution - creative/open puzzle
        hints: ["There's no wrong answer"],
        difficulty: 3,
        experimentId: "exp-open",
      };

      const result = await aiCreatePuzzle(testSession.id, testUser.id, openPuzzle);
      expect(result.success).toBe(true);

      // Attempting to check should handle missing solution
      const checkResult = await aiCheckPuzzleSolution(
        testSession.id,
        testUser.id,
        openPuzzle.id,
        "any answer"
      );

      // Should fail gracefully or accept any answer
      console.log(`[E2E] Open puzzle check: ${checkResult.message}`);
    });

    it("should handle rapid successive solves", async () => {
      // Create 3 puzzles
      const puzzles: AICreatedPuzzle[] = [
        { id: "rapid-1", name: "Rapid 1", type: "cipher", solution: "A", hints: [], difficulty: 1, experimentId: "exp-rapid" },
        { id: "rapid-2", name: "Rapid 2", type: "world", solution: "B", hints: [], difficulty: 1, experimentId: "exp-rapid" },
        { id: "rapid-3", name: "Rapid 3", type: "cipher", solution: "C", hints: [], difficulty: 1, experimentId: "exp-rapid" },
      ];

      for (const p of puzzles) {
        await aiCreatePuzzle(testSession.id, testUser.id, p);
      }

      // Solve all rapidly
      const results = await Promise.all(
        puzzles.map(p => aiCheckPuzzleSolution(testSession.id, testUser.id, p.id, p.solution!))
      );

      // All should succeed
      expect(results.every(r => r.correct)).toBe(true);

      // Profile should reflect all solves
      const profile = await getPlayerPuzzleProfile(testUser.id);
      expect(profile.totalSolved).toBe(3);
    });

    it("should not double-reward solving same puzzle twice", async () => {
      const puzzle: AICreatedPuzzle = {
        id: "e2e-double",
        name: "Double Solve Test",
        type: "cipher",
        solution: "ONCE",
        hints: [],
        difficulty: 2,
        pointsReward: 100,
        experimentId: "exp-double",
      };

      await aiCreatePuzzle(testSession.id, testUser.id, puzzle);

      // Solve once
      const first = await aiCheckPuzzleSolution(testSession.id, testUser.id, puzzle.id, "ONCE");
      expect(first.correct).toBe(true);
      expect(first.pointsAwarded).toBe(100);
      expect(first.skillUpdate).toBeDefined(); // First solve updates skill

      // Try to solve again
      const second = await aiCheckPuzzleSolution(testSession.id, testUser.id, puzzle.id, "ONCE");

      // Should indicate already solved, no double points or skill update
      console.log(`[E2E] Second solve attempt: ${second.message}`);
      expect(second.correct).toBe(true);
      expect(second.message).toContain("Already solved");
      expect(second.pointsAwarded).toBeFalsy(); // No points on re-solve
      expect(second.skillUpdate).toBeUndefined(); // No skill update on re-solve
    });
  });
});
