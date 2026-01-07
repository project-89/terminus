import { describe, it, expect, beforeEach } from "vitest";
import { testPrisma, createTestUser, createTestSession } from "../setup";

describe("Session API", () => {
  describe("User Creation", () => {
    it("should create a user with handle and agentId", async () => {
      const user = await createTestUser("test-session-user");

      expect(user.id).toBeTruthy();
      expect(user.handle).toMatch(/^test-session-user-/);
      expect(user.agentId).toBeTruthy();
      expect(user.agentId).toMatch(/^TST-/);
    });

    it("should generate unique agentIds for different users", async () => {
      const user1 = await createTestUser("test-user-1");
      const user2 = await createTestUser("test-user-2");

      expect(user1.agentId).not.toBe(user2.agentId);
    });
  });

  describe("Session Creation", () => {
    it("should create a session for a user", async () => {
      const user = await createTestUser("test-session-owner");
      const session = await createTestSession(user.id);

      expect(session.id).toBeTruthy();
      expect(session.userId).toBe(user.id);
      expect(session.token).toBeTruthy();
    });

    it("should allow multiple sessions for the same user", async () => {
      const user = await createTestUser("test-multi-session");

      const session1 = await createTestSession(user.id);
      const session2 = await createTestSession(user.id);

      expect(session1.id).not.toBe(session2.id);
      expect(session1.userId).toBe(session2.userId);
      expect(session1.token).not.toBe(session2.token);
    });
  });

  describe("Message Persistence", () => {
    it("should save messages to a game session", async () => {
      const user = await createTestUser(`test-msg-user-${Date.now()}`);
      const gameSession = await testPrisma.gameSession.create({
        data: {
          userId: user.id,
          status: "OPEN",
        },
      });

      // Create messages
      await testPrisma.gameMessage.createMany({
        data: [
          {
            gameSessionId: gameSession.id,
            role: "user",
            content: "look around",
            order: 0,
          },
          {
            gameSessionId: gameSession.id,
            role: "assistant",
            content: "You see nothing but the void.",
            order: 1,
          },
        ],
      });

      // Retrieve messages
      const messages = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: gameSession.id },
        orderBy: { order: "asc" },
      });

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toBe("look around");
      expect(messages[1].role).toBe("assistant");
      expect(messages[1].content).toBe("You see nothing but the void.");
    });

    it("should filter out empty messages", async () => {
      const user = await createTestUser(`test-empty-msg-${Date.now()}`);
      const gameSession = await testPrisma.gameSession.create({
        data: {
          userId: user.id,
          status: "OPEN",
        },
      });

      // Simulate the filtering behavior from Thread API
      const messages = [
        { role: "user", content: "hello" },
        { role: "user", content: "" }, // empty - should be filtered
        { role: "assistant", content: "Welcome!" },
        { role: "user", content: "   " }, // whitespace - should be filtered
      ];

      const validMessages = messages.filter(
        (msg) => msg.content && msg.content.trim().length > 0
      );

      await testPrisma.gameMessage.createMany({
        data: validMessages.map((msg, i) => ({
          gameSessionId: gameSession.id,
          role: msg.role,
          content: msg.content,
          order: i,
        })),
      });

      const saved = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: gameSession.id },
      });

      expect(saved).toHaveLength(2);
      expect(saved.every((m) => m.content.trim().length > 0)).toBe(true);
    });
  });
});
