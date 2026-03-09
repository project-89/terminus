import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/admin/agents/[id]/route";
import { createTestUser, testPrisma } from "../setup";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "project89";

function createRequest(url: string, authorized = false): Request {
  const headers = new Headers();
  if (authorized) {
    headers.set("x-admin-secret", ADMIN_SECRET);
  }

  return new Request(url, {
    method: "GET",
    headers,
  });
}

describe("Admin Agent Route", () => {
  it("returns effective trust state alongside raw trust context", async () => {
    const user = await createTestUser("admin-agent-trust-state");

    await testPrisma.playerProfile.create({
      data: {
        userId: user.id,
        trustScore: 0.8,
        layer: 1,
        lastActiveAt: new Date(),
      },
    });

    const response = await GET(
      createRequest(`http://localhost/api/admin/agents/${user.id}`, true),
      { params: Promise.resolve({ id: user.id }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(user.id);
    expect(data.rawTrustScore).toBeCloseTo(0.8, 5);
    expect(data.layer).toBe(1);
    expect(data.trustScore).toBeLessThan(0.25);
    expect(data.trustScore).toBeGreaterThanOrEqual(0.1);
    expect(data.decayedTrustScore).toBeCloseTo(0.8, 5);
  });
});
