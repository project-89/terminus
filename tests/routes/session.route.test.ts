import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST, PATCH, PUT } from "@/app/api/session/route";
import { testPrisma, createTestUser } from "../setup";

/**
 * Session API Route Tests
 *
 * Tests the /api/session endpoint:
 * - POST: Create/reset session
 * - GET: Retrieve session by ID
 * - PATCH: Close session
 * - PUT: Sync messages
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

describe("Session API Routes", () => {
  describe("POST /api/session", () => {
    it("should create a new session with handle", async () => {
      const uniqueHandle = `session-handle-${Date.now()}`;
      const req = createRequest("POST", "http://localhost/api/session", {
        handle: uniqueHandle,
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBeTruthy();
      expect(data.userId).toBeTruthy();
      expect(data.handle).toBe(uniqueHandle);
    });

    it("should reset session and close previous one", async () => {
      const handle = `reset-test-${Date.now()}`;

      // Create first session
      const res1 = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const session1 = await res1.json();

      // Create second session with explicit reset=true (should close first)
      const res2 = await POST(
        createRequest("POST", "http://localhost/api/session", { handle, reset: true })
      );
      const session2 = await res2.json();

      expect(session2.sessionId).not.toBe(session1.sessionId);

      // Check first session is closed
      const oldSession = await testPrisma.gameSession.findUnique({
        where: { id: session1.sessionId },
      });
      expect(oldSession?.status).toBe("CLOSED");
    });

    it("should get existing session when reset=false", async () => {
      const handle = `no-reset-${Date.now()}`;

      // Create session
      const res1 = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const session1 = await res1.json();

      // Get without reset
      const res2 = await POST(
        createRequest("POST", "http://localhost/api/session", {
          handle,
          reset: false,
        })
      );
      const session2 = await res2.json();

      expect(session2.sessionId).toBe(session1.sessionId);
    });

    it("should return 404 when no active session and reset=false", async () => {
      const handle = `no-session-${Date.now()}`;

      const response = await POST(
        createRequest("POST", "http://localhost/api/session", {
          handle,
          reset: false,
        })
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("No active session");
    });
  });

  describe("GET /api/session", () => {
    it("should retrieve session by sessionId", async () => {
      const handle = `get-session-${Date.now()}`;
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const { sessionId } = await createRes.json();

      const getRes = await GET(
        createRequest("GET", `http://localhost/api/session?sessionId=${sessionId}`)
      );
      const data = await getRes.json();

      expect(getRes.status).toBe(200);
      expect(data.sessionId).toBe(sessionId);
      expect(data.handle).toBe(handle);
      expect(data.status).toBe("OPEN");
    });

    it("should return 400 without sessionId", async () => {
      const response = await GET(
        createRequest("GET", "http://localhost/api/session")
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("sessionId required");
    });

    it("should return 404 for non-existent session", async () => {
      const response = await GET(
        createRequest("GET", "http://localhost/api/session?sessionId=fake-id")
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  describe("PATCH /api/session", () => {
    it("should close session", async () => {
      const handle = `close-session-${Date.now()}`;
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const { sessionId } = await createRes.json();

      const patchRes = await PATCH(
        createRequest("PATCH", "http://localhost/api/session", {
          sessionId,
        })
      );
      const data = await patchRes.json();

      expect(patchRes.status).toBe(200);
      expect(data.ok).toBe(true);

      // Verify session is closed
      const session = await testPrisma.gameSession.findUnique({
        where: { id: sessionId },
      });
      expect(session?.status).toBe("CLOSED");
    });

    it("should close session with summary", async () => {
      const handle = `summary-session-${Date.now()}`;
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const { sessionId } = await createRes.json();

      const summary = "Agent explored the void and found patterns.";
      await PATCH(
        createRequest("PATCH", "http://localhost/api/session", {
          sessionId,
          summary,
        })
      );

      const session = await testPrisma.gameSession.findUnique({
        where: { id: sessionId },
      });
      expect(session?.summary).toBe(summary);
    });

    it("should return 400 without sessionId", async () => {
      const response = await PATCH(
        createRequest("PATCH", "http://localhost/api/session", {})
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("sessionId required");
    });
  });

  describe("PUT /api/session", () => {
    it("should sync messages to session", async () => {
      const handle = `sync-messages-${Date.now()}`;
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const { sessionId } = await createRes.json();

      const messages = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Welcome, agent." },
        { role: "user", content: "What is this place?" },
      ];

      const putRes = await PUT(
        createRequest("PUT", "http://localhost/api/session", {
          sessionId,
          messages,
        })
      );
      const data = await putRes.json();

      expect(putRes.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.synced).toBe(3);
      expect(data.total).toBe(3);

      // Verify messages in database
      const dbMessages = await testPrisma.gameMessage.findMany({
        where: { gameSessionId: sessionId },
        orderBy: { order: "asc" },
      });
      expect(dbMessages).toHaveLength(3);
    });

    it("should only sync new messages", async () => {
      const handle = `incremental-sync-${Date.now()}`;
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const { sessionId } = await createRes.json();

      // First sync
      await PUT(
        createRequest("PUT", "http://localhost/api/session", {
          sessionId,
          messages: [{ role: "user", content: "First" }],
        })
      );

      // Second sync with more messages
      const putRes = await PUT(
        createRequest("PUT", "http://localhost/api/session", {
          sessionId,
          messages: [
            { role: "user", content: "First" },
            { role: "assistant", content: "Second" },
            { role: "user", content: "Third" },
          ],
        })
      );
      const data = await putRes.json();

      expect(data.synced).toBe(2); // Only new messages
      expect(data.total).toBe(3);
    });

    it("should handle empty messages array", async () => {
      const handle = `empty-sync-${Date.now()}`;
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      const { sessionId } = await createRes.json();

      const putRes = await PUT(
        createRequest("PUT", "http://localhost/api/session", {
          sessionId,
          messages: [],
        })
      );
      const data = await putRes.json();

      expect(putRes.status).toBe(200);
      expect(data.synced).toBe(0);
    });

    it("should return 400 without sessionId", async () => {
      const response = await PUT(
        createRequest("PUT", "http://localhost/api/session", {
          messages: [{ role: "user", content: "test" }],
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("sessionId required");
    });

    it("should return 404 for non-existent session", async () => {
      const response = await PUT(
        createRequest("PUT", "http://localhost/api/session", {
          sessionId: "fake-session-id",
          messages: [{ role: "user", content: "test" }],
        })
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });
});
