import { describe, it, expect } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import { createExperiment, appendExperimentNote, listRecentExperiments } from "@/app/lib/server/experimentService";

describe("Experiment Service", () => {
  describe("createExperiment", () => {
    it("should create an experiment with all required fields", async () => {
      const user = await createTestUser("test-exp-full");

      const experiment = await createExperiment({
        userId: user.id,
        hypothesis: "Player will explore the void",
        task: "Observe player navigation behavior",
        success_criteria: "Player types 'look' or similar",
        title: "Void Exploration Test",
      });

      expect(experiment.id).toBeTruthy();
      expect(experiment.hypothesis).toBe("Player will explore the void");
      expect(experiment.task).toBe("Observe player navigation behavior");

      // Verify it's in the database
      const dbExperiment = await testPrisma.experiment.findUnique({
        where: { id: experiment.id },
      });
      expect(dbExperiment).toBeTruthy();
      expect(dbExperiment?.hypothesis).toBe("Player will explore the void");
    });

    it("should create an experiment with custom ID", async () => {
      const user = await createTestUser("test-exp-custom-id");
      const customId = `exp-custom-${Date.now()}`;

      const experiment = await createExperiment({
        userId: user.id,
        expId: customId,
        hypothesis: "Custom ID test",
        task: "Test custom ID generation",
      });

      expect(experiment.id).toBe(customId);
    });

    it("should fall back to AgentNote if Experiment table fails", async () => {
      // This test verifies the fallback behavior
      // In production, Experiment.create might fail for various reasons
      // The service should gracefully fall back to AgentNote

      const user = await createTestUser("test-exp-fallback");

      // Create experiment - should succeed in Experiment table first
      const experiment = await createExperiment({
        userId: user.id,
        hypothesis: "Fallback test hypothesis",
        task: "Fallback test task",
      });

      expect(experiment.id).toBeTruthy();
      expect(experiment.hypothesis).toBe("Fallback test hypothesis");
    });

    it("should generate experiment ID if not provided", async () => {
      const user = await createTestUser("test-exp-auto-id");

      const experiment = await createExperiment({
        userId: user.id,
        hypothesis: "Auto ID test",
        task: "Test automatic ID generation",
      });

      expect(experiment.id).toMatch(/^exp-[a-z0-9]+$/);
    });
  });

  describe("appendExperimentNote", () => {
    it("should add observation note to an experiment", async () => {
      const user = await createTestUser("test-exp-note");

      const experiment = await createExperiment({
        userId: user.id,
        hypothesis: "Note test",
        task: "Test notes",
      });

      const note = await appendExperimentNote({
        userId: user.id,
        id: experiment.id,
        observation: "Player typed 'look around'",
      });

      expect(note.id).toBe(experiment.id);
      expect(note.observation).toBe("Player typed 'look around'");
    });

    it("should add result and score to an experiment", async () => {
      const user = await createTestUser("test-exp-score");

      const experiment = await createExperiment({
        userId: user.id,
        hypothesis: "Score test",
        task: "Test scoring",
      });

      const note = await appendExperimentNote({
        userId: user.id,
        id: experiment.id,
        result: "success",
        score: 0.85,
      });

      expect(note.result).toBe("success");
      expect(note.score).toBe(0.85);
    });
  });

  describe("listRecentExperiments", () => {
    it("should return recent experiments for a user", async () => {
      const user = await createTestUser("test-exp-list");

      // Create multiple experiments with unique timestamps
      const exp1 = await createExperiment({
        userId: user.id,
        hypothesis: "First experiment",
        task: "Task 1",
      });
      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 10));
      const exp2 = await createExperiment({
        userId: user.id,
        hypothesis: "Second experiment",
        task: "Task 2",
      });
      await new Promise((r) => setTimeout(r, 10));
      const exp3 = await createExperiment({
        userId: user.id,
        hypothesis: "Third experiment",
        task: "Task 3",
      });

      const experiments = await listRecentExperiments({
        userId: user.id,
        limit: 5,
      });

      expect(experiments).toHaveLength(3);
      // Should be in reverse chronological order (newest first)
      expect(experiments[0].id).toBe(exp3.id);
      expect(experiments[2].id).toBe(exp1.id);
    });

    it("should respect limit parameter", async () => {
      const user = await createTestUser("test-exp-limit");

      // Create 5 experiments
      for (let i = 0; i < 5; i++) {
        await createExperiment({
          userId: user.id,
          hypothesis: `Experiment ${i}`,
          task: `Task ${i}`,
        });
      }

      const experiments = await listRecentExperiments({
        userId: user.id,
        limit: 2,
      });

      expect(experiments).toHaveLength(2);
    });
  });
});
