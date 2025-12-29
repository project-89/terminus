import prisma from "@/app/lib/prisma";
import { uid } from "./memoryStore";

export type SynchronicityRecord = {
  id: string;
  userId: string;
  pattern: string;
  occurrences: Array<{ timestamp: string; context: string; value?: any }>;
  significance: number;
  acknowledged: boolean;
  note?: string;
  createdAt: Date;
};

type PatternDetector = {
  name: string;
  detect: (input: PatternInput) => PatternMatch | null;
};

type PatternInput = {
  userId: string;
  content: string;
  timestamp: Date;
  context?: string;
  previousInputs?: Array<{ content: string; timestamp: Date }>;
};

type PatternMatch = {
  pattern: string;
  value: any;
  significance: number;
};

const memSynchronicities: Map<string, SynchronicityRecord> = new Map();

const PATTERN_DETECTORS: PatternDetector[] = [
  {
    name: "repeating_numbers",
    detect: (input) => {
      const matches = input.content.match(/\b(\d)\1{2,}\b/g);
      if (matches) {
        return { pattern: `repeating:${matches[0]}`, value: matches[0], significance: 0.6 };
      }
      const angel = input.content.match(/\b(111|222|333|444|555|666|777|888|999|1111|1234)\b/);
      if (angel) {
        return { pattern: `angel_number:${angel[0]}`, value: angel[0], significance: 0.7 };
      }
      return null;
    },
  },
  {
    name: "time_patterns",
    detect: (input) => {
      const hour = input.timestamp.getHours();
      const minute = input.timestamp.getMinutes();
      if (hour === minute) {
        return { pattern: `mirror_time:${hour}:${minute}`, value: `${hour}:${minute}`, significance: 0.5 };
      }
      if ((hour === 3 && minute === 33) || (hour === 4 && minute === 44) || (hour === 11 && minute === 11)) {
        return { pattern: `power_time:${hour}:${minute}`, value: `${hour}:${minute}`, significance: 0.8 };
      }
      if (hour >= 3 && hour < 5) {
        return { pattern: "witching_hour", value: `${hour}:${minute}`, significance: 0.4 };
      }
      return null;
    },
  },
  {
    name: "word_echo",
    detect: (input) => {
      if (!input.previousInputs || input.previousInputs.length < 2) return null;
      const words = input.content.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      for (const prev of input.previousInputs.slice(-5)) {
        const prevWords = prev.content.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (prevWords.includes(word)) {
            const timeDiff = input.timestamp.getTime() - prev.timestamp.getTime();
            if (timeDiff > 60000 && timeDiff < 86400000) {
              return { pattern: `echo:${word}`, value: word, significance: 0.5 };
            }
          }
        }
      }
      return null;
    },
  },
  {
    name: "89_reference",
    detect: (input) => {
      if (input.content.includes("89") || input.content.toLowerCase().includes("eighty-nine")) {
        return { pattern: "project_89", value: "89", significance: 0.9 };
      }
      const sum = input.content.split("").reduce((acc, c) => {
        const n = parseInt(c);
        return isNaN(n) ? acc : acc + n;
      }, 0);
      if (sum === 89 || sum === 17 || sum === 8) {
        return { pattern: `numerology:${sum}`, value: sum, significance: 0.6 };
      }
      return null;
    },
  },
  {
    name: "session_pattern",
    detect: (input) => {
      const hour = input.timestamp.getHours();
      const dayOfWeek = input.timestamp.getDay();
      if (input.previousInputs && input.previousInputs.length >= 3) {
        const sameHourCount = input.previousInputs.filter(
          (p) => new Date(p.timestamp).getHours() === hour
        ).length;
        if (sameHourCount >= 2) {
          return { pattern: `ritual_time:${hour}`, value: hour, significance: 0.6 };
        }
        const sameDayCount = input.previousInputs.filter(
          (p) => new Date(p.timestamp).getDay() === dayOfWeek
        ).length;
        if (sameDayCount >= 2) {
          return { pattern: `ritual_day:${dayOfWeek}`, value: dayOfWeek, significance: 0.5 };
        }
      }
      return null;
    },
  },
  {
    name: "thematic_cluster",
    detect: (input) => {
      const themes: Record<string, string[]> = {
        death: ["death", "die", "dying", "dead", "kill", "end", "void", "nothing"],
        transformation: ["change", "transform", "become", "evolve", "metamorphosis", "shift"],
        awakening: ["wake", "awake", "aware", "conscious", "realize", "see", "truth"],
        connection: ["connect", "link", "bond", "together", "merge", "unite"],
        journey: ["path", "road", "journey", "quest", "travel", "seek", "find"],
        hidden: ["secret", "hidden", "mystery", "puzzle", "cipher", "code", "encrypt"],
      };

      const words = input.content.toLowerCase().split(/\s+/);
      for (const [theme, keywords] of Object.entries(themes)) {
        const matches = words.filter((w) => keywords.some((k) => w.includes(k)));
        if (matches.length >= 2) {
          return { pattern: `theme:${theme}`, value: matches, significance: 0.5 };
        }
      }
      return null;
    },
  },
];

export async function detectSynchronicities(params: {
  userId: string;
  content: string;
  context?: string;
}): Promise<SynchronicityRecord[]> {
  const timestamp = new Date();
  const detected: SynchronicityRecord[] = [];

  let previousInputs: Array<{ content: string; timestamp: Date }> = [];
  try {
    const recent = await prisma.memoryEvent.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    previousInputs = recent.map((r: any) => ({ content: r.content, timestamp: r.createdAt }));
  } catch {}

  const input: PatternInput = {
    userId: params.userId,
    content: params.content,
    timestamp,
    context: params.context,
    previousInputs,
  };

  for (const detector of PATTERN_DETECTORS) {
    const match = detector.detect(input);
    if (match) {
      const record = await recordSynchronicity({
        userId: params.userId,
        pattern: match.pattern,
        value: match.value,
        context: params.context || params.content.slice(0, 100),
        significance: match.significance,
      });
      detected.push(record);
    }
  }

  return detected;
}

async function recordSynchronicity(params: {
  userId: string;
  pattern: string;
  value: any;
  context: string;
  significance: number;
}): Promise<SynchronicityRecord> {
  const timestamp = new Date().toISOString();
  const occurrence = { timestamp, context: params.context, value: params.value };

  try {
    const existing = await prisma.synchronicity.findFirst({
      where: { userId: params.userId, pattern: params.pattern },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      const occurrences = Array.isArray(existing.occurrences) ? existing.occurrences : [];
      const newOccurrences = [...occurrences, occurrence];
      const newSignificance = Math.min(1.0, params.significance + occurrences.length * 0.05);

      await prisma.synchronicity.update({
        where: { id: existing.id },
        data: { occurrences: newOccurrences, significance: newSignificance },
      });

      return {
        id: existing.id,
        userId: params.userId,
        pattern: params.pattern,
        occurrences: newOccurrences as any,
        significance: newSignificance,
        acknowledged: existing.acknowledged,
        note: existing.note || undefined,
        createdAt: existing.createdAt,
      };
    }

    const created = await prisma.synchronicity.create({
      data: {
        userId: params.userId,
        pattern: params.pattern,
        occurrences: [occurrence],
        significance: params.significance,
      },
    });

    return {
      id: created.id,
      userId: params.userId,
      pattern: params.pattern,
      occurrences: [occurrence],
      significance: params.significance,
      acknowledged: false,
      createdAt: created.createdAt,
    };
  } catch {
    const id = `sync-${uid().slice(0, 8)}`;
    const existing = Array.from(memSynchronicities.values()).find(
      (s) => s.userId === params.userId && s.pattern === params.pattern
    );

    if (existing) {
      existing.occurrences.push(occurrence);
      existing.significance = Math.min(1.0, existing.significance + 0.05);
      return existing;
    }

    const record: SynchronicityRecord = {
      id,
      userId: params.userId,
      pattern: params.pattern,
      occurrences: [occurrence],
      significance: params.significance,
      acknowledged: false,
      createdAt: new Date(),
    };
    memSynchronicities.set(id, record);
    return record;
  }
}

export async function getUserSynchronicities(params: {
  userId: string;
  minSignificance?: number;
  limit?: number;
}): Promise<SynchronicityRecord[]> {
  const limit = params.limit ?? 20;
  const minSig = params.minSignificance ?? 0;

  try {
    const rows = await prisma.synchronicity.findMany({
      where: {
        userId: params.userId,
        significance: { gte: minSig },
      },
      orderBy: { significance: "desc" },
      take: limit,
    });

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      pattern: r.pattern,
      occurrences: r.occurrences as any,
      significance: r.significance,
      acknowledged: r.acknowledged,
      note: r.note || undefined,
      createdAt: r.createdAt,
    }));
  } catch {
    return Array.from(memSynchronicities.values())
      .filter((s) => s.userId === params.userId && s.significance >= minSig)
      .sort((a, b) => b.significance - a.significance)
      .slice(0, limit);
  }
}

export async function acknowledgeSynchronicity(id: string, note?: string): Promise<void> {
  try {
    await prisma.synchronicity.update({
      where: { id },
      data: { acknowledged: true, note: note || null },
    });
  } catch {
    const record = memSynchronicities.get(id);
    if (record) {
      record.acknowledged = true;
      record.note = note;
    }
  }
}

export async function getSynchronicitySummary(userId: string): Promise<{
  total: number;
  significant: number;
  patterns: Array<{ pattern: string; count: number; significance: number }>;
  recentInsight?: string;
}> {
  const all = await getUserSynchronicities({ userId, limit: 100 });

  const patterns = all.map((s) => ({
    pattern: s.pattern,
    count: s.occurrences.length,
    significance: s.significance,
  }));

  const significant = all.filter((s) => s.significance >= 0.7);

  let recentInsight: string | undefined;
  if (significant.length > 0) {
    const top = significant[0];
    const count = top.occurrences.length;
    if (top.pattern.startsWith("echo:")) {
      recentInsight = `The word "${top.pattern.split(":")[1]}" echoes through your sessions...`;
    } else if (top.pattern.startsWith("ritual_time:")) {
      recentInsight = `You return at the same hour. The pattern is noticed.`;
    } else if (top.pattern === "project_89") {
      recentInsight = `89. The number appears ${count} times. Coincidence decays.`;
    } else if (top.pattern.startsWith("theme:")) {
      recentInsight = `Your words cluster around ${top.pattern.split(":")[1]}. Interesting.`;
    } else if (top.pattern.startsWith("angel_number:")) {
      recentInsight = `${top.pattern.split(":")[1]} - someone is trying to tell you something.`;
    }
  }

  return {
    total: all.length,
    significant: significant.length,
    patterns,
    recentInsight,
  };
}
