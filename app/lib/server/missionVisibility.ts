export const TARGET_USER_TAG_PREFIX = "target-user:";
export const SCOPE_AGENT_TAG = "scope:agent";
export const ADMIN_ASSIGNED_TAG = "admin-assigned";

export function extractTargetUserIds(tags: string[] | null | undefined): string[] {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .filter((tag) => tag.startsWith(TARGET_USER_TAG_PREFIX))
    .map((tag) => tag.slice(TARGET_USER_TAG_PREFIX.length).trim())
    .filter((id) => id.length > 0);
}

export function isMissionVisibleToUser(tags: string[] | null | undefined, userId: string): boolean {
  const targets = extractTargetUserIds(tags);
  if (targets.length > 0) return targets.includes(userId);
  const normalizedTags = Array.isArray(tags) ? tags : [];
  if (normalizedTags.includes(ADMIN_ASSIGNED_TAG)) {
    return false;
  }
  return true;
}

export function withAgentTargetTags(tags: string[] | null | undefined, userId: string): string[] {
  const base = Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : [];
  const set = new Set(base);
  set.add(SCOPE_AGENT_TAG);
  set.add(`${TARGET_USER_TAG_PREFIX}${userId}`);
  return Array.from(set);
}
