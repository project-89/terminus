import { describe, it, expect } from "vitest";
import { createTestUser } from "../setup";
import {
  getAutonomousExperimentProposal,
  getBayesianSnapshot,
  getExperimentTypeExplorationBonus,
  initializeExperimentHypothesis,
  recordExperimentObservation,
  recordMissionBayesianOutcome,
  resolveExperimentHypothesis,
} from "@/app/lib/server/bayes/orchestrator";

describe("Bayesian orchestrator", () => {
  it("creates and resolves an experiment hypothesis across all variable types", async () => {
    const user = await createTestUser("test-bayes-orch-exp");
    const experimentId = `exp-orch-${Date.now()}`;

    await initializeExperimentHypothesis({
      userId: user.id,
      experimentId,
      hypothesis: "Subject follows protocol under urgency",
      task: "Give short timed directive and observe compliance",
      title: "Protocol Adherence Probe",
      experimentType: "compliance",
      successCriteria: "Responds within 2 turns and follows sequence",
    });

    await recordExperimentObservation({
      userId: user.id,
      experimentId,
      observation: "Player responded quickly and followed all three instructions in sequence.",
      result: "success",
      score: 0.86,
      experimentType: "compliance",
    });

    await resolveExperimentHypothesis({
      userId: user.id,
      experimentId,
      outcome: "success",
      finalScore: 0.9,
      resolution: "Consistent compliance observed under pressure.",
      experimentType: "compliance",
      createdAt: new Date(Date.now() - 60_000),
      resolvedAt: new Date(),
    });

    const snapshot = await getBayesianSnapshot(user.id);
    const expSummary = snapshot.summaries.find((s) => s.id === `experiment:${experimentId}`);

    expect(expSummary).toBeTruthy();
    expect(expSummary?.successProbability).toBeGreaterThan(0.5);

    const types = new Set(expSummary?.variables.map((v) => v.type));
    expect(types.has("binary")).toBe(true);
    expect(types.has("continuous_01")).toBe(true);
    expect(types.has("ordinal_k")).toBe(true);
    expect(types.has("count")).toBe(true);
    expect(types.has("time_to_event")).toBe(true);
    expect(types.has("categorical")).toBe(true);
    expect(types.has("latent_trait")).toBe(true);

    expect(snapshot.globalTraits.compliance).toBeTruthy();
  });

  it("tracks mission outcomes and updates autonomous queue", async () => {
    const user = await createTestUser("test-bayes-orch-mission");

    await recordMissionBayesianOutcome({
      userId: user.id,
      missionType: "social",
      missionRunId: `run-${Date.now()}`,
      status: "FAILED",
      score: 0.25,
      minEvidence: 2,
      payloadLength: 70,
      createdAt: new Date(Date.now() - 120_000),
      resolvedAt: new Date(),
    });

    const snapshot = await getBayesianSnapshot(user.id);
    const missionSummary = snapshot.summaries.find((s) => s.id === "mission:type:social");

    expect(missionSummary).toBeTruthy();
    expect(missionSummary?.successProbability).toBeLessThan(0.5);
    expect(snapshot.queue.length).toBeGreaterThan(0);

    const bonus = await getExperimentTypeExplorationBonus(user.id, "empathy");
    expect(bonus).toBeGreaterThanOrEqual(0);
    expect(bonus).toBeLessThanOrEqual(1);

    const proposal = await getAutonomousExperimentProposal(user.id, { missionFailureRate: 0.7 });
    expect(proposal).toBeTruthy();
  });
});
