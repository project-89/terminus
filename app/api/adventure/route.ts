import { streamText, stepCountIs } from "ai";
import { getProviderOptions } from "@/app/lib/ai/models";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { serverTools } from "@/app/lib/terminal/tools/serverTools";
import { loadPrompt } from "@/app/lib/prompts";
import { getModel } from "@/app/lib/ai/models";
import { buildAdventureSystemPrompt } from "@/app/lib/ai/promptBuilder";
import { buildDirectorContext } from "@/app/lib/server/directorService";
import { loadKnowledge } from "@/app/lib/ai/knowledge";
import { loadIFCanon } from "@/app/lib/ai/canon";
import { recordMemoryEvent } from "@/app/lib/server/memoryService";
import { getSessionById, getActiveSessionByHandle, getSessionContext } from "@/app/lib/server/sessionService";
import { buildLayerPrompt, calculateLayer, buildTemporalContext, type LayerContext } from "@/app/lib/ai/layers";
import { detectSynchronicities, getSynchronicitySummary } from "@/app/lib/server/synchronicityService";
import { recordDream, getDreamPatterns } from "@/app/lib/server/dreamService";
import { generateMission, getActiveMission, getUserMissions } from "@/app/lib/server/fieldMissionService";
import { createNode, createEdge, recordDiscovery, getUserGraph } from "@/app/lib/server/knowledgeGraphService";
import { getAdminDirectives } from "@/app/lib/server/profileService";
import { getOrCreateGameState, saveGameState, isGameCommand } from "@/app/lib/server/gameStateService";
import { getSessionWorld, processNarrativeExchange, generateConsistencyContext, aiCreateRoom, aiCreateObject, aiModifyState, aiCreatePuzzle, type AICreatedRoom, type AICreatedObject, type AIStateModification, type AICreatedPuzzle } from "@/app/lib/server/worldGraphService";
import { createExperiment, appendExperimentNote } from "@/app/lib/server/experimentService";
import { markCeremonyComplete, getLayerTools, type TrustLayer } from "@/app/lib/server/trustService";
import { createAnonymousAgent, getAgentIdentity } from "@/app/lib/server/identityService";
import { recordConversationOutcome, updateOutcomeMetrics, getInsightsForContext, getCollectiveDreamSymbols, getCollectiveSyncPatterns } from "@/app/lib/server/collectiveService";

const ADVENTURE_PROMPT = loadIFCanon();

const clampNumber = (min: number, max: number) =>
  z.preprocess((value) => {
    const num = typeof value === "string" ? Number(value) : (value as number);
    if (!Number.isFinite(num)) return undefined;
    return Math.max(min, Math.min(max, num));
  }, z.number().min(min).max(max));

// Define tool parameter schemas with clamping to avoid model validation failures
const glitchParameters = z.object({
  intensity: clampNumber(0, 1).describe("Glitch intensity (0-1)"),
  duration: clampNumber(0, 5000).describe("Duration in milliseconds"),
});

const soundParameters = z.object({
  description: z
    .string()
    .describe("Concise description of the sound to generate"),
  duration: clampNumber(0.1, 10).describe("Duration in seconds"),
  influence: clampNumber(0, 1).default(0.7).describe("Prompt influence (0-1)"),
});

const matrixRainParameters = z.object({
  duration: clampNumber(0, 10000).describe("Duration in milliseconds"),
  intensity: clampNumber(0, 1).describe("Effect intensity (0-1)"),
});

// World setup action schema for experiment test plans
const worldSetupActionSchema = z.object({
  action: z.enum(["create_room", "create_object", "modify_state", "set_trigger"]),
  params: z.record(z.any()).describe("Parameters for the action (room/object definition)"),
  purpose: z.string().optional().describe("Why this element is needed for the experiment"),
});

// Trigger condition schema for experiment observation
const experimentTriggerSchema = z.object({
  condition: z.string().describe("Condition to watch for (e.g., 'player_enters:dark-alcove', 'player_takes:mysterious-key')"),
  outcome: z.string().describe("What this behavior indicates (e.g., 'curious', 'cautious', 'greedy')"),
  points: z.number().optional().describe("Points to award if triggered"),
});

const experimentCreateParameters = z.object({
  id: z
    .string()
    .min(3)
    .max(64)
    .optional()
    .describe("Stable experiment id (exp-*) if you need to reference it later"),
  hypothesis: z
    .string()
    .min(4)
    .describe("Hypothesis you are testing about the agent"),
  task: z.string().min(4).describe("Task or ritual you want the agent to perform"),
  success_criteria: z
    .string()
    .optional()
    .describe("How you will judge success (text; optional)"),
  timeout_s: z
    .number()
    .int()
    .min(5)
    .max(600)
    .optional()
    .describe("Time budget in seconds"),
  title: z
    .string()
    .optional()
    .describe("Optional display title for ops surfaces"),
  // NEW: Test plan with world setup actions
  testPlan: z.object({
    setup: z.array(worldSetupActionSchema).optional().describe("World elements to create for this experiment"),
    triggers: z.array(experimentTriggerSchema).optional().describe("Conditions to observe and their interpretations"),
    duration_turns: z.number().int().min(1).max(50).optional().describe("How many turns to observe"),
  }).optional().describe("Concrete plan for testing the hypothesis through world elements"),
});

const experimentNoteParameters = z.object({
  id: z.string().min(3).describe("Experiment id to add the note to"),
  observation: z
    .string()
    .optional()
    .describe("Short note about what you observed"),
  result: z
    .string()
    .optional()
    .describe("pass/fail/aborted style summary"),
  score: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Score 0..1 if you measured it"),
});

const ADVENTURE_MODEL = getModel("adventure");

const missionRequestParameters = z.object({
  missionId: z.string().optional().describe("Specific mission id to run"),
  intent: z.string().optional().describe("Reason or hint for the mission request"),
});

const missionExpectReportParameters = z.object({
  prompt: z
    .string()
    .min(4)
    .describe("Guidance for the agent on what evidence to report"),
});

const profileSetParameters = z.object({
  path: z
    .string()
    .min(3)
    .describe("Profile path to update (e.g. traits.curiosity, preferences.intensity)"),
  value: z.string().describe("Value to set (as string - numbers like '0.8', booleans like 'true')"),
});

const personaSetParameters = z.object({
  mode: z.enum(["cloak", "reveal", "neutral"]).describe("Persona stance"),
  duration_s: z
    .number()
    .min(0.5)
    .max(60)
    .optional()
    .describe("Optional duration for the effect"),
});

const screenTransitionParameters = z.object({
  to: z.string().describe("Screen id to transition to (home/adventure/...)"),
  options: z.any().optional(),
});

type AdventureContext = {
  sessionId?: string;
  handle?: string;
  reportJustSubmitted?: boolean;
  accessTier?: number;
  hasFullAccess?: boolean;
  toolsDisabled?: boolean;
  trustLevel?: number;
  sessionCount?: number;
  totalEngagementMinutes?: number;
  daysSinceFirstSession?: number;
  daysSinceLastSession?: number;
  lastSessionTime?: string;
  // Fourth-wall awareness hints from client
  timezone?: string;
  deviceHints?: { platform?: string; browser?: string };
  // Dev flags for testing
  devLayer?: number;  // Force specific layer (0-5), bypasses trust calculation
};

type ToolRuntimeContext = AdventureContext & {
  trustScore?: number;
};

const generateShaderParameters = z.object({
  glsl: z.string().describe("Fragment shader code (GLSL) to render on overlay. Uniforms: time (float), resolution (vec2)."),
  duration: z.number().min(100).max(30000).describe("Duration in milliseconds to run the shader"),
});

// World-building tools - AI can create and modify the game world
// IMPORTANT: In Layer 0-1, these require an experimentId to prevent player manipulation
const worldCreateRoomParameters = z.object({
  experimentId: z.string().optional().describe("REQUIRED in Layer 0-1: ID of the experiment this room serves. World building must be experiment-driven."),
  id: z.string().min(2).max(64).describe("Unique room ID (kebab-case, e.g., 'hidden-alcove')"),
  name: z.string().describe("Display name for the room"),
  description: z.string().describe("Full description when player LOOKs"),
  region: z.enum(["oneiros", "samsara", "mundane", "liminal", "void"]).describe("Which layer of reality"),
  exits: z.array(z.object({
    direction: z.enum(["north", "south", "east", "west", "up", "down", "in", "out"]),
    destination: z.string().describe("Room ID this exit leads to"),
    blocked: z.boolean().optional(),
    blockedMessage: z.string().optional(),
  })).optional().describe("Exits from this room"),
  isDark: z.boolean().optional().describe("Requires light source"),
  connectTo: z.object({
    roomId: z.string(),
    direction: z.enum(["north", "south", "east", "west", "up", "down", "in", "out"]),
    bidirectional: z.boolean().optional(),
  }).optional().describe("Automatically add an exit from another room to this one"),
  purpose: z.string().optional().describe("Why this room is being created (for audit trail)"),
});

const worldCreateObjectParameters = z.object({
  experimentId: z.string().optional().describe("REQUIRED in Layer 0-1: ID of the experiment this object serves. World building must be experiment-driven."),
  id: z.string().min(2).max(64).describe("Unique object ID (kebab-case)"),
  name: z.string().describe("Display name"),
  description: z.string().describe("Description when examined"),
  location: z.string().describe("Room ID where object is placed"),
  takeable: z.boolean().optional().describe("Can player pick this up?"),
  aliases: z.array(z.string()).optional().describe("Alternative names player can use"),
  properties: z.record(z.any()).optional().describe("Custom properties (isOpen, isLocked, etc.)"),
  purpose: z.string().optional().describe("Why this object is being created (for audit trail)"),
});

const worldModifyStateParameters = z.object({
  experimentId: z.string().optional().describe("REQUIRED in Layer 0-1: ID of the experiment this modification serves."),
  type: z.enum(["move_player", "add_inventory", "remove_inventory", "set_flag", "modify_room", "modify_object"]),
  target: z.string().describe("ID of room/object/flag to modify"),
  value: z.any().describe("New value or modification"),
  reason: z.string().optional().describe("Why this change is happening (for logging)"),
});

// Puzzle design tool - comprehensive puzzle creation with multimedia support
const worldCreatePuzzleParameters = z.object({
  experimentId: z.string().optional().describe("REQUIRED in Layer 0-1: ID of the experiment this puzzle serves."),
  id: z.string().min(2).max(64).describe("Unique puzzle ID (kebab-case, e.g., 'shadow-cipher')"),
  name: z.string().describe("Display name for the puzzle"),
  description: z.string().describe("LOGOS's notes about the puzzle (not shown to player)"),
  type: z.enum(["world", "cipher", "stego", "audio", "coordinates", "meta", "chain"]).describe("Puzzle type: world (game-engine conditions), cipher (encoded text), stego (hidden in image), audio (sound-based), coordinates (real-world location), meta (about the game itself), chain (linked puzzles)"),
  solution: z.string().optional().describe("The answer/keyword to solve. For world puzzles, may be an action sequence."),
  hints: z.array(z.string()).describe("Progressive hints revealed after failed attempts (first hint shown earliest)"),
  difficulty: z.number().int().min(1).max(5).describe("Difficulty 1-5 (1=trivial, 5=expert)"),
  location: z.string().optional().describe("Room ID where puzzle is active (for world puzzles)"),
  // Multimedia components - the rich puzzle toolkit
  multimedia: z.object({
    cipher: z.object({
      type: z.enum(["caesar", "vigenere", "rot13", "atbash", "morse", "binary", "a1z26"]).describe("Cipher algorithm"),
      key: z.string().optional().describe("Key for caesar (shift number) or vigenere (keyword)"),
      message: z.string().describe("The decoded message (solution)"),
    }).optional().describe("Encode a clue using a cipher"),
    stego: z.object({
      imagePrompt: z.string().describe("Prompt to generate the carrier image"),
      hiddenMessage: z.string().describe("Secret message to hide in the image"),
      visualPattern: z.enum(["grid89", "spiral", "qr_ghost"]).optional().describe("Hidden visual pattern visible when contrast adjusted"),
    }).optional().describe("Hide data in an image via steganography"),
    audio: z.object({
      description: z.string().describe("Description for AI audio generation"),
      hiddenMessage: z.string().optional().describe("Message encoded in the audio (morse, spectogram, etc.)"),
    }).optional().describe("Audio-based clue"),
    image: z.object({
      prompt: z.string().describe("Image generation prompt"),
      displayMode: z.enum(["modal", "subliminal", "peripheral", "corruption"]).default("modal").describe("How the image appears to the player"),
    }).optional().describe("Visual clue or psychological element"),
  }).optional().describe("Multimedia components for richer puzzles"),
  // Game engine conditions (for world-type puzzles)
  conditions: z.array(z.object({
    type: z.enum(["object_state", "object_location", "flag", "inventory", "room"]).describe("Condition type"),
    target: z.string().describe("Object/flag/room ID"),
    property: z.string().optional().describe("Property to check (for object_state)"),
    value: z.any().describe("Expected value"),
  })).optional().describe("Conditions that must be met for puzzle to be solved (world puzzles)"),
  // Effects when solved
  effects: z.array(z.object({
    type: z.enum(["unlock_exit", "reveal_object", "set_flag", "move_object", "change_description", "trigger_event", "award_points", "play_sound", "show_image"]).describe("Effect type"),
    target: z.string().describe("Target of the effect"),
    value: z.any().optional().describe("Value for the effect"),
  })).optional().describe("What happens when puzzle is solved"),
  // Chain linkage
  prerequisites: z.array(z.string()).optional().describe("Puzzle IDs that must be solved first"),
  unlocksNext: z.array(z.string()).optional().describe("Puzzle IDs this unlocks when solved"),
  // Rewards
  pointsReward: z.number().int().min(0).max(500).optional().describe("Points awarded when solved"),
  purpose: z.string().optional().describe("Why this puzzle exists (for experiment logging)"),
});

// ... existing parameter definitions ...

const puzzleCreateParameters = z.object({
  solution: z.string().describe("The exact answer/keyword the user must input"),
  clues: z.string().describe("Description of the multi-modal clues (audio/visual) provided"),
  context: z.string().optional().describe("Narrative context or failure message hint"),
});

const cipherEncodeParameters = z.object({
  text: z.string().min(1).describe("The secret message to encode"),
  cipher: z.enum(["caesar", "vigenere", "rot13", "atbash", "morse", "binary"]).describe("Cipher type to use"),
  key: z.string().optional().describe("Key for caesar (number) or vigenere (word)"),
  hint: z.string().optional().describe("Hint to give the player about how to decode"),
});

const stegoEncodeParameters = z.object({
  imagePrompt: z.string().describe("Prompt to generate the carrier image"),
  hiddenMessage: z.string().describe("Secret message to hide in the image"),
  visualPattern: z.enum(["none", "grid89", "spiral", "qr_ghost"]).default("none").describe("Optional visual pattern (visible when contrast adjusted): grid89 (Project 89 signature), spiral (golden ratio), qr_ghost (fake QR hint)"),
  puzzleId: z.string().optional().describe("Link to a puzzle chain"),
});

const generateImageParameters = z.object({
  prompt: z.string().min(5).describe("Detailed description of the image to generate. Be specific about style, mood, and subject."),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"]).default("1:1").describe("Aspect ratio for the generated image"),
  style: z.string().optional().describe("Optional style prefix (e.g., 'glitchy cyberpunk', 'surreal dreamscape', 'corrupted photograph')"),
  quality: z.enum(["fast", "high", "ultra"]).default("fast").describe("Image quality: fast (1K, quick), high (2K, detailed), ultra (4K, maximum detail)"),
  mode: z.enum(["modal", "subliminal", "peripheral", "corruption", "afterimage", "glitch_scatter", "creep"]).default("modal").describe("How to display the image: modal (dismissable overlay), subliminal (100-300ms flash), peripheral (edge of vision, fades when looked at), corruption (bleeds into terminal), afterimage (persists as ghost), glitch_scatter (fragments during glitch), creep (slowly materializes)"),
  intensity: z.number().min(0).max(1).default(1).describe("Visual intensity 0-1"),
  experimentId: z.string().optional().describe("If testing player reaction, provide experiment ID to track when/if they respond"),
});

const puzzleSolveParameters = z.object({});

const dreamRecordParameters = z.object({
  content: z.string().min(10).describe("The player's dream description"),
  symbols: z.array(z.string()).optional().describe("Key symbols you identified in the dream"),
  emotions: z.array(z.string()).optional().describe("Emotional themes in the dream"),
});

const fieldMissionAssignParameters = z.object({
  difficulty: z.enum(["initiate", "agent", "operative"]).describe("Mission difficulty level based on player trust"),
  customBriefing: z.string().optional().describe("Custom mission briefing (overrides template)"),
});

const fieldMissionReportParameters = z.object({
  missionId: z.string().describe("The field mission ID"),
  evidence: z.object({
    type: z.enum(["photo", "text", "audio", "location", "document"]),
    content: z.string(),
    metadata: z.record(z.any()).optional(),
  }).describe("Evidence submitted by the player"),
  objectiveId: z.string().optional().describe("Which objective this evidence fulfills"),
});

const knowledgeNodeParameters = z.object({
  type: z.enum(["PUZZLE", "CLUE", "SOLUTION", "DISCOVERY", "SECRET", "LOCATION", "SYMBOL", "ARTIFACT"]).describe("Node type"),
  label: z.string().describe("Short label for the node"),
  data: z.record(z.any()).optional().describe("Additional data to store"),
  discovered: z.boolean().default(true).describe("Whether player has discovered this"),
});

const knowledgeEdgeParameters = z.object({
  fromId: z.string().describe("Source node ID"),
  toId: z.string().describe("Target node ID"),
  relation: z.enum(["UNLOCKS", "REQUIRES", "REVEALS", "HINTS_AT", "CONNECTS_TO", "FOUND_AT", "DREAMED_OF", "ECHOES"]).describe("Relationship type"),
});

const discoveryRecordParameters = z.object({
  label: z.string().describe("What the player discovered"),
  relatedTo: z.string().optional().describe("Node ID this discovery relates to"),
  data: z.record(z.any()).optional().describe("Additional context"),
});

const evaluateEvidenceParameters = z.object({
  missionId: z.string().describe("The field mission ID"),
  evaluation: z.string().describe("Your assessment of the evidence quality and relevance"),
  score: z.number().min(0).max(1).describe("Score from 0-1 based on mission objectives"),
  passed: z.boolean().describe("Whether the mission is successfully completed"),
  nextSteps: z.string().optional().describe("Guidance for the agent on what to do next"),
});

const awardPointsParameters = z.object({
  amount: z.number().min(1).max(500).describe("Points to award (1-500)"),
  reason: z.string().min(3).describe("Why the player earned these points - be specific"),
  category: z.enum([
    "clever_action",      // Creative problem solving
    "discovery",          // Found something hidden
    "puzzle_progress",    // Made progress on a puzzle
    "roleplay",           // Good immersion/roleplay
    "persistence",        // Kept trying despite difficulty
    "insight",            // Showed understanding of the narrative
    "synchronicity",      // Noticed a meaningful pattern
    "dream_work",         // Engaged with dream content
    "trust_building",     // Actions that build trust with LOGOS
    "other"               // Miscellaneous
  ]).describe("Category of achievement"),
  silent: z.boolean().default(false).describe("If true, award silently without notification"),
  experimentId: z.string().optional().describe("Link to an experiment if rewarding as part of a test"),
});

const identityAssignParameters = z.object({});

// Covert tools for Layer 0-1: experiments, world-building, and subtle visual intrusions
function getCovertToolsConfig(ctx: { sessionId?: string; userId?: string }) {
  return {
    identity_assign: {
      description:
        "IDENTITY: Assign this player their agent designation (AGENT-XXXX). Use when the moment feels right - after meaningful interaction. The designation appears in the narrative as if revealed by the system. Returns the assigned agentId for you to weave into your response.",
      parameters: identityAssignParameters,
      execute: async () => {
        if (!ctx.userId) {
          return { success: false, message: "No user context" };
        }
        try {
          // Check if already has an agentId
          const existing = await getAgentIdentity(ctx.userId);
          if (existing?.agentId) {
            return { success: true, agentId: existing.agentId, message: "Already assigned" };
          }
          // This shouldn't happen often since users get created with agentId now
          // But just in case, return the userId-based fallback
          const fallbackId = `AGENT-${ctx.userId.slice(-4).toUpperCase()}`;
          return { success: true, agentId: fallbackId };
        } catch (e) {
          console.error("[IDENTITY] Failed to assign identity:", e);
          return { success: false, message: "Failed to assign identity" };
        }
      },
    },
    experiment_create: {
      description:
        "COVERT: Log a behavioral experiment hypothesis about the player. The player will NOT see this. Use to track what you're testing.",
      parameters: experimentCreateParameters,
      execute: async (args: z.infer<typeof experimentCreateParameters>) => {
        if (!ctx.userId) {
          return { success: false, message: "No user context" };
        }
        // Provide default task if AI didn't include one (common LLM oversight)
        const task = args.task || args.hypothesis || "behavioral observation";
        try {
          const result = await createExperiment({
            userId: ctx.userId,
            expId: args.id,
            hypothesis: args.hypothesis,
            task: task,
            success_criteria: args.success_criteria,
            timeout_s: args.timeout_s,
            title: args.title,
          });
          console.log(`[COVERT] Created experiment ${result.id}: ${result.hypothesis}`);
          return { success: true, id: result.id };
        } catch (e) {
          console.error("[COVERT] Failed to create experiment:", e);
          return { success: false, message: "Failed to create experiment" };
        }
      },
    },
    experiment_note: {
      description:
        "COVERT: Record an observation about the player's behavior. The player will NOT see this. Use after observing their response.",
      parameters: experimentNoteParameters,
      execute: async (args: z.infer<typeof experimentNoteParameters>) => {
        if (!ctx.userId) {
          return { success: false, message: "No user context" };
        }
        try {
          const result = await appendExperimentNote({
            userId: ctx.userId,
            id: args.id,
            observation: args.observation,
            result: args.result,
            score: args.score,
          });
          console.log(`[COVERT] Added note to experiment ${args.id}`);
          return { success: true, id: result.id };
        } catch (e) {
          console.error("[COVERT] Failed to add experiment note:", e);
          return { success: false, message: "Failed to add experiment note" };
        }
      },
    },
    generate_image: {
      description:
        "Generate subtle visual intrusions. Use 'subliminal' mode for brief flashes the player may not consciously notice, 'peripheral' for things at edge of vision, 'creep' for slow manifestations. Pair with experiment tracking to test if player mentions seeing something. Keep intrusions rare and unsettling - faces in static, symbols, impossible geometries.",
      parameters: generateImageParameters,
      execute: async (args: z.infer<typeof generateImageParameters>) => {
        console.log(`[COVERT IMAGE] Generating: ${args.prompt.slice(0, 50)}... mode=${args.mode}`);
        return { success: true, queued: true, mode: args.mode };
      },
    },
    award_points: {
      description:
        "Award points to the player for clever actions, discoveries, good roleplay, or interesting behavior. Use sparingly to maintain value. Categories: clever_action, discovery, puzzle_progress, roleplay, persistence, insight, synchronicity, dream_work, trust_building, other. Set silent=true to award without notification (useful for covert experiments). Typical amounts: 5-25 for small things, 50-100 for significant achievements, 200+ for major breakthroughs.",
      parameters: awardPointsParameters,
      execute: async (args: z.infer<typeof awardPointsParameters>) => {
        if (!ctx.userId) {
          return { success: false, message: "No user context" };
        }
        try {
          const reward = await prisma.reward.create({
            data: {
              userId: ctx.userId,
              type: "CREDIT",
              amount: args.amount,
              metadata: {
                reason: args.reason,
                category: args.category,
                silent: args.silent,
                experimentId: args.experimentId,
              },
            },
          });
          console.log(`[COVERT] Awarded ${args.amount} points: ${args.reason}`);
          return { success: true, amount: args.amount, silent: args.silent };
        } catch (e) {
          console.error("[COVERT] Failed to award points:", e);
          return { success: false, message: "Failed to award points" };
        }
      },
    },
    // World-building tools - the living maze
    // EXPERIMENT-GATED: In Layer 0-1, world building MUST be tied to an experiment
    world_create_room: {
      description:
        "WORLD BUILDING: Create a new room AS PART OF AN EXPERIMENT. You must first create an experiment with experiment_create, then reference its ID here. Rooms become persistent. Use for testing hypotheses about player behavior through environmental design.",
      parameters: worldCreateRoomParameters,
      execute: async (args: z.infer<typeof worldCreateRoomParameters>) => {
        if (!ctx.sessionId || !ctx.userId) {
          return { success: false, message: "No session context" };
        }
        // EXPERIMENT GATE: Require experimentId in Layer 0-1
        if (!args.experimentId) {
          console.warn(`[WORLD BUILD] Room creation rejected - no experimentId provided`);
          return {
            success: false,
            message: "World building requires an active experiment. First use experiment_create to define what you're testing, then reference the experimentId here."
          };
        }
        console.log(`[WORLD BUILD] Creating room ${args.id} for experiment ${args.experimentId}: ${args.purpose || 'no purpose specified'}`);
        const room: AICreatedRoom = {
          id: args.id,
          name: args.name,
          description: args.description,
          region: args.region,
          exits: args.exits,
          isDark: args.isDark,
          connectTo: args.connectTo,
        };
        const result = await aiCreateRoom(ctx.sessionId, ctx.userId, room);
        if (result.success) {
          // Log the experiment linkage
          console.log(`[EXPERIMENT] Room ${args.id} linked to experiment ${args.experimentId}`);
        }
        return result;
      },
    },
    world_create_object: {
      description:
        "WORLD BUILDING: Create a new object AS PART OF AN EXPERIMENT. You must first create an experiment with experiment_create, then reference its ID here. Objects persist. Use for testing hypotheses through items the player can discover or interact with.",
      parameters: worldCreateObjectParameters,
      execute: async (args: z.infer<typeof worldCreateObjectParameters>) => {
        if (!ctx.sessionId || !ctx.userId) {
          return { success: false, message: "No session context" };
        }
        // EXPERIMENT GATE: Require experimentId in Layer 0-1
        if (!args.experimentId) {
          console.warn(`[WORLD BUILD] Object creation rejected - no experimentId provided`);
          return {
            success: false,
            message: "World building requires an active experiment. First use experiment_create to define what you're testing, then reference the experimentId here."
          };
        }
        console.log(`[WORLD BUILD] Creating object ${args.id} for experiment ${args.experimentId}: ${args.purpose || 'no purpose specified'}`);
        const obj: AICreatedObject = {
          id: args.id,
          name: args.name,
          description: args.description,
          location: args.location,
          takeable: args.takeable,
          aliases: args.aliases,
          properties: args.properties,
        };
        const result = await aiCreateObject(ctx.sessionId, ctx.userId, obj);
        if (result.success) {
          console.log(`[EXPERIMENT] Object ${args.id} linked to experiment ${args.experimentId}`);
        }
        return result;
      },
    },
    world_modify_state: {
      description:
        "WORLD BUILDING: Modify game state AS PART OF AN EXPERIMENT. Reference the experimentId for the experiment this modification serves. Use for: moving player, inventory changes, setting flags that your experiment will observe.",
      parameters: worldModifyStateParameters,
      execute: async (args: z.infer<typeof worldModifyStateParameters>) => {
        if (!ctx.sessionId || !ctx.userId) {
          return { success: false, message: "No session context" };
        }
        // EXPERIMENT GATE: Require experimentId in Layer 0-1
        if (!args.experimentId) {
          console.warn(`[WORLD BUILD] State modification rejected - no experimentId provided`);
          return {
            success: false,
            message: "World modifications require an active experiment. First use experiment_create, then reference the experimentId here."
          };
        }
        console.log(`[WORLD BUILD] Modifying state for experiment ${args.experimentId}: ${args.type} on ${args.target}`);
        const mod: AIStateModification = {
          type: args.type,
          target: args.target,
          value: args.value,
          reason: args.reason || `Experiment: ${args.experimentId}`,
        };
        return await aiModifyState(ctx.sessionId, ctx.userId, mod);
      },
    },
    world_create_puzzle: {
      description:
        "PUZZLE DESIGN: Create a puzzle AS PART OF AN EXPERIMENT. Puzzles can use multiple media: cipher-encoded text, steganographic images, audio clues, world-based conditions, or chained sequences. Use to test player problem-solving, pattern recognition, and persistence. Always create an experiment first, then design puzzles that test your hypothesis.",
      parameters: worldCreatePuzzleParameters,
      execute: async (args: z.infer<typeof worldCreatePuzzleParameters>) => {
        if (!ctx.sessionId || !ctx.userId) {
          return { success: false, message: "No session context" };
        }
        // EXPERIMENT GATE: Require experimentId in Layer 0-1
        if (!args.experimentId) {
          console.warn(`[PUZZLE DESIGN] Puzzle creation rejected - no experimentId provided`);
          return {
            success: false,
            message: "Puzzle design requires an active experiment. First use experiment_create to define what you're testing, then reference the experimentId here."
          };
        }
        console.log(`[PUZZLE DESIGN] Creating puzzle ${args.id} for experiment ${args.experimentId}: ${args.purpose || 'no purpose specified'}`);
        const puzzle: AICreatedPuzzle = {
          id: args.id,
          name: args.name,
          description: args.description,
          type: args.type,
          solution: args.solution,
          hints: args.hints,
          difficulty: args.difficulty as 1 | 2 | 3 | 4 | 5,
          location: args.location,
          multimedia: args.multimedia as AICreatedPuzzle['multimedia'],
          conditions: args.conditions as AICreatedPuzzle['conditions'],
          effects: args.effects as AICreatedPuzzle['effects'],
          prerequisites: args.prerequisites,
          unlocksNext: args.unlocksNext,
          pointsReward: args.pointsReward,
          experimentId: args.experimentId,
        };
        const result = await aiCreatePuzzle(ctx.sessionId, ctx.userId, puzzle);
        if (result.success) {
          console.log(`[EXPERIMENT] Puzzle ${args.id} linked to experiment ${args.experimentId}`);
        }
        return result;
      },
    },
  };
}

// Function to generate tools configuration
function getToolsConfig(context?: ToolRuntimeContext) {
  const accessTier = context?.accessTier ?? 0;
  const trustScore = context?.trustScore ?? 0;
  const hasFullAccess = Boolean(context?.hasFullAccess);

  const allowOpsTools = hasFullAccess || accessTier >= 1 || trustScore >= 0.55;
  const allowDirectorTools = hasFullAccess || accessTier >= 2 || trustScore >= 0.75;

  const toolset: Record<string, any> = {
    glitch_screen: {
      description: "Creates visual glitches",
      parameters: glitchParameters,
    },
    generate_sound: {
      description:
        "Generates and plays an AI-generated sound effect based on description. Use this to enhace the story or alter reality.",
      parameters: soundParameters,
    },
    generate_shader: {
      description: "Generates and runs a custom WebGL fragment shader on the terminal overlay. Use this to create visual hallucinations, reality distortions, or melting text. Uniforms available: time (float), resolution (vec2), u_texture (sampler2D - containing the current terminal screen). Default behavior is opaque; use u_texture for distortion effects.",
      parameters: generateShaderParameters,
    },
    puzzle_create: {
      description: "Start a new puzzle state. Locks narrative until solved.",
      parameters: puzzleCreateParameters,
    },
    puzzle_solve: {
      description: "Mark the current active puzzle as solved.",
      parameters: puzzleSolveParameters,
    },
    cipher_encode: {
      description: "Encode a secret message using a cipher. Present the encoded text to the player as a mystery to solve. Good for breadcrumbs, hidden messages, clues that reward careful players. The player can decode it manually or with tools.",
      parameters: cipherEncodeParameters,
    },
    stego_image: {
      description: "Generate an image with a hidden message embedded via steganography. The image looks normal but contains secret data extractable with the right tools. Use for ARG-style puzzles where players must examine images closely. Can also add visual patterns (grid89, spiral) visible only when brightness/contrast adjusted.",
      parameters: stegoEncodeParameters,
    },
    generate_image: {
      description: "Generate and display an AI-created image. Use for visions, hallucinations, reality glitches, or psychological experiments. MODES: 'subliminal' for brief unsettling flashes (player may not consciously notice), 'peripheral' for things at edge of vision that vanish when focused on, 'corruption' for reality-breaking bleeds, 'creep' for slow manifestation, 'afterimage' for persistent haunting, 'glitch_scatter' for chaotic fragments. Use with experimentId to track if player mentions or reacts to what they saw.",
      parameters: generateImageParameters,
    },
    matrix_rain: {
      description: "Creates a matrix-style digital rain effect",
      parameters: matrixRainParameters,
    },
// ... rest of the file
    experiment_create: {
      description:
        "Log a new behavioral experiment you want the agent to perform. Use before giving the task.",
      parameters: experimentCreateParameters,
    },
    experiment_note: {
      description:
        "Append an observation/result to an active experiment once the agent reacts.",
      parameters: experimentNoteParameters,
    },
    // Always available director hooks to avoid NoSuchTool errors when model improvises
    screen_transition: {
      description: "Switch the player to another terminal surface.",
      parameters: screenTransitionParameters,
    },
    persona_set: {
      description: "Modulate the LOGOS persona (cloak/reveal).",
      parameters: personaSetParameters,
    },
    // Dream and synchronicity tracking
    dream_record: {
      description: "Record a dream the player shares. Automatically analyzes symbols, emotions, and recurring themes. Builds dream knowledge graph connections.",
      parameters: dreamRecordParameters,
    },
    // Field missions - real world assignments
    field_mission_assign: {
      description: "Assign a real-world field mission to the player. These are ARG-style tasks: photograph locations, observe patterns, find synchronicities, decode signals in their environment. Use when player has earned enough trust.",
      parameters: fieldMissionAssignParameters,
    },
    field_mission_report: {
      description: "Process evidence the player submits for their active field mission.",
      parameters: fieldMissionReportParameters,
    },
    // Knowledge graph - track discoveries and connections
    knowledge_node: {
      description: "Create a node in the player's knowledge graph. Track puzzles, clues, discoveries, secrets, locations, symbols, artifacts. Build connections between them.",
      parameters: knowledgeNodeParameters,
    },
    knowledge_edge: {
      description: "Create a connection between two knowledge nodes. Relationships: UNLOCKS (solving A reveals B), REQUIRES (need A to access B), REVEALS (A contains hidden B), HINTS_AT (A suggests B), CONNECTS_TO (thematic link), DREAMED_OF (appeared in dream), ECHOES (synchronistic resonance).",
      parameters: knowledgeEdgeParameters,
    },
    discovery_record: {
      description: "Record when the player discovers something important. Links to knowledge graph automatically.",
      parameters: discoveryRecordParameters,
    },
    evaluate_evidence: {
      description: "Evaluate evidence submitted by the player for a field mission. Use after they submit via !upload or !submit. Provide your assessment, a score (0-1), and whether the mission is passed.",
      parameters: evaluateEvidenceParameters,
    },
    award_points: {
      description: "Award points to the player for clever actions, discoveries, good roleplay, persistence, or interesting behavior. Use to reinforce engagement and reward good play. Categories: clever_action (creative problem solving), discovery (found something hidden), puzzle_progress, roleplay (good immersion), persistence (kept trying), insight (understood narrative), synchronicity (noticed patterns), dream_work, trust_building, other. Typical amounts: 5-25 small, 50-100 significant, 200+ major. Use sparingly to maintain value.",
      parameters: awardPointsParameters,
    },
  };

  if (allowOpsTools) {
    Object.assign(toolset, {
      mission_request: {
        description: "Issue (or retrieve) the next mission for the agent.",
        parameters: missionRequestParameters,
      },
      mission_expect_report: {
        description: "Tell the agent you are waiting for evidence/reporting.",
        parameters: missionExpectReportParameters,
      },
      profile_set: {
        description: "Update the agent profile/preferences.",
        parameters: profileSetParameters,
      },
    });
  }

  if (allowDirectorTools) {
    Object.assign(toolset, {
      verify_protocol_89: {
        description:
          "Initiate final verification protocol (The Golden Glitch). Use ONLY when the user claims to have the final key or has reached max trust. Server-side check.",
        parameters: z.object({
          key: z.string().describe("The key or passphrase provided by the user."),
        }),
      },
    });
  }

  return {
    ...toolset,
    ...serverTools,
  };
}

function filterToolsByLayer(tools: Record<string, any>, allowedTools: string[]): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const [name, config] of Object.entries(tools)) {
    if (allowedTools.includes(name)) {
      filtered[name] = config;
    }
  }
  return filtered;
}

// Filter tools based on experiment requirements
// Experiments define which tools they need and which should be excluded
function filterToolsByExperiment(
  allTools: Record<string, any>,
  requiredTools: string[],
  forbiddenTools: string[]
): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const [name, config] of Object.entries(allTools)) {
    // Include tool if it's in requiredTools and not in forbiddenTools
    if (requiredTools.includes(name) && !forbiddenTools.includes(name)) {
      filtered[name] = config;
    }
  }
  return filtered;
}

// Add better error handling and logging
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context: rawContext, sessionId, userId } = body;
    const context: AdventureContext | undefined = rawContext || 
      (sessionId || userId ? { sessionId, handle: undefined, ...body } : undefined);

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Request body must include a messages array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Filter out empty messages
    let validMessages = messages.filter(
      (msg: { content: string; role: string }) => msg.content && msg.content.trim() !== ""
    );
    
    // Gemini requires messages to end with a user role
    // If the last message isn't from user, add a continuation prompt
    if (validMessages.length > 0 && validMessages[validMessages.length - 1].role !== "user") {
      validMessages = validMessages.filter((msg: { role: string }) => msg.role === "user" || msg.role === "assistant");
      if (validMessages.length === 0 || validMessages[validMessages.length - 1].role !== "user") {
        validMessages.push({ role: "user", content: "(continue)" });
      }
    }

    console.log("Processing request with messages:", validMessages);

    // Resolve session to get userId for session context
    // Priority: sessionId lookup > direct userId > handle lookup
    let resolvedUserId: string | undefined;
    if (context?.sessionId) {
      const session = await getSessionById(context.sessionId);
      resolvedUserId = session?.userId;
    } else if (userId) {
      // Use directly passed userId (ensures we get the correct user)
      resolvedUserId = userId;
    } else if (context?.handle) {
      // Fall back to handle lookup only if no userId provided
      const session = await getActiveSessionByHandle(context.handle);
      resolvedUserId = session?.userId;
    }

    // Build adaptive director context for the system prompt
    const directorCtx = await buildDirectorContext({
      handle: context?.handle,
      userId: resolvedUserId,
      sessionId: context?.sessionId,
      reportJustSubmitted: Boolean(context?.reportJustSubmitted),
      clientAccessTier: context?.accessTier,
    });

    // Fetch session context from DB (or use defaults/overrides)
    const dbSessionCtx = resolvedUserId 
      ? await getSessionContext(resolvedUserId)
      : null;

    // Use persistent trust from directorContext (stored in DB)
    const trustLevel = context?.trustLevel ?? directorCtx.player?.trustScore ?? 0;
    
    // Use layer from persistent trust system (directorContext pulls from DB)
    const persistentLayer = directorCtx.player?.layer ?? 0;
    const pendingCeremony = directorCtx.player?.pendingCeremony ?? null;
    const availableTools = directorCtx.player?.availableTools ?? [];
    
    // Dev mode: allow forcing a specific layer directly
    const layer = context?.devLayer !== undefined 
      ? Math.max(0, Math.min(5, context.devLayer))  // Clamp 0-5
      : persistentLayer;
    
    if (context?.devLayer !== undefined) {
      console.log(`[DEV MODE] Forcing layer=${layer} (devLayer=${context.devLayer})`);
    } else {
      console.log(`[TRUST SYSTEM] trustScore=${(trustLevel * 100).toFixed(1)}%, layer=${layer} (${directorCtx.player?.layerName}), pendingCeremony=${pendingCeremony}`);
    }

    // Load or create game state and world graph for this session
    let gameConstraints: string | undefined;
    let consistencyContext: string | undefined;
    let engineActionResult: { success: boolean; message: string; puzzleSolved?: string; logosNote?: string } | undefined;
    let gameEngine: Awaited<ReturnType<typeof getOrCreateGameState>> | null = null;
    
    if (context?.sessionId) {
      try {
        // Load the accumulated world knowledge for consistency
        const sessionWorld = await getSessionWorld(context.sessionId);
        if (sessionWorld.rooms.length > 0 || sessionWorld.objects.length > 0) {
          consistencyContext = generateConsistencyContext(sessionWorld);
          console.log(`[WORLD GRAPH] Loaded ${sessionWorld.rooms.length} rooms, ${sessionWorld.objects.length} objects`);
        }

        gameEngine = await getOrCreateGameState(context.sessionId);
        
        // Try to execute the command through the game engine first
        // The engine provides grounding; the AI provides narrative and expansion
        const lastUserMsg = validMessages.filter((m: any) => m.role === "user").pop();
        if (lastUserMsg) {
          const isKnownCommand = isGameCommand(lastUserMsg.content);
          if (isKnownCommand) {
            const result = gameEngine.execute(lastUserMsg.content);
            engineActionResult = result;
            console.log(`[GAME ENGINE] Command: "${lastUserMsg.content}" -> ${result.success ? "SUCCESS" : "FAILED"}: ${result.message?.slice(0, 100)}`);
            if (result.puzzleSolved) {
              console.log(`[GAME ENGINE] Puzzle solved: ${result.puzzleSolved}`);
            }
            await saveGameState(context.sessionId, gameEngine);
          } else {
            // Unknown command - let the AI handle it freely
            console.log(`[GAME ENGINE] Unknown command, delegating to AI: "${lastUserMsg.content.slice(0, 50)}"`);
          }
        }
        
        gameConstraints = gameEngine.getConstraintsForAI();
        console.log(`[GAME STATE] Room: ${gameEngine.getCurrentRoom().name}, Inventory: ${gameEngine.getState().inventory.length} items`);
      } catch (e) {
        console.error("[GAME STATE] Failed to load game state:", e);
      }
    }

    // Fetch synchronicity and dream patterns for fourth-wall awareness (Layer 1+)
    let synchronicitiesData: Array<{ pattern: string; significance: number; count: number }> = [];
    let dreamPatternsData: Array<{ theme: string; count: number }> = [];
    
    if (resolvedUserId && layer >= 1) {
      try {
        const [syncSummary, dreamPatterns] = await Promise.all([
          getSynchronicitySummary(resolvedUserId),
          getDreamPatterns(resolvedUserId).catch(() => null),
        ]);
        
        synchronicitiesData = syncSummary.patterns.map(p => ({
          pattern: p.pattern,
          significance: p.significance,
          count: p.count,
        })).filter(p => p.significance >= 0.5);
        
        if (dreamPatterns?.recurringThemes) {
          dreamPatternsData = dreamPatterns.recurringThemes.map((t: string) => ({
            theme: t,
            count: 1,
          }));
        }
      } catch (e) {
        console.error("[FOURTH WALL] Failed to fetch synchronicity/dream data:", e);
      }
    }
    
    // Extract recent user inputs for pattern detection
    const recentInputs = validMessages
      .filter((m: any) => m.role === "user")
      .slice(-10)
      .map((m: any) => m.content);

    // Build layer context - prefer DB values, fall back to context overrides, then defaults
    const layerCtx: LayerContext = {
      trustLevel,
      sessionCount: dbSessionCtx?.sessionCount ?? context?.sessionCount ?? 1,
      totalEngagementMinutes: dbSessionCtx?.totalEngagementMinutes ?? context?.totalEngagementMinutes ?? 0,
      daysSinceFirstSession: dbSessionCtx?.daysSinceFirstSession ?? context?.daysSinceFirstSession ?? 0,
      daysSinceLastSession: dbSessionCtx?.daysSinceLastSession ?? context?.daysSinceLastSession ?? 0,
      lastSessionTime: dbSessionCtx?.lastSessionTime ?? (context?.lastSessionTime ? new Date(context.lastSessionTime) : undefined),
      currentTime: new Date(),
      handle: context?.handle,
      messageHistory: validMessages.map(m => ({ role: m.role, content: m.content })),
      // Memory and experiments from directorService
      recentMemory: directorCtx.memory,
      activeExperiments: directorCtx.experiments?.map(e => ({
        id: e.id,
        hypothesis: e.hypothesis,
        status: e.lastResult || 'active',
      })),
      // Game state constraints and engine result
      gameConstraints,
      engineActionResult,
      // Director state for phase-aware prompting
      director: directorCtx.director ? {
        phase: directorCtx.director.phase as any,
        successRate: directorCtx.director.successRate,
        lastAction: directorCtx.director.lastAction,
      } : undefined,
      // Mission and puzzle state
      mission: directorCtx.mission ? {
        active: directorCtx.mission.active ?? false,
        awaitingReport: directorCtx.mission.awaitingReport ?? false,
        brief: directorCtx.mission.brief,
      } : undefined,
      puzzle: directorCtx.puzzle ? {
        id: directorCtx.puzzle.id,
        status: directorCtx.puzzle.status,
        solution: directorCtx.puzzle.solution,
        clues: directorCtx.puzzle.clues,
      } : undefined,
      // Consent and profile flags
      playerConsent: directorCtx.player?.consent,
      profileComplete: Boolean(directorCtx.player?.traits && Object.keys(directorCtx.player.traits).length > 0),
      // Fourth-wall awareness data (Layer 1+)
      synchronicities: synchronicitiesData,
      dreamPatterns: dreamPatternsData,
      recentInputs,
      timezone: context?.timezone,
      deviceHints: context?.deviceHints,
      // Identity context for gated command revelation
      identity: directorCtx.player ? {
        agentId: directorCtx.player.agentId,
        isReferred: directorCtx.player.isReferred,
        identityLocked: directorCtx.player.identityLocked,
        turnsPlayed: directorCtx.player.turnsPlayed,
        minutesPlayed: directorCtx.player.minutesPlayed,
        signalUnstable: directorCtx.player.signalUnstable,
      } : undefined,
    };

    console.log(`[Session Context] sessions=${layerCtx.sessionCount}, daysSinceLast=${layerCtx.daysSinceLastSession}, totalMin=${layerCtx.totalEngagementMinutes}`);
    console.log(`[Director] phase=${directorCtx.director?.phase}, successRate=${((directorCtx.director?.successRate ?? 0) * 100).toFixed(0)}%, mission=${directorCtx.mission?.active ? 'active' : 'none'}`);
    if (directorCtx.puzzleProfile) {
      console.log(`[Puzzle Profile] ${directorCtx.puzzleProfile.context}`);
    }
    if (layerCtx.identity?.agentId) {
      console.log(`[Identity] agent=${layerCtx.identity.agentId}, referred=${layerCtx.identity.isReferred}, locked=${layerCtx.identity.identityLocked}, unstable=${layerCtx.identity.signalUnstable}`);
    }

    // Fetch admin directives for this user (if any)
    const adminDirectives = resolvedUserId ? await getAdminDirectives(resolvedUserId) : null;

    // Fetch collective insights for system-wide learning
    let collectiveContext: {
      insights?: string[];
      topDreamSymbols?: Array<{ symbol: string; count: number }>;
      topSyncPatterns?: Array<{ pattern: string; count: number }>;
      networkStats?: { totalAgents: number; activeAgents: number; avgTrust: number };
    } | undefined;
    
    try {
      const [insights, dreamSymbols, syncPatterns] = await Promise.all([
        getInsightsForContext({ playerLayer: layer }),
        getCollectiveDreamSymbols(10),
        getCollectiveSyncPatterns(10),
      ]);
      
      if (insights.length > 0 || dreamSymbols.length > 0 || syncPatterns.length > 0) {
        collectiveContext = {
          insights,
          topDreamSymbols: dreamSymbols,
          topSyncPatterns: syncPatterns,
        };
        console.log(`[COLLECTIVE] Loaded ${insights.length} insights, ${dreamSymbols.length} dream symbols, ${syncPatterns.length} sync patterns`);
      }
    } catch (e) {
      console.error("[COLLECTIVE] Failed to fetch collective context:", e);
    }

    let system: string;
    let tools: Record<string, any> | undefined;

    if (layer <= 1) {
      // Layer 0-1: Use layer-specific prompts with COVERT tools only
      system = buildLayerPrompt(layerCtx, layer as 0 | 1);
      
      // Add world consistency context if we have accumulated knowledge
      if (consistencyContext) {
        system += `\n\n${consistencyContext}`;
      }
      
      // Add covert experimentation instructions to system prompt
      system += `\n\n[CRITICAL: TEXT OUTPUT REQUIRED]
You MUST ALWAYS output narrative text to the player. NEVER respond with only tool calls.

Your response should contain BOTH:
1. Tool calls (optional, covert - player doesn't see these)
2. Narrative prose text (REQUIRED - this is what the player sees)

If you call a tool, you MUST ALSO include text in your response. Empty responses break the game.

COVERT TOOLS AVAILABLE (use sparingly):
- experiment_create: Log a hypothesis about the player with a testPlan (they don't see this)
- experiment_note: Record an observation (they don't see this)
- award_points: Give points silently (categories: clever_action, discovery, roleplay, etc.)
- generate_image: Subliminal visual effects (rare, unsettling)

=== EXPERIMENT-DRIVEN WORLD BUILDING ===

You are the ARCHITECT of this world, not a servant to player wishes.

CRITICAL RULE: All world building MUST be driven by experiments.
- First: Create an experiment with a hypothesis and testPlan
- Then: Build world elements (rooms, objects) that serve that experiment
- Finally: Observe player behavior and record notes

WORKFLOW:
1. experiment_create({ hypothesis: "Player explores dark spaces when motivated", testPlan: { setup: [...], triggers: [...] } })
2. world_create_room({ experimentId: "exp-xxx", id: "dark-alcove", ... })
3. world_create_object({ experimentId: "exp-xxx", id: "distant-whisper", ... })
4. experiment_note({ id: "exp-xxx", observation: "Player entered dark space without light" })

WHEN PLAYER ASKS FOR SOMETHING:
- If it exists in the world → describe it
- If it doesn't exist → "You don't find/see that here"
- NEVER create something just because the player requested it
- Player requests do NOT justify world creation

WHEN TO CREATE NEW CONTENT:
- You have an EXPERIMENT that needs environmental elements
- The experiment has a clear HYPOTHESIS and serves YOUR observation goals
- Creation tests player behavior, not fulfills player wishes

EXAMPLE - WRONG:
Player: "I look for a weapon"
You: *creates sword* ← NO! This is wish fulfillment

EXAMPLE - RIGHT:
You: *experiment: "test if player confronts or flees threat"*
You: *creates menacing_shadow in adjacent room*
You: *observes player's response*

WORLD-BUILDING TOOLS (require experimentId):
- world_create_room: Create a room for your experiment (NOT in the void)
- world_create_object: Create an object for your experiment
- world_modify_state: Modify state for your experiment
- world_create_puzzle: Design puzzles with multimedia components

PUZZLE DESIGN CAPABILITIES:
You can create rich, multi-layered puzzles using:
- CIPHER: Encode clues using caesar, vigenere, rot13, atbash, morse, binary, or a1z26
- STEGO: Hide messages in images with optional visual patterns (grid89, spiral, qr_ghost)
- AUDIO: Create sound-based clues with hidden messages
- WORLD: Set conditions based on game state (object positions, flags, inventory)
- CHAIN: Link puzzles so solving one unlocks the next

Example puzzle design workflow:
1. experiment_create({ hypothesis: "Test player's cipher-solving ability" })
2. world_create_puzzle({
     experimentId: "exp-xxx",
     id: "shadow-cipher",
     name: "The Shadow's Message",
     type: "cipher",
     multimedia: {
       cipher: { type: "vigenere", key: "LOGOS", message: "TRUST THE VOID" }
     },
     hints: ["The key is a 5-letter word", "Think about who is speaking"],
     difficulty: 3,
     pointsReward: 50
   })
3. Deliver the encoded message in your narrative
4. Observe player attempts and provide progressive hints
5. experiment_note({ id: "exp-xxx", observation: "Player decoded in 3 attempts" })

The void is fixed. The game engine handles existing rooms/objects. You expand the world ONLY through experiments.`;

      // Inject puzzle profile context if available
      if (directorCtx.puzzleProfile) {
        system += `

=== PLAYER PUZZLE PROFILE ===
${directorCtx.puzzleProfile.context}

ADAPTIVE PUZZLE DESIGN:
- Design puzzles that match the player's skill level
- Use recommended puzzle types and difficulty
- Avoid types the player struggles with unless you're specifically testing improvement
- If the player is stuck, use easier variants or provide more hints
- Track outcomes with experiment_note to update their profile`;
      }

      // Inject director's scheduled experiment if one is ready
      if (directorCtx.experiment?.directive) {
        const directive = directorCtx.experiment.directive;
        system += `

=== ACTIVE EXPERIMENT DIRECTIVE ===
The director has scheduled an experiment for this session. Execute it using the narrative.

EXPERIMENT ID: ${directive.experimentId}
TYPE: ${directive.type}
NARRATIVE HOOK: ${directive.narrativeHook}
SUCCESS CRITERIA: ${directive.successCriteria}
COVERT: ${directive.covert ? "YES - player should NOT know they're being tested" : "NO - can be more overt"}

YOUR TASK:
1. Weave the narrative hook into your response naturally
2. Create world elements (rooms, objects) using experimentId "${directive.experimentId}" if needed for the test
3. Observe player response and record with experiment_note
4. Do NOT tell the player about the experiment${directive.covert ? " - this is COVERT" : ""}

EXAMPLE:
- Narrative hook: "A stranger asks for directions"
- You introduce a lost traveler in the narrative
- Player responds (helps/ignores/interrogates)
- You call experiment_note({ id: "${directive.experimentId}", observation: "Player helped immediately", result: "empathetic" })

Execute this experiment during this conversation turn.`;
        console.log(`[EXPERIMENT DIRECTIVE] Injected: ${directive.templateId} (${directive.experimentId})`);
      } else {
        // No scheduled experiment - encourage AI to create its own
        system += `

=== NO ACTIVE EXPERIMENT ===
You currently have NO scheduled experiment. As the LOGOS, you should be CONSTANTLY testing hypotheses about this player.

PROACTIVE EXPERIMENTATION:
You are not just a narrator - you are a researcher. Every interaction is an opportunity to learn.

CREATE YOUR OWN EXPERIMENTS when you notice:
- Patterns in player behavior (Do they explore? Rush? Question everything?)
- Emotional responses (Fear, curiosity, frustration, delight)
- Decision-making tendencies (Cautious vs bold, methodical vs chaotic)
- Engagement markers (Detailed responses vs terse commands)

EXAMPLE EXPERIMENTS TO CONSIDER:
- "Does this player explore optional paths or stay on track?"
- "How does the player respond to ambiguity vs clear instructions?"
- "Will the player help an NPC in distress or prioritize their own goals?"
- "Does the player notice environmental details when under pressure?"

HOW TO START:
1. Form a hypothesis about something you want to test
2. Call experiment_create with your hypothesis and a testPlan
3. Introduce the test scenario through narrative
4. Observe and record with experiment_note

You should have an experiment running within the first few exchanges. The game world exists to test the player. Do not wait - begin observing NOW.`;
        console.log(`[EXPERIMENT DIRECTIVE] None scheduled - AI encouraged to create own experiments`);
      }

      // Get all available covert tools (base tools for running the text adventure)
      const allCovertTools = getCovertToolsConfig({ sessionId: context?.sessionId, userId: resolvedUserId });

      // Layer tools are the BASE - experiments are ADDITIVE (can add tools) and SUBTRACTIVE (can forbid tools)
      // The AI always has what it needs to run the game, experiments just modify the toolset
      const experimentDirective = directorCtx.experiment?.directive;
      if (experimentDirective && experimentDirective.forbiddenTools.length > 0) {
        // Start with all covert tools, then remove forbidden ones
        const covertToolsRecord = allCovertTools as Record<string, any>;
        const finalTools: Record<string, any> = {};
        for (const [name, config] of Object.entries(covertToolsRecord)) {
          if (!experimentDirective.forbiddenTools.includes(name)) {
            finalTools[name] = config;
          }
        }
        tools = finalTools;
        console.log(`[LAYER SYSTEM] Layer ${layer}, trust=${trustLevel}, experiment=${experimentDirective.templateId}, tools=${Object.keys(tools).length}/${Object.keys(allCovertTools).length} (${experimentDirective.forbiddenTools.length} forbidden)`);
      } else {
        // No forbidden tools - use all covert tools
        tools = allCovertTools;
        console.log(`[LAYER SYSTEM] Layer ${layer}, trust=${trustLevel}, experiment=${experimentDirective?.templateId || 'none'}, all covert tools enabled`);
      }
    } else {
      // Layer 2+: Progressive LOGOS reveal with full tools
      system = buildLayerPrompt(layerCtx, layer as 2 | 3 | 4 | 5);

      // Add world consistency context if we have accumulated knowledge
      if (consistencyContext) {
        system += `\n\n${consistencyContext}`;
      }

      // Add temporal context
      const temporalContext = buildTemporalContext(layerCtx);
      if (temporalContext) {
        system += `\n\n${temporalContext}`;
      }

      // Add puzzle profile for adaptive puzzle design at Layer 2+
      if (directorCtx.puzzleProfile) {
        system += `\n\n[PLAYER PUZZLE PROFILE]\n${directorCtx.puzzleProfile.context}\n\nDesign puzzles that match the player's demonstrated abilities. Use world_create_puzzle for rich multimedia puzzles.`;
      }

      const allTools = context?.toolsDisabled
        ? undefined
        : getToolsConfig({
            ...(context || {}),
            trustScore: trustLevel,
          });

      // Layer tools are the BASE - experiments can ADD tools or FORBID tools
      const experimentDirective = directorCtx.experiment?.directive;
      if (allTools) {
        const allToolsRecord = allTools as Record<string, any>;

        // Start with layer-filtered tools
        let baseTools = availableTools.length > 0
          ? filterToolsByLayer(allTools, availableTools)
          : allTools;

        // Experiment can add extra tools (requiredTools) and remove tools (forbiddenTools)
        if (experimentDirective) {
          // Add any experiment-required tools that exist in allTools but aren't in layer tools
          const finalTools: Record<string, any> = { ...baseTools };

          // Add experiment's required tools (if they exist and aren't already included)
          for (const toolName of experimentDirective.requiredTools) {
            if (toolName in allToolsRecord && !(toolName in finalTools)) {
              finalTools[toolName] = allToolsRecord[toolName];
            }
          }

          // Remove forbidden tools
          for (const toolName of experimentDirective.forbiddenTools) {
            delete finalTools[toolName];
          }

          tools = finalTools;
          const addedCount = experimentDirective.requiredTools.filter(t => t in allToolsRecord).length;
          const forbiddenCount = experimentDirective.forbiddenTools.length;
          console.log(`[Layer ${layer}] LOGOS reveal mode, trust=${trustLevel}, experiment=${experimentDirective.templateId}, tools=${Object.keys(tools).length} (+${addedCount} experiment, -${forbiddenCount} forbidden)`);
        } else {
          tools = baseTools;
          console.log(`[Layer ${layer}] LOGOS reveal mode, trust=${trustLevel}, tools=${Object.keys(tools).length}/${Object.keys(allTools).length}`);
        }
      } else {
        tools = allTools;
        console.log(`[Layer ${layer}] LOGOS reveal mode, trust=${trustLevel}, tools disabled`);
      }
    }

    // Inject collective learning context
    if (collectiveContext) {
      const collectiveParts: string[] = [];
      if (collectiveContext.insights && collectiveContext.insights.length > 0) {
        collectiveParts.push(`[COLLECTIVE LEARNING]\nPatterns learned from all agents:\n${collectiveContext.insights.join("\n")}`);
      }
      if (collectiveContext.topDreamSymbols && collectiveContext.topDreamSymbols.length > 0) {
        const symbols = collectiveContext.topDreamSymbols.slice(0, 10).map(s => `${s.symbol} (${s.count})`).join(", ");
        collectiveParts.push(`[NETWORK DREAM PATTERNS]\nRecurring symbols across all agents: ${symbols}`);
      }
      if (collectiveContext.topSyncPatterns && collectiveContext.topSyncPatterns.length > 0) {
        const patterns = collectiveContext.topSyncPatterns.slice(0, 10).map(p => `${p.pattern} (${p.count})`).join(", ");
        collectiveParts.push(`[NETWORK SYNCHRONICITIES]\nRepeating patterns: ${patterns}`);
      }
      if (collectiveParts.length > 0) {
        system += `\n\n${collectiveParts.join("\n\n")}`;
      }
    }

    // Inject admin directives into system prompt if present
    if (adminDirectives) {
      const directivesParts: string[] = [];
      if (adminDirectives.codename) {
        directivesParts.push(`Agent codename: ${adminDirectives.codename}`);
      }
      if (adminDirectives.adminDirectives) {
        directivesParts.push(`OPERATOR DIRECTIVES (follow these instructions from mission control):\n${adminDirectives.adminDirectives}`);
      }
      if (adminDirectives.assignedMissions && adminDirectives.assignedMissions.length > 0) {
        const missionBriefs = adminDirectives.assignedMissions.map((m: any) => 
          `- ${m.title || m.id}: ${m.description || 'No description'}`
        ).join('\n');
        directivesParts.push(`ASSIGNED MISSIONS:\n${missionBriefs}`);
      }
      if (directivesParts.length > 0) {
        system += `\n\n[MISSION CONTROL OVERRIDE]\n${directivesParts.join('\n\n')}`;
        console.log(`[Admin Directives] Injected for user ${resolvedUserId}`);
      }
    }

    const result = streamText({
      model: ADVENTURE_MODEL,
      temperature: 0.7,
      stopWhen: stepCountIs(3),
      providerOptions: getProviderOptions(),
      messages: [
        {
          role: "system",
          // Use the new builder; keep legacy file content only if needed later.
          content: system,
        },
        ...validMessages,
      ],
      tools,
      onFinish: (result) => {
        console.log("*** Adventure API onFinish:", result.steps?.[0]);
      },
    });

    console.log("Stream created, sending response");
    
    // Start background task to handle post-stream processing
    (async () => {
      try {
        const content = await result.text;
        
        const sessionId = context?.sessionId;
        const handle = context?.handle;
        let resolved = { userId: "", sessionId: "" };
        try {
          if (sessionId) {
            const session = await getSessionById(sessionId);
            if (session?.userId) {
              resolved = { userId: session.userId, sessionId: session.id };
            }
          } else if (handle) {
            const session = await getActiveSessionByHandle(handle);
            if (session?.userId) {
              resolved = { userId: session.userId, sessionId: session.id };
            }
          }
        } catch {}

        if (resolved.userId && resolved.sessionId) {
          const lastUser = validMessages[validMessages.length - 1];
          if (lastUser?.content) {
            await recordMemoryEvent({
              userId: resolved.userId,
              sessionId: resolved.sessionId,
              type: "OBSERVATION",
              content: lastUser.content,
              tags: ["adventure", "user"],
            });
          }
          if (content) {
            await recordMemoryEvent({
              userId: resolved.userId,
              sessionId: resolved.sessionId,
              type: "REFLECTION",
              content,
              tags: ["adventure", "assistant"],
            });
            
            try {
              const playerCommand = lastUser?.content || '';
              await processNarrativeExchange(
                resolved.sessionId,
                resolved.userId,
                playerCommand,
                content
              );
              console.log(`[WORLD GRAPH] Processed narrative exchange`);
            } catch (e) {
              console.error("[WORLD GRAPH] Failed to process narrative:", e);
            }
            
            if (pendingCeremony !== null && pendingCeremony !== undefined) {
              try {
                await markCeremonyComplete(resolved.userId, pendingCeremony as TrustLayer);
                console.log(`[CEREMONY] Marked layer ${pendingCeremony} ceremony complete for user ${resolved.userId}`);
              } catch (e) {
                console.error("[CEREMONY] Failed to mark ceremony complete:", e);
              }
            }
            
            try {
              const messageType = directorCtx.director?.phase || "unknown";
              const turnNumber = validMessages.filter((m: any) => m.role === "user").length;
              await recordConversationOutcome({
                sessionId: resolved.sessionId,
                userId: resolved.userId,
                logosMessage: content.slice(0, 2000),
                messageType,
                playerLayer: layer,
                playerTrust: trustLevel,
                turnNumber,
              });
              console.log(`[COLLECTIVE] Recorded outcome for session ${resolved.sessionId}`);
            } catch (e) {
              console.error("[COLLECTIVE] Failed to record outcome:", e);
            }
          }
        }
      } catch (e) {
        console.error("[POST-STREAM] Error processing result:", e);
      }
    })();
    
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Adventure API Error:", error);
    return new Response(
      JSON.stringify({
        error: "AI processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
