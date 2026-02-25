export type BayesianVariableType =
  | "binary"
  | "continuous_01"
  | "ordinal_k"
  | "count"
  | "time_to_event"
  | "categorical"
  | "latent_trait";

export type HypothesisSource = "experiment" | "mission" | "system";
export type HypothesisStatus = "active" | "resolved" | "retired";

export type BinaryVariableDefinition = {
  id: string;
  label: string;
  type: "binary";
  priorAlpha?: number;
  priorBeta?: number;
  weight?: number;
};

export type Continuous01VariableDefinition = {
  id: string;
  label: string;
  type: "continuous_01";
  priorAlpha?: number;
  priorBeta?: number;
  weight?: number;
};

export type OrdinalKVariableDefinition = {
  id: string;
  label: string;
  type: "ordinal_k";
  k: number;
  priorCounts?: number[];
  weight?: number;
};

export type CountVariableDefinition = {
  id: string;
  label: string;
  type: "count";
  priorShape?: number;
  priorRate?: number;
  weight?: number;
};

export type TimeToEventVariableDefinition = {
  id: string;
  label: string;
  type: "time_to_event";
  priorShape?: number;
  priorRate?: number;
  unit?: "seconds" | "minutes" | "hours";
  weight?: number;
};

export type CategoricalVariableDefinition = {
  id: string;
  label: string;
  type: "categorical";
  categories: string[];
  priorCounts?: number[];
  weight?: number;
};

export type LatentTraitVariableDefinition = {
  id: string;
  label: string;
  type: "latent_trait";
  priorMean?: number;
  priorVariance?: number;
  measurementVariance?: number;
  weight?: number;
};

export type BayesianVariableDefinition =
  | BinaryVariableDefinition
  | Continuous01VariableDefinition
  | OrdinalKVariableDefinition
  | CountVariableDefinition
  | TimeToEventVariableDefinition
  | CategoricalVariableDefinition
  | LatentTraitVariableDefinition;

export type BinaryPosterior = {
  kind: "binary";
  alpha: number;
  beta: number;
  n: number;
};

export type Continuous01Posterior = {
  kind: "continuous_01";
  alpha: number;
  beta: number;
  n: number;
};

export type OrdinalKPosterior = {
  kind: "ordinal_k";
  k: number;
  counts: number[];
  n: number;
};

export type CountPosterior = {
  kind: "count";
  shape: number;
  rate: number;
  exposure: number;
  n: number;
};

export type TimeToEventPosterior = {
  kind: "time_to_event";
  shape: number;
  rate: number;
  totalTime: number;
  unit: "seconds" | "minutes" | "hours";
  n: number;
};

export type CategoricalPosterior = {
  kind: "categorical";
  categories: string[];
  counts: number[];
  n: number;
};

export type LatentTraitPosterior = {
  kind: "latent_trait";
  mean: number;
  variance: number;
  measurementVariance: number;
  n: number;
};

export type BayesianVariablePosterior =
  | BinaryPosterior
  | Continuous01Posterior
  | OrdinalKPosterior
  | CountPosterior
  | TimeToEventPosterior
  | CategoricalPosterior
  | LatentTraitPosterior;

export type BayesianObservation = {
  value?: boolean | number | string;
  category?: string;
  elapsed?: number;
  exposure?: number;
  weight?: number;
  measurementVariance?: number;
  censored?: boolean;
};

export type BayesianHistoryEntry = {
  at: string;
  hypothesisId: string;
  variableId: string;
  event: "observation" | "resolution" | "auto_proposal";
  summary: string;
};

export type BayesianHypothesisDefinition = {
  id: string;
  title: string;
  description?: string;
  source: HypothesisSource;
  kind?: string;
  variables: BayesianVariableDefinition[];
  tags?: string[];
};

export type BayesianHypothesisState = {
  definition: BayesianHypothesisDefinition;
  status: HypothesisStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  evidenceCount: number;
  posteriors: Record<string, BayesianVariablePosterior>;
};

export type AutonomousHypothesisProposal = {
  id: string;
  title: string;
  rationale: string;
  source: HypothesisSource;
  kind?: string;
  hypothesis: string;
  task: string;
  successCriteria?: string;
  experimentType?: string;
  narrativeHook?: string;
  variables: BayesianVariableDefinition[];
  createdAt: string;
  score: number;
};

export type BayesianAgentState = {
  version: number;
  updatedAt: string;
  hypotheses: Record<string, BayesianHypothesisState>;
  history: BayesianHistoryEntry[];
  autonomousQueue: AutonomousHypothesisProposal[];
};

export type BayesianVariableSummary = {
  variableId: string;
  type: BayesianVariableType;
  estimate: number | null;
  uncertainty: number;
  sampleSize: number;
  distribution?: Record<string, number>;
};

export type BayesianHypothesisSummary = {
  id: string;
  title: string;
  source: HypothesisSource;
  kind?: string;
  status: HypothesisStatus;
  evidenceCount: number;
  successProbability: number | null;
  uncertainty: number;
  variables: BayesianVariableSummary[];
};

export type AutonomousContext = {
  missionFailureRate?: number;
  averageMissionScore?: number;
  averageResponseLatencySec?: number;
  engagementDrop?: boolean;
  recentExperimentOutcomes?: Array<"success" | "failure" | "abandoned">;
};
