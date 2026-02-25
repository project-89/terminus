import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as renderScene, GET as getRenderHistory } from "@/app/api/render/route";
import { POST as createSession } from "@/app/api/session/route";

vi.mock("@/app/lib/server/imageGenerationService", () => ({
  generateImageAsset: vi.fn(async () => ({
    buffer: Buffer.from("mock-image-data"),
    mimeType: "image/png",
    model: "gemini-3-pro-image-preview",
    resolution: "2K",
    referencesUsed: 2,
  })),
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

describe("Render API Route", () => {
  let testSession: { sessionId: string; userId: string; handle: string };

  beforeEach(async () => {
    const handle = `render-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const sessionRes = await createSession(
      createRequest("POST", "http://localhost/api/session", { handle })
    );
    testSession = await sessionRes.json();
  });

  it("returns 400 when sessionId is missing", async () => {
    const response = await renderScene(
      createRequest("POST", "http://localhost/api/render", {
        prompt: "show me the room",
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("sessionId");
  });

  it("returns 404 when session does not exist", async () => {
    const response = await renderScene(
      createRequest("POST", "http://localhost/api/render", {
        sessionId: "missing-session-id",
      })
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain("Session not found");
  });

  it("renders an image and returns metadata headers", async () => {
    const response = await renderScene(
      createRequest("POST", "http://localhost/api/render", {
        sessionId: testSession.sessionId,
        prompt: "focus on the old desk and window",
        preset: "matrix90s",
        mode: "modal",
        quality: "high",
        aspectRatio: "16:9",
        resolution: "2K",
        injectClue: true,
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("image/");
    expect(response.headers.get("X-Render-Id")).toBeTruthy();
    expect(response.headers.get("X-Render-Model")).toBe("gemini-3-pro-image-preview");
    expect(response.headers.get("X-Render-Room")).toBeTruthy();
    expect(response.headers.get("X-Render-Preset")).toBe("matrix90s");

    const bytes = await response.arrayBuffer();
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it("persists render history retrievable via GET", async () => {
    await renderScene(
      createRequest("POST", "http://localhost/api/render", {
        sessionId: testSession.sessionId,
        prompt: "wide shot of current room",
        mode: "modal",
      })
    );

    const response = await getRenderHistory(
      createRequest(
        "GET",
        `http://localhost/api/render?sessionId=${encodeURIComponent(testSession.sessionId)}&limit=5`
      )
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe(testSession.sessionId);
    expect(Array.isArray(data.renders)).toBe(true);
    expect(data.renders.length).toBeGreaterThan(0);
    expect(data.renders[0].mode).toBeTruthy();
    expect(data.renders[0].quality).toBeTruthy();
    expect(data.renders[0].preset).toBeTruthy();
  });
});
