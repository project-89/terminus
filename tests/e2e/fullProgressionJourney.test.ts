import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as createSession } from "@/app/api/session/route";
import { POST as acceptMissionRoute, DELETE as abandonMissionRoute } from "@/app/api/mission/route";
import { POST as submitReportRoute } from "@/app/api/report/route";
import { GET as adminAgentRoute } from "@/app/api/admin/agents/[id]/route";
import { GET as adminDashboardRoute } from "@/app/api/admin/dashboard/route";
import { GET as adminBayesianRoute } from "@/app/api/admin/agents/[id]/bayesian/route";
import { getExperimentDirective } from "@/app/lib/server/experimentScheduler";
import {
  aiCreateObject,
  aiCreateRoom,
  aiModifyState,
  getSessionWorld,
} from "@/app/lib/server/worldGraphService";
import { evolveTrust, getLayerTools, getTrustState } from "@/app/lib/server/trustService";
import { getBayesianSnapshot } from "@/app/lib/server/bayes/orchestrator";
import { testPrisma } from "../setup";

vi.mock("@/app/lib/ai/models", () => ({
  getModel: vi.fn(() => ({ modelId: "mock-model" })),
}));

vi.mock("ai", () => ({
  generateObject: vi.fn(async () => ({
    object: {
      score: 0.92,
      feedback: "Signal confirmed. Evidence is clean and actionable.",
      rewardAdjustment: 1.2,
    },
  })),
}));

const ADMIN_SECRET = process.env.ADMIN_SECRET || "project89";

function createRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  admin = false,
): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (admin) {
    headers.set("x-admin-secret", ADMIN_SECRET);
  }
  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function createBackdatedJourneyUser(daysAgo = 120) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const id = `test-user-journey-${unique}`;
  const handle = `test-journey-${unique}`;
  const agentId = `TJ${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return testPrisma.user.create({
    data: {
      id,
      handle,
      agentId,
      createdAt,
    },
  });
}

afterEach(async () => {
  vi.restoreAllMocks();
  const missionDefs = await testPrisma.missionDefinition.findMany({
    where: {
      title: {
        startsWith: "TEST-JOURNEY-",
      },
    },
    select: { id: true },
  });
  const missionIds = missionDefs.map((mission) => mission.id);
  if (missionIds.length > 0) {
    await testPrisma.reward.deleteMany({
      where: { missionRun: { missionId: { in: missionIds } } },
    });
    await testPrisma.missionRun.deleteMany({
      where: { missionId: { in: missionIds } },
    });
    await testPrisma.missionDefinition.deleteMany({
      where: { id: { in: missionIds } },
    });
  }
});

describe("Full Progression Journey (Deterministic)", () => {
  it("tracks trust, experiments, world state, missions, and admin control surfaces end to end", async () => {
    const user = await createBackdatedJourneyUser();

    let sessionId = "";
    for (let i = 0; i < 3; i += 1) {
      const sessionRes = await createSession(
        createRequest("POST", "http://localhost/api/session", {
          userId: user.id,
          reset: true,
        }),
      );
      expect(sessionRes.status).toBe(200);
      const sessionData = await sessionRes.json();
      sessionId = sessionData.sessionId;
    }
    expect(sessionId).toBeTruthy();

    const earlyTrust = await getTrustState(user.id);
    expect(earlyTrust.layer).toBe(0);

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    const directive = await getExperimentDirective(user.id, [
      "I keep noticing repeating numbers and symbol echoes.",
    ]);
    randomSpy.mockRestore();

    expect(directive).not.toBeNull();
    expect(directive?.experimentId).toBeTruthy();
    expect(directive?.requiredTools).toContain("experiment_create");
    expect(directive?.requiredTools).toContain("experiment_note");

    const suffix = Date.now().toString(36);
    const roomName = `Probe Chamber ${suffix}`;
    const objectName = `Signal Anchor ${suffix}`;
    const flagKey = `exp:${directive!.experimentId}:world_probe`;

    const roomResult = await aiCreateRoom(sessionId, user.id, {
      id: `probe-room-${suffix}`,
      name: roomName,
      description: "A deterministic calibration chamber assembled for experiment telemetry.",
      region: "liminal",
    });
    expect(roomResult.success).toBe(true);

    const objectResult = await aiCreateObject(sessionId, user.id, {
      id: `signal-anchor-${suffix}`,
      name: objectName,
      description: "A fixed anchor point for measuring player interaction patterns.",
      location: roomName,
      takeable: false,
    });
    expect(objectResult.success).toBe(true);

    const stateResult = await aiModifyState(sessionId, user.id, {
      type: "set_flag",
      target: flagKey,
      value: true,
      reason: `Experiment ${directive!.experimentId} deterministic world mutation`,
    });
    expect(stateResult.success).toBe(true);

    const world = await getSessionWorld(sessionId);
    expect(world.rooms.some((room) => room.name === roomName)).toBe(true);
    expect(world.objects.some((obj) => obj.name === objectName && obj.location === roomName)).toBe(true);
    const worldFlags = ((world as any).flags || {}) as Record<string, unknown>;
    expect(worldFlags[flagKey]).toBe(true);

    await evolveTrust(user.id, 0.65, "integration:layer-progression");
    const elevatedTrust = await getTrustState(user.id);
    expect(elevatedTrust.layer).toBeGreaterThanOrEqual(3);

    const layer0Tools = await getLayerTools(0);
    const layer3Tools = await getLayerTools(3);
    expect(layer0Tools).not.toContain("mission_request");
    expect(layer3Tools).toContain("mission_request");

    const missionDefinition = await testPrisma.missionDefinition.create({
      data: {
        title: `TEST-JOURNEY-${suffix}`,
        prompt: "Collect and submit the deterministic calibration signature.",
        type: "decode",
        minEvidence: 1,
        tags: ["test-journey", "integration"],
        active: true,
      },
    });

    const acceptRes = await acceptMissionRoute(
      createRequest("POST", "http://localhost/api/mission", {
        sessionId,
        missionId: missionDefinition.id,
      }),
    );
    expect(acceptRes.status).toBe(200);
    const acceptData = await acceptRes.json();
    const missionRunId = acceptData.missionRun?.id as string;
    expect(missionRunId).toBeTruthy();
    expect(acceptData.missionRun?.status).toBe("ACCEPTED");

    const abandonRes = await abandonMissionRoute(
      createRequest("DELETE", "http://localhost/api/mission", {
        sessionId,
        missionRunId,
        reason: "Deterministic integration journey teardown",
      }),
    );
    expect(abandonRes.status).toBe(200);
    const abandonData = await abandonRes.json();
    expect(abandonData.success).toBe(true);
    expect(abandonData.mission?.status).toBe("FAILED");

    const [sessionCount, missionCount, experimentCount] = await Promise.all([
      testPrisma.gameSession.count({ where: { userId: user.id } }),
      testPrisma.missionRun.count({ where: { userId: user.id } }),
      testPrisma.experiment.count({ where: { userId: user.id } }),
    ]);

    expect(sessionCount).toBeGreaterThanOrEqual(3);
    expect(missionCount).toBe(1);
    expect(experimentCount).toBeGreaterThanOrEqual(1);

    const adminAgentRes = await adminAgentRoute(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}`, undefined, true),
      { params: Promise.resolve({ id: user.id }) },
    );
    expect(adminAgentRes.status).toBe(200);
    const adminAgentData = await adminAgentRes.json();
    expect(adminAgentData.id).toBe(user.id);
    expect(adminAgentData.stats.totalSessions).toBe(sessionCount);
    expect(adminAgentData.stats.totalMissions).toBe(missionCount);
    expect(adminAgentData.experiments.length).toBe(experimentCount);
    expect(adminAgentData.missionHistory.some((m: { id: string }) => m.id === missionRunId)).toBe(true);

    const serviceSnapshot = await getBayesianSnapshot(user.id);
    const adminBayesianRes = await adminBayesianRoute(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}/bayesian`, undefined, true),
      { params: Promise.resolve({ id: user.id }) },
    );
    expect(adminBayesianRes.status).toBe(200);
    const adminBayesianData = await adminBayesianRes.json();
    expect(adminBayesianData.agentId).toBe(user.id);
    expect(adminBayesianData.stats.hypothesisCount).toBeGreaterThan(0);
    expect(adminBayesianData.summaries.some((s: { id: string }) => s.id === "global:agent_profile")).toBe(true);
    expect(Object.keys(adminBayesianData.globalTraits).length).toBeGreaterThan(0);
    expect(adminBayesianData.stats.hypothesisCount).toBeLessThanOrEqual(serviceSnapshot.summaries.length);

    const dashboardRes = await adminDashboardRoute(
      createRequest("GET", "http://localhost/api/admin/dashboard", undefined, true),
    );
    expect(dashboardRes.status).toBe(200);
    const dashboardData = await dashboardRes.json();
    expect(dashboardData.stats.totalAgents).toBeGreaterThan(0);
    expect(dashboardData.stats.activeMissions).toBeGreaterThanOrEqual(0);
    expect(dashboardData.stats.completedMissions).toBeGreaterThanOrEqual(0);
  });

  it("completes a mission via report with deterministic evaluation and updates trust/rewards/dashboard", async () => {
    const user = await createBackdatedJourneyUser();

    const sessionRes = await createSession(
      createRequest("POST", "http://localhost/api/session", {
        userId: user.id,
        reset: true,
      }),
    );
    expect(sessionRes.status).toBe(200);
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.sessionId as string;
    expect(sessionId).toBeTruthy();

    await evolveTrust(user.id, 0.7, "integration:mission-success-path");
    const trustBefore = await getTrustState(user.id);
    expect(trustBefore.layer).toBeGreaterThanOrEqual(3);

    const suffix = Date.now().toString(36);
    const missionDefinition = await testPrisma.missionDefinition.create({
      data: {
        title: `TEST-JOURNEY-SUCCESS-${suffix}`,
        prompt: "Capture and submit a deterministic operational signature from the field.",
        type: "decode",
        minEvidence: 1,
        tags: ["test-journey", "integration", "success"],
        active: true,
      },
    });

    const acceptRes = await acceptMissionRoute(
      createRequest("POST", "http://localhost/api/mission", {
        sessionId,
        missionId: missionDefinition.id,
      }),
    );
    expect(acceptRes.status).toBe(200);
    const acceptData = await acceptRes.json();
    const missionRunId = acceptData.missionRun?.id as string;
    expect(missionRunId).toBeTruthy();
    expect(acceptData.missionRun?.status).toBe("ACCEPTED");

    const reportContent =
      "Field log 04:15 UTC. I traced three repeating signal bands, captured ordered intervals, " +
      "validated correlation against prior anomaly windows, and confirmed a stable decode path. " +
      "Attached method notes: source isolation, timestamp alignment, checksum comparison, and final signature verification.";

    const reportRes = await submitReportRoute(
      createRequest("POST", "http://localhost/api/report", {
        sessionId,
        missionRunId,
        content: reportContent,
      }),
    );
    expect(reportRes.status).toBe(200);
    const reportData = await reportRes.json();
    expect(reportData.id).toBe(missionRunId);
    expect(reportData.status).toBe("COMPLETED");
    expect(reportData.score).toBeCloseTo(0.92, 3);
    expect(reportData.reward?.amount).toBeGreaterThan(0);

    const dbRun = await testPrisma.missionRun.findUnique({
      where: { id: missionRunId },
    });
    expect(dbRun).not.toBeNull();
    expect(dbRun?.status).toBe("COMPLETED");
    expect(dbRun?.score).toBeCloseTo(0.92, 3);
    expect(dbRun?.payload).toBe(reportContent);

    const rewards = await testPrisma.reward.findMany({
      where: { missionRunId },
      orderBy: { createdAt: "asc" },
    });
    expect(rewards.length).toBeGreaterThan(0);
    expect(rewards[0].type).toBe("LOGOS_AWARD");
    expect(rewards[0].amount).toBeGreaterThan(0);

    const userAfterReward = await testPrisma.user.findUnique({
      where: { id: user.id },
      select: { referralPoints: true },
    });
    expect((userAfterReward?.referralPoints || 0)).toBeGreaterThan(0);

    const trustAfter = await getTrustState(user.id);
    expect(trustAfter.trustScore).toBeGreaterThan(trustBefore.trustScore);

    const bayes = await getBayesianSnapshot(user.id);
    const missionSummary = bayes.summaries.find((summary) => summary.id === "mission:type:decode");
    expect(missionSummary).toBeDefined();
    expect((missionSummary?.evidenceCount || 0)).toBeGreaterThan(0);

    const adminAgentRes = await adminAgentRoute(
      createRequest("GET", `http://localhost/api/admin/agents/${user.id}`, undefined, true),
      { params: Promise.resolve({ id: user.id }) },
    );
    expect(adminAgentRes.status).toBe(200);
    const adminAgentData = await adminAgentRes.json();
    expect(adminAgentData.stats.totalMissions).toBe(1);
    expect(adminAgentData.stats.completedMissions).toBe(1);
    expect(adminAgentData.stats.totalRewards).toBeGreaterThan(0);
    expect(adminAgentData.missionHistory.some((m: { id: string; status: string }) => m.id === missionRunId && m.status === "COMPLETED")).toBe(true);

    const dashboardRes = await adminDashboardRoute(
      createRequest("GET", "http://localhost/api/admin/dashboard", undefined, true),
    );
    expect(dashboardRes.status).toBe(200);
    const dashboardData = await dashboardRes.json();
    expect(dashboardData.stats.completedMissions).toBeGreaterThanOrEqual(1);
  });
});
