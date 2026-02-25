import { describe, it, expect } from "vitest";
import { createTestUser } from "../setup";
import {
  appendExperimentNote,
  createExperiment,
  resolveExperiment,
} from "@/app/lib/server/experimentService";
import { getBayesianSnapshot } from "@/app/lib/server/bayes/orchestrator";

describe("Bayesian service integration", () => {
  it("updates bayesian state through experimentService lifecycle", async () => {
    const user = await createTestUser("test-bayes-integration");

    const experiment = await createExperiment({
      userId: user.id,
      hypothesis: "Player detects hidden pattern under subtle pressure",
      task: "Embed pattern in two turns and observe recognition",
      success_criteria: "Mentions pattern unprompted",
      title: "Pattern Detection Probe",
    });

    expect(experiment).toBeTruthy();

    await appendExperimentNote({
      userId: user.id,
      id: experiment!.id,
      observation: "Player explicitly noticed repeating capital letters.",
      result: "success",
      score: 0.82,
    });

    await resolveExperiment({
      userId: user.id,
      experimentId: experiment!.id,
      status: "RESOLVED_SUCCESS",
      finalScore: 0.88,
      resolution: "Pattern detection confirmed.",
    });

    const snapshot = await getBayesianSnapshot(user.id);
    const expSummary = snapshot.summaries.find((s) => s.id === `experiment:${experiment!.id}`);

    expect(expSummary).toBeTruthy();
    expect(expSummary?.status).toBe("resolved");
    expect(expSummary?.successProbability).toBeGreaterThan(0.5);
  });
});
