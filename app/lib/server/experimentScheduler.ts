import prisma from "@/app/lib/prisma";
import { TrustLayer, getTrustState } from "./trustService";
import {
  ExperimentTemplate,
  ExperimentTrigger,
  EXPERIMENT_TEMPLATES,
  getTemplatesForLayer,
} from "./experimentTemplates";
import { createExperiment } from "./experimentService";

export type PlayerContext = {
  userId: string;
  sessionCount: number;
  lastSessionAt: Date | null;
  currentHour: number;
  trustScore: number;
  layer: TrustLayer;
  layerJustUnlocked: TrustLayer | null;
  recentMissionOutcomes: ("success" | "failure")[];
  recentExperimentIds: string[];
  recentMessages: string[];
};

export type ScheduledExperiment = {
  template: ExperimentTemplate;
  narrativeHook: string;
  priority: number;
};

async function buildPlayerContext(userId: string): Promise<PlayerContext> {
  const trustState = await getTrustState(userId);
  
  let sessionCount = 0;
  let lastSessionAt: Date | null = null;
  let recentMissionOutcomes: ("success" | "failure")[] = [];
  let recentExperimentIds: string[] = [];
  
  try {
    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    sessionCount = sessions.length;
    lastSessionAt = sessions[0]?.createdAt || null;
    
    const missionRuns = await prisma.missionRun.findMany({
      where: { userId, status: { in: ["COMPLETED", "FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    recentMissionOutcomes = missionRuns.map((r: { status: string; score: number | null }) =>
      r.status === "COMPLETED" && (r.score ?? 0) >= 0.6 ? "success" : "failure"
    );
    
    const experiments = await prisma.experiment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    recentExperimentIds = experiments.map((e: { id: string }) => e.id);
  } catch {
  }
  
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  }).catch(() => null);
  
  const layerJustUnlocked = profile?.pendingCeremony as TrustLayer | null;
  
  return {
    userId,
    sessionCount,
    lastSessionAt,
    currentHour: new Date().getHours(),
    trustScore: trustState.decayedScore,
    layer: trustState.layer,
    layerJustUnlocked,
    recentMissionOutcomes,
    recentExperimentIds,
    recentMessages: [],
  };
}

function evaluateTrigger(trigger: ExperimentTrigger, ctx: PlayerContext): boolean {
  switch (trigger.type) {
    case "session_count":
      return ctx.sessionCount >= trigger.min;
      
    case "time_of_day":
      return trigger.hours.includes(ctx.currentHour);
      
    case "session_gap_days":
      if (!ctx.lastSessionAt) return false;
      const daysSince = (Date.now() - ctx.lastSessionAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= trigger.min;
      
    case "trust_range":
      return ctx.trustScore >= trigger.min && ctx.trustScore <= trigger.max;
      
    case "layer_just_unlocked":
      return ctx.layerJustUnlocked === trigger.layer;
      
    case "mission_streak": {
      if (ctx.recentMissionOutcomes.length < trigger.count) return false;
      const recent = ctx.recentMissionOutcomes.slice(0, trigger.count);
      return recent.every((o) => o === trigger.outcome);
    }
    
    case "random":
      return Math.random() < trigger.probability;
      
    case "keyword_mentioned":
      return trigger.keywords.some((kw) =>
        ctx.recentMessages.some((msg) => msg.toLowerCase().includes(kw.toLowerCase()))
      );
      
    case "emotion_detected":
      return false;
      
    default:
      return false;
  }
}

function evaluateTriggers(template: ExperimentTemplate, ctx: PlayerContext): boolean {
  if (template.triggers.length === 0) return true;
  
  const randomTrigger = template.triggers.find((t) => t.type === "random");
  const otherTriggers = template.triggers.filter((t) => t.type !== "random");
  
  const othersPass = otherTriggers.length === 0 || otherTriggers.every((t) => evaluateTrigger(t, ctx));
  
  if (!othersPass) return false;
  
  if (randomTrigger) {
    return evaluateTrigger(randomTrigger, ctx);
  }
  
  return true;
}

async function checkCooldown(userId: string, templateId: string, cooldownHours: number): Promise<boolean> {
  try {
    const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);
    
    const recent = await prisma.experiment.findFirst({
      where: {
        userId,
        hypothesis: { contains: templateId },
        createdAt: { gte: cutoff },
      },
    });
    
    return !recent;
  } catch {
    return true;
  }
}

export async function selectExperiment(
  userId: string,
  additionalContext?: { recentMessages?: string[] }
): Promise<ScheduledExperiment | null> {
  const ctx = await buildPlayerContext(userId);
  
  if (additionalContext?.recentMessages) {
    ctx.recentMessages = additionalContext.recentMessages;
  }
  
  const eligibleTemplates = getTemplatesForLayer(ctx.layer);
  
  const candidates: Array<{ template: ExperimentTemplate; score: number }> = [];
  
  for (const template of eligibleTemplates) {
    const passedCooldown = await checkCooldown(userId, template.id, template.cooldownHours);
    if (!passedCooldown) continue;
    
    const triggersPass = evaluateTriggers(template, ctx);
    if (!triggersPass) continue;
    
    let score = template.priority;
    
    if (ctx.layerJustUnlocked !== null) {
      const layerTrigger = template.triggers.find(
        (t) => t.type === "layer_just_unlocked" && t.layer === ctx.layerJustUnlocked
      );
      if (layerTrigger) score += 5;
    }
    
    const typeCount: Record<string, number> = {};
    for (const expId of ctx.recentExperimentIds) {
      const t = EXPERIMENT_TEMPLATES.find((t) => expId.includes(t.id));
      if (t) typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    }
    const thisTypeCount = typeCount[template.type] || 0;
    score -= thisTypeCount * 0.5;
    
    score += Math.random() * 0.5;
    
    candidates.push({ template, score });
  }
  
  if (candidates.length === 0) return null;
  
  candidates.sort((a, b) => b.score - a.score);
  const chosen = candidates[0];
  
  let narrativeHook = chosen.template.narrativeHook;
  
  if (narrativeHook.includes("{TIME}")) {
    const targetHour = (ctx.currentHour + 4 + Math.floor(Math.random() * 4)) % 24;
    const targetTime = `${targetHour.toString().padStart(2, "0")}:00`;
    narrativeHook = narrativeHook.replace("{TIME}", targetTime);
  }
  
  return {
    template: chosen.template,
    narrativeHook,
    priority: chosen.score,
  };
}

export async function activateExperiment(
  userId: string,
  scheduled: ScheduledExperiment,
  threadId?: string
): Promise<string> {
  const exp = await createExperiment({
    userId,
    threadId,
    expId: `${scheduled.template.id}-${Date.now()}`,
    hypothesis: `[${scheduled.template.id}] ${scheduled.template.hypothesis}`,
    task: scheduled.template.task,
    success_criteria: scheduled.template.successCriteria,
    title: scheduled.template.name,
  });
  
  return exp.id;
}

export async function shouldRunExperiment(userId: string): Promise<boolean> {
  const ctx = await buildPlayerContext(userId);
  
  if (ctx.layer <= 1) {
    return ctx.sessionCount >= 2 && Math.random() < 0.6;
  }
  
  return Math.random() < 0.4;
}

export type ExperimentDirective = {
  experimentId: string;
  templateId: string;
  type: string;
  narrativeHook: string;
  successCriteria: string;
  covert: boolean;
};

export async function getExperimentDirective(
  userId: string,
  recentMessages?: string[]
): Promise<ExperimentDirective | null> {
  const shouldRun = await shouldRunExperiment(userId);
  if (!shouldRun) return null;
  
  const scheduled = await selectExperiment(userId, { recentMessages });
  if (!scheduled) return null;
  
  const experimentId = await activateExperiment(userId, scheduled);
  
  return {
    experimentId,
    templateId: scheduled.template.id,
    type: scheduled.template.type,
    narrativeHook: scheduled.narrativeHook,
    successCriteria: scheduled.template.successCriteria,
    covert: scheduled.template.covert,
  };
}
