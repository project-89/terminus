import { describe, expect, it } from "vitest";
import {
  isMissionVisibleToUser,
  withAgentTargetTags,
  ADMIN_ASSIGNED_TAG,
} from "@/app/lib/server/missionVisibility";

describe("missionVisibility", () => {
  it("treats unscoped missions as visible", () => {
    expect(isMissionVisibleToUser(["global"], "user-a")).toBe(true);
    expect(isMissionVisibleToUser([], "user-a")).toBe(true);
    expect(isMissionVisibleToUser(undefined, "user-a")).toBe(true);
  });

  it("hides legacy admin-assigned missions when no explicit target is present", () => {
    expect(isMissionVisibleToUser([ADMIN_ASSIGNED_TAG], "user-a")).toBe(false);
  });

  it("shows scoped missions only to targeted users", () => {
    const scopedTags = withAgentTargetTags([ADMIN_ASSIGNED_TAG], "user-a");
    expect(isMissionVisibleToUser(scopedTags, "user-a")).toBe(true);
    expect(isMissionVisibleToUser(scopedTags, "user-b")).toBe(false);
  });
});
