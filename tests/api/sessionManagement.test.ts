import { describe, it, expect, beforeEach } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import {
  resetSession,
  getActiveSessionByHandle,
  getSessionById,
  appendMessage,
  closeSession,
  getSessionContext,
} from "@/app/lib/server/sessionService";

/**
 * Session Management Tests
 *
 * Tests the session lifecycle:
 * 1. Session creation/reset
 * 2. Session retrieval
 * 3. Message appending
 * 4. Session closure
 * 5. Session context (engagement metrics)
 */

describe("Session Management", () => {
  describe("resetSession", () => {
    it("should create a new session for a user", async () => {
      const user = await createTestUser("session-create");

      const session = await resetSession(user.handle!);

      expect(session.id).toBeTruthy();
      expect(session.userId).toBe(user.id);
      expect(session.handle).toBe(user.handle);
      expect(session.status).toBe("OPEN");
    });

    it("should close previous session when creating new one", async () => {
      const user = await createTestUser("session-reset");

      // Create first session
      const session1 = await resetSession(user.handle!);
      expect(session1.status).toBe("OPEN");

      // Create second session (should close first)
      const session2 = await resetSession(user.handle!);
      expect(session2.id).not.toBe(session1.id);
      expect(session2.status).toBe("OPEN");

      // Verify first session is closed
      const oldSession = await getSessionById(session1.id);
      expect(oldSession?.status).toBe("CLOSED");
    });

    it("should create user if handle not found", async () => {
      const uniqueHandle = `new-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const session = await resetSession(uniqueHandle);

      expect(session.id).toBeTruthy();
      expect(session.handle).toBe(uniqueHandle);
      expect(session.userId).toBeTruthy();
    });
  });

  describe("getActiveSessionByHandle", () => {
    it("should return active session for handle", async () => {
      const user = await createTestUser("active-session");
      const created = await resetSession(user.handle!);

      const retrieved = await getActiveSessionByHandle(user.handle!);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.status).toBe("OPEN");
    });

    it("should return null for handle with no active session", async () => {
      const user = await createTestUser("no-active-session");

      const session = await getActiveSessionByHandle(user.handle!);

      expect(session).toBeNull();
    });

    it("should return null for closed sessions", async () => {
      const user = await createTestUser("closed-session");
      const created = await resetSession(user.handle!);
      await closeSession(created.id);

      const session = await getActiveSessionByHandle(user.handle!);

      expect(session).toBeNull();
    });
  });

  describe("getSessionById", () => {
    it("should retrieve session by ID", async () => {
      const user = await createTestUser("session-by-id");
      const created = await resetSession(user.handle!);

      const retrieved = await getSessionById(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.userId).toBe(user.id);
    });

    it("should return null for non-existent session", async () => {
      const session = await getSessionById("non-existent-session-id");

      expect(session).toBeNull();
    });
  });

  describe("appendMessage", () => {
    it("should append message to session", async () => {
      const user = await createTestUser("append-msg");
      const session = await resetSession(user.handle!);

      await appendMessage({
        sessionId: session.id,
        role: "user",
        content: "Hello, world!",
      });

      // Verify message was saved
      const messages = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: session.id },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toBe("Hello, world!");
    });

    it("should maintain message order", async () => {
      const user = await createTestUser("msg-order");
      const session = await resetSession(user.handle!);

      await appendMessage({ sessionId: session.id, role: "user", content: "First" });
      await appendMessage({ sessionId: session.id, role: "assistant", content: "Second" });
      await appendMessage({ sessionId: session.id, role: "user", content: "Third" });

      const messages = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: session.id },
        orderBy: { order: "asc" },
      });

      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe("First");
      expect(messages[1].content).toBe("Second");
      expect(messages[2].content).toBe("Third");
    });
  });

  describe("closeSession", () => {
    it("should close session with status CLOSED", async () => {
      const user = await createTestUser("close-session");
      const session = await resetSession(user.handle!);

      await closeSession(session.id);

      const closed = await getSessionById(session.id);
      expect(closed?.status).toBe("CLOSED");
    });

    it("should store summary when provided", async () => {
      const user = await createTestUser("session-summary");
      const session = await resetSession(user.handle!);

      const summary = "User explored the void and discovered patterns.";
      await closeSession(session.id, summary);

      const closed = await getSessionById(session.id);
      expect(closed?.summary).toBe(summary);
    });
  });

  describe("getSessionContext", () => {
    it("should return session metrics for user", async () => {
      const user = await createTestUser("session-context");

      // Create a session with messages
      const session = await resetSession(user.handle!);
      await appendMessage({ sessionId: session.id, role: "user", content: "msg1" });
      await appendMessage({ sessionId: session.id, role: "assistant", content: "resp1" });
      await appendMessage({ sessionId: session.id, role: "user", content: "msg2" });

      const context = await getSessionContext(user.id);

      // SessionContext returns: sessionCount, totalEngagementMinutes, daysSinceFirstSession, daysSinceLastSession
      expect(context.sessionCount).toBeGreaterThanOrEqual(1);
      expect(context.totalEngagementMinutes).toBeGreaterThanOrEqual(0);
    });

    it("should return default metrics for new user", async () => {
      const user = await createTestUser("new-context");

      const context = await getSessionContext(user.id);

      // Default values when no sessions exist
      expect(context.sessionCount).toBe(1);
      expect(context.totalEngagementMinutes).toBe(0);
    });

    it("should track session count across multiple sessions", async () => {
      const user = await createTestUser("multi-session-context");

      // Session 1
      const session1 = await resetSession(user.handle!);
      await appendMessage({ sessionId: session1.id, role: "user", content: "s1m1" });
      await closeSession(session1.id);

      // Session 2
      const session2 = await resetSession(user.handle!);
      await appendMessage({ sessionId: session2.id, role: "user", content: "s2m1" });

      const context = await getSessionContext(user.id);

      // Should count both sessions
      expect(context.sessionCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Session Isolation", () => {
    it("should isolate sessions between users", async () => {
      const user1 = await createTestUser("session-user1");
      const user2 = await createTestUser("session-user2");

      const session1 = await resetSession(user1.handle!);
      const session2 = await resetSession(user2.handle!);

      expect(session1.id).not.toBe(session2.id);
      expect(session1.userId).not.toBe(session2.userId);

      // Messages should be isolated
      await appendMessage({ sessionId: session1.id, role: "user", content: "user1 msg" });
      await appendMessage({ sessionId: session2.id, role: "user", content: "user2 msg" });

      const messages1 = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: session1.id },
      });
      const messages2 = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: session2.id },
      });

      expect(messages1).toHaveLength(1);
      expect(messages2).toHaveLength(1);
      expect(messages1[0].content).toBe("user1 msg");
      expect(messages2[0].content).toBe("user2 msg");
    });
  });
});
