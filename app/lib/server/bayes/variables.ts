import {
  type BayesianObservation,
  type BayesianVariableDefinition,
  type BayesianVariablePosterior,
  type BayesianVariableSummary,
} from "./types";

const EPS = 1e-9;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function toWeight(defaultWeight: number | undefined, observationWeight: number | undefined) {
  const weight = typeof observationWeight === "number" ? observationWeight : defaultWeight ?? 1;
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
}

function entropy(probabilities: number[]) {
  let h = 0;
  for (const p of probabilities) {
    if (p <= 0) continue;
    h -= p * Math.log(p);
  }
  return h;
}

function normalizeCounts(counts: number[]) {
  const total = counts.reduce((sum, n) => sum + n, 0);
  if (total <= 0) {
    return counts.map(() => 1 / Math.max(1, counts.length));
  }
  return counts.map((n) => n / total);
}

function parseBinaryValue(value: BayesianObservation["value"]): number | null {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value >= 0.5 ? 1 : 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["success", "pass", "true", "yes", "1", "completed"].includes(normalized)) return 1;
    if (["failure", "fail", "false", "no", "0", "abandoned", "failed"].includes(normalized)) return 0;
  }
  return null;
}

function parseNumber(value: BayesianObservation["value"]): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseOrdinal(value: BayesianObservation["value"], k: number): number | null {
  const numeric = parseNumber(value);
  if (numeric === null) return null;
  return clamp(Math.round(numeric), 0, k - 1);
}

export function initializePosterior(definition: BayesianVariableDefinition): BayesianVariablePosterior {
  switch (definition.type) {
    case "binary": {
      const alpha = Math.max(EPS, definition.priorAlpha ?? 1);
      const beta = Math.max(EPS, definition.priorBeta ?? 1);
      return { kind: "binary", alpha, beta, n: 0 };
    }
    case "continuous_01": {
      const alpha = Math.max(EPS, definition.priorAlpha ?? 1);
      const beta = Math.max(EPS, definition.priorBeta ?? 1);
      return { kind: "continuous_01", alpha, beta, n: 0 };
    }
    case "ordinal_k": {
      const k = Math.max(2, Math.floor(definition.k || 2));
      const priorCounts = Array.isArray(definition.priorCounts) && definition.priorCounts.length === k
        ? definition.priorCounts.map((n) => Math.max(EPS, n))
        : Array.from({ length: k }, () => 1);
      return { kind: "ordinal_k", k, counts: priorCounts, n: 0 };
    }
    case "count": {
      const shape = Math.max(EPS, definition.priorShape ?? 1);
      const rate = Math.max(EPS, definition.priorRate ?? 1);
      return { kind: "count", shape, rate, exposure: 0, n: 0 };
    }
    case "time_to_event": {
      const shape = Math.max(EPS, definition.priorShape ?? 1);
      const rate = Math.max(EPS, definition.priorRate ?? 1);
      return {
        kind: "time_to_event",
        shape,
        rate,
        totalTime: 0,
        unit: definition.unit ?? "seconds",
        n: 0,
      };
    }
    case "categorical": {
      const categories = Array.from(new Set(definition.categories));
      const counts = Array.isArray(definition.priorCounts) && definition.priorCounts.length === categories.length
        ? definition.priorCounts.map((n) => Math.max(EPS, n))
        : Array.from({ length: categories.length }, () => 1);
      return {
        kind: "categorical",
        categories,
        counts,
        n: 0,
      };
    }
    case "latent_trait": {
      return {
        kind: "latent_trait",
        mean: clamp01(definition.priorMean ?? 0.5),
        variance: Math.max(EPS, definition.priorVariance ?? 0.25),
        measurementVariance: Math.max(EPS, definition.measurementVariance ?? 0.05),
        n: 0,
      };
    }
    default:
      return { kind: "binary", alpha: 1, beta: 1, n: 0 };
  }
}

export function updatePosterior(
  definition: BayesianVariableDefinition,
  posterior: BayesianVariablePosterior,
  observation: BayesianObservation,
): BayesianVariablePosterior {
  const weight = toWeight(definition.weight, observation.weight);

  switch (definition.type) {
    case "binary": {
      if (posterior.kind !== "binary") return posterior;
      const result = parseBinaryValue(observation.value);
      if (result === null) return posterior;
      return {
        ...posterior,
        alpha: posterior.alpha + result * weight,
        beta: posterior.beta + (1 - result) * weight,
        n: posterior.n + weight,
      };
    }

    case "continuous_01": {
      if (posterior.kind !== "continuous_01") return posterior;
      const value = parseNumber(observation.value);
      if (value === null) return posterior;
      const x = clamp01(value);
      return {
        ...posterior,
        alpha: posterior.alpha + x * weight,
        beta: posterior.beta + (1 - x) * weight,
        n: posterior.n + weight,
      };
    }

    case "ordinal_k": {
      if (posterior.kind !== "ordinal_k") return posterior;
      const index = parseOrdinal(observation.value, posterior.k);
      if (index === null) return posterior;
      const counts = [...posterior.counts];
      counts[index] += weight;
      return {
        ...posterior,
        counts,
        n: posterior.n + weight,
      };
    }

    case "count": {
      if (posterior.kind !== "count") return posterior;
      const countValue = parseNumber(observation.value);
      if (countValue === null) return posterior;
      const exposure = Math.max(EPS, observation.exposure ?? 1);
      const count = Math.max(0, countValue);
      return {
        ...posterior,
        shape: posterior.shape + count * weight,
        rate: posterior.rate + exposure * weight,
        exposure: posterior.exposure + exposure * weight,
        n: posterior.n + weight,
      };
    }

    case "time_to_event": {
      if (posterior.kind !== "time_to_event") return posterior;
      const elapsedCandidate = typeof observation.elapsed === "number" ? observation.elapsed : parseNumber(observation.value);
      if (elapsedCandidate === null) return posterior;
      const elapsed = Math.max(EPS, elapsedCandidate);
      const censored = Boolean(observation.censored);
      return {
        ...posterior,
        shape: posterior.shape + (censored ? 0 : weight),
        rate: posterior.rate + elapsed * weight,
        totalTime: posterior.totalTime + elapsed * weight,
        n: posterior.n + weight,
      };
    }

    case "categorical": {
      if (posterior.kind !== "categorical") return posterior;
      const raw = observation.category ?? (typeof observation.value === "string" ? observation.value : null);
      if (!raw) return posterior;
      const category = raw.trim().toLowerCase();
      const categories = [...posterior.categories];
      const counts = [...posterior.counts];

      let idx = categories.indexOf(category);
      if (idx === -1) {
        categories.push(category);
        counts.push(EPS);
        idx = categories.length - 1;
      }
      counts[idx] += weight;

      return {
        ...posterior,
        categories,
        counts,
        n: posterior.n + weight,
      };
    }

    case "latent_trait": {
      if (posterior.kind !== "latent_trait") return posterior;
      const value = parseNumber(observation.value);
      if (value === null) return posterior;

      const measured = clamp01(value);
      const priorVariance = Math.max(EPS, posterior.variance);
      const measurementVariance = Math.max(
        EPS,
        observation.measurementVariance ?? posterior.measurementVariance,
      );
      const effectiveMeasurementVariance = Math.max(EPS, measurementVariance / weight);

      const posteriorVariance = 1 / ((1 / priorVariance) + (1 / effectiveMeasurementVariance));
      const posteriorMean = posteriorVariance * (
        (posterior.mean / priorVariance) +
        (measured / effectiveMeasurementVariance)
      );

      return {
        ...posterior,
        mean: clamp01(posteriorMean),
        variance: Math.max(EPS, posteriorVariance),
        measurementVariance,
        n: posterior.n + weight,
      };
    }

    default:
      return posterior;
  }
}

export function summarizePosterior(
  variableId: string,
  posterior: BayesianVariablePosterior,
): BayesianVariableSummary {
  switch (posterior.kind) {
    case "binary": {
      const total = posterior.alpha + posterior.beta;
      const mean = posterior.alpha / total;
      const variance = (posterior.alpha * posterior.beta) / (total * total * (total + 1));
      const uncertainty = clamp01(Math.sqrt(Math.max(0, variance)) / 0.5);
      return {
        variableId,
        type: "binary",
        estimate: mean,
        uncertainty,
        sampleSize: posterior.n,
      };
    }

    case "continuous_01": {
      const total = posterior.alpha + posterior.beta;
      const mean = posterior.alpha / total;
      const variance = (posterior.alpha * posterior.beta) / (total * total * (total + 1));
      const uncertainty = clamp01(Math.sqrt(Math.max(0, variance)) / 0.5);
      return {
        variableId,
        type: "continuous_01",
        estimate: mean,
        uncertainty,
        sampleSize: posterior.n,
      };
    }

    case "ordinal_k": {
      const probs = normalizeCounts(posterior.counts);
      const denom = Math.max(1, posterior.k - 1);
      const mean = probs.reduce((acc, p, idx) => acc + p * (idx / denom), 0);
      const normEntropy = posterior.k > 1
        ? clamp01(entropy(probs) / Math.log(posterior.k))
        : 0;
      return {
        variableId,
        type: "ordinal_k",
        estimate: mean,
        uncertainty: normEntropy,
        sampleSize: posterior.n,
        distribution: Object.fromEntries(probs.map((p, idx) => [`${idx}`, Number(p.toFixed(4))])),
      };
    }

    case "count": {
      const expectedRate = posterior.shape / Math.max(EPS, posterior.rate);
      const uncertainty = clamp01(1 / Math.sqrt(Math.max(EPS, posterior.shape)));
      return {
        variableId,
        type: "count",
        estimate: expectedRate,
        uncertainty,
        sampleSize: posterior.n,
      };
    }

    case "time_to_event": {
      const expectedLambda = posterior.shape / Math.max(EPS, posterior.rate);
      const expectedTime = expectedLambda > EPS ? 1 / expectedLambda : null;
      const uncertainty = clamp01(1 / Math.sqrt(Math.max(EPS, posterior.shape)));
      return {
        variableId,
        type: "time_to_event",
        estimate: expectedTime,
        uncertainty,
        sampleSize: posterior.n,
      };
    }

    case "categorical": {
      const probs = normalizeCounts(posterior.counts);
      const normEntropy = posterior.categories.length > 1
        ? clamp01(entropy(probs) / Math.log(posterior.categories.length))
        : 0;
      const maxProb = probs.length ? Math.max(...probs) : 0;
      return {
        variableId,
        type: "categorical",
        estimate: maxProb,
        uncertainty: normEntropy,
        sampleSize: posterior.n,
        distribution: Object.fromEntries(
          posterior.categories.map((cat, idx) => [cat, Number((probs[idx] ?? 0).toFixed(4))]),
        ),
      };
    }

    case "latent_trait": {
      const uncertainty = clamp01(Math.sqrt(Math.max(EPS, posterior.variance)) / 0.5);
      return {
        variableId,
        type: "latent_trait",
        estimate: clamp01(posterior.mean),
        uncertainty,
        sampleSize: posterior.n,
      };
    }

    default:
      return {
        variableId,
        type: "binary",
        estimate: null,
        uncertainty: 1,
        sampleSize: 0,
      };
  }
}

export function scoreFromSummary(summary: BayesianVariableSummary): number | null {
  if (summary.estimate === null || !Number.isFinite(summary.estimate)) return null;

  switch (summary.type) {
    case "binary":
    case "continuous_01":
    case "ordinal_k":
    case "latent_trait":
      return clamp01(summary.estimate);
    case "categorical":
      return clamp01(summary.estimate);
    default:
      return null;
  }
}
