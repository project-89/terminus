import prisma from "@/app/lib/prisma";
import { memoryStore } from "./memoryStore";

export type ProfileRecord = {
  traits: Record<string, any>;
  skills: Record<string, any>;
  preferences: Record<string, any>;
};

const DEFAULT_PROFILE: ProfileRecord = {
  traits: {
    alignment: "unknown",
    curiosity: "latent",
    resilience: "untested",
  },
  skills: {
    logic: 0,
    perception: 0,
    creation: 0,
    field: 0,
  },
  preferences: {
    intensity: "balanced",
    effects: "full",
    consent: true,
  },
};

function normalizeProfile(partial?: Partial<ProfileRecord>): ProfileRecord {
  return {
    traits: { ...DEFAULT_PROFILE.traits, ...(partial?.traits || {}) },
    skills: { ...DEFAULT_PROFILE.skills, ...(partial?.skills || {}) },
    preferences: {
      ...DEFAULT_PROFILE.preferences,
      ...(partial?.preferences || {}),
    },
  };
}

export async function getProfile(userId: string): Promise<ProfileRecord> {
  try {
    const profile = await prisma.playerProfile.findUnique({ where: { userId } });
    if (!profile) {
      return DEFAULT_PROFILE;
    }
    return normalizeProfile({
      traits: profile.traits as Record<string, any> | undefined,
      skills: profile.skills as Record<string, any> | undefined,
      preferences: profile.preferences as Record<string, any> | undefined,
    });
  } catch {
    const profile = memoryStore.profiles.get(userId) || null;
    if (!profile) return DEFAULT_PROFILE;
    return normalizeProfile(profile);
  }
}

export async function upsertProfile(
  userId: string,
  delta: Partial<ProfileRecord>
): Promise<ProfileRecord> {
  const merged = normalizeProfile(delta);
  try {
    const existing = await prisma.playerProfile.findUnique({ where: { userId } });
    if (existing) {
      await prisma.playerProfile.update({
        where: { userId },
        data: {
          traits: merged.traits,
          skills: merged.skills,
          preferences: merged.preferences,
        },
      });
    } else {
      await prisma.playerProfile.create({
        data: {
          userId,
          traits: merged.traits,
          skills: merged.skills,
          preferences: merged.preferences,
        },
      });
    }
    return merged;
  } catch {
    const profile = normalizeProfile({
      ...memoryStore.profiles.get(userId),
      ...delta,
    });
    memoryStore.profiles.set(userId, profile);
    return profile;
  }
}
