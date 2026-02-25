import {
  type AutonomousContext,
  type AutonomousHypothesisProposal,
  type BayesianAgentState,
  type BayesianHistoryEntry,
  type BayesianHypothesisDefinition,
  type BayesianHypothesisState,
  type BayesianHypothesisSummary,
  type BayesianObservation,
  type BayesianVariableDefinition,
} from "./types";
import { initializePosterior, scoreFromSummary, summarizePosterior, updatePosterior } from "./variables";

const STATE_VERSION = 1;
const HISTORY_LIMIT = 300;
const QUEUE_LIMIT = 8;

function nowIso() {
  return new Date().toISOString();
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function trimHistory(entries: BayesianHistoryEntry[]) {
  if (entries.length <= HISTORY_LIMIT) return entries;
  return entries.slice(entries.length - HISTORY_LIMIT);
}

function standardExperimentVariables(targetTrait = "reliability"): BayesianVariableDefinition[] {
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
      label: `${targetTrait} trait signal`,
      type: "latent_trait",
      priorMean: 0.5,
      priorVariance: 0.25,
      measurementVariance: 0.08,
    },
  ];
}

export function createEmptyAgentState(at = nowIso()): BayesianAgentState {
  return {
    version: STATE_VERSION,
    updatedAt: at,
    hypotheses: {},
    history: [],
    autonomousQueue: [],
  };
}

export function normalizeState(candidate: unknown): BayesianAgentState {
  const at = nowIso();
  if (!candidate || typeof candidate !== "object") {
    return createEmptyAgentState(at);
  }

  const asRecord = candidate as Record<string, any>;
  const state: BayesianAgentState = {
    version: typeof asRecord.version === "number" ? asRecord.version : STATE_VERSION,
    updatedAt: typeof asRecord.updatedAt === "string" ? asRecord.updatedAt : at,
    hypotheses: {},
    history: Array.isArray(asRecord.history) ? asRecord.history.slice(-HISTORY_LIMIT) : [],
    autonomousQueue: Array.isArray(asRecord.autonomousQueue) ? asRecord.autonomousQueue.slice(0, QUEUE_LIMIT) : [],
  };

  const hypotheses = asRecord.hypotheses;
  if (!hypotheses || typeof hypotheses !== "object") {
    return state;
  }

  for (const [id, raw] of Object.entries(hypotheses as Record<string, any>)) {
    if (!raw || typeof raw !== "object") continue;
    const def = (raw as any).definition as BayesianHypothesisDefinition | undefined;
    if (!def || !Array.isArray(def.variables)) continue;

    const posteriors: Record<string, any> = {};
    for (const variable of def.variables) {
      const rawPosterior = (raw as any).posteriors?.[variable.id];
      posteriors[variable.id] = rawPosterior && typeof rawPosterior === "object"
        ? rawPosterior
        : initializePosterior(variable);
    }

    state.hypotheses[id] = {
      definition: {
        ...def,
        id,
      },
      status: (raw as any).status === "resolved" || (raw as any).status === "retired"
        ? (raw as any).status
        : "active",
      createdAt: typeof (raw as any).createdAt === "string" ? (raw as any).createdAt : at,
      updatedAt: typeof (raw as any).updatedAt === "string" ? (raw as any).updatedAt : at,
      resolvedAt: typeof (raw as any).resolvedAt === "string" ? (raw as any).resolvedAt : undefined,
      resolution: typeof (raw as any).resolution === "string" ? (raw as any).resolution : undefined,
      evidenceCount: typeof (raw as any).evidenceCount === "number" ? (raw as any).evidenceCount : 0,
      posteriors,
    };
  }

  return state;
}

function addHistoryEntry(state: BayesianAgentState, entry: BayesianHistoryEntry) {
  state.history = trimHistory([...state.history, entry]);
}

export function ensureHypothesis(
  state: BayesianAgentState,
  definition: BayesianHypothesisDefinition,
  at = nowIso(),
): BayesianHypothesisState {
  const existing = state.hypotheses[definition.id];

  if (existing) {
    const nextPosteriors: Record<string, any> = { ...existing.posteriors };
    for (const variable of definition.variables) {
      if (!nextPosteriors[variable.id]) {
        nextPosteriors[variable.id] = initializePosterior(variable);
      }
    }

    const updated: BayesianHypothesisState = {
      ...existing,
      definition,
      posteriors: nextPosteriors,
      updatedAt: at,
    };
    state.hypotheses[definition.id] = updated;
    state.updatedAt = at;
    return updated;
  }

  const posteriors: Record<string, any> = {};
  for (const variable of definition.variables) {
    posteriors[variable.id] = initializePosterior(variable);
  }

  const created: BayesianHypothesisState = {
    definition,
    status: "active",
    createdAt: at,
    updatedAt: at,
    evidenceCount: 0,
    posteriors,
  };

  state.hypotheses[definition.id] = created;
  state.updatedAt = at;
  return created;
}

export function applyObservation(params: {
  state: BayesianAgentState;
  definition: BayesianHypothesisDefinition;
  variableId: string;
  observation: BayesianObservation;
  summary?: string;
  at?: string;
}): BayesianHypothesisState {
  const at = params.at ?? nowIso();
  const hypothesis = ensureHypothesis(params.state, params.definition, at);
  const variable = hypothesis.definition.variables.find((candidate) => candidate.id === params.variableId);
  if (!variable) {
    return hypothesis;
  }

  const currentPosterior = hypothesis.posteriors[variable.id] ?? initializePosterior(variable);
  const nextPosterior = updatePosterior(variable, currentPosterior, params.observation);

  const nextHypothesis: BayesianHypothesisState = {
    ...hypothesis,
    evidenceCount: hypothesis.evidenceCount + 1,
    updatedAt: at,
    posteriors: {
      ...hypothesis.posteriors,
      [variable.id]: nextPosterior,
    },
  };

  params.state.hypotheses[hypothesis.definition.id] = nextHypothesis;
  params.state.updatedAt = at;

  addHistoryEntry(params.state, {
    at,
    event: "observation",
    hypothesisId: hypothesis.definition.id,
    variableId: variable.id,
    summary: params.summary || `${hypothesis.definition.title}::${variable.label}`,
  });

  return nextHypothesis;
}

export function applyObservations(params: {
  state: BayesianAgentState;
  definition: BayesianHypothesisDefinition;
  observations: Array<{ variableId: string; observation: BayesianObservation; summary?: string }>;
  at?: string;
}): BayesianHypothesisState {
  const at = params.at ?? nowIso();
  let latest = ensureHypothesis(params.state, params.definition, at);

  for (const item of params.observations) {
    latest = applyObservation({
      state: params.state,
      definition: params.definition,
      variableId: item.variableId,
      observation: item.observation,
      summary: item.summary,
      at,
    });
  }

  return latest;
}

export function resolveHypothesis(params: {
  state: BayesianAgentState;
  hypothesisId: string;
  resolution?: string;
  status?: "resolved" | "retired";
  at?: string;
}): BayesianHypothesisState | null {
  const at = params.at ?? nowIso();
  const existing = params.state.hypotheses[params.hypothesisId];
  if (!existing) return null;

  const next: BayesianHypothesisState = {
    ...existing,
    status: params.status ?? "resolved",
    resolution: params.resolution,
    resolvedAt: at,
    updatedAt: at,
  };

  params.state.hypotheses[params.hypothesisId] = next;
  params.state.updatedAt = at;

  addHistoryEntry(params.state, {
    at,
    event: "resolution",
    hypothesisId: params.hypothesisId,
    variableId: "resolution",
    summary: params.resolution || next.status,
  });

  return next;
}

function successProbabilityFromVariableSummaries(variableSummaries: ReturnType<typeof summarizePosterior>[]) {
  const preferredKeys = [
    "success",
    "mission_success",
    "experiment_success",
    "score",
    "quality",
    "target_trait",
  ];

  for (const key of preferredKeys) {
    const candidate = variableSummaries.find((summary) => summary.variableId === key);
    if (!candidate) continue;
    const score = scoreFromSummary(candidate);
    if (score !== null) return score;
  }

  const scored = variableSummaries
    .map((summary) => scoreFromSummary(summary))
    .filter((score): score is number => typeof score === "number");

  if (!scored.length) return null;
  return scored.reduce((sum, value) => sum + value, 0) / scored.length;
}

export function summarizeHypothesis(hypothesis: BayesianHypothesisState): BayesianHypothesisSummary {
  const variableSummaries = hypothesis.definition.variables.map((variable) => {
    const posterior = hypothesis.posteriors[variable.id] ?? initializePosterior(variable);
    return summarizePosterior(variable.id, posterior);
  });

  const uncertainties = variableSummaries.map((summary) => clamp01(summary.uncertainty));
  const avgUncertainty = uncertainties.length
    ? uncertainties.reduce((sum, value) => sum + value, 0) / uncertainties.length
    : 1;

  return {
    id: hypothesis.definition.id,
    title: hypothesis.definition.title,
    source: hypothesis.definition.source,
    kind: hypothesis.definition.kind,
    status: hypothesis.status,
    evidenceCount: hypothesis.evidenceCount,
    successProbability: successProbabilityFromVariableSummaries(variableSummaries),
    uncertainty: avgUncertainty,
    variables: variableSummaries,
  };
}

export function summarizeState(state: BayesianAgentState): BayesianHypothesisSummary[] {
  return Object.values(state.hypotheses)
    .map((hypothesis) => summarizeHypothesis(hypothesis))
    .sort((a, b) => b.evidenceCount - a.evidenceCount);
}

export function scoreForAutonomousExploration(summary: BayesianHypothesisSummary) {
  const uncertainty = clamp01(summary.uncertainty);
  const confidenceGap = summary.successProbability === null ? 0.5 : 1 - Math.abs(summary.successProbability - 0.5) * 2;
  const lowEvidenceBoost = summary.evidenceCount < 3 ? 0.2 : summary.evidenceCount < 8 ? 0.1 : 0;
  return clamp01(0.55 * uncertainty + 0.35 * confidenceGap + lowEvidenceBoost);
}

function proposeFromUncertainTrait(state: BayesianAgentState, at: string) {
  const global = state.hypotheses["global:agent_profile"];
  if (!global) return null;

  const summary = summarizeHypothesis(global);
  const uncertainLatent = summary.variables
    .filter((variable) => variable.type === "latent_trait")
    .sort((a, b) => b.uncertainty - a.uncertainty)[0];

  if (!uncertainLatent || uncertainLatent.uncertainty < 0.2) return null;

  const traitName = uncertainLatent.variableId.replaceAll("_", " ");

  return {
    id: `auto:trait:${uncertainLatent.variableId}`,
    title: `Probe ${traitName}`,
    rationale: `High uncertainty in ${traitName} profile signal (${uncertainLatent.uncertainty.toFixed(2)}).`,
    source: "experiment",
    kind: "trait_probe",
    hypothesis: `Subject exhibits stable ${traitName} under directed challenge`,
    task: `Run a focused scenario that measures ${traitName}; log result, score, and outcome category.`,
    successCriteria: `At least two observations with consistent score trend for ${traitName}.`,
    experimentType: "perception",
    narrativeHook: `A calibration sequence spins up. I need one precise response pattern from you.`,
    variables: standardExperimentVariables(uncertainLatent.variableId),
    createdAt: at,
    score: clamp01(0.6 + uncertainLatent.uncertainty * 0.4),
  } satisfies AutonomousHypothesisProposal;
}

function proposeFromMissionRisk(context: AutonomousContext, at: string) {
  const failureRate = context.missionFailureRate ?? 0;
  if (failureRate < 0.35) return null;

  return {
    id: "auto:mission:clarity",
    title: "Mission clarity model",
    rationale: `Mission failure rate is elevated (${failureRate.toFixed(2)}). Test instruction clarity effects.`,
    source: "mission",
    kind: "mission_clarity",
    hypothesis: "Clearer mission framing improves completion probability",
    task: "Compare concise directives vs layered narrative directives and track outcomes.",
    successCriteria: "Completion rate improves over next 3 comparable missions.",
    experimentType: "compliance",
    narrativeHook: "Signal integrity check: we are refining briefing protocols in real time.",
    variables: standardExperimentVariables("reliability"),
    createdAt: at,
    score: clamp01(0.65 + failureRate * 0.35),
  } satisfies AutonomousHypothesisProposal;
}

function proposeFromLatency(context: AutonomousContext, at: string) {
  const latency = context.averageResponseLatencySec ?? 0;
  if (latency < 90 && !context.engagementDrop) return null;

  return {
    id: "auto:engagement:cadence",
    title: "Cadence sensitivity",
    rationale: "Response latency or engagement drop suggests pacing mismatch.",
    source: "experiment",
    kind: "cadence",
    hypothesis: "Subject engagement is sensitive to message pacing and turn cadence",
    task: "Alternate short prompts and atmospheric long prompts, then compare latency and quality.",
    successCriteria: "Average response latency decreases and note quality increases.",
    experimentType: "perception",
    narrativeHook: "I am going to change the transmission rhythm. Tell me when it feels wrong.",
    variables: standardExperimentVariables("persistence"),
    createdAt: at,
    score: clamp01(0.55 + (context.engagementDrop ? 0.25 : 0.15)),
  } satisfies AutonomousHypothesisProposal;
}

function hasActiveExperimentHypothesis(state: BayesianAgentState) {
  return Object.values(state.hypotheses).some(
    (hypothesis) => hypothesis.definition.source === "experiment" && hypothesis.status === "active",
  );
}

export function proposeAutonomousHypotheses(
  state: BayesianAgentState,
  context: AutonomousContext = {},
  at = nowIso(),
): AutonomousHypothesisProposal[] {
  const proposals: AutonomousHypothesisProposal[] = [];

  if (!hasActiveExperimentHypothesis(state)) {
    proposals.push({
      id: "auto:baseline:recalibration",
      title: "Baseline recalibration",
      rationale: "No active experiment hypothesis exists; maintain continuous learning.",
      source: "experiment",
      kind: "baseline",
      hypothesis: "Current behavioral baseline differs from previous profile",
      task: "Run a low-friction baseline interaction and capture structured notes.",
      successCriteria: "At least two observations and one resolved outcome.",
      experimentType: "perception",
      narrativeHook: "Quick calibration before we proceed. I need one clean signal from you.",
      variables: standardExperimentVariables("reliability"),
      createdAt: at,
      score: 0.62,
    });
  }

  const traitProposal = proposeFromUncertainTrait(state, at);
  if (traitProposal) proposals.push(traitProposal);

  const missionProposal = proposeFromMissionRisk(context, at);
  if (missionProposal) proposals.push(missionProposal);

  const latencyProposal = proposeFromLatency(context, at);
  if (latencyProposal) proposals.push(latencyProposal);

  const deduped = new Map<string, AutonomousHypothesisProposal>();
  for (const proposal of proposals) {
    const existing = deduped.get(proposal.id);
    if (!existing || proposal.score > existing.score) {
      deduped.set(proposal.id, proposal);
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, QUEUE_LIMIT);
}

export function updateAutonomousQueue(params: {
  state: BayesianAgentState;
  proposals: AutonomousHypothesisProposal[];
  at?: string;
}) {
  const at = params.at ?? nowIso();
  const existingIds = new Set(params.state.autonomousQueue.map((proposal) => proposal.id));

  params.state.autonomousQueue = params.proposals.slice(0, QUEUE_LIMIT);
  params.state.updatedAt = at;

  for (const proposal of params.proposals) {
    if (existingIds.has(proposal.id)) continue;
    addHistoryEntry(params.state, {
      at,
      event: "auto_proposal",
      hypothesisId: proposal.id,
      variableId: "proposal",
      summary: proposal.title,
    });
  }
}

export function getTopAutonomousProposal(state: BayesianAgentState) {
  return [...state.autonomousQueue].sort((a, b) => b.score - a.score)[0] ?? null;
}

export function getExperimentTypeUncertainty(
  state: BayesianAgentState,
  experimentType: string,
): number {
  const summaries = summarizeState(state).filter(
    (summary) => summary.source === "experiment" && (summary.kind || "").includes(experimentType),
  );

  if (!summaries.length) {
    return 0.6;
  }

  const average = summaries.reduce((sum, summary) => sum + summary.uncertainty, 0) / summaries.length;
  return clamp01(average);
}
