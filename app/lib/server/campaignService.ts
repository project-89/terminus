import prisma from "@/app/lib/prisma";
import {
  Campaign,
  CampaignPhase,
  Objective,
  ObjectiveContribution,
  CampaignParticipation,
  CampaignEvent,
  CampaignStatus,
  ObjectiveType,
} from "@prisma/client";

// ============================================
// Types
// ============================================

export interface CreateCampaignParams {
  name: string;
  codename?: string;
  description: string;
  narrative?: string;
  minTrust?: number;
  maxAgents?: number;
  autoAssign?: boolean;
  deadline?: Date;
  triggers?: {
    agentCount?: number;
    trustThreshold?: number;
    schedule?: string;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreatePhaseParams {
  campaignId: string;
  name: string;
  description: string;
  narrative?: string;
  order?: number;
  prerequisites?: string[];
  requireAll?: boolean;
}

export interface CreateObjectiveParams {
  phaseId: string;
  title: string;
  description: string;
  briefing: string;
  hiddenContext?: string;
  type?: ObjectiveType;
  targetContributions?: number;
  dependsOn?: string[];
  eligibleTags?: string[];
  minTrust?: number;
  points?: number;
}

export interface SetAgentViewParams {
  objectiveId: string;
  agentId: string;
  briefing?: string;
  pieceId?: string;
  customData?: Record<string, any>;
}

export interface SubmitContributionParams {
  objectiveId: string;
  userId: string;
  content: string;
  evidence?: {
    type: string;
    url?: string;
    description?: string;
  };
  pieceId?: string;
}

export interface EvaluateContributionParams {
  contributionId: string;
  status: "accepted" | "rejected" | "integrated";
  score?: number;
  feedback?: string;
  pieceContext?: string;
  pointsAwarded?: number;
}

export interface CampaignWithDetails extends Campaign {
  phases: (CampaignPhase & {
    objectives: (Objective & {
      contributions: ObjectiveContribution[];
    })[];
  })[];
  participations: CampaignParticipation[];
  events: CampaignEvent[];
}

export interface ObjectiveWithPhase extends Objective {
  phase: CampaignPhase & {
    campaign: Campaign;
  };
}

export interface AgentView {
  briefing?: string;
  pieceId?: string;
  customData?: Record<string, any>;
}

// ============================================
// Campaign CRUD
// ============================================

export async function createCampaign(
  params: CreateCampaignParams
): Promise<Campaign> {
  return prisma.campaign.create({
    data: {
      name: params.name,
      codename: params.codename,
      description: params.description,
      narrative: params.narrative,
      minTrust: params.minTrust ?? 0,
      maxAgents: params.maxAgents,
      autoAssign: params.autoAssign ?? false,
      deadline: params.deadline,
      triggers: params.triggers,
      tags: params.tags ?? [],
      metadata: params.metadata,
      status: "DRAFT",
    },
  });
}

export async function getCampaign(
  campaignId: string
): Promise<CampaignWithDetails | null> {
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          objectives: {
            include: {
              contributions: true,
            },
          },
        },
      },
      participations: {
        include: {
          user: {
            select: {
              id: true,
              handle: true,
              profile: { select: { codename: true, trustScore: true, layer: true } },
            },
          },
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  }) as Promise<CampaignWithDetails | null>;
}

export async function listCampaigns(options?: {
  status?: CampaignStatus;
  includeDetails?: boolean;
}): Promise<Campaign[]> {
  const where = options?.status ? { status: options.status } : {};

  if (options?.includeDetails) {
    return prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: {
            objectives: {
              include: {
                contributions: true,
              },
            },
          },
        },
        participations: true,
        _count: {
          select: {
            phases: true,
            participations: true,
            events: true,
          },
        },
      },
    });
  }

  return prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          phases: true,
          participations: true,
        },
      },
    },
  });
}

export async function updateCampaign(
  campaignId: string,
  data: Partial<CreateCampaignParams> & { status?: CampaignStatus }
): Promise<Campaign> {
  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.codename !== undefined && { codename: data.codename }),
      ...(data.description && { description: data.description }),
      ...(data.narrative !== undefined && { narrative: data.narrative }),
      ...(data.minTrust !== undefined && { minTrust: data.minTrust }),
      ...(data.maxAgents !== undefined && { maxAgents: data.maxAgents }),
      ...(data.autoAssign !== undefined && { autoAssign: data.autoAssign }),
      ...(data.deadline !== undefined && { deadline: data.deadline }),
      ...(data.triggers !== undefined && { triggers: data.triggers }),
      ...(data.tags && { tags: data.tags }),
      ...(data.metadata !== undefined && { metadata: data.metadata }),
      ...(data.status && { status: data.status }),
    },
  });
}

// ============================================
// Phase Management
// ============================================

export async function addPhase(params: CreatePhaseParams): Promise<CampaignPhase> {
  // Get the current max order for this campaign
  const maxOrder = await prisma.campaignPhase.aggregate({
    where: { campaignId: params.campaignId },
    _max: { order: true },
  });

  return prisma.campaignPhase.create({
    data: {
      campaignId: params.campaignId,
      name: params.name,
      description: params.description,
      narrative: params.narrative,
      order: params.order ?? (maxOrder._max.order ?? -1) + 1,
      prerequisites: params.prerequisites ?? [],
      requireAll: params.requireAll ?? true,
      status: "LOCKED",
    },
  });
}

export async function updatePhaseStatus(
  phaseId: string,
  status: string
): Promise<CampaignPhase> {
  return prisma.campaignPhase.update({
    where: { id: phaseId },
    data: { status },
  });
}

// ============================================
// Objective Management
// ============================================

export async function addObjective(
  params: CreateObjectiveParams
): Promise<Objective> {
  return prisma.objective.create({
    data: {
      phaseId: params.phaseId,
      title: params.title,
      description: params.description,
      briefing: params.briefing,
      hiddenContext: params.hiddenContext,
      type: params.type ?? "INDEPENDENT",
      targetContributions: params.targetContributions ?? 1,
      dependsOn: params.dependsOn ?? [],
      eligibleTags: params.eligibleTags ?? [],
      minTrust: params.minTrust,
      points: params.points ?? 100,
      status: "LOCKED",
    },
  });
}

export async function setAgentView(params: SetAgentViewParams): Promise<Objective> {
  const objective = await prisma.objective.findUnique({
    where: { id: params.objectiveId },
    select: { agentViews: true },
  });

  const currentViews = (objective?.agentViews as Record<string, AgentView>) ?? {};
  const updatedViews = {
    ...currentViews,
    [params.agentId]: {
      ...(currentViews[params.agentId] ?? {}),
      ...(params.briefing && { briefing: params.briefing }),
      ...(params.pieceId && { pieceId: params.pieceId }),
      ...(params.customData && { customData: params.customData }),
    },
  };

  return prisma.objective.update({
    where: { id: params.objectiveId },
    data: { agentViews: updatedViews },
  });
}

export async function assignObjective(
  objectiveId: string,
  agentIds: string[],
  customBriefings?: Record<string, { briefing?: string; pieceId?: string }>
): Promise<Objective> {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: {
      phase: {
        include: { campaign: true },
      },
    },
  });

  if (!objective) {
    throw new Error("Objective not found");
  }

  // Build agent views if custom briefings provided
  let agentViews = (objective.agentViews as Record<string, AgentView>) ?? {};
  if (customBriefings) {
    for (const [agentId, view] of Object.entries(customBriefings)) {
      agentViews[agentId] = {
        ...(agentViews[agentId] ?? {}),
        ...view,
      };
    }
  }

  // Update objective with assigned agents
  const updated = await prisma.objective.update({
    where: { id: objectiveId },
    data: {
      assignedAgents: agentIds,
      agentViews,
      status: "AVAILABLE",
    },
  });

  // Add agents to campaign participation if not already
  for (const agentId of agentIds) {
    await prisma.campaignParticipation.upsert({
      where: {
        campaignId_userId: {
          campaignId: objective.phase.campaignId,
          userId: agentId,
        },
      },
      create: {
        campaignId: objective.phase.campaignId,
        userId: agentId,
        role: "agent",
        status: "active",
      },
      update: {},
    });
  }

  // Log event
  await logCampaignEvent({
    campaignId: objective.phase.campaignId,
    type: "objective_assigned",
    objectiveId,
    data: { agentIds, assignedCount: agentIds.length },
    narrative: `Objective "${objective.title}" assigned to ${agentIds.length} agent(s)`,
  });

  return updated;
}

export async function updateObjectiveStatus(
  objectiveId: string,
  status: string
): Promise<Objective> {
  return prisma.objective.update({
    where: { id: objectiveId },
    data: { status },
  });
}

// ============================================
// Campaign Activation & Status
// ============================================

export async function activateCampaign(campaignId: string): Promise<Campaign> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.phases.length === 0) {
    throw new Error("Campaign must have at least one phase");
  }

  // Activate the first phase(s) that have no prerequisites
  const firstPhases = campaign.phases.filter(
    (p) => p.prerequisites.length === 0
  );

  for (const phase of firstPhases) {
    await updatePhaseStatus(phase.id, "AVAILABLE");

    // Make objectives with no dependencies available
    for (const obj of phase.objectives) {
      if (obj.dependsOn.length === 0) {
        await updateObjectiveStatus(obj.id, "AVAILABLE");
      }
    }
  }

  // Update campaign status
  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "ACTIVE",
      startedAt: new Date(),
    },
  });

  // Log event
  await logCampaignEvent({
    campaignId,
    type: "campaign_activated",
    data: { activatedPhases: firstPhases.map((p) => p.id) },
    narrative: `Campaign "${campaign.name}" has been activated`,
  });

  return updated;
}

export async function pauseCampaign(campaignId: string): Promise<Campaign> {
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "PAUSED" },
  });

  await logCampaignEvent({
    campaignId,
    type: "campaign_paused",
    narrative: `Campaign "${campaign.name}" has been paused`,
  });

  return campaign;
}

export async function completeCampaign(campaignId: string): Promise<Campaign> {
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  await logCampaignEvent({
    campaignId,
    type: "campaign_completed",
    narrative: `Campaign "${campaign.name}" has been completed`,
  });

  return campaign;
}

// ============================================
// Contribution Management
// ============================================

export async function submitContribution(
  params: SubmitContributionParams
): Promise<ObjectiveContribution> {
  const objective = await prisma.objective.findUnique({
    where: { id: params.objectiveId },
    include: {
      phase: { include: { campaign: true } },
    },
  });

  if (!objective) {
    throw new Error("Objective not found");
  }

  // Get agent view for piece ID if not provided
  const agentViews = (objective.agentViews as Record<string, AgentView>) ?? {};
  const agentView = agentViews[params.userId];
  const pieceId = params.pieceId ?? agentView?.pieceId;

  const contribution = await prisma.objectiveContribution.create({
    data: {
      objectiveId: params.objectiveId,
      userId: params.userId,
      content: params.content,
      evidence: params.evidence,
      status: "submitted",
      pieceId,
    },
  });

  // Log event
  await logCampaignEvent({
    campaignId: objective.phase.campaignId,
    type: "contribution_submitted",
    actorId: params.userId,
    objectiveId: params.objectiveId,
    data: { contributionId: contribution.id, pieceId },
    narrative: `Agent submitted contribution for "${objective.title}"`,
  });

  // Check if this completes the objective
  await checkObjectiveCompletion(params.objectiveId);

  return contribution;
}

export async function evaluateContribution(
  params: EvaluateContributionParams
): Promise<ObjectiveContribution> {
  const contribution = await prisma.objectiveContribution.update({
    where: { id: params.contributionId },
    data: {
      status: params.status,
      score: params.score,
      feedback: params.feedback,
      pieceContext: params.pieceContext,
      pointsAwarded: params.pointsAwarded ?? 0,
    },
    include: {
      objective: {
        include: {
          phase: { include: { campaign: true } },
        },
      },
    },
  });

  // Log event
  await logCampaignEvent({
    campaignId: contribution.objective.phase.campaignId,
    type: "contribution_evaluated",
    actorId: contribution.userId,
    objectiveId: contribution.objectiveId,
    data: {
      contributionId: contribution.id,
      status: params.status,
      score: params.score,
      pointsAwarded: params.pointsAwarded,
    },
    narrative: `Contribution evaluated: ${params.status}`,
  });

  // If integrated, check if objective is now complete
  if (params.status === "integrated" || params.status === "accepted") {
    await checkObjectiveCompletion(contribution.objectiveId);
  }

  return contribution;
}

// ============================================
// Progress & Completion Checks
// ============================================

export async function checkObjectiveCompletion(
  objectiveId: string
): Promise<boolean> {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: {
      contributions: true,
      phase: { include: { campaign: true } },
    },
  });

  if (!objective) return false;

  const acceptedContributions = objective.contributions.filter(
    (c: any) => c.status === "accepted" || c.status === "integrated"
  );

  const isComplete = acceptedContributions.length >= objective.targetContributions;

  if (isComplete && objective.status !== "COMPLETED") {
    await prisma.objective.update({
      where: { id: objectiveId },
      data: { status: "COMPLETED" },
    });

    await logCampaignEvent({
      campaignId: objective.phase.campaignId,
      type: "objective_completed",
      objectiveId,
      data: { contributionCount: acceptedContributions.length },
      narrative: `Objective "${objective.title}" has been completed`,
    });

    // Check if this unlocks other objectives
    await checkDependentObjectives(objective.phase.id, objectiveId);

    // Check if phase is complete
    await checkPhaseCompletion(objective.phase.id);
  }

  return isComplete;
}

async function checkDependentObjectives(
  phaseId: string,
  completedObjectiveId: string
): Promise<void> {
  const dependentObjectives = await prisma.objective.findMany({
    where: {
      phaseId,
      dependsOn: { has: completedObjectiveId },
      status: "LOCKED",
    },
  });

  for (const obj of dependentObjectives) {
    // Check if all dependencies are met
    const completedDeps = await prisma.objective.count({
      where: {
        id: { in: obj.dependsOn },
        status: "COMPLETED",
      },
    });

    if (completedDeps === obj.dependsOn.length) {
      await updateObjectiveStatus(obj.id, "AVAILABLE");
    }
  }
}

export async function checkPhaseCompletion(phaseId: string): Promise<boolean> {
  const phase = await prisma.campaignPhase.findUnique({
    where: { id: phaseId },
    include: {
      objectives: true,
      campaign: true,
    },
  });

  if (!phase) return false;

  const allComplete = phase.objectives.every((o: any) => o.status === "COMPLETED");

  if (allComplete && phase.status !== "COMPLETED") {
    await prisma.campaignPhase.update({
      where: { id: phaseId },
      data: { status: "COMPLETED" },
    });

    await logCampaignEvent({
      campaignId: phase.campaignId,
      type: "phase_completed",
      phaseId,
      narrative: `Phase "${phase.name}" has been completed`,
    });

    // Check for phases that depend on this one
    await checkDependentPhases(phase.campaignId, phaseId);

    // Check if campaign is complete
    await checkCampaignCompletion(phase.campaignId);
  }

  return allComplete;
}

async function checkDependentPhases(
  campaignId: string,
  completedPhaseId: string
): Promise<void> {
  const dependentPhases = await prisma.campaignPhase.findMany({
    where: {
      campaignId,
      prerequisites: { has: completedPhaseId },
      status: "LOCKED",
    },
  });

  for (const phase of dependentPhases) {
    const completedPrereqs = await prisma.campaignPhase.count({
      where: {
        id: { in: phase.prerequisites },
        status: "COMPLETED",
      },
    });

    const shouldUnlock = phase.requireAll
      ? completedPrereqs === phase.prerequisites.length
      : completedPrereqs > 0;

    if (shouldUnlock) {
      await updatePhaseStatus(phase.id, "AVAILABLE");

      // Make objectives with no dependencies available
      const objectives = await prisma.objective.findMany({
        where: {
          phaseId: phase.id,
          dependsOn: { equals: [] },
        },
      });

      for (const obj of objectives) {
        await updateObjectiveStatus(obj.id, "AVAILABLE");
      }
    }
  }
}

async function checkCampaignCompletion(campaignId: string): Promise<boolean> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { phases: true },
  });

  if (!campaign) return false;

  const allComplete = campaign.phases.every((p: any) => p.status === "COMPLETED");

  if (allComplete && campaign.status !== "COMPLETED") {
    await completeCampaign(campaignId);
  }

  return allComplete;
}

// ============================================
// Agent-Facing Functions
// ============================================

export async function getAvailableObjectivesForAgent(
  userId: string
): Promise<ObjectiveWithPhase[]> {
  // Get user's profile for trust score
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    select: { trustScore: true, tags: true },
  });

  const trustScore = profile?.trustScore ?? 0;
  const userTags = profile?.tags ?? [];

  // Find objectives where:
  // 1. Status is AVAILABLE or ACTIVE
  // 2. User is in assignedAgents OR assignedAgents is empty (open to all)
  // 3. User hasn't already contributed
  // 4. User meets trust requirement
  // 5. Campaign is ACTIVE
  const objectives = await prisma.objective.findMany({
    where: {
      status: { in: ["AVAILABLE", "ACTIVE"] },
      phase: {
        status: { in: ["AVAILABLE", "ACTIVE"] },
        campaign: { status: "ACTIVE" },
      },
      OR: [
        { assignedAgents: { has: userId } },
        { assignedAgents: { equals: [] } },
      ],
      contributions: {
        none: { userId },
      },
    },
    include: {
      phase: {
        include: { campaign: true },
      },
    },
  });

  // Filter by trust and tags
  return objectives.filter((obj: any) => {
    // Check trust requirement
    if (obj.minTrust && trustScore < obj.minTrust) {
      return false;
    }

    // Check tag eligibility (if tags specified, user must have at least one)
    if (obj.eligibleTags.length > 0) {
      const hasEligibleTag = obj.eligibleTags.some((tag: string) =>
        userTags.includes(tag)
      );
      if (!hasEligibleTag) return false;
    }

    return true;
  }) as ObjectiveWithPhase[];
}

export function getAgentBriefing(
  objective: Objective,
  userId: string
): { briefing: string; pieceId?: string; customData?: Record<string, any> } {
  const agentViews = (objective.agentViews as Record<string, AgentView>) ?? {};
  const agentView = agentViews[userId];

  return {
    briefing: agentView?.briefing ?? objective.briefing,
    pieceId: agentView?.pieceId,
    customData: agentView?.customData,
  };
}

export async function getAgentCampaignStatus(
  campaignId: string,
  userId: string
): Promise<{
  campaign: Campaign;
  participation: CampaignParticipation | null;
  myContributions: ObjectiveContribution[];
  availableObjectives: Objective[];
}> {
  const [campaign, participation, contributions, available] = await Promise.all([
    prisma.campaign.findUnique({ where: { id: campaignId } }),
    prisma.campaignParticipation.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    }),
    prisma.objectiveContribution.findMany({
      where: {
        userId,
        objective: { phase: { campaignId } },
      },
      include: { objective: true },
    }),
    getAvailableObjectivesForAgent(userId).then((objs) =>
      objs.filter((o) => o.phase.campaignId === campaignId)
    ),
  ]);

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return {
    campaign,
    participation,
    myContributions: contributions,
    availableObjectives: available,
  };
}

// ============================================
// Collaboration Helpers
// ============================================

export async function aggregateContributions(
  objectiveId: string
): Promise<{
  objective: Objective;
  contributions: ObjectiveContribution[];
  pieces: { pieceId: string; context: string | null; agentId: string }[];
  complete: boolean;
  progress: number;
}> {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: {
      contributions: {
        where: { status: { in: ["accepted", "integrated"] } },
        include: {
          user: { select: { id: true, handle: true } },
        },
      },
    },
  });

  if (!objective) {
    throw new Error("Objective not found");
  }

  const pieces = objective.contributions
    .filter((c: any) => c.pieceId)
    .map((c: any) => ({
      pieceId: c.pieceId!,
      context: c.pieceContext,
      agentId: c.userId,
    }));

  return {
    objective,
    contributions: objective.contributions,
    pieces,
    complete: objective.contributions.length >= objective.targetContributions,
    progress: objective.contributions.length / objective.targetContributions,
  };
}

export async function triggerRevelation(objectiveId: string): Promise<void> {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: {
      contributions: {
        where: { status: "integrated" },
        select: { userId: true, pieceId: true, pieceContext: true },
      },
      phase: { include: { campaign: true } },
    },
  });

  if (!objective) {
    throw new Error("Objective not found");
  }

  // Build the revelation - combine all piece contexts
  const pieces = objective.contributions
    .filter((c: any) => c.pieceId && c.pieceContext)
    .map((c: any) => ({ pieceId: c.pieceId, context: c.pieceContext }));

  const involvedAgents = objective.contributions.map((c: any) => c.userId);

  // Update each participant's knownInfo with the revelation
  for (const userId of involvedAgents) {
    const participation = await prisma.campaignParticipation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: objective.phase.campaignId,
          userId,
        },
      },
    });

    const currentKnownInfo = (participation?.knownInfo as Record<string, any>) ?? {};
    const revelations = currentKnownInfo.revelations ?? [];

    await prisma.campaignParticipation.update({
      where: {
        campaignId_userId: {
          campaignId: objective.phase.campaignId,
          userId,
        },
      },
      data: {
        knownInfo: {
          ...currentKnownInfo,
          revelations: [
            ...revelations,
            {
              objectiveId,
              title: objective.title,
              hiddenContext: objective.hiddenContext,
              pieces,
              revealedAt: new Date().toISOString(),
            },
          ],
        },
      },
    });
  }

  // Log the revelation event
  await logCampaignEvent({
    campaignId: objective.phase.campaignId,
    type: "revelation",
    objectiveId,
    data: {
      involvedAgents,
      pieceCount: pieces.length,
    },
    narrative: `Revelation triggered for "${objective.title}" - ${involvedAgents.length} agents now share unified knowledge`,
  });
}

// ============================================
// Event Logging
// ============================================

async function logCampaignEvent(params: {
  campaignId: string;
  type: string;
  actorId?: string;
  objectiveId?: string;
  phaseId?: string;
  data?: Record<string, any>;
  narrative?: string;
}): Promise<CampaignEvent> {
  return prisma.campaignEvent.create({
    data: {
      campaignId: params.campaignId,
      type: params.type,
      actorId: params.actorId,
      objectiveId: params.objectiveId,
      phaseId: params.phaseId,
      data: params.data,
      narrative: params.narrative,
    },
  });
}

// ============================================
// Campaign Statistics
// ============================================

export async function getCampaignStats(campaignId: string): Promise<{
  totalParticipants: number;
  activeParticipants: number;
  totalContributions: number;
  acceptedContributions: number;
  completedObjectives: number;
  totalObjectives: number;
  completedPhases: number;
  totalPhases: number;
  progress: number;
}> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const totalParticipants = campaign.participations.length;
  const activeParticipants = campaign.participations.filter(
    (p) => p.status === "active"
  ).length;

  let totalContributions = 0;
  let acceptedContributions = 0;
  let completedObjectives = 0;
  let totalObjectives = 0;
  let completedPhases = 0;

  for (const phase of campaign.phases) {
    if (phase.status === "COMPLETED") completedPhases++;

    for (const obj of phase.objectives) {
      totalObjectives++;
      if (obj.status === "COMPLETED") completedObjectives++;

      for (const contrib of obj.contributions) {
        totalContributions++;
        if (contrib.status === "accepted" || contrib.status === "integrated") {
          acceptedContributions++;
        }
      }
    }
  }

  return {
    totalParticipants,
    activeParticipants,
    totalContributions,
    acceptedContributions,
    completedObjectives,
    totalObjectives,
    completedPhases,
    totalPhases: campaign.phases.length,
    progress: totalObjectives > 0 ? completedObjectives / totalObjectives : 0,
  };
}
