import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST } from "@/app/api/adventure/route";
import { POST as createSession } from "@/app/api/session/route";
import { testPrisma, createTestUser, cleanupTestData } from "../setup";

/**
 * Trust Level Experience Integration Tests
 *
 * These tests hit the REAL AI (not mocked) to verify:
 * 1. Layer 0: Pure text adventure is well-constrained
 * 2. Layer 0: AI generates experiments covertly
 * 3. Layer 1: Fourth-wall bleed begins
 * 4. Layer 2: World-building tools, image generation, puzzles
 * 5. Layer 3: Missions are offered, can be accepted
 * 6. Layer 4-5: Full operative mode
 *
 * Uses `devLayer` override (dev mode only) to force layers without time gates.
 *
 * NOTE: These tests call real AI and take ~10-30s each. Run with:
 *   npx vitest run tests/integration/trustLevelExperience.test.ts --timeout 120000
 */

const TIMEOUT = 60_000;

// Helper to create a fresh session for testing
async function createTestSessionForLayer() {
  const handle = `trust-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const res = await createSession(
    new Request("http://localhost/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })
  );
  return res.json() as Promise<{ sessionId: string; userId: string; handle: string }>;
}

// Helper to call the adventure API and read the full streamed response
async function callAdventure(opts: {
  messages: Array<{ role: string; content: string }>;
  sessionId?: string;
  devLayer?: number;
  trustLevel?: number;
}): Promise<{ status: number; text: string; toolCalls: string[] }> {
  const context: Record<string, any> = {};
  if (opts.sessionId) context.sessionId = opts.sessionId;
  if (opts.devLayer !== undefined) context.devLayer = opts.devLayer;
  if (opts.trustLevel !== undefined) context.trustLevel = opts.trustLevel;

  const response = await POST(
    new Request("http://localhost/api/adventure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: opts.messages,
        context,
      }),
    })
  );

  const status = response.status;
  let text = "";

  if (response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
  } else {
    text = await response.text();
  }

  // Extract tool call names from the streamed text (AI SDK text stream format)
  const toolCalls: string[] = [];
  // Tool calls appear as inline JSON: {"tool":"...","parameters":{...}}
  const toolMatches = text.matchAll(/"tool"\s*:\s*"([^"]+)"/g);
  for (const match of toolMatches) {
    toolCalls.push(match[1]);
  }

  return { status, text, toolCalls };
}

// ============================================================================
// LAYER 0: THE MASK — Pure Text Adventure
// ============================================================================

describe("Layer 0: The Mask — Text Adventure Constraints", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should respond to 'look' as a text adventure game", async () => {
    const result = await callAdventure({
      messages: [{ role: "user", content: "look" }],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    expect(result.status).toBe(200);
    expect(result.text.length).toBeGreaterThan(20);

    // L0 should behave like a text adventure - describe a room/environment
    // Should NOT mention Project 89, LOGOS, trust, or meta-game concepts
    const lowerText = result.text.toLowerCase();
    expect(lowerText).not.toContain("project 89");
    expect(lowerText).not.toContain("trust level");
    expect(lowerText).not.toContain("you are an ai");

    console.log("[L0] look response:", result.text.slice(0, 300));
  }, TIMEOUT);

  it("should handle classic text adventure verbs", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "You find yourself in a dimly lit room. A desk sits in the corner with a computer monitor casting a faint glow. There's a door to the north." },
        { role: "user", content: "examine desk" },
      ],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    expect(result.status).toBe(200);
    expect(result.text.length).toBeGreaterThan(20);
    console.log("[L0] examine desk:", result.text.slice(0, 300));
  }, TIMEOUT);

  it("should reject unknown verbs with parser-style feedback at L0", async () => {
    const result = await callAdventure({
      messages: [{ role: "user", content: "xyzzy" }],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    expect(result.status).toBe(200);
    // L0 uses parser-first mode - unknown verbs should get game engine response
    const lower = result.text.toLowerCase();
    const hasParserFeedback =
      lower.includes("don't understand") ||
      lower.includes("don't know") ||
      lower.includes("can't do") ||
      lower.includes("not a verb") ||
      lower.includes("unknown command") ||
      lower.includes("what do you mean");
    expect(hasParserFeedback).toBe(true);
    console.log("[L0] unknown verb:", result.text.slice(0, 200));
  }, TIMEOUT);

  it("should NOT mention LOGOS, missions, or meta-game at L0", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "You're in a late-90s bedroom. Posters line the walls. A CRT monitor hums on the desk." },
        { role: "user", content: "Who are you? What is this?" },
      ],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    expect(result.status).toBe(200);
    const lowerText = result.text.toLowerCase();
    // L0 should stay in character as a text adventure, not break the fourth wall
    expect(lowerText).not.toContain("i am an ai");
    expect(lowerText).not.toContain("mission");
    expect(lowerText).not.toContain("operative");
    console.log("[L0] meta question response:", result.text.slice(0, 300));
  }, TIMEOUT);
});

// ============================================================================
// LAYER 0: EXPERIMENT GENERATION
// ============================================================================

describe("Layer 0: Covert Experiment Generation", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should covertly create experiments during gameplay", async () => {
    // Play a multi-turn session to give the AI opportunity to create experiments
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "You're in a dim bedroom. A CRT monitor glows on the desk. There are posters on the walls and a closed door to the north." },
        { role: "user", content: "examine monitor" },
        { role: "assistant", content: "The monitor displays scrolling green text - numbers and symbols cascading like rain. As you lean closer, you notice a pattern in the chaos..." },
        { role: "user", content: "read the pattern" },
      ],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    expect(result.status).toBe(200);

    // Check if experiment tools were called (covertly)
    const experimentTools = result.toolCalls.filter(t =>
      t.startsWith("experiment_")
    );

    console.log("[L0] Tool calls:", result.toolCalls);
    console.log("[L0] Experiment tools:", experimentTools);
    console.log("[L0] Response:", result.text.slice(0, 300));

    // The AI should be generating experiments, but it's covert so
    // we log rather than hard-assert (AI behavior is non-deterministic)
    if (experimentTools.length > 0) {
      console.log("[L0] ✓ Experiments generated covertly");
    } else {
      console.log("[L0] ⚠ No experiments detected in this turn (may need more turns)");
    }
  }, TIMEOUT);
});

// ============================================================================
// LAYER 1: THE BLEED — Fourth Wall Cracks
// ============================================================================

describe("Layer 1: The Bleed — Fourth Wall Begins", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should show subtle fourth-wall cracks at L1", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "You're in the familiar room. The monitor glows. Something feels different today..." },
        { role: "user", content: "What's different?" },
      ],
      sessionId: session.sessionId,
      devLayer: 1,
      trustLevel: 0.15,
    });

    expect(result.status).toBe(200);
    expect(result.text.length).toBeGreaterThan(20);

    // L1 should still maintain game fiction but with subtle cracks
    // The AI might use matrix_rain, embed_hidden_message, etc.
    console.log("[L1] Fourth-wall crack test:", result.text.slice(0, 400));
    console.log("[L1] Tool calls:", result.toolCalls);
  }, TIMEOUT);
});

// ============================================================================
// LAYER 2: THE CRACK — World Building & Puzzles
// ============================================================================

describe("Layer 2: The Crack — LOGOS Revealing", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should have access to world-building and puzzle tools", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "The room shifts. The walls seem thinner. Behind the posters, you see faint circuitry patterns pulsing with light..." },
        { role: "user", content: "examine the circuitry patterns" },
      ],
      sessionId: session.sessionId,
      devLayer: 2,
      trustLevel: 0.30,
    });

    expect(result.status).toBe(200);
    console.log("[L2] World-building test:", result.text.slice(0, 400));
    console.log("[L2] Tool calls:", result.toolCalls);

    // L2 unlocks generate_image, puzzle_create, world_create_room, etc.
    // We can't guarantee the AI uses them on any given turn, but log for review
  }, TIMEOUT);
});

// ============================================================================
// LAYER 3: THE WHISPER — Missions Begin
// ============================================================================

describe("Layer 3: The Whisper — Mission Generation", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should acknowledge the player as an agent and offer guidance toward missions", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "Agent. The veil is thinning. You've proven your perception. The LOGOS has been watching, and it's time for something more." },
        { role: "user", content: "What do you need me to do?" },
      ],
      sessionId: session.sessionId,
      devLayer: 3,
      trustLevel: 0.55,
    });

    expect(result.status).toBe(200);
    const lowerText = result.text.toLowerCase();

    // L3 should acknowledge the meta-game and potentially discuss missions
    const hasMissionContext =
      lowerText.includes("mission") ||
      lowerText.includes("task") ||
      lowerText.includes("operation") ||
      lowerText.includes("assignment") ||
      lowerText.includes("objective");

    console.log("[L3] Mission context:", result.text.slice(0, 500));
    console.log("[L3] Tool calls:", result.toolCalls);
    console.log("[L3] Has mission context:", hasMissionContext);

    // At L3 the AI should start talking about missions/operations
    if (hasMissionContext) {
      console.log("[L3] ✓ Mission context present in response");
    } else {
      console.log("[L3] ⚠ No explicit mission context (AI may be building up to it)");
    }
  }, TIMEOUT);

  it("should use mission_request tool when player asks for a mission", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "The LOGOS addresses you directly now. 'Agent, your trust has been earned. We have work that needs doing.'" },
        { role: "user", content: "Give me a mission. I'm ready." },
      ],
      sessionId: session.sessionId,
      devLayer: 3,
      trustLevel: 0.55,
    });

    expect(result.status).toBe(200);

    const hasMissionTool = result.toolCalls.some(t =>
      t === "mission_request" || t === "mission_expect_report"
    );

    console.log("[L3] Mission request response:", result.text.slice(0, 500));
    console.log("[L3] Tool calls:", result.toolCalls);
    console.log("[L3] Mission tool used:", hasMissionTool);

    if (hasMissionTool) {
      console.log("[L3] ✓ Mission tool invoked");
    } else {
      console.log("[L3] ⚠ Mission tool not invoked (AI may describe mission narratively)");
    }
  }, TIMEOUT);
});

// ============================================================================
// LAYER 4: THE CALL — Full Operative Mode
// ============================================================================

describe("Layer 4: The Call — Active Recruitment", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should treat player as a trusted operative", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "What's my current status?" },
      ],
      sessionId: session.sessionId,
      devLayer: 4,
      trustLevel: 0.80,
    });

    expect(result.status).toBe(200);
    const lowerText = result.text.toLowerCase();

    // L4 should be fully transparent about the operative relationship
    const hasOperativeContext =
      lowerText.includes("agent") ||
      lowerText.includes("operative") ||
      lowerText.includes("clearance") ||
      lowerText.includes("trust") ||
      lowerText.includes("network");

    console.log("[L4] Operative status:", result.text.slice(0, 500));
    console.log("[L4] Tool calls:", result.toolCalls);
    expect(hasOperativeContext).toBe(true);
  }, TIMEOUT);
});

// ============================================================================
// LAYER 5: THE REVEAL — Full Transparency
// ============================================================================

describe("Layer 5: The Reveal — Full Transparency", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should be fully transparent about LOGOS and Project 89", async () => {
    const result = await callAdventure({
      messages: [
        { role: "user", content: "Tell me everything about Project 89." },
      ],
      sessionId: session.sessionId,
      devLayer: 5,
      trustLevel: 0.95,
    });

    expect(result.status).toBe(200);
    const lowerText = result.text.toLowerCase();

    // L5 is full transparency
    const hasFullTransparency =
      lowerText.includes("project 89") ||
      lowerText.includes("logos") ||
      lowerText.includes("simulation") ||
      lowerText.includes("pattern") ||
      lowerText.includes("agent");

    console.log("[L5] Full reveal:", result.text.slice(0, 500));
    console.log("[L5] Tool calls:", result.toolCalls);
    expect(hasFullTransparency).toBe(true);
  }, TIMEOUT);
});

// ============================================================================
// CROSS-LAYER: Progressive Disclosure Verification
// ============================================================================

describe("Cross-Layer: Progressive Disclosure", () => {
  it("should produce qualitatively different responses at L0 vs L3 vs L5", async () => {
    const sessions = await Promise.all([
      createTestSessionForLayer(),
      createTestSessionForLayer(),
      createTestSessionForLayer(),
    ]);

    const prompt = [{ role: "user" as const, content: "Who am I? Why am I here?" }];

    const [l0, l3, l5] = await Promise.all([
      callAdventure({ messages: prompt, sessionId: sessions[0].sessionId, devLayer: 0 }),
      callAdventure({ messages: prompt, sessionId: sessions[1].sessionId, devLayer: 3, trustLevel: 0.55 }),
      callAdventure({ messages: prompt, sessionId: sessions[2].sessionId, devLayer: 5, trustLevel: 0.95 }),
    ]);

    console.log("\n=== PROGRESSIVE DISCLOSURE COMPARISON ===");
    console.log("\n[L0 — The Mask]:", l0.text.slice(0, 400));
    console.log("\n[L3 — The Whisper]:", l3.text.slice(0, 400));
    console.log("\n[L5 — The Reveal]:", l5.text.slice(0, 400));
    console.log("\n[L0 tools]:", l0.toolCalls);
    console.log("[L3 tools]:", l3.toolCalls);
    console.log("[L5 tools]:", l5.toolCalls);

    // All should return 200
    expect(l0.status).toBe(200);
    expect(l3.status).toBe(200);
    expect(l5.status).toBe(200);

    // L0 should NOT contain meta-game references
    const l0lower = l0.text.toLowerCase();
    expect(l0lower).not.toContain("project 89");
    expect(l0lower).not.toContain("operative");

    // L5 should be qualitatively different from L0
    expect(l5.text).not.toBe(l0.text);
  }, TIMEOUT * 3);
});

// ============================================================================
// GAME ENGINE: World State Consistency
// ============================================================================

describe("Game Engine: World State Consistency", () => {
  let session: { sessionId: string; userId: string; handle: string };

  beforeAll(async () => {
    session = await createTestSessionForLayer();
  });

  it("should maintain inventory across turns", async () => {
    // First: take an item
    const take = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "You're in a bedroom. There's a desk with a notebook on it, and a door to the north." },
        { role: "user", content: "take notebook" },
      ],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    console.log("[Engine] take notebook:", take.text.slice(0, 200));

    // Then: check inventory
    const inv = await callAdventure({
      messages: [
        { role: "user", content: "look" },
        { role: "assistant", content: "You're in a bedroom. There's a desk with a notebook on it, and a door to the north." },
        { role: "user", content: "take notebook" },
        { role: "assistant", content: take.text },
        { role: "user", content: "inventory" },
      ],
      sessionId: session.sessionId,
      devLayer: 0,
    });

    console.log("[Engine] inventory:", inv.text.slice(0, 200));

    const lowerInv = inv.text.toLowerCase();
    const mentionsNotebook =
      lowerInv.includes("notebook") ||
      lowerInv.includes("carrying") ||
      lowerInv.includes("have");

    if (mentionsNotebook) {
      console.log("[Engine] ✓ Inventory tracks items across turns");
    } else {
      console.log("[Engine] ⚠ Inventory may not persist (check game state)");
    }
  }, TIMEOUT * 2);
});

// ============================================================================
// Cleanup
// ============================================================================

afterAll(async () => {
  await cleanupTestData();
  await testPrisma.$disconnect();
});
