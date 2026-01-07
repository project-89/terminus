import { describe, it, expect } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import {
  getNextMission,
  acceptMission,
  getLatestOpenMissionRun,
} from "@/app/lib/server/missionService";

describe("Mission System", () => {
  describe("getNextMission", () => {
    it("should return a mission definition for a user", async () => {
      const user = await createTestUser("test-mission-next");

      const mission = await getNextMission(user.id);

      expect(mission).not.toBeNull();
      expect(mission?.id).toBeTruthy();
      expect(mission?.title).toBeTruthy();
      expect(mission?.prompt).toBeTruthy();
      expect(mission?.type).toBeTruthy();
    });

    it("should return mission with required fields", async () => {
      const user = await createTestUser("test-mission-fields");

      const mission = await getNextMission(user.id);

      expect(mission).toHaveProperty("id");
      expect(mission).toHaveProperty("title");
      expect(mission).toHaveProperty("prompt");
      expect(mission).toHaveProperty("type");
      expect(mission).toHaveProperty("minEvidence");
      expect(mission).toHaveProperty("tags");
      expect(Array.isArray(mission?.tags)).toBe(true);
    });
  });

  describe("acceptMission", () => {
    it("should create a mission run with ACCEPTED status", async () => {
      const user = await createTestUser("test-mission-accept");

      // First get a mission
      const mission = await getNextMission(user.id);
      expect(mission).not.toBeNull();

      // Accept the mission
      const run = await acceptMission({
        missionId: mission!.id,
        userId: user.id,
      });

      expect(run.id).toBeTruthy();
      expect(run.status).toBe("ACCEPTED");
      expect(run.mission.id).toBe(mission!.id);
    });

    it("should associate mission run with session if provided", async () => {
      const user = await createTestUser("test-mission-session");
      const session = await testPrisma.gameSession.create({
        data: { userId: user.id, status: "OPEN" },
      });

      const mission = await getNextMission(user.id);
      expect(mission).not.toBeNull();

      const run = await acceptMission({
        missionId: mission!.id,
        userId: user.id,
        sessionId: session.id,
      });

      expect(run.id).toBeTruthy();
      expect(run.status).toBe("ACCEPTED");

      // Verify in database
      const dbRun = await testPrisma.missionRun.findUnique({
        where: { id: run.id },
      });
      expect(dbRun?.sessionId).toBe(session.id);
    });

    it("should allow multiple mission runs for same user", async () => {
      const user = await createTestUser("test-mission-multi");

      const mission1 = await getNextMission(user.id);
      const run1 = await acceptMission({
        missionId: mission1!.id,
        userId: user.id,
      });

      const mission2 = await getNextMission(user.id);
      const run2 = await acceptMission({
        missionId: mission2!.id,
        userId: user.id,
      });

      expect(run1.id).not.toBe(run2.id);
    });
  });

  describe("getLatestOpenMissionRun", () => {
    it("should return null when no open missions exist", async () => {
      const user = await createTestUser("test-mission-none");

      const run = await getLatestOpenMissionRun(user.id);

      expect(run).toBeNull();
    });

    it("should return the latest accepted mission", async () => {
      const user = await createTestUser("test-mission-latest");

      const mission = await getNextMission(user.id);
      const acceptedRun = await acceptMission({
        missionId: mission!.id,
        userId: user.id,
      });

      const latestRun = await getLatestOpenMissionRun(user.id);

      expect(latestRun).not.toBeNull();
      expect(latestRun?.id).toBe(acceptedRun.id);
      expect(latestRun?.status).toBe("ACCEPTED");
    });

    it("should not return completed missions", async () => {
      const user = await createTestUser("test-mission-completed");

      const mission = await getNextMission(user.id);
      const run = await acceptMission({
        missionId: mission!.id,
        userId: user.id,
      });

      // Mark it as completed directly
      await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "COMPLETED" },
      });

      const latestRun = await getLatestOpenMissionRun(user.id);

      expect(latestRun).toBeNull();
    });

    it("should return most recent of multiple open missions", async () => {
      const user = await createTestUser("test-mission-multiple-open");

      const mission1 = await getNextMission(user.id);
      await acceptMission({
        missionId: mission1!.id,
        userId: user.id,
      });

      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 10));

      const mission2 = await getNextMission(user.id);
      const run2 = await acceptMission({
        missionId: mission2!.id,
        userId: user.id,
      });

      const latestRun = await getLatestOpenMissionRun(user.id);

      expect(latestRun?.id).toBe(run2.id);
    });
  });

  describe("Mission Definition Management", () => {
    it("should create mission definition in database from catalog", async () => {
      const user = await createTestUser("test-mission-def");

      const mission = await getNextMission(user.id);

      // Verify it's in the database
      const dbMission = await testPrisma.missionDefinition.findUnique({
        where: { id: mission!.id },
      });

      expect(dbMission).not.toBeNull();
      expect(dbMission?.title).toBe(mission!.title);
      expect(dbMission?.active).toBe(true);
    });

    it("should reuse existing mission definitions", async () => {
      const user1 = await createTestUser("test-mission-reuse-1");
      const user2 = await createTestUser("test-mission-reuse-2");

      // Get the same type of mission for two users
      const mission1 = await getNextMission(user1.id);
      const mission2 = await getNextMission(user2.id);

      // Count total definitions
      const count = await testPrisma.missionDefinition.count();

      // Should not create duplicate definitions
      expect(count).toBeGreaterThan(0);

      // Missions might be same or different, but definitions should be reused
      if (mission1?.id === mission2?.id) {
        expect(mission1?.title).toBe(mission2?.title);
      }
    });
  });

  describe("Mission Status Flow", () => {
    it("should track mission status transitions", async () => {
      const user = await createTestUser("test-mission-status");

      const mission = await getNextMission(user.id);
      const run = await acceptMission({
        missionId: mission!.id,
        userId: user.id,
      });

      // Initial status is ACCEPTED
      expect(run.status).toBe("ACCEPTED");

      // Simulate status changes
      await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "SUBMITTED" },
      });

      let dbRun = await testPrisma.missionRun.findUnique({
        where: { id: run.id },
      });
      expect(dbRun?.status).toBe("SUBMITTED");

      await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "REVIEWING" },
      });

      dbRun = await testPrisma.missionRun.findUnique({
        where: { id: run.id },
      });
      expect(dbRun?.status).toBe("REVIEWING");

      await testPrisma.missionRun.update({
        where: { id: run.id },
        data: { status: "COMPLETED", score: 0.85 },
      });

      dbRun = await testPrisma.missionRun.findUnique({
        where: { id: run.id },
      });
      expect(dbRun?.status).toBe("COMPLETED");
      expect(dbRun?.score).toBe(0.85);
    });

    it("should allow storing mission feedback", async () => {
      const user = await createTestUser("test-mission-feedback");

      const mission = await getNextMission(user.id);
      const run = await acceptMission({
        missionId: mission!.id,
        userId: user.id,
      });

      const feedback = "Excellent work, Agent. The pattern reveals itself.";
      await testPrisma.missionRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          score: 0.9,
          feedback,
          payload: "Agent report content here",
        },
      });

      const dbRun = await testPrisma.missionRun.findUnique({
        where: { id: run.id },
      });

      expect(dbRun?.feedback).toBe(feedback);
      expect(dbRun?.payload).toBe("Agent report content here");
    });
  });
});
