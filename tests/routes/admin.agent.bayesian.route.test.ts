import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/admin/agents/[id]/bayesian/route";
import {
  initializeExperimentHypothesis,
  recordExperimentObservation,
} from "@/app/lib/server/bayes/orchestrator";
import { createTestUser } from "../setup";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "project89";

function createRequest(method: string, url: string, authorized = false): Request {
  const headers = new Headers();
  if (authorized) {
    headers.set("x-admin-secret", ADMIN_SECRET);
  }

  return new Request(url, {
    method,
    headers,
  });
}

describe("Admin Agent Bayesian Route", () => {
  it("returns 401 when admin auth is missing", async () => {
    const user = await createTestUser("bayes-unauth");

    const response = await GET(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}/bayesian`),
      { params: Promise.resolve({ id: user.id }) },
    );

    expect(response.status).toBe(401);
  });

  it("returns 404 when agent is not found", async () => {
    const response = await GET(
      createRequest("GET", "http://localhost/api/admin/agents/missing/bayesian", true),
      { params: Promise.resolve({ id: "missing-agent-id" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Agent not found",
    });
  });

  it("returns bayesian snapshot payload for an agent", async () => {
    const user = await createTestUser("bayes-snapshot");
    const experimentId = `exp-${Date.now()}`;

    await initializeExperimentHypothesis({
      userId: user.id,
      experimentId,
      hypothesis: "Operative follows precise protocol under ambiguity",
      task: "Run a brief compliance probe and record result quality",
      title: "Compliance baseline",
      experimentType: "compliance",
    });

    await recordExperimentObservation({
      userId: user.id,
      experimentId,
      hypothesis: "Operative follows precise protocol under ambiguity",
      task: "Run a brief compliance probe and record result quality",
      title: "Compliance baseline",
      experimentType: "compliance",
      observation: "Followed each step, explained constraints, and preserved sequence under pressure.",
      result: "success",
      score: 0.82,
    });

    const response = await GET(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}/bayesian`, true),
      { params: Promise.resolve({ id: user.id }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agentId).toBe(user.id);
    expect(data.generatedAt).toBeTruthy();
    expect(data.stats.hypothesisCount).toBeGreaterThan(0);
    expect(Array.isArray(data.summaries)).toBe(true);
    expect(Array.isArray(data.queue)).toBe(true);
    expect(Array.isArray(data.history)).toBe(true);
    expect(data.summaries.some((summary: { id: string }) => summary.id === "global:agent_profile")).toBe(true);
  });
});
