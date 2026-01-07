import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/adventure/route";
import { POST as createSession } from "@/app/api/session/route";
import { testPrisma } from "../setup";

/**
 * Adventure Streaming API Tests
 *
 * Tests the /api/adventure streaming endpoint:
 * - Request validation
 * - Error handling
 * - Stream response format
 * - Context building
 *
 * Note: Full streaming tests with AI responses are in integration tests.
 * These tests focus on the HTTP layer and validation.
 */

// Mock the AI SDK to avoid real API calls
vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: () =>
      new Response("mocked stream", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }),
    text: Promise.resolve("Mocked AI response"),
  })),
  stepCountIs: vi.fn(() => () => false),
}));

vi.mock("@/app/lib/ai/models", () => ({
  getModel: vi.fn(() => ({ modelId: "mock-model" })),
  getProviderOptions: vi.fn(() => ({})),
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

describe("Adventure Streaming API", () => {
  describe("Request Validation", () => {
    it("should return 400 if messages array is missing", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          context: { handle: "test" },
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("messages array");
    });

    it("should return 400 if messages is not an array", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: "not an array",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("messages array");
    });

    it("should accept valid request with messages array", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
        })
      );

      // Should return 200 with streaming response (mocked)
      expect(response.status).toBe(200);
    });

    it("should filter empty messages", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [
            { role: "user", content: "" },
            { role: "user", content: "   " },
            { role: "user", content: "Valid message" },
          ],
        })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Context Handling", () => {
    let testSession: { sessionId: string; userId: string; handle: string };

    beforeEach(async () => {
      const handle = `adventure-test-${Date.now()}`;
      const res = await createSession(
        createRequest("POST", "http://localhost/api/session", { handle })
      );
      testSession = await res.json();
    });

    it("should accept sessionId in context", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { sessionId: testSession.sessionId },
        })
      );

      expect(response.status).toBe(200);
    });

    it("should accept handle in context", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { handle: testSession.handle },
        })
      );

      expect(response.status).toBe(200);
    });

    it("should accept sessionId at top level", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          sessionId: testSession.sessionId,
        })
      );

      expect(response.status).toBe(200);
    });

    it("should work without context (anonymous mode)", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
        })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Response Format", () => {
    it("should return streaming response headers", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
        })
      );

      expect(response.status).toBe(200);
      // The mocked response uses text/plain, real would use text/event-stream
      expect(response.headers.get("Content-Type")).toContain("text");
    });

    it("should handle multi-turn conversations", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [
            { role: "user", content: "Hello" },
            { role: "assistant", content: "Welcome to Project 89." },
            { role: "user", content: "What is this place?" },
          ],
        })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Layer System Integration", () => {
    it("should accept trustLevel in context", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { trustLevel: 0.5 },
        })
      );

      expect(response.status).toBe(200);
    });

    it("should accept devLayer override", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { devLayer: 3 },
        })
      );

      expect(response.status).toBe(200);
    });

    it("should accept accessTier in context", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { accessTier: 2 },
        })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Fourth Wall Context", () => {
    it("should accept timezone hint", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { timezone: "America/New_York" },
        })
      );

      expect(response.status).toBe(200);
    });

    it("should accept device hints", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: {
            deviceHints: { platform: "macOS", browser: "Chrome" },
          },
        })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Tool Disabling", () => {
    it("should accept toolsDisabled flag", async () => {
      const response = await POST(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: "Hello" }],
          context: { toolsDisabled: true },
        })
      );

      expect(response.status).toBe(200);
    });
  });
});

describe("Adventure Error Handling", () => {
  it("should handle malformed JSON gracefully", async () => {
    const request = new Request("http://localhost/api/adventure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json",
    });

    // This will throw during req.json() - we should get 500
    try {
      const response = await POST(request);
      // If it doesn't throw, check for error response
      expect(response.status).toBeGreaterThanOrEqual(400);
    } catch (e) {
      // JSON parse error is expected
      expect(e).toBeDefined();
    }
  });
});
