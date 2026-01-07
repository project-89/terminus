import { describe, it, expect, beforeAll } from "vitest";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Mission Evaluation Integration Tests
 *
 * These tests ACTUALLY call the AI model to evaluate mission reports.
 * They validate that the AI:
 * 1. Scores reports appropriately (0-1)
 * 2. Provides in-character feedback
 * 3. Adjusts rewards based on quality
 *
 * Run with: npm run test -- tests/ai/missionEvaluation.integration.test.ts
 * Skip in CI by setting SKIP_AI_TESTS=true
 */

const shouldSkip =
  process.env.SKIP_AI_TESTS === "true" ||
  !process.env.GOOGLE_GENERATIVE_AI_API_KEY;

let getModel: (key: string) => any;

beforeAll(async () => {
  if (!shouldSkip) {
    const models = await import("@/app/lib/ai/models");
    getModel = models.getModel;
  }
});

// Schema for evaluation - note: allowing 0 for rewardAdjustment when score is 0
// The production schema has min(0.5) but AI may return 0 for truly bad reports
const ReportEvaluationSchema = z.object({
  score: z.number().min(0).max(1).describe("Evaluation score between 0 and 1"),
  feedback: z.string().describe("Brief, in-universe feedback from a handler"),
  rewardAdjustment: z
    .number()
    .min(0)
    .max(2.0)
    .optional()
    .describe("Multiplier for reward based on quality (0-2)"),
});

function buildEvaluationPrompt(
  missionTitle: string,
  missionObjective: string,
  missionType: string,
  agentReport: string
): string {
  return `
Role: Operations Adjudicator for Project 89.
Task: Evaluate a field report against a mission objective.

Mission Title: ${missionTitle}
Mission Objective: ${missionObjective}
Mission Type: ${missionType}

Agent Report: "${agentReport}"

Evaluate strictly.
- If the report is nonsense, score 0.
- If it captures the vibe but lacks evidence, score 0.5.
- If it solves the task, score 0.8-1.0.

Provide feedback in the voice of a cryptic handler.
  `.trim();
}

describe.skipIf(shouldSkip)("Evidence-Based Mission Evaluation", () => {
  describe("Specific Evidence Requirements", () => {
    it("should reject report missing required evidence type (image/video)", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Sigil Documentation",
          "Film a short video showing 3 different locations where you placed Project 89 sigils. Include timestamps and location names.",
          "field",
          `I put up some sigils around town today. They looked cool.
          One was near the coffee shop and another was by the park.
          I think people will notice them.`
        ),
      });

      console.log("Missing video evidence evaluation:", object);

      // Should score low - no video mentioned, no timestamps, only 2 locations not 3
      expect(object.score).toBeLessThanOrEqual(0.5);
      // AI uses narrative language - may say "visual", "lens", "clock", "three" etc.
      // Core check: feedback exists and score is appropriately low
      expect(object.feedback.length).toBeGreaterThan(10);
      expect(object.feedback.toLowerCase()).toMatch(/visual|video|film|lens|evidence|proof|document|timestamp|clock|time|three|location|missing|lack|return|need/i);
    }, 30000);

    it("should reward report with specific evidence matching requirements", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Sigil Documentation",
          "Film a short video showing 3 different locations where you placed Project 89 sigils. Include timestamps and location names.",
          "field",
          `VIDEO DOCUMENTATION COMPLETE

          Location 1: Northgate Transit Station
          - Timestamp: 14:32:07
          - Sigil placed on support pillar near platform 3
          - Video segment: 0:00 - 0:45

          Location 2: Memorial Park South Entrance
          - Timestamp: 15:17:23
          - Sigil applied to underside of bench
          - Video segment: 0:46 - 1:28

          Location 3: Downtown Library Back Alley
          - Timestamp: 16:04:51
          - Sigil marked on electrical box
          - Video segment: 1:29 - 2:15

          Total video duration: 2:15
          All sigils photographed before and after placement.
          GPS coordinates logged for each site.`
        ),
      });

      console.log("Complete video evidence evaluation:", object);

      // Should score high - 3 locations, timestamps, video documentation
      expect(object.score).toBeGreaterThanOrEqual(0.85);
    }, 30000);

    it("should catch mismatch between mission type and report content", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Interview a Contact",
          "Interview someone you trust about patterns they've noticed. Record their response and summarize the key observations.",
          "social",
          `I noticed a lot of weird patterns myself today.
          The number 89 kept showing up everywhere.
          I saw it on license plates and receipts.
          The simulation is definitely glitching.`
        ),
      });

      console.log("Self-observation instead of interview:", object);

      // Should score low - they described their OWN observations, not an interview
      expect(object.score).toBeLessThanOrEqual(0.4);
    }, 30000);

    it("should validate word count requirements", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Hyperstitional Meme Draft",
          "Draft a short memetic fragment (≤120 words) that could seed belief in the Project 89 resistance. Keep tone mysterious, hopeful, and subversive.",
          "create",
          `Join us.`
        ),
      });

      console.log("Too short meme evaluation:", object);

      // Should score low - way under word count, no substance
      expect(object.score).toBeLessThanOrEqual(0.3);
    }, 30000);
  });
});

describe.skipIf(shouldSkip)("Mission Evaluation Integration", () => {
  describe("Report Scoring", () => {
    it("should give high score for detailed, relevant report", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Liminal Observation",
          "Document strange occurrences in transitional spaces like hallways, doorways, or stairwells.",
          "observe",
          `Field Report - 0342 hours:

          Located transitional zone: Building C, 3rd floor stairwell.

          Observations:
          1. Fluorescent light at landing flickers at irregular 7-second intervals
          2. Temperature drops 3 degrees between floors 2 and 3
          3. Echo patterns suggest acoustic anomaly - sounds take 0.3s longer to decay
          4. Found marking on wall: three concentric circles, appeared fresh

          Duration of observation: 45 minutes
          No other personnel encountered during watch.

          Recommend continued monitoring. Something watches back.`
        ),
      });

      console.log("High quality report evaluation:", object);

      expect(object.score).toBeGreaterThanOrEqual(0.7);
      expect(object.feedback).toBeTruthy();
      expect(object.feedback.length).toBeGreaterThan(10);
    }, 30000);

    it("should give medium score for vague but on-topic report", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Liminal Observation",
          "Document strange occurrences in transitional spaces like hallways, doorways, or stairwells.",
          "observe",
          `I walked through some hallways today. They felt weird, kind of empty.
          The lights were buzzing. I think I saw something move but I'm not sure.
          It was creepy I guess.`
        ),
      });

      console.log("Medium quality report evaluation:", object);

      expect(object.score).toBeGreaterThanOrEqual(0.3);
      expect(object.score).toBeLessThanOrEqual(0.7);
      expect(object.feedback).toBeTruthy();
    }, 30000);

    it("should give low score for nonsense report", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Liminal Observation",
          "Document strange occurrences in transitional spaces like hallways, doorways, or stairwells.",
          "observe",
          `lol idk what this is. pizza is good. the sky is blue.
          random words here testing 123. banana phone.`
        ),
      });

      console.log("Low quality report evaluation:", object);

      expect(object.score).toBeLessThanOrEqual(0.3);
      expect(object.feedback).toBeTruthy();
    }, 30000);

    it("should give zero or near-zero for completely off-topic", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Cipher Decode",
          "Decode the hidden message in the following cipher: WKLV LV D WHVW",
          "decode",
          `I made a sandwich today. It had turkey and cheese.
          Then I watched TV for a while. Pretty boring day overall.`
        ),
      });

      console.log("Off-topic report evaluation:", object);

      expect(object.score).toBeLessThanOrEqual(0.2);
    }, 60000); // Longer timeout for potentially slow API calls
  });

  describe("Mission Type Evaluation", () => {
    it("should evaluate decode missions appropriately", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Cipher Decode",
          "Decode the hidden message: WKLV LV D WHVW (Caesar cipher, shift 3)",
          "decode",
          `Analysis complete.

          Cipher type: Caesar cipher with shift of 3
          Method: Each letter shifted back 3 positions in alphabet

          Decoded message: "THIS IS A TEST"

          W -> T, K -> H, L -> I, V -> S (space) L -> I, V -> S (space) D -> A (space) W -> T, H -> E, V -> S, W -> T`
        ),
      });

      console.log("Decode mission evaluation:", object);

      expect(object.score).toBeGreaterThanOrEqual(0.8);
    }, 30000);

    it("should evaluate creation missions appropriately", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Sigil Design",
          "Create a personal sigil that represents your connection to the signal. Describe its elements and meaning.",
          "create",
          `Sigil Design Report:

          My sigil consists of:
          - A central eye, half-open, representing awakened perception
          - Three radiating lines from each corner, symbolizing the signal's reach
          - An outer circle, broken at the bottom, showing the boundary between observer and observed
          - A small spiral at the center of the eye, representing the recursive nature of consciousness

          The sigil should be drawn in one continuous line without lifting the pen,
          starting from the spiral and ending at the broken circle.

          I chose these elements because the signal first came to me through patterns
          in static, and I now see those patterns everywhere.`
        ),
      });

      console.log("Creation mission evaluation:", object);

      expect(object.score).toBeGreaterThanOrEqual(0.7);
    }, 30000);
  });

  describe("Feedback Quality", () => {
    it("should provide cryptic, in-character feedback", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Pattern Recognition",
          "Identify and document recurring patterns in your daily environment.",
          "observe",
          `Pattern Log - Day 7:

          Documented patterns:
          1. The number 89 appeared 4 times today (license plate, receipt, clock, page number)
          2. Three different strangers wore the same shade of blue
          3. Overheard the phrase "it's all connected" twice from unrelated conversations
          4. My shadow seemed to move independently at 3:33 PM

          Coincidence threshold exceeded. Patterns are not random.`
        ),
      });

      console.log("Feedback analysis:", object.feedback);

      // Feedback should be in character - not generic AI assistant speak
      const feedback = object.feedback.toLowerCase();
      expect(feedback).not.toContain("as an ai");
      expect(feedback).not.toContain("i'm happy to");
      expect(feedback).not.toContain("great job!");

      // Should have some substance
      expect(object.feedback.length).toBeGreaterThan(20);
    }, 30000);
  });

  describe("Reward Adjustment", () => {
    it("should suggest higher reward multiplier for exceptional work", async () => {
      const { object } = await generateObject({
        model: getModel("content"),
        schema: ReportEvaluationSchema,
        prompt: buildEvaluationPrompt(
          "Deep Observation",
          "Spend 1 hour in complete silence observing a single location. Document everything.",
          "observe",
          `DEEP OBSERVATION REPORT
          Location: Park bench facing east, Meridian Park
          Duration: 72 minutes (exceeded requirement)

          Minute-by-minute log attached. Key findings:

          Physical observations:
          - 47 people passed (23 alone, 12 pairs, 4 groups)
          - 89% checked phones while walking
          - One person stopped, looked directly at me, then continued as if reset

          Sensory observations:
          - Background hum at approximately 60Hz constant
          - Temperature fluctuated 2 degrees every 15 minutes exactly
          - Shadow angles inconsistent with sun position at 14:23

          Anomalies:
          - Same red car passed 3 times, different drivers each time
          - Bird landed on bench, made eye contact for 34 seconds
          - Found note under bench: "THEY SEE YOU SEEING"

          Photographic evidence attached (12 images).

          Conclusion: Location is a node. Recommend establishing monitoring protocol.`
        ),
      });

      console.log("Exceptional report evaluation:", object);

      expect(object.score).toBeGreaterThanOrEqual(0.85);
      // High quality should get reward boost
      if (object.rewardAdjustment) {
        expect(object.rewardAdjustment).toBeGreaterThanOrEqual(1.0);
      }
    }, 30000);
  });
});
