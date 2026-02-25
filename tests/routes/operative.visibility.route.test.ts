import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as getOperativeProfile } from "@/app/api/operative/profile/route";
import { POST as postOperativeMission } from "@/app/api/operative/missions/route";
import { createTestUser, testPrisma } from "../setup";
import { withAgentTargetTags } from "@/app/lib/server/missionVisibility";

async function enableOperativeDashboard(userId: string) {
  await testPrisma.playerProfile.upsert({
    where: { userId },
    update: { dashboardEnabled: true },
    create: { userId, dashboardEnabled: true },
  });
}

describe("Operative Mission Visibility", () => {
  it("hides missions scoped to other agents from operative profile availability", async () => {
    const viewer = await createTestUser("test-operative-visibility-viewer");
    const other = await createTestUser("test-operative-visibility-other");

    await enableOperativeDashboard(viewer.id);

    const globalMission = await testPrisma.missionDefinition.create({
      data: {
        title: `Global mission ${Date.now()}`,
        prompt: "Visible to all agents.",
        type: "decode",
        minEvidence: 1,
        tags: ["test", "global"],
        active: true,
      },
    });

    const hiddenMission = await testPrisma.missionDefinition.create({
      data: {
        title: `Hidden mission ${Date.now()}`,
        prompt: "Should be hidden from other agents.",
        type: "observe",
        minEvidence: 1,
        tags: withAgentTargetTags(["test", "scoped"], other.id),
        active: true,
      },
    });

    const visibleTargetedMission = await testPrisma.missionDefinition.create({
      data: {
        title: `Visible mission ${Date.now()}`,
        prompt: "Should be visible for the scoped agent.",
        type: "observe",
        minEvidence: 1,
        tags: withAgentTargetTags(["test", "scoped"], viewer.id),
        active: true,
      },
    });

    const response = await getOperativeProfile(
      new NextRequest(`http://localhost/api/operative/profile?userId=${viewer.id}`),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    const availableIds = (data.availableMissions || []).map((mission: { id: string }) => mission.id);
    expect(availableIds).toContain(globalMission.id);
    expect(availableIds).toContain(visibleTargetedMission.id);
    expect(availableIds).not.toContain(hiddenMission.id);
  });

  it("blocks accepting missions scoped to other agents", async () => {
    const viewer = await createTestUser("test-operative-accept-viewer");
    const other = await createTestUser("test-operative-accept-other");

    await enableOperativeDashboard(viewer.id);

    const hiddenMission = await testPrisma.missionDefinition.create({
      data: {
        title: `Restricted accept mission ${Date.now()}`,
        prompt: "Should not be accepted by another user.",
        type: "decode",
        minEvidence: 1,
        tags: withAgentTargetTags(["test", "restricted"], other.id),
        active: true,
      },
    });

    const deniedResponse = await postOperativeMission(
      new NextRequest("http://localhost/api/operative/missions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: viewer.id,
          missionId: hiddenMission.id,
          action: "accept",
        }),
      }),
    );
    const deniedData = await deniedResponse.json();

    expect(deniedResponse.status).toBe(403);
    expect(String(deniedData.error || "")).toContain("not available");

    const allowedMission = await testPrisma.missionDefinition.create({
      data: {
        title: `Allowed accept mission ${Date.now()}`,
        prompt: "Should be accepted by scoped user.",
        type: "decode",
        minEvidence: 1,
        tags: withAgentTargetTags(["test", "allowed"], viewer.id),
        active: true,
      },
    });

    const allowedResponse = await postOperativeMission(
      new NextRequest("http://localhost/api/operative/missions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: viewer.id,
          missionId: allowedMission.id,
          action: "accept",
        }),
      }),
    );
    const allowedData = await allowedResponse.json();

    expect(allowedResponse.status).toBe(200);
    expect(allowedData.success).toBe(true);
    expect(allowedData.mission?.id).toBeTruthy();
  });
});
