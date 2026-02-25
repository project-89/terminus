import {
  applyObservations,
  ensureHypothesis,
  proposeAutonomousHypotheses,
  resolveHypothesis,
  scoreForAutonomousExploration,
  summarizeState,
  updateAutonomousQueue,
} from "./engine";
import { loadBayesianState, updateBayesianState } from "./store";
import type {
  AutonomousContext,
  AutonomousHypothesisProposal,
  BayesianHypothesisDefinition,
  BayesianHypothesisSummary,
  BayesianObservation,
  BayesianVariableDefinition,
} from "./types";

const GLOBAL_PROFILE_ID = "global:agent_profile";

const EXPERIMENT_TYPE_TO_TRAIT: Record<string, string> = {
  compliance: "compliance",
  creativity: "creativity",
  empathy: "empathy",
  perception: "analytical",
  cryptography: "analytical",
};

const MISSION_TYPE_TO_TRAIT: Record<string, string> = {
  decode: "analytical",
  cipher: "analytical",
  puzzle: "analytical",
  analysis: "analytical",
  observe: "curiosity",
  surveillance: "analytical",
  pattern: "analytical",
  audio: "analytical",
  create: "creativity",
  compose: "creativity",
  design: "creativity",
  memetic: "creativity",
  field: "reliability",
  retrieve: "reliability",
  deploy: "reliability",
  social: "empathy",
  empathy: "empathy",
};

const TRAIT_KEYWORDS: Record<string, string[]> = {
  compliance: ["compliance", "protocol", "instruction", "authority", "follow"],
  curiosity: ["curious", "explore", "discover", "wonder", "question"],
  persistence: ["persist", "retry", "stuck", "resilien", "pressure"],
  creativity: ["creative", "novel", "imagin", "symbol", "memetic"],
  empathy: ["empathy", "care", "moral", "kind", "compassion", "social"],
  analytical: ["logic", "pattern", "cipher", "decode", "analy"],
  stress_tolerance: ["stress", "urgency", "time", "pressure", "panic"],
  reliability: ["return", "consisten", "routine", "mission", "complete"],
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function nowIso() {
  return new Date().toISOString();
}

function wordCount(text?: string) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeType(type?: string) {
  return (type || "perception").trim().toLowerCase();
}

function normalizeOutcome(outcome?: string) {
  const normalized = (outcome || "unknown").trim().toLowerCase();
  if (["success", "pass", "completed", "complete"].includes(normalized)) return "success";
  if (["failure", "failed", "fail"].includes(normalized)) return "failure";
  if (["abandoned", "cancelled", "canceled"].includes(normalized)) return "abandoned";
  return "unknown";
}

function scoreToOrdinal(score?: number) {
  if (typeof score !== "number" || Number.isNaN(score)) return 2;
  return Math.max(0, Math.min(4, Math.round(clamp01(score) * 4)));
}

function inferTraitFromText(input: string, fallback = "reliability") {
  const lower = input.toLowerCase();
  let best: { trait: string; score: number } = { trait: fallback, score: 0 };

  for (const [trait, keywords] of Object.entries(TRAIT_KEYWORDS)) {
    const score = keywords.reduce((sum, keyword) => sum + (lower.includes(keyword) ? 1 : 0), 0);
    if (score > best.score) {
      best = { trait, score };
    }
  }

  return best.trait;
}

function comprehensiveVariables(targetTrait: string): BayesianVariableDefinition[] {
  return [
    { id: "success", label: "Hypothesis success", type: "binary", priorAlpha: 1, priorBeta: 1 },
    { id: "score", label: "Outcome quality", type: "continuous_01", priorAlpha: 1, priorBeta: 1 },
    { id: "evidence_quality", label: "Evidence quality", type: "ordinal_k", k: 5 },
    { id: "observation_volume", label: "Observation volume", type: "count", priorShape: 1, priorRate: 1 },
    {
      id: "completion_time_s",
      label: "Completion time (seconds)",
      type: "time_to_event",
      priorShape: 1,
      priorRate: 60,
      unit: "seconds",
    },
    {
      id: "outcome_category",
      label: "Outcome category",
      type: "categorical",
      categories: ["success", "failure", "abandoned", "unknown"],
    },
    {
      id: "target_trait",
      label: `${targetTrait} signal`,
      type: "latent_trait",
      priorMean: 0.5,
      priorVariance: 0.25,
      measurementVariance: 0.08,
    },
  ];
}

function globalProfileDefinition(): BayesianHypothesisDefinition {
  const variables: BayesianVariableDefinition[] = [
    "compliance",
    "curiosity",
    "persistence",
    "creativity",
    "empathy",
    "analytical",
    "stress_tolerance",
    "reliability",
  ].map((trait) => ({
    id: trait,
    label: `${trait.replaceAll("_", " ")} trait`,
    type: "latent_trait",
    priorMean: 0.5,
    priorVariance: 0.25,
    measurementVariance: 0.1,
  }));

  return {
    id: GLOBAL_PROFILE_ID,
    title: "Global Agent Profile",
    description: "Long-lived latent trait model for autonomous mission and experiment planning.",
    source: "system",
    kind: "global_profile",
    variables,
    tags: ["bayesian", "profile"],
  };
}

function experimentDefinition(params: {
  experimentId: string;
  hypothesis?: string;
  task?: string;
  title?: string;
  experimentType?: string;
}) {
  const combined = `${params.title || ""} ${params.hypothesis || ""} ${params.task || ""}`.trim();
  const type = normalizeType(params.experimentType);
  const trait = EXPERIMENT_TYPE_TO_TRAIT[type] || inferTraitFromText(combined, "reliability");

  return {
    definition: {
      id: `experiment:${params.experimentId}`,
      title: params.title || `Experiment ${params.experimentId}`,
      description: params.hypothesis || "Experiment performance model",
      source: "experiment" as const,
      kind: `experiment:${type}`,
      variables: comprehensiveVariables(trait),
      tags: ["experiment", type, trait],
    },
    trait,
    type,
  };
}

function missionDefinition(params: { missionType: string }): {
  definition: BayesianHypothesisDefinition;
  trait: string;
  normalizedType: string;
} {
  const normalizedType = normalizeType(params.missionType || "decode");
  const trait = MISSION_TYPE_TO_TRAIT[normalizedType] || "reliability";
  const variables: BayesianVariableDefinition[] = [
    { id: "success", label: "Mission success", type: "binary", priorAlpha: 1, priorBeta: 1 },
    { id: "score", label: "Mission score", type: "continuous_01", priorAlpha: 1, priorBeta: 1 },
    { id: "evidence_quality", label: "Evidence quality", type: "ordinal_k", k: 5 },
    { id: "observation_volume", label: "Evidence count", type: "count", priorShape: 1, priorRate: 1 },
    {
      id: "completion_time_s",
      label: "Mission completion time",
      type: "time_to_event",
      priorShape: 1,
      priorRate: 180,
      unit: "seconds",
    },
    {
      id: "outcome_category",
      label: "Mission outcome category",
      type: "categorical",
      categories: ["completed", "failed", "abandoned", "accepted"],
    },
    {
      id: "target_trait",
      label: `${trait} mission trait signal`,
      type: "latent_trait",
      priorMean: 0.5,
      priorVariance: 0.25,
      measurementVariance: 0.08,
    },
  ];

  return {
    definition: {
      id: `mission:type:${normalizedType}`,
      title: `Mission Model: ${normalizedType}`,
      description: `Outcome model for ${normalizedType} missions`,
      source: "mission" as const,
      kind: `mission:${normalizedType}`,
      variables,
      tags: ["mission", normalizedType, trait],
    },
    trait,
    normalizedType,
  };
}

function buildAutonomyContextFromSummaries(summaries: BayesianHypothesisSummary[]): AutonomousContext {
  const missionSummaries = summaries.filter((summary) => summary.source === "mission");
  const missionSuccessScores = missionSummaries
    .map((summary) => summary.successProbability)
    .filter((score): score is number => typeof score === "number");

  const missionFailureRate = missionSuccessScores.length
    ? 1 - (missionSuccessScores.reduce((sum, score) => sum + score, 0) / missionSuccessScores.length)
    : 0;

  const averageMissionScore = missionSuccessScores.length
    ? missionSuccessScores.reduce((sum, score) => sum + score, 0) / missionSuccessScores.length
    : undefined;

  return {
    missionFailureRate,
    averageMissionScore,
  };
}

function refreshAutonomousQueue(state: any, additionalContext?: AutonomousContext) {
  const summaries = summarizeState(state);
  const derived = buildAutonomyContextFromSummaries(summaries);
  const merged: AutonomousContext = {
    ...derived,
    ...(additionalContext || {}),
  };
  const proposals = proposeAutonomousHypotheses(state, merged, nowIso());
  updateAutonomousQueue({ state, proposals, at: nowIso() });
}

export async function initializeExperimentHypothesis(params: {
  userId: string;
  experimentId: string;
  hypothesis: string;
  task: string;
  successCriteria?: string;
  title?: string;
  experimentType?: string;
}) {
  await updateBayesianState({
    userId: params.userId,
    mutate: (state) => {
      const at = nowIso();
      const profile = globalProfileDefinition();
      ensureHypothesis(state, profile, at);

      const { definition, trait } = experimentDefinition({
        experimentId: params.experimentId,
        hypothesis: params.hypothesis,
        task: params.task,
        title: params.title,
        experimentType: params.experimentType,
      });

      ensureHypothesis(state, definition, at);

      // Seed initial uncertainty note as unknown outcome.
      applyObservations({
        state,
        definition,
        at,
        observations: [{
          variableId: "outcome_category",
          observation: { category: "unknown", weight: 0.5 },
          summary: "experiment_initialized",
        }],
      });

      // Light prior update on target trait to indicate active probing.
      applyObservations({
        state,
        definition: profile,
        at,
        observations: [{
          variableId: trait,
          observation: { value: 0.5, measurementVariance: 0.2, weight: 0.5 },
          summary: `trait_probe_started:${trait}`,
        }],
      });

      refreshAutonomousQueue(state);
      return true;
    },
  });
}

export async function recordExperimentObservation(params: {
  userId: string;
  experimentId: string;
  observation?: string;
  result?: string;
  score?: number;
  hypothesis?: string;
  task?: string;
  title?: string;
  experimentType?: string;
}) {
  await updateBayesianState({
    userId: params.userId,
    mutate: (state) => {
      const at = nowIso();
      const profile = globalProfileDefinition();
      ensureHypothesis(state, profile, at);

      const { definition, trait } = experimentDefinition({
        experimentId: params.experimentId,
        hypothesis: params.hypothesis,
        task: params.task,
        title: params.title,
        experimentType: params.experimentType,
      });

      ensureHypothesis(state, definition, at);

      const observationWords = wordCount(params.observation);
      const score = typeof params.score === "number" ? clamp01(params.score) : undefined;
      const qualityOrdinal = scoreToOrdinal(
        typeof score === "number"
          ? score
          : observationWords >= 40
            ? 0.8
            : observationWords >= 20
              ? 0.6
              : observationWords >= 10
                ? 0.4
                : 0.25,
      );

      const outcomeCategory = normalizeOutcome(params.result);

      const updates: Array<{ variableId: string; observation: BayesianObservation; summary: string }> = [
        {
          variableId: "observation_volume",
          observation: {
            value: Math.max(1, Math.round(Math.max(1, observationWords) / 10)),
          },
          summary: "observation_volume",
        },
        {
          variableId: "evidence_quality",
          observation: {
            value: qualityOrdinal,
          },
          summary: "evidence_quality",
        },
        {
          variableId: "outcome_category",
          observation: {
            category: outcomeCategory,
          },
          summary: "outcome_category",
        },
      ];

      if (typeof score === "number") {
        updates.push(
          {
            variableId: "score",
            observation: { value: score },
            summary: "score",
          },
          {
            variableId: "target_trait",
            observation: { value: score, measurementVariance: 0.12 },
            summary: "target_trait",
          },
          {
            variableId: trait,
            observation: { value: score, measurementVariance: 0.12 },
            summary: `global_trait:${trait}`,
          },
        );
      }

      if (outcomeCategory === "success" || outcomeCategory === "failure") {
        const binary = outcomeCategory === "success" ? 1 : 0;
        updates.push({
          variableId: "success",
          observation: { value: binary },
          summary: "success_binary",
        });
      }

      applyObservations({
        state,
        definition,
        observations: updates,
        at,
      });

      refreshAutonomousQueue(state);
      return true;
    },
  });
}

export async function resolveExperimentHypothesis(params: {
  userId: string;
  experimentId: string;
  outcome: "success" | "failure" | "abandoned";
  finalScore?: number;
  resolution?: string;
  hypothesis?: string;
  task?: string;
  title?: string;
  experimentType?: string;
  createdAt?: Date;
  resolvedAt?: Date;
}) {
  await updateBayesianState({
    userId: params.userId,
    mutate: (state) => {
      const at = (params.resolvedAt || new Date()).toISOString();
      const profile = globalProfileDefinition();
      ensureHypothesis(state, profile, at);

      const { definition, trait } = experimentDefinition({
        experimentId: params.experimentId,
        hypothesis: params.hypothesis,
        task: params.task,
        title: params.title,
        experimentType: params.experimentType,
      });

      ensureHypothesis(state, definition, at);

      const baseScore =
        typeof params.finalScore === "number"
          ? clamp01(params.finalScore)
          : params.outcome === "success"
            ? 0.75
            : params.outcome === "failure"
              ? 0.25
              : 0.4;

      const elapsedSeconds = params.createdAt && params.resolvedAt
        ? Math.max(1, Math.round((params.resolvedAt.getTime() - params.createdAt.getTime()) / 1000))
        : undefined;

      const updates: Array<{ variableId: string; observation: BayesianObservation; summary: string }> = [
        {
          variableId: "success",
          observation: { value: params.outcome === "success" ? 1 : 0 },
          summary: "resolve_success",
        },
        {
          variableId: "score",
          observation: { value: baseScore },
          summary: "resolve_score",
        },
        {
          variableId: "evidence_quality",
          observation: { value: scoreToOrdinal(baseScore) },
          summary: "resolve_quality",
        },
        {
          variableId: "outcome_category",
          observation: { category: normalizeOutcome(params.outcome) },
          summary: "resolve_category",
        },
        {
          variableId: "target_trait",
          observation: { value: baseScore, measurementVariance: 0.08 },
          summary: "resolve_target_trait",
        },
        {
          variableId: trait,
          observation: { value: baseScore, measurementVariance: 0.1 },
          summary: `resolve_global_trait:${trait}`,
        },
      ];

      if (typeof elapsedSeconds === "number") {
        updates.push({
          variableId: "completion_time_s",
          observation: { elapsed: elapsedSeconds },
          summary: "resolve_elapsed",
        });
      }

      applyObservations({
        state,
        definition,
        observations: updates,
        at,
      });

      resolveHypothesis({
        state,
        hypothesisId: definition.id,
        resolution: params.resolution || params.outcome,
        status: "resolved",
        at,
      });

      refreshAutonomousQueue(state, {
        recentExperimentOutcomes: [params.outcome],
      });
      return true;
    },
  });
}

export async function recordMissionBayesianOutcome(params: {
  userId: string;
  missionType: string;
  missionRunId: string;
  status: "COMPLETED" | "FAILED" | "ACCEPTED";
  score?: number;
  minEvidence?: number;
  payloadLength?: number;
  createdAt?: Date;
  resolvedAt?: Date;
}) {
  await updateBayesianState({
    userId: params.userId,
    mutate: (state) => {
      const at = (params.resolvedAt || new Date()).toISOString();
      const profile = globalProfileDefinition();
      ensureHypothesis(state, profile, at);

      const { definition, trait } = missionDefinition({ missionType: params.missionType });
      ensureHypothesis(state, definition, at);

      const normalizedStatus = params.status.toLowerCase();
      const success = params.status === "COMPLETED" ? 1 : 0;
      const score = typeof params.score === "number"
        ? clamp01(params.score)
        : params.status === "COMPLETED"
          ? 0.7
          : params.status === "FAILED"
            ? 0.2
            : 0.45;

      const evidencePieces = params.payloadLength
        ? Math.max(1, Math.round(params.payloadLength / 50))
        : Math.max(1, params.minEvidence ?? 1);

      const elapsedSeconds = params.createdAt && params.resolvedAt
        ? Math.max(1, Math.round((params.resolvedAt.getTime() - params.createdAt.getTime()) / 1000))
        : undefined;

      const updates: Array<{ variableId: string; observation: BayesianObservation; summary: string }> = [
        {
          variableId: "success",
          observation: { value: success },
          summary: `mission_success:${params.missionRunId}`,
        },
        {
          variableId: "score",
          observation: { value: score },
          summary: `mission_score:${params.missionRunId}`,
        },
        {
          variableId: "evidence_quality",
          observation: { value: scoreToOrdinal(score) },
          summary: `mission_quality:${params.missionRunId}`,
        },
        {
          variableId: "observation_volume",
          observation: { value: evidencePieces },
          summary: `mission_evidence_count:${params.missionRunId}`,
        },
        {
          variableId: "outcome_category",
          observation: { category: normalizedStatus },
          summary: `mission_outcome_category:${params.missionRunId}`,
        },
        {
          variableId: "target_trait",
          observation: { value: score, measurementVariance: 0.08 },
          summary: `mission_target_trait:${params.missionRunId}`,
        },
        {
          variableId: trait,
          observation: { value: score, measurementVariance: 0.1 },
          summary: `global_mission_trait:${trait}`,
        },
      ];

      if (typeof elapsedSeconds === "number") {
        updates.push({
          variableId: "completion_time_s",
          observation: { elapsed: elapsedSeconds },
          summary: `mission_elapsed:${params.missionRunId}`,
        });
      }

      applyObservations({
        state,
        definition,
        observations: updates,
        at,
      });

      refreshAutonomousQueue(state);
      return true;
    },
  });
}

export async function getBayesianSnapshot(userId: string) {
  const state = await loadBayesianState(userId);
  const summaries = summarizeState(state)
    .sort((a, b) => scoreForAutonomousExploration(b) - scoreForAutonomousExploration(a));

  const globalSummary = summaries.find((summary) => summary.id === GLOBAL_PROFILE_ID);
  const globalTraits = Object.fromEntries(
    (globalSummary?.variables || [])
      .filter((variable) => typeof variable.estimate === "number")
      .map((variable) => [
        variable.variableId,
        {
          estimate: variable.estimate,
          uncertainty: variable.uncertainty,
          sampleSize: variable.sampleSize,
        },
      ]),
  );

  return {
    generatedAt: nowIso(),
    summaries,
    queue: state.autonomousQueue,
    globalTraits,
    history: state.history.slice(-30),
  };
}

export async function refreshAutonomousHypothesisQueue(userId: string, context?: AutonomousContext) {
  const { state } = await updateBayesianState({
    userId,
    mutate: (current) => {
      refreshAutonomousQueue(current, context);
      return true;
    },
  });
  return state.autonomousQueue;
}

export async function getAutonomousExperimentProposal(userId: string, context?: AutonomousContext) {
  const queue = await refreshAutonomousHypothesisQueue(userId, context);
  const best = queue.slice().sort((a, b) => b.score - a.score)[0] || null;
  return best;
}

export async function getExperimentTypeExplorationBonus(userId: string, experimentType: string) {
  const snapshot = await getBayesianSnapshot(userId);
  const type = normalizeType(experimentType);
  const trait = EXPERIMENT_TYPE_TO_TRAIT[type] || "reliability";

  const traitSignal = (snapshot.globalTraits as Record<string, any>)[trait];
  if (traitSignal) {
    return clamp01(traitSignal.uncertainty);
  }

  const matching = snapshot.summaries.filter(
    (summary) => summary.source === "experiment" && (summary.kind || "").includes(type),
  );

  if (!matching.length) {
    return 0.6;
  }

  const avg = matching.reduce((sum, summary) => sum + summary.uncertainty, 0) / matching.length;
  return clamp01(avg);
}

export type { AutonomousHypothesisProposal };
