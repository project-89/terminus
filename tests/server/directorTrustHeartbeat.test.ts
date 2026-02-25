import { afterEach, describe, expect, it } from "vitest";
import { buildDirectorContext } from "@/app/lib/server/directorService";
import { cleanupTestData, createTestUser, testPrisma } from "../setup";

describe("director trust heartbeat", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("seeds trust above zero for engaged new users", async () => {
    const user = await createTestUser("trust-heartbeat-seed");

    const context = await buildDirectorContext({ userId: user.id });
    expect((context.player?.trustScore || 0)).toBeGreaterThan(0);

    const profile = await testPrisma.playerProfile.findUnique({
      where: { userId: user.id },
      select: { trustScore: true },
    });
    expect((profile?.trustScore || 0)).toBeGreaterThan(0);
  });

  it("does not increment trust on every immediate turn", async () => {
    const user = await createTestUser("trust-heartbeat-gate");

    await buildDirectorContext({ userId: user.id });
    const afterFirst = await testPrisma.playerProfile.findUnique({
      where: { userId: user.id },
      select: { trustScore: true },
    });

    await buildDirectorContext({ userId: user.id });
    const afterSecond = await testPrisma.playerProfile.findUnique({
      where: { userId: user.id },
      select: { trustScore: true },
    });

    expect(afterSecond?.trustScore).toBeCloseTo(afterFirst?.trustScore || 0, 8);
  });
});

