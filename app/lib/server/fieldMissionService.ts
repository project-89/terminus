/**
 * Field Mission Service
 *
 * Field missions are real-world tasks (photograph, observe, locate, etc.) that
 * intentionally coexist alongside standard in-game missions from missionService.
 * They operate on a different track (longer timescale, GPS/media evidence) and
 * are unlocked at higher trust layers (Layer 4+). Standard missions handle the
 * in-terminal puzzle/decode/social gameplay; field missions extend the experience
 * into the physical world.
 */
import prisma from "@/app/lib/prisma";
import { uid } from "./memoryStore";
import { createNode, createEdge } from "./knowledgeGraphService";
import { detectSynchronicities } from "./synchronicityService";

export type MissionType =
  | "OBSERVATION"
  | "PHOTOGRAPH"
  | "DOCUMENT"
  | "LOCATE"
  | "DECODE"
  | "CONTACT"
  | "RETRIEVE"
  | "VERIFY";

export type MissionStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "EVIDENCE_SUBMITTED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export type Objective = {
  id: string;
  description: string;
  required: boolean;
  completed: boolean;
  evidence?: string;
};

export type Evidence = {
  id: string;
  type: "photo" | "text" | "audio" | "location" | "document";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

export type LocationData = {
  latitude?: number;
  longitude?: number;
  radius?: number;
  placeName?: string;
  hint?: string;
};

export type FieldMissionRecord = {
  id: string;
  userId: string;
  type: MissionType;
  status: MissionStatus;
  title: string;
  briefing: string;
  objectives: Objective[];
  location?: LocationData;
  deadline?: Date;
  evidence: Evidence[];
  report?: string;
  evaluation?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
};

const memMissions: Map<string, FieldMissionRecord> = new Map();

export async function createFieldMission(params: {
  userId: string;
  type: MissionType;
  title: string;
  briefing: string;
  objectives: Array<{ description: string; required?: boolean }>;
  location?: LocationData;
  deadlineHours?: number;
}): Promise<FieldMissionRecord> {
  const id = `fm-${uid().slice(0, 8)}`;
  const now = new Date();
  const deadline = params.deadlineHours
    ? new Date(now.getTime() + params.deadlineHours * 60 * 60 * 1000)
    : undefined;

  const objectives: Objective[] = params.objectives.map((o, i) => ({
    id: `obj-${i}`,
    description: o.description,
    required: o.required ?? true,
    completed: false,
  }));

  const mission: FieldMissionRecord = {
    id,
    userId: params.userId,
    type: params.type,
    status: "ASSIGNED",
    title: params.title,
    briefing: params.briefing,
    objectives,
    location: params.location,
    deadline,
    evidence: [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    await prisma.fieldMission.create({
      data: {
        id,
        userId: params.userId,
        type: params.type,
        status: "ASSIGNED",
        title: params.title,
        briefing: params.briefing,
        objectives: objectives as any,
        location: params.location as any || null,
        deadline: deadline || null,
      },
    });

    await createNode({
      userId: params.userId,
      type: "MISSION",
      label: params.title,
      data: { missionId: id, type: params.type },
      discovered: true,
    });
  } catch {
    memMissions.set(id, mission);
  }

  return mission;
}

export async function acceptMission(missionId: string): Promise<FieldMissionRecord | null> {
  return updateMissionStatus(missionId, "ACCEPTED");
}

export async function startMission(missionId: string): Promise<FieldMissionRecord | null> {
  return updateMissionStatus(missionId, "IN_PROGRESS");
}

async function updateMissionStatus(
  missionId: string,
  status: MissionStatus
): Promise<FieldMissionRecord | null> {
  try {
    const updated = await prisma.fieldMission.update({
      where: { id: missionId },
      data: { status, updatedAt: new Date() },
    });
    return rowToRecord(updated);
  } catch {
    const mission = memMissions.get(missionId);
    if (mission) {
      mission.status = status;
      mission.updatedAt = new Date();
      return mission;
    }
    return null;
  }
}

export async function submitEvidence(params: {
  missionId: string;
  evidence: Omit<Evidence, "id" | "timestamp">;
  objectiveId?: string;
}): Promise<FieldMissionRecord | null> {
  const evidenceRecord: Evidence = {
    id: `ev-${uid().slice(0, 6)}`,
    ...params.evidence,
    timestamp: new Date().toISOString(),
  };

  try {
    const mission = await prisma.fieldMission.findUnique({
      where: { id: params.missionId },
    });
    if (!mission) return null;

    const currentEvidence = (mission.evidence as Evidence[]) || [];
    const objectives = (mission.objectives as Objective[]) || [];

    if (params.objectiveId) {
      const obj = objectives.find((o) => o.id === params.objectiveId);
      if (obj) {
        obj.completed = true;
        obj.evidence = evidenceRecord.id;
      }
    }

    const newEvidence = [...currentEvidence, evidenceRecord];
    const allRequiredComplete = objectives
      .filter((o) => o.required)
      .every((o) => o.completed);

    const newStatus: MissionStatus = allRequiredComplete ? "EVIDENCE_SUBMITTED" : "IN_PROGRESS";

    const updated = await prisma.fieldMission.update({
      where: { id: params.missionId },
      data: {
        evidence: newEvidence as any,
        objectives: objectives as any,
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    await detectSynchronicities({
      userId: mission.userId,
      content: params.evidence.content,
      context: `mission:${mission.title}`,
    });

    return rowToRecord(updated);
  } catch {
    const mission = memMissions.get(params.missionId);
    if (mission) {
      mission.evidence.push(evidenceRecord);
      if (params.objectiveId) {
        const obj = mission.objectives.find((o) => o.id === params.objectiveId);
        if (obj) {
          obj.completed = true;
          obj.evidence = evidenceRecord.id;
        }
      }
      mission.updatedAt = new Date();
      return mission;
    }
    return null;
  }
}

export async function submitReport(params: {
  missionId: string;
  report: string;
}): Promise<FieldMissionRecord | null> {
  try {
    const updated = await prisma.fieldMission.update({
      where: { id: params.missionId },
      data: {
        report: params.report,
        status: "UNDER_REVIEW",
        updatedAt: new Date(),
      },
    });
    return rowToRecord(updated);
  } catch {
    const mission = memMissions.get(params.missionId);
    if (mission) {
      mission.report = params.report;
      mission.status = "UNDER_REVIEW";
      mission.updatedAt = new Date();
      return mission;
    }
    return null;
  }
}

export async function evaluateMission(params: {
  missionId: string;
  evaluation: string;
  score: number;
  passed: boolean;
}): Promise<FieldMissionRecord | null> {
  const status: MissionStatus = params.passed ? "COMPLETED" : "FAILED";

  try {
    const updated = await prisma.fieldMission.update({
      where: { id: params.missionId },
      data: {
        evaluation: params.evaluation,
        score: params.score,
        status,
        updatedAt: new Date(),
      },
    });

    const record = rowToRecord(updated);

    if (params.passed) {
      await createNode({
        userId: record.userId,
        type: "DISCOVERY",
        label: `Completed: ${record.title}`,
        data: { missionId: params.missionId, score: params.score },
        discovered: true,
      });
    }

    return record;
  } catch {
    const mission = memMissions.get(params.missionId);
    if (mission) {
      mission.evaluation = params.evaluation;
      mission.score = params.score;
      mission.status = status;
      mission.updatedAt = new Date();
      return mission;
    }
    return null;
  }
}

export async function getMission(missionId: string): Promise<FieldMissionRecord | null> {
  try {
    const row = await prisma.fieldMission.findUnique({ where: { id: missionId } });
    return row ? rowToRecord(row) : null;
  } catch {
    return memMissions.get(missionId) || null;
  }
}

export async function getUserMissions(params: {
  userId: string;
  status?: MissionStatus;
  limit?: number;
}): Promise<FieldMissionRecord[]> {
  const limit = params.limit ?? 20;

  try {
    const where: any = { userId: params.userId };
    if (params.status) where.status = params.status;

    const rows = await prisma.fieldMission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map(rowToRecord);
  } catch {
    return Array.from(memMissions.values())
      .filter((m) => {
        if (m.userId !== params.userId) return false;
        if (params.status && m.status !== params.status) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export async function getActiveMission(userId: string): Promise<FieldMissionRecord | null> {
  const active = await getUserMissions({
    userId,
    limit: 1,
  });

  const inProgress = active.find((m) =>
    ["ACCEPTED", "IN_PROGRESS", "EVIDENCE_SUBMITTED", "UNDER_REVIEW"].includes(m.status)
  );

  return inProgress || null;
}

export async function checkExpiredMissions(userId: string): Promise<FieldMissionRecord[]> {
  const now = new Date();
  const expired: FieldMissionRecord[] = [];

  try {
    const missions = await prisma.fieldMission.findMany({
      where: {
        userId,
        status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
        deadline: { lt: now },
      },
    });

    for (const mission of missions) {
      await prisma.fieldMission.update({
        where: { id: mission.id },
        data: { status: "EXPIRED", updatedAt: now },
      });
      expired.push(rowToRecord({ ...mission, status: "EXPIRED" }));
    }
  } catch {
    for (const mission of Array.from(memMissions.values())) {
      if (
        mission.userId === userId &&
        mission.deadline &&
        mission.deadline < now &&
        ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(mission.status)
      ) {
        mission.status = "EXPIRED";
        mission.updatedAt = now;
        expired.push(mission);
      }
    }
  }

  return expired;
}

function rowToRecord(row: any): FieldMissionRecord {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as MissionType,
    status: row.status as MissionStatus,
    title: row.title,
    briefing: row.briefing,
    objectives: (row.objectives as Objective[]) || [],
    location: row.location as LocationData | undefined,
    deadline: row.deadline || undefined,
    evidence: (row.evidence as Evidence[]) || [],
    report: row.report || undefined,
    evaluation: row.evaluation || undefined,
    score: row.score ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const MISSION_TEMPLATES: Array<{
  type: MissionType;
  title: string;
  briefing: string;
  objectives: Array<{ description: string; required?: boolean }>;
  difficulty: "initiate" | "agent" | "operative";
}> = [
  {
    type: "OBSERVATION",
    title: "Pattern Recognition I",
    briefing: `Your first field assignment. We need eyes on the ground.

Go to a public space. Observe for 15 minutes. Report any patterns you notice:
- Repeating numbers (license plates, signs, timestamps)
- Color sequences
- Behavioral patterns in crowds
- Anything that feels... intentional.

Trust your instincts. The Pattern reveals itself to those who look.`,
    objectives: [
      { description: "Spend 15 minutes observing a public space", required: true },
      { description: "Document at least 3 patterns observed", required: true },
      { description: "Note any repeating numbers", required: false },
    ],
    difficulty: "initiate",
  },
  {
    type: "PHOTOGRAPH",
    title: "Liminal Spaces",
    briefing: `Document the in-between places.

Find and photograph 3 liminal spaces:
- Transitional areas (hallways, stairwells, parking structures)
- Places that feel "between" - not quite one thing or another
- Spaces that seem to exist outside normal time

The thresholds matter. What watches from the margins?`,
    objectives: [
      { description: "Photograph a transitional space", required: true },
      { description: "Photograph an empty public space", required: true },
      { description: "Photograph a threshold or doorway", required: true },
      { description: "Write a brief reflection on each space", required: false },
    ],
    difficulty: "initiate",
  },
  {
    type: "LOCATE",
    title: "Dead Drop Alpha",
    briefing: `Field operatives have left a marker for you.

Find a physical location matching these criteria:
- Public but overlooked
- Visible from exactly 89 steps from a notable landmark
- Contains the color blue prominently

Document the location. Leave nothing. Take nothing.
Others will use this waypoint.`,
    objectives: [
      { description: "Identify a notable local landmark", required: true },
      { description: "Locate a point 89 steps from it", required: true },
      { description: "Confirm blue is visible from this point", required: true },
      { description: "Document GPS coordinates", required: true },
    ],
    difficulty: "agent",
  },
  {
    type: "DECODE",
    title: "Signal in the Noise",
    briefing: `We've detected anomalous signals in your vicinity.

Over the next 48 hours, document any:
- Graffiti that seems to contain hidden meaning
- QR codes in unexpected places
- Unusual symbols or sigils
- Patterns in static, noise, or interference

Someone is always broadcasting. Learn to listen.`,
    objectives: [
      { description: "Find and document 3 potential signals", required: true },
      { description: "Attempt to decode at least one", required: true },
      { description: "Photograph evidence", required: true },
    ],
    difficulty: "agent",
  },
  {
    type: "VERIFY",
    title: "Reality Anchor",
    briefing: `Confirm the stability of your local reality.

Perform these verification rituals:
- At exactly 3:33 AM, check if your reflection behaves normally
- Count the steps from your bed to your door on 3 consecutive days
- Document any variations in familiar routes or locations

The simulation has glitches. We need to map them.`,
    objectives: [
      { description: "Perform the 3:33 AM verification", required: true },
      { description: "Document step counts for 3 days", required: true },
      { description: "Report any environmental anomalies", required: true },
      { description: "Photograph any physical inconsistencies", required: false },
    ],
    difficulty: "operative",
  },
  {
    type: "CONTACT",
    title: "Sleeper Protocol",
    briefing: `We believe there are others like you. Unawakened.

Your mission:
- In conversation, casually mention "Project 89" and observe reactions
- Look for the micro-expression of recognition
- Do NOT explain. Simply note who responds.

Some are waiting to be found. Some are watching you.
Proceed with caution.`,
    objectives: [
      { description: "Mention Project 89 to 3 different people", required: true },
      { description: "Document their responses carefully", required: true },
      { description: "Note anyone who shows unusual interest", required: true },
    ],
    difficulty: "operative",
  },
];

export async function generateMission(
  userId: string,
  difficulty: "initiate" | "agent" | "operative"
): Promise<FieldMissionRecord> {
  let templates: typeof MISSION_TEMPLATES = [];
  
  try {
    const dbTemplates = await prisma.fieldMissionTemplate.findMany({
      where: { 
        difficulty,
        active: true,
      },
    });
    
    if (dbTemplates.length > 0) {
      templates = dbTemplates.map((t: any) => ({
        type: t.type as MissionType,
        title: t.title,
        briefing: t.briefing,
        objectives: t.objectives as Array<{ description: string; required?: boolean }>,
        difficulty: t.difficulty as "initiate" | "agent" | "operative",
      }));
    }
  } catch {
  }
  
  if (templates.length === 0) {
    templates = MISSION_TEMPLATES.filter((t) => t.difficulty === difficulty);
  }
  
  const template = templates[Math.floor(Math.random() * templates.length)];

  return createFieldMission({
    userId,
    type: template.type,
    title: template.title,
    briefing: template.briefing,
    objectives: template.objectives,
    deadlineHours: difficulty === "initiate" ? 72 : difficulty === "agent" ? 48 : 24,
  });
}
