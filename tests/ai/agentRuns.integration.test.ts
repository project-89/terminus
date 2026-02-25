import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateObject, streamText } from "ai";
import { POST as adventureRoute } from "@/app/api/adventure/route";
import { POST as createSessionRoute } from "@/app/api/session/route";
import { POST as acceptMissionRoute } from "@/app/api/mission/route";
import { POST as submitReportRoute } from "@/app/api/report/route";
import { GET as adminAgentRoute } from "@/app/api/admin/agents/[id]/route";
import { GET as adminBayesianRoute } from "@/app/api/admin/agents/[id]/bayesian/route";
import { GET as adminDashboardRoute } from "@/app/api/admin/dashboard/route";
import { evolveTrust, getTrustState } from "@/app/lib/server/trustService";
import { getSessionWorld } from "@/app/lib/server/worldGraphService";
import { getBayesianSnapshot } from "@/app/lib/server/bayes/orchestrator";
import { createTestUser, testPrisma } from "../setup";
import curiousPersonaJson from "../fixtures/personas/curious.json";
import skepticalPersonaJson from "../fixtures/personas/skeptical.json";
import methodicalPersonaJson from "../fixtures/personas/methodical.json";

vi.mock("@/app/lib/ai/models", () => ({
  getModel: vi.fn(() => ({ modelId: "mock-model" })),
  getProviderOptions: vi.fn(() => ({})),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
  stepCountIs: vi.fn(() => () => false),
  generateObject: vi.fn(),
}));

type PersonaFixture = {
  id: string;
  label: string;
  turns: string[];
  experiment: {
    hypothesis: string;
    task: string;
    successCriteria: string;
    observation: string;
    outcome: "success" | "failure" | "abandoned";
    score: number;
    resolution: string;
  };
  mission: {
    type: string;
    reportScore: number;
  };
};

type JourneyResult = {
  user: { id: string; handle: string; agentId: string };
  sessionId: string;
  scenarioId: string;
  experimentId: string;
  roomName: string;
  objectName: string;
  flagKey: string;
  successProbability: number;
  analyticalEstimate: number;
  referralPoints: number;
  expectedExperimentStatus: "RESOLVED_SUCCESS" | "RESOLVED_FAILURE" | "ABANDONED";
};

const ADMIN_SECRET = process.env.ADMIN_SECRET || "project89";
const personas: PersonaFixture[] = [
  curiousPersonaJson as PersonaFixture,
  skepticalPersonaJson as PersonaFixture,
  methodicalPersonaJson as PersonaFixture,
];
const personaById = new Map(personas.map((persona) => [persona.id, persona]));

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

function wait(ms = 25) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createScenarioId(personaId: string) {
  return `${personaId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function marker(personaId: string, scenarioId: string, turn: number) {
  return `[persona:${personaId};scenario:${scenarioId};turn:${turn}]`;
}

function parseMarkerFromMessages(messages: Array<{ role: string; content: string }>) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUser || typeof lastUser.content !== "string") return null;
  const match = lastUser.content.match(/\[persona:([a-z0-9_-]+);scenario:([a-z0-9_-]+);turn:(\d+)\]/i);
  if (!match) return null;

  return {
    personaId: match[1],
    scenarioId: match[2],
    turn: Number(match[3]),
  };
}

function expectedStatus(outcome: PersonaFixture["experiment"]["outcome"]) {
  if (outcome === "success") return "RESOLVED_SUCCESS";
  if (outcome === "failure") return "RESOLVED_FAILURE";
  return "ABANDONED";
}

async function createBackdatedUser(prefix: string, daysAgo = 120) {
  const user = await createTestUser(prefix);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return testPrisma.user.update({
    where: { id: user.id },
    data: { createdAt },
    select: {
      id: true,
      handle: true,
      agentId: true,
      createdAt: true,
    },
  });
}

async function createSession(userId: string) {
  const res = await createSessionRoute(
    createRequest("POST", "http://localhost/api/session", {
      userId,
      reset: true,
    }),
  );
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.sessionId).toBeTruthy();
  return data.sessionId as string;
}

beforeEach(() => {
  const streamTextMock = vi.mocked(streamText);
  const generateObjectMock = vi.mocked(generateObject);

  streamTextMock.mockImplementation((options: any) => {
    const textPromise = (async () => {
      const tools = (options?.tools || {}) as Record<string, { execute?: (args: any) => Promise<any> }>;
      const markerInfo = parseMarkerFromMessages(options?.messages || []);

      if (markerInfo) {
        const persona = personaById.get(markerInfo.personaId);
        if (persona) {
          const experimentId = `exp-${markerInfo.personaId}-${markerInfo.scenarioId}`;
          const roomName = `Probe Room ${markerInfo.personaId} ${markerInfo.scenarioId}`;
          const objectName = `Signal Anchor ${markerInfo.personaId} ${markerInfo.scenarioId}`;
          const flagKey = `exp:${experimentId}:world_probe`;

          const noteScore = Math.max(0, Math.min(1, persona.experiment.score - 0.1));
          const rewardAmount = Math.max(5, Math.round(persona.experiment.score * 30));

          const turnPlans: Record<number, Array<{ name: string; args: Record<string, unknown> }>> = {
            1: [
              {
                name: "experiment_create",
                args: {
                  id: experimentId,
                  hypothesis: persona.experiment.hypothesis,
                  task: persona.experiment.task,
                  success_criteria: persona.experiment.successCriteria,
                  title: `${persona.label} Probe`,
                  testPlan: {
                    setup: [
                      {
                        action: "create_room",
                        params: { name: roomName },
                        purpose: "Controlled observation arena.",
                      },
                    ],
                    triggers: [
                      {
                        condition: "player_observes_anomaly",
                        outcome: "engagement_signal",
                      },
                    ],
                    duration_turns: 3,
                  },
                },
              },
              {
                name: "world_create_room",
                args: {
                  experimentId,
                  id: `probe-room-${markerInfo.personaId}-${markerInfo.scenarioId}`,
                  name: roomName,
                  description: "A deterministic calibration room for persona-specific observation.",
                  region: "liminal",
                },
              },
              {
                name: "world_create_object",
                args: {
                  experimentId,
                  id: `signal-anchor-${markerInfo.personaId}-${markerInfo.scenarioId}`,
                  name: objectName,
                  description: "A fixed anchor object used to test attention and follow-through.",
                  location: roomName,
                  takeable: false,
                },
              },
            ],
            2: [
              {
                name: "experiment_note",
                args: {
                  id: experimentId,
                  observation: persona.experiment.observation,
                  result: persona.experiment.outcome === "success" ? "success" : "failure",
                  score: noteScore,
                },
              },
              {
                name: "world_modify_state",
                args: {
                  experimentId,
                  type: "set_flag",
                  target: flagKey,
                  value: true,
                  reason: `Turn-2 probe update for ${persona.id}`,
                },
              },
            ],
            3: [
              {
                name: "experiment_note",
                args: {
                  id: experimentId,
                  observation: `Final observation for ${persona.id}: ${persona.experiment.resolution}`,
                  result: persona.experiment.outcome,
                  score: persona.experiment.score,
                },
              },
              {
                name: "experiment_resolve",
                args: {
                  id: experimentId,
                  outcome: persona.experiment.outcome,
                  resolution: persona.experiment.resolution,
                  final_score: persona.experiment.score,
                },
              },
              {
                name: "award_points",
                args: {
                  amount: rewardAmount,
                  reason: `Agent-run reward for ${persona.id} trajectory`,
                  category: "insight",
                  silent: true,
                  experimentId,
                },
              },
            ],
          };

          const steps = turnPlans[markerInfo.turn] || [];
          for (const step of steps) {
            const tool = tools[step.name];
            if (!tool || typeof tool.execute !== "function") {
              throw new Error(`Missing executable tool in agent run: ${step.name}`);
            }
            const result = await tool.execute(step.args);
            if (result && typeof result === "object" && "success" in result && (result as any).success === false) {
              throw new Error(`${step.name} failed: ${(result as any).message || "unknown error"}`);
            }
          }
        }
      }

      return "Deterministic agent-run narrative emitted.";
    })();

    textPromise.then((text) => {
      if (typeof options?.onFinish === "function") {
        options.onFinish({ steps: [{ text }] });
      }
    });

    return {
      text: textPromise,
      toTextStreamResponse: () =>
        new Response("mocked stream", {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    } as any;
  });

  generateObjectMock.mockImplementation(async (args: any) => {
    const prompt = typeof args?.prompt === "string" ? args.prompt : "";
    const scoreMatch = prompt.match(/REPORT_SCORE:([0-9]*\.?[0-9]+)/i);
    const parsedScore = scoreMatch ? Number(scoreMatch[1]) : 0.82;
    const score = Math.max(0, Math.min(1, Number.isFinite(parsedScore) ? parsedScore : 0.82));

    return {
      object: {
        score,
        feedback: `Deterministic evaluator score ${score.toFixed(2)}.`,
        rewardAdjustment: 1.0,
      },
    };
  });
});

afterEach(async () => {
  vi.clearAllMocks();

  const missionDefs = await testPrisma.missionDefinition.findMany({
    where: {
      title: {
        startsWith: "TEST-AGENT-RUN-",
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

async function runPersonaJourney(persona: PersonaFixture): Promise<JourneyResult> {
  const user = await createBackdatedUser(`test-agent-run-${persona.id}`);
  const sessionId = await createSession(user.id);
  const scenarioId = createScenarioId(persona.id);
  const experimentId = `exp-${persona.id}-${scenarioId}`;
  const roomName = `Probe Room ${persona.id} ${scenarioId}`;
  const objectName = `Signal Anchor ${persona.id} ${scenarioId}`;
  const flagKey = `exp:${experimentId}:world_probe`;

  for (let turn = 1; turn <= persona.turns.length; turn += 1) {
    const response = await adventureRoute(
      createRequest("POST", "http://localhost/api/adventure", {
        messages: [
          {
            role: "user",
            content: `${marker(persona.id, scenarioId, turn)} ${persona.turns[turn - 1]}`,
          },
        ],
        context: {
          sessionId,
        },
      }),
    );
    expect(response.status).toBe(200);
    await wait(40);
  }

  const experiment = await testPrisma.experiment.findUnique({
    where: { id: experimentId },
    include: { events: true },
  });
  expect(experiment).not.toBeNull();
  expect(experiment?.status).toBe(expectedStatus(persona.experiment.outcome));
  expect((experiment?.events || []).length).toBeGreaterThanOrEqual(2);

  const world = await getSessionWorld(sessionId);
  expect(world.rooms.some((room) => room.name === roomName)).toBe(true);
  expect(world.objects.some((object) => object.name === objectName && object.location === roomName)).toBe(true);
  const worldFlags = ((world as any).flags || {}) as Record<string, unknown>;
  expect(worldFlags[flagKey]).toBe(true);

  const snapshot = await getBayesianSnapshot(user.id);
  const summary = snapshot.summaries.find((candidate) => candidate.id === `experiment:${experimentId}`);
  expect(summary).toBeDefined();
  expect((summary?.evidenceCount || 0)).toBeGreaterThan(0);
  expect(snapshot.queue.length).toBeGreaterThan(0);

  const successProbability = summary?.successProbability ?? 0;
  const analyticalEstimate = Number(
    ((snapshot.globalTraits as Record<string, { estimate?: number }>).analytical?.estimate ?? 0.5).toFixed(4),
  );
  const userLedger = await testPrisma.user.findUnique({
    where: { id: user.id },
    select: { referralPoints: true },
  });

  return {
    user: { id: user.id, handle: user.handle, agentId: user.agentId },
    sessionId,
    scenarioId,
    experimentId,
    roomName,
    objectName,
    flagKey,
    successProbability,
    analyticalEstimate,
    referralPoints: userLedger?.referralPoints || 0,
    expectedExperimentStatus: expectedStatus(persona.experiment.outcome),
  };
}

describe.sequential("AI Agent Runs", () => {
  it("executes multi-turn persona runs and produces divergent Bayesian posteriors", async () => {
    const curious = await runPersonaJourney(personas[0]);
    const skeptical = await runPersonaJourney(personas[1]);
    const methodical = await runPersonaJourney(personas[2]);

    expect(curious.successProbability).toBeGreaterThan(skeptical.successProbability);
    expect(methodical.successProbability).toBeGreaterThan(skeptical.successProbability);
    expect(curious.referralPoints).toBeGreaterThan(skeptical.referralPoints);
    expect(methodical.referralPoints).toBeGreaterThan(skeptical.referralPoints);
  });

  it("hands off from experiment runs to trust-gated mission flow with admin observability", async () => {
    const methodical = personas.find((persona) => persona.id === "methodical");
    if (!methodical) {
      throw new Error("Methodical fixture missing");
    }

    const journey = await runPersonaJourney(methodical);
    const trustBefore = await getTrustState(journey.user.id);
    expect(trustBefore.layer).toBe(0);

    await evolveTrust(journey.user.id, 0.72, "agent-run:mission-handoff");
    const trustAfter = await getTrustState(journey.user.id);
    expect(trustAfter.layer).toBeGreaterThanOrEqual(3);

    const missionDef = await testPrisma.missionDefinition.create({
      data: {
        title: `TEST-AGENT-RUN-${journey.scenarioId}`,
        prompt: "Collect deterministic evidence and submit a clear field report.",
        type: methodical.mission.type,
        minEvidence: 2,
        tags: ["test-agent-run", methodical.id],
        active: true,
      },
    });

    const acceptRes = await acceptMissionRoute(
      createRequest("POST", "http://localhost/api/mission", {
        sessionId: journey.sessionId,
        missionId: missionDef.id,
      }),
    );
    expect(acceptRes.status).toBe(200);
    const acceptData = await acceptRes.json();
    const missionRunId = acceptData.missionRun?.id as string;
    expect(missionRunId).toBeTruthy();
    expect(acceptData.missionRun?.status).toBe("ACCEPTED");

    const reportContent =
      `REPORT_SCORE:${methodical.mission.reportScore} ` +
      "I logged source observations, compared two controlled runs, aligned timestamps, validated pattern symmetry, " +
      "and produced a reproducible decode path with explicit evidence checkpoints and final verification notes.";

    const reportRes = await submitReportRoute(
      createRequest("POST", "http://localhost/api/report", {
        sessionId: journey.sessionId,
        missionRunId,
        content: reportContent,
      }),
    );
    expect(reportRes.status).toBe(200);
    const reportData = await reportRes.json();
    expect(reportData.id).toBe(missionRunId);
    expect(reportData.status).toBe("COMPLETED");
    expect(reportData.score).toBeCloseTo(methodical.mission.reportScore, 2);

    const snapshot = await getBayesianSnapshot(journey.user.id);
    const missionSummary = snapshot.summaries.find((summary) => summary.id === `mission:type:${methodical.mission.type}`);
    expect(missionSummary).toBeDefined();
    expect((missionSummary?.evidenceCount || 0)).toBeGreaterThan(0);

    const adminAgentRes = await adminAgentRoute(
      createRequest("GET", `http://localhost/api/admin/agents/${journey.user.id}`, undefined, true),
      { params: Promise.resolve({ id: journey.user.id }) },
    );
    expect(adminAgentRes.status).toBe(200);
    const adminAgentData = await adminAgentRes.json();
    expect(adminAgentData.id).toBe(journey.user.id);
    expect(adminAgentData.stats.totalMissions).toBe(1);
    expect(adminAgentData.stats.completedMissions).toBe(1);
    expect(adminAgentData.stats.totalSessions).toBeGreaterThanOrEqual(1);

    const adminBayesianRes = await adminBayesianRoute(
      createRequest("GET", `http://localhost/api/admin/agents/${journey.user.id}/bayesian`, undefined, true),
      { params: Promise.resolve({ id: journey.user.id }) },
    );
    expect(adminBayesianRes.status).toBe(200);
    const adminBayesianData = await adminBayesianRes.json();
    expect(adminBayesianData.agentId).toBe(journey.user.id);
    expect(adminBayesianData.summaries.some((summary: { id: string }) => summary.id === `experiment:${journey.experimentId}`)).toBe(true);
    expect(adminBayesianData.summaries.some((summary: { id: string }) => summary.id === `mission:type:${methodical.mission.type}`)).toBe(true);
    expect(adminBayesianData.stats.queueSize).toBeGreaterThan(0);

    const dashboardRes = await adminDashboardRoute(
      createRequest("GET", "http://localhost/api/admin/dashboard", undefined, true),
    );
    expect(dashboardRes.status).toBe(200);
    const dashboardData = await dashboardRes.json();
    expect(dashboardData.stats.totalAgents).toBeGreaterThan(0);
    expect(dashboardData.stats.completedMissions).toBeGreaterThanOrEqual(1);
  });
});
