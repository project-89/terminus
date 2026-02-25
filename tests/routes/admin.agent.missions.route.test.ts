import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/admin/agents/[id]/missions/route";
import { createTestUser, testPrisma } from "../setup";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "project89";

function createRequest(
  method: string,
  url: string,
  authorized = false,
  body?: Record<string, unknown>,
): Request {
  const headers = new Headers();
  if (authorized) {
    headers.set("x-admin-secret", ADMIN_SECRET);
  }
  if (body) {
    headers.set("content-type", "application/json");
  }

  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("Admin Agent Missions Route", () => {
  it("returns 401 when admin auth is missing", async () => {
    const user = await createTestUser("admin-agent-missions-auth");

    const response = await GET(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}/missions`),
      { params: Promise.resolve({ id: user.id }) },
    );

    expect(response.status).toBe(401);
  });

  it("returns available templates for assignment", async () => {
    const user = await createTestUser("admin-agent-missions-templates");
    const definition = await testPrisma.missionDefinition.create({
      data: {
        title: `Template visibility ${Date.now()}`,
        prompt: "Validate template visibility in agent assignment modal.",
        type: "observe",
        minEvidence: 2,
        tags: ["test", "visibility"],
        active: true,
      },
    });

    const response = await GET(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}/missions`, true),
      { params: Promise.resolve({ id: user.id }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.availableTemplates)).toBe(true);
    expect(
      data.availableTemplates.some((template: { id: string }) => template.id === definition.id),
    ).toBe(true);
  });

  it("enforces one active mission run per agent when assigning templates", async () => {
    const user = await createTestUser("admin-agent-missions-single-active");
    const definition = await testPrisma.missionDefinition.create({
      data: {
        title: `Single active invariant ${Date.now()}`,
        prompt: "Ensure admin assignment enforces single active mission.",
        type: "decode",
        minEvidence: 1,
        tags: ["test", "single-active"],
        active: true,
      },
    });

    const firstAssign = await POST(
      createRequest("POST", `http://localhost/api/admin/agents/${user.id}/missions`, true, {
        action: "assign_template",
        templateId: definition.id,
        createMissionRun: true,
      }),
      { params: Promise.resolve({ id: user.id }) },
    );
    const firstData = await firstAssign.json();

    expect(firstAssign.status).toBe(200);
    expect(firstData.success).toBe(true);
    expect(firstData.missionRun?.status).toBe("ACCEPTED");

    const secondAssign = await POST(
      createRequest("POST", `http://localhost/api/admin/agents/${user.id}/missions`, true, {
        action: "assign_template",
        templateId: definition.id,
        createMissionRun: true,
      }),
      { params: Promise.resolve({ id: user.id }) },
    );
    const secondData = await secondAssign.json();

    expect(secondAssign.status).toBe(409);
    expect(String(secondData.error || "")).toContain("active mission");

    const activeRuns = await testPrisma.missionRun.count({
      where: {
        userId: user.id,
        status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] },
      },
    });
    expect(activeRuns).toBe(1);
  });

  it("scopes ad-hoc admin-created mission definitions to the target agent", async () => {
    const user = await createTestUser("admin-agent-missions-scoped");

    const response = await POST(
      createRequest("POST", `http://localhost/api/admin/agents/${user.id}/missions`, true, {
        action: "assign",
        title: `Scoped mission ${Date.now()}`,
        briefing: "This mission should only be visible to one target agent.",
        type: "observe",
        priority: 4,
        createMissionRun: true,
      }),
      { params: Promise.resolve({ id: user.id }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const definitionId = data?.mission?.definitionId;
    expect(definitionId).toBeTruthy();

    const definition = await testPrisma.missionDefinition.findUnique({
      where: { id: definitionId },
      select: { tags: true },
    });

    expect(Array.isArray(definition?.tags)).toBe(true);
    expect(definition?.tags || []).toContain("scope:agent");
    expect(definition?.tags || []).toContain(`target-user:${user.id}`);
  });
});
