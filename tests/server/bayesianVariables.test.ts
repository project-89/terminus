import { describe, it, expect } from "vitest";
import {
  initializePosterior,
  summarizePosterior,
  updatePosterior,
} from "@/app/lib/server/bayes/variables";
import type { BayesianVariableDefinition } from "@/app/lib/server/bayes/types";

describe("Bayesian variable updates", () => {
  it("updates binary beta posterior", () => {
    const def: BayesianVariableDefinition = {
      id: "success",
      label: "Success",
      type: "binary",
      priorAlpha: 1,
      priorBeta: 1,
    };

    let posterior = initializePosterior(def);
    posterior = updatePosterior(def, posterior, { value: true });
    posterior = updatePosterior(def, posterior, { value: false });
    posterior = updatePosterior(def, posterior, { value: true });

    const summary = summarizePosterior(def.id, posterior);
    expect(summary.type).toBe("binary");
    expect(summary.sampleSize).toBeGreaterThan(2);
    expect(summary.estimate).toBeGreaterThan(0.5);
    expect(summary.uncertainty).toBeGreaterThanOrEqual(0);
  });

  it("updates continuous_01 beta posterior", () => {
    const def: BayesianVariableDefinition = {
      id: "quality",
      label: "Quality",
      type: "continuous_01",
    };

    let posterior = initializePosterior(def);
    posterior = updatePosterior(def, posterior, { value: 0.8 });
    posterior = updatePosterior(def, posterior, { value: 0.6 });

    const summary = summarizePosterior(def.id, posterior);
    expect(summary.type).toBe("continuous_01");
    expect(summary.estimate).toBeGreaterThan(0.5);
  });

  it("updates ordinal posterior with discrete bins", () => {
    const def: BayesianVariableDefinition = {
      id: "evidence_quality",
      label: "Evidence Quality",
      type: "ordinal_k",
      k: 5,
    };

    let posterior = initializePosterior(def);
    posterior = updatePosterior(def, posterior, { value: 4 });
    posterior = updatePosterior(def, posterior, { value: 3 });
    posterior = updatePosterior(def, posterior, { value: 4 });

    const summary = summarizePosterior(def.id, posterior);
    expect(summary.type).toBe("ordinal_k");
    expect(summary.estimate).toBeGreaterThan(0.6);
    expect(summary.distribution?.["4"]).toBeGreaterThan(summary.distribution?.["0"] || 0);
  });

  it("updates count posterior", () => {
    const def: BayesianVariableDefinition = {
      id: "evidence_count",
      label: "Evidence Count",
      type: "count",
      priorShape: 1,
      priorRate: 1,
    };

    let posterior = initializePosterior(def);
    posterior = updatePosterior(def, posterior, { value: 3, exposure: 1 });
    posterior = updatePosterior(def, posterior, { value: 5, exposure: 2 });

    const summary = summarizePosterior(def.id, posterior);
    expect(summary.type).toBe("count");
    expect(summary.estimate).toBeGreaterThan(1);
  });

  it("updates time_to_event posterior with event and censored observation", () => {
    const def: BayesianVariableDefinition = {
      id: "completion_time_s",
      label: "Completion Time",
      type: "time_to_event",
      priorShape: 1,
      priorRate: 60,
      unit: "seconds",
    };

    let posterior = initializePosterior(def);
    posterior = updatePosterior(def, posterior, { elapsed: 45 });
    posterior = updatePosterior(def, posterior, { elapsed: 120, censored: true });

    const summary = summarizePosterior(def.id, posterior);
    expect(summary.type).toBe("time_to_event");
    expect(summary.estimate).not.toBeNull();
    expect(summary.sampleSize).toBeGreaterThan(1);
  });

  it("updates categorical posterior and accepts unseen category", () => {
    const def: BayesianVariableDefinition = {
      id: "outcome_category",
      label: "Outcome",
      type: "categorical",
      categories: ["success", "failure", "abandoned"],
    };

    let posterior = initializePosterior(def);
    posterior = updatePosterior(def, posterior, { category: "success" });
    posterior = updatePosterior(def, posterior, { category: "success" });
    posterior = updatePosterior(def, posterior, { category: "unknown" });

    const summary = summarizePosterior(def.id, posterior);
    expect(summary.type).toBe("categorical");
    expect(summary.distribution?.success).toBeGreaterThan(0);
    expect(summary.distribution?.unknown).toBeGreaterThan(0);
  });

  it("updates latent trait gaussian posterior", () => {
    const def: BayesianVariableDefinition = {
      id: "reliability",
      label: "Reliability",
      type: "latent_trait",
      priorMean: 0.5,
      priorVariance: 0.25,
      measurementVariance: 0.1,
    };

    let posterior = initializePosterior(def);
    const before = summarizePosterior(def.id, posterior);
    posterior = updatePosterior(def, posterior, { value: 0.9 });
    const after = summarizePosterior(def.id, posterior);

    expect(after.type).toBe("latent_trait");
    expect(after.estimate).toBeGreaterThan(before.estimate || 0);
    expect(after.uncertainty).toBeLessThanOrEqual(before.uncertainty);
  });
});
