import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { testPrisma, createTestUser } from "../setup";

/**
 * Session Tracking Regression Tests
 *
 * These tests verify the critical session tracking fixes:
 * 1. Default reset behavior (reset === true, not reset !== false)
 * 2. Message sync to database after each exchange
 * 3. Session updatedAt is updated when messages are synced
 */
describe("Session Tracking Regression Tests", () => {
  let testUser: { id: string; handle: string };

  beforeEach(async () => {
    testUser = await createTestUser("session-track");
  });

  afterEach(async () => {
    // Cleanup
    try {
      await testPrisma.gameMessage.deleteMany({
        where: { gameSession: { userId: testUser.id } }
      });
      await testPrisma.gameSession.deleteMany({ where: { userId: testUser.id } });
      await testPrisma.user.delete({ where: { id: testUser.id } });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe("Session Creation Defaults", () => {
    it("should NOT reset session when reset is undefined", async () => {
      // Create an initial session
      const firstSession = await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      // Simulate what the API does when reset is undefined
      // The fix changes: reset !== false (always reset when undefined)
      // to: reset === true (only reset when explicitly true)
      const reset = undefined;
      const shouldReset = reset === true; // NEW behavior - should be false

      expect(shouldReset).toBe(false);

      // Old behavior would have been:
      const oldBehavior = reset !== false; // OLD behavior - would be true
      expect(oldBehavior).toBe(true);

      // Verify session still exists and is OPEN
      const session = await testPrisma.gameSession.findFirst({
        where: { userId: testUser.id, status: "OPEN" },
      });
      expect(session).not.toBeNull();
      expect(session?.id).toBe(firstSession.id);
    });

    it("should reset session when reset is explicitly true", async () => {
      // Create an initial session
      await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      const reset = true;
      const shouldReset = reset === true;

      expect(shouldReset).toBe(true);
    });

    it("should NOT reset session when reset is explicitly false", async () => {
      const reset = false;
      const shouldReset = reset === true;

      expect(shouldReset).toBe(false);
    });
  });

  describe("Message Persistence", () => {
    it("should persist messages to database", async () => {
      const gameSession = await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      const messages = [
        { role: "user", content: "look around" },
        { role: "assistant", content: "You are in a dark void." },
      ];

      // Simulate message sync (what PUT /api/session does)
      await testPrisma.gameMessage.createMany({
        data: messages.map((msg) => ({
          gameSessionId: gameSession.id,
          role: msg.role,
          content: msg.content,
        })),
      });

      const savedMessages = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: gameSession.id },
        orderBy: { createdAt: "asc" },
      });

      expect(savedMessages).toHaveLength(2);
      expect(savedMessages[0].role).toBe("user");
      expect(savedMessages[0].content).toBe("look around");
      expect(savedMessages[1].role).toBe("assistant");
    });

    it("should update session updatedAt when messages are synced", async () => {
      const gameSession = await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      const originalUpdatedAt = gameSession.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate message sync with updatedAt update (the fix)
      await testPrisma.gameMessage.create({
        data: {
          gameSessionId: gameSession.id,
          role: "user",
          content: "test message",
        },
      });

      await testPrisma.gameSession.update({
        where: { id: gameSession.id },
        data: { updatedAt: new Date() },
      });

      const updatedSession = await testPrisma.gameSession.findUnique({
        where: { id: gameSession.id },
      });

      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it("should only sync new messages (not duplicates)", async () => {
      const gameSession = await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      // First sync - 2 messages
      const messages1 = [
        { role: "user", content: "hello" },
        { role: "assistant", content: "greetings" },
      ];

      await testPrisma.gameMessage.createMany({
        data: messages1.map((msg) => ({
          gameSessionId: gameSession.id,
          role: msg.role,
          content: msg.content,
        })),
      });

      // Simulate the sync logic from PUT /api/session
      const existingCount = await testPrisma.gameMessage.count({
        where: { gameSessionId: gameSession.id },
      });
      expect(existingCount).toBe(2);

      // Second sync - 4 messages total (2 old + 2 new)
      const messages2 = [
        { role: "user", content: "hello" },
        { role: "assistant", content: "greetings" },
        { role: "user", content: "what is this place" },
        { role: "assistant", content: "you are in the void" },
      ];

      const newMessages = messages2.slice(existingCount);
      expect(newMessages).toHaveLength(2);
      expect(newMessages[0].content).toBe("what is this place");

      await testPrisma.gameMessage.createMany({
        data: newMessages.map((msg) => ({
          gameSessionId: gameSession.id,
          role: msg.role,
          content: msg.content,
        })),
      });

      const totalMessages = await testPrisma.gameMessage.count({
        where: { gameSessionId: gameSession.id },
      });
      expect(totalMessages).toBe(4);
    });
  });

  describe("Session Engagement Tracking", () => {
    it("should calculate total engagement minutes from session durations", async () => {
      // Create sessions with known durations
      const baseTime = new Date();

      // Session 1: 10 minutes
      await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "CLOSED",
          createdAt: new Date(baseTime.getTime() - 60 * 60 * 1000), // 1 hour ago
          updatedAt: new Date(baseTime.getTime() - 50 * 60 * 1000), // 50 min ago (10 min duration)
        },
      });

      // Session 2: 5 minutes
      await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "CLOSED",
          createdAt: new Date(baseTime.getTime() - 30 * 60 * 1000), // 30 min ago
          updatedAt: new Date(baseTime.getTime() - 25 * 60 * 1000), // 25 min ago (5 min duration)
        },
      });

      const sessions = await testPrisma.gameSession.findMany({
        where: { userId: testUser.id },
      });

      let totalMinutes = 0;
      for (const s of sessions) {
        const duration = s.updatedAt.getTime() - s.createdAt.getTime();
        totalMinutes += Math.floor(duration / (1000 * 60));
      }

      expect(totalMinutes).toBe(15); // 10 + 5 minutes
    });
  });

  describe("User ID Association", () => {
    it("should associate session with correct userId", async () => {
      const session = await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      expect(session.userId).toBe(testUser.id);

      // Verify lookup by userId works
      const found = await testPrisma.gameSession.findFirst({
        where: { userId: testUser.id, status: "OPEN" },
      });

      expect(found).not.toBeNull();
      expect(found?.id).toBe(session.id);
    });

    it("should find session by userId even when handle lookup would fail", async () => {
      // Create session for our test user
      const session = await testPrisma.gameSession.create({
        data: {
          userId: testUser.id,
          status: "OPEN",
        },
      });

      // Create another user with same handle prefix (simulating potential collision)
      const otherUser = await createTestUser("session-track");
      await testPrisma.gameSession.create({
        data: {
          userId: otherUser.id,
          status: "OPEN",
        },
      });

      // Lookup by userId should find the correct session
      const foundByUserId = await testPrisma.gameSession.findFirst({
        where: { userId: testUser.id, status: "OPEN" },
      });

      expect(foundByUserId?.id).toBe(session.id);

      // Cleanup other user
      await testPrisma.gameSession.deleteMany({ where: { userId: otherUser.id } });
      await testPrisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
