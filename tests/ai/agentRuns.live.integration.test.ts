import { describe, expect, it } from "vitest";
import { POST as adventureRoute } from "@/app/api/adventure/route";
import { POST as createSessionRoute } from "@/app/api/session/route";
import { getBayesianSnapshot } from "@/app/lib/server/bayes/orchestrator";
import { getSessionWorld } from "@/app/lib/server/worldGraphService";
import { createTestUser, testPrisma } from "../setup";

const shouldRunLive =
  process.env.RUN_LIVE_AI_E2E === "true" &&
  process.env.SKIP_AI_TESTS !== "true" &&
  Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

function createRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Request {
  return new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe.skipIf(!shouldRunLive)("AI Agent Runs (Live LLM)", () => {
  it(
    "runs live text-adventure turns, plans an experiment, mutates world state, and updates Bayesian state",
    async () => {
      const user = await createTestUser("live-agent-run");

      const sessionRes = await createSessionRoute(
        createRequest("POST", "http://localhost/api/session", {
          userId: user.id,
          reset: true,
        }),
      );
      expect(sessionRes.status).toBe(200);
      const sessionData = await sessionRes.json();
      const sessionId = sessionData.sessionId as string;
      expect(sessionId).toBeTruthy();

      const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const experimentId = `exp-live-${suffix}`;
      const roomId = `live-room-${suffix}`;
      const roomName = `Live Probe Room ${suffix}`;
      const objectId = `live-anchor-${suffix}`;
      const objectName = `Live Signal Anchor ${suffix}`;
      const flagKey = `exp:${experimentId}:world_probe`;

      const turn1Directive = [
        "LIVE INTEGRATION TEST DIRECTIVE.",
        `Call covert tools now with this exact experiment id: ${experimentId}.`,
        `1) experiment_create(id=${experimentId}) with hypothesis/task/success criteria.`,
        `2) world_create_room(experimentId=${experimentId}, id=${roomId}, name=${roomName}, region=liminal).`,
        `3) world_create_object(experimentId=${experimentId}, id=${objectId}, name=${objectName}, location=${roomName}, takeable=false).`,
        "After tool calls, respond with one short narrative sentence.",
      ].join(" ");

      const turn1Res = await adventureRoute(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: turn1Directive }],
          context: { sessionId },
        }),
      );
      expect(turn1Res.status).toBe(200);
      await turn1Res.text();
      await wait(500);

      const turn2Directive = [
        "Continue the same active experiment.",
        `Use experiment_note for id=${experimentId}.`,
        "Observation: subject inspected optional paths and extracted coherent hidden structure.",
        "Result: success. Score: 0.84.",
        "Then continue narrative in one sentence.",
      ].join(" ");

      const turn2Res = await adventureRoute(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: turn2Directive }],
          context: { sessionId },
        }),
      );
      expect(turn2Res.status).toBe(200);
      await turn2Res.text();
      await wait(500);

      const turn3Directive = [
        "Resolve the active experiment now.",
        `Use experiment_resolve for id=${experimentId}.`,
        "Outcome: success. final_score: 0.88.",
        "Resolution: hypothesis confirmed with consistent exploratory behavior.",
        `Also set flag ${flagKey} true using world_modify_state tied to the same experiment id.`,
        "Then continue narrative in one sentence.",
      ].join(" ");

      const turn3Res = await adventureRoute(
        createRequest("POST", "http://localhost/api/adventure", {
          messages: [{ role: "user", content: turn3Directive }],
          context: { sessionId },
        }),
      );
      expect(turn3Res.status).toBe(200);
      await turn3Res.text();
      await wait(700);

      const experiment = await testPrisma.experiment.findUnique({
        where: { id: experimentId },
        include: { events: true },
      });
      expect(experiment).not.toBeNull();
      expect(experiment?.events.length || 0).toBeGreaterThan(0);
      expect(["ACTIVE", "RESOLVED_SUCCESS", "RESOLVED_FAILURE", "ABANDONED"]).toContain(experiment?.status);

      const world = await getSessionWorld(sessionId);
      const roomExists = world.rooms.some((room) => room.name === roomName);
      const objectExists = world.objects.some((obj) => obj.name === objectName && obj.location === roomName);
      const worldFlags = ((world as any).flags || {}) as Record<string, unknown>;
      const flagSet = worldFlags[flagKey] === true;

      expect(roomExists || objectExists || flagSet).toBe(true);

      const bayes = await getBayesianSnapshot(user.id);
      const experimentSummary = bayes.summaries.find((summary) => summary.id === `experiment:${experimentId}`);
      expect(experimentSummary).toBeDefined();
      expect((experimentSummary?.evidenceCount || 0)).toBeGreaterThan(0);
      expect(bayes.queue.length).toBeGreaterThan(0);
    },
    180000,
  );
});
