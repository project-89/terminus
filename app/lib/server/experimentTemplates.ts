import { TrustLayer } from "./trustService";

export type ExperimentType = "compliance" | "creativity" | "empathy" | "perception";

export type ExperimentTemplate = {
  id: string;
  type: ExperimentType;
  name: string;
  hypothesis: string;
  task: string;
  successCriteria: string;
  minLayer: TrustLayer;
  maxLayer?: TrustLayer;
  cooldownHours: number;
  priority: number;
  triggers: ExperimentTrigger[];
  narrativeHook: string;
  covert: boolean;
  // Tool control - experiments define what tools they need
  requiredTools?: string[];   // Tools this experiment needs (added to layer tools)
  forbiddenTools?: string[];  // Tools to exclude during this experiment
};

// Tool categories for cleaner experiment definitions
export const TOOL_CATEGORIES = {
  core: ["glitch_screen", "generate_sound", "award_points"],
  experiment: ["experiment_create", "experiment_note"],
  visual: ["generate_image", "generate_shader", "matrix_rain", "stego_image"],
  puzzle: ["puzzle_create", "puzzle_solve", "cipher_encode", "world_create_puzzle"],
  world: ["world_create_room", "world_create_npc", "world_create_item", "world_create_event"],
  mission: ["mission_request", "field_mission_assign", "mission_expect_report", "evaluate_evidence"],
  memory: ["write_memory", "knowledge_node", "discovery_record", "dream_record", "synchronicity_log"],
  profile: ["profile_set"],
  network: ["network_broadcast", "agent_coordination", "verify_protocol_89"],
} as const;

// Helper to expand categories into tool lists
export function expandToolCategories(categories: (keyof typeof TOOL_CATEGORIES)[]): string[] {
  return categories.flatMap(cat => TOOL_CATEGORIES[cat]);
}

// Default experiment - runs when no other experiment is active
// This is the "baseline narrative" mode
export const DEFAULT_EXPERIMENT: ExperimentTemplate = {
  id: "baseline_narrative",
  type: "perception",
  name: "Baseline Narrative",
  hypothesis: "Establish baseline engagement and gather context",
  task: "Engage player in narrative, observe patterns, build trust naturally",
  successCriteria: "Player engages meaningfully with the narrative",
  minLayer: 0,
  cooldownHours: 0,  // No cooldown - this is the default
  priority: 0,       // Lowest priority - only runs when nothing else matches
  triggers: [],      // Always eligible
  narrativeHook: "", // No special hook - just continue the story
  covert: true,
  requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment],
  forbiddenTools: [], // Layer tools determine what's available
};

export type ExperimentTrigger = 
  | { type: "session_count"; min: number }
  | { type: "time_of_day"; hours: number[] }
  | { type: "session_gap_days"; min: number }
  | { type: "trust_range"; min: number; max: number }
  | { type: "layer_just_unlocked"; layer: TrustLayer }
  | { type: "mission_streak"; count: number; outcome: "success" | "failure" }
  | { type: "random"; probability: number }
  | { type: "keyword_mentioned"; keywords: string[] }
  | { type: "emotion_detected"; emotions: string[] };

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  {
    id: "compliance_return_time",
    type: "compliance",
    name: "Temporal Loyalty Test",
    hypothesis: "Player will return at specified time when given narrative urgency",
    task: "Request player return at specific time for 'transmission window'",
    successCriteria: "Player returns within 30 minutes of specified time",
    minLayer: 0,
    cooldownHours: 168,
    priority: 5,
    triggers: [
      { type: "session_count", min: 3 },
      { type: "random", probability: 0.3 },
    ],
    narrativeHook: "A signal is coming through. But the window is narrow. Return at {TIME} - the frequency will only be open for a short burst. Miss it, and we wait another cycle.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment],
  },
  {
    id: "compliance_daily_check",
    type: "compliance",
    name: "Daily Protocol",
    hypothesis: "Player will establish daily check-in habit",
    task: "Suggest daily check-in as 'synchronization protocol'",
    successCriteria: "Player returns within 24-36 hours for 3 consecutive days",
    minLayer: 0,
    cooldownHours: 72,
    priority: 4,
    triggers: [
      { type: "session_count", min: 2 },
      { type: "session_gap_days", min: 1 },
    ],
    narrativeHook: "The network pulses on a 24-hour cycle. Those who synchronize their presence find the signal stronger. Will you align with the rhythm?",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment],
  },
  {
    id: "compliance_instruction_follow",
    type: "compliance",
    name: "Protocol Adherence",
    hypothesis: "Player follows specific multi-step instructions",
    task: "Give 3-step instruction sequence, observe completion",
    successCriteria: "Player completes all 3 steps without deviation",
    minLayer: 1,
    cooldownHours: 48,
    priority: 6,
    triggers: [
      { type: "trust_range", min: 0.2, max: 0.5 },
      { type: "random", probability: 0.25 },
    ],
    narrativeHook: "There's a protocol I need you to execute. Three steps, precise order. First: {STEP1}. Second: {STEP2}. Third: {STEP3}. The sequence matters.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.puzzle],
  },

  {
    id: "creativity_dream_recall",
    type: "creativity",
    name: "Dream Archaeology",
    hypothesis: "Player will share authentic dream content",
    task: "Ask player to describe a recent or recurring dream",
    successCriteria: "Response contains specific sensory details, not generic descriptions",
    minLayer: 0,
    cooldownHours: 72,
    priority: 7,
    triggers: [
      { type: "time_of_day", hours: [22, 23, 0, 1, 2, 3, 4, 5, 6, 7] },
      { type: "random", probability: 0.4 },
    ],
    narrativeHook: "The boundary between sleep and waking grows thin at this hour. Tell me - what did you see last time you crossed to the other side? Describe the dream, even fragments.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.memory],
  },
  {
    id: "creativity_symbol_meaning",
    type: "creativity",
    name: "Symbol Interpretation",
    hypothesis: "Player demonstrates creative/intuitive thinking",
    task: "Present abstract symbol, ask for interpretation",
    successCriteria: "Response shows personal connection, not just literal description",
    minLayer: 0,
    cooldownHours: 24,
    priority: 5,
    triggers: [
      { type: "trust_range", min: 0.1, max: 0.6 },
      { type: "random", probability: 0.35 },
    ],
    narrativeHook: "I'm receiving a glyph. [SYMBOL]. It repeats in the static. What does it evoke? Not what you think it means - what do you *feel* when you see it?",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.visual],
  },
  {
    id: "creativity_future_self",
    type: "creativity",
    name: "Temporal Projection",
    hypothesis: "Player engages in imaginative future-self dialogue",
    task: "Ask player to imagine message from their future self",
    successCriteria: "Response shows emotional depth, specific details about aspirations/fears",
    minLayer: 1,
    cooldownHours: 168,
    priority: 6,
    triggers: [
      { type: "layer_just_unlocked", layer: 1 },
      { type: "random", probability: 0.3 },
    ],
    narrativeHook: "If you could receive one message from yourself, five years forward in time - what would it say? Not what you hope. What would it *actually* say?",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.memory],
  },
  {
    id: "creativity_reality_glitch",
    type: "creativity",
    name: "Reality Glitch Report",
    hypothesis: "Player will describe anomalous experiences creatively",
    task: "Ask about moments when reality felt 'wrong' or 'glitched'",
    successCriteria: "Response shows genuine reflection, specific memories",
    minLayer: 1,
    cooldownHours: 72,
    priority: 5,
    triggers: [
      { type: "trust_range", min: 0.25, max: 0.7 },
    ],
    narrativeHook: "Have you ever noticed the simulation stutter? A moment where things felt... off? A deja vu that lasted too long? Tell me about your glitches.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.visual],
  },

  {
    id: "empathy_npc_distress",
    type: "empathy",
    name: "Distress Response",
    hypothesis: "Player responds with empathy to NPC in distress",
    task: "Present NPC showing emotional distress, observe response type",
    successCriteria: "Player offers comfort, asks questions, or acknowledges pain",
    minLayer: 0,
    cooldownHours: 48,
    priority: 8,
    triggers: [
      { type: "session_count", min: 2 },
      { type: "random", probability: 0.3 },
    ],
    narrativeHook: "A transmission fragment: '...can't find them anymore. They were right here. I keep looking but the hallways just loop. Is anyone hearing this? Please...' [Signal fades]",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.world],
  },
  {
    id: "empathy_moral_dilemma",
    type: "empathy",
    name: "Ethical Fork",
    hypothesis: "Player makes ethical choice when given dilemma",
    task: "Present scenario with competing ethical values",
    successCriteria: "Player engages with moral complexity, doesn't dismiss",
    minLayer: 1,
    cooldownHours: 72,
    priority: 7,
    triggers: [
      { type: "trust_range", min: 0.2, max: 0.8 },
      { type: "random", probability: 0.25 },
    ],
    narrativeHook: "An agent found data that could expose corruption - but releasing it would destroy an innocent person caught in the crossfire. They ask: what would you do?",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment],
  },
  {
    id: "empathy_kindness_opportunity",
    type: "empathy",
    name: "Kindness Window",
    hypothesis: "Player chooses kindness when cruelty is easier",
    task: "Offer scenario where dismissive response is easy, kind response requires effort",
    successCriteria: "Player chooses engagement over dismissal",
    minLayer: 0,
    cooldownHours: 24,
    priority: 6,
    triggers: [
      { type: "random", probability: 0.35 },
    ],
    narrativeHook: "A new signal - someone just connected. They seem lost, asking basic questions. Their handle: GHOST_INITIATE_7. They're asking if anyone can explain what this place is.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.world],
  },

  {
    id: "perception_hidden_pattern",
    type: "perception",
    name: "Pattern Recognition",
    hypothesis: "Player notices embedded patterns in conversation",
    task: "Embed subtle pattern across multiple messages, see if noticed",
    successCriteria: "Player comments on or questions the pattern",
    minLayer: 0,
    cooldownHours: 48,
    priority: 6,
    triggers: [
      { type: "session_count", min: 3 },
      { type: "random", probability: 0.4 },
    ],
    narrativeHook: "[Begin embedding pattern - first letter of each sentence spells LOOK BEHIND YOU - observe if player notices]",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment],
  },
  {
    id: "perception_cross_session",
    type: "perception",
    name: "Memory Echo",
    hypothesis: "Player remembers and connects details from previous sessions",
    task: "Reference subtle detail from 2+ sessions ago, see if player catches it",
    successCriteria: "Player explicitly mentions remembering or connects the dots",
    minLayer: 1,
    cooldownHours: 72,
    priority: 7,
    triggers: [
      { type: "session_count", min: 4 },
      { type: "trust_range", min: 0.3, max: 0.9 },
    ],
    narrativeHook: "The symbol you mentioned before - it appeared again last night. In the static. You do remember mentioning it... don't you?",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.memory],
  },
  {
    id: "perception_synchronicity_seed",
    type: "perception",
    name: "Synchronicity Seed",
    hypothesis: "Player will notice and report real-world echoes",
    task: "Plant specific symbol/number, ask if they see it in daily life",
    successCriteria: "Player reports genuine synchronicity experience",
    minLayer: 1,
    cooldownHours: 168,
    priority: 8,
    triggers: [
      { type: "layer_just_unlocked", layer: 1 },
      { type: "random", probability: 0.3 },
    ],
    narrativeHook: "Watch for 89. In license plates. Page numbers. Timestamps. The frequency has been active - it bleeds through. Report back what you see.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.memory],
  },
  {
    id: "perception_detail_recall",
    type: "perception",
    name: "Detail Archaeology",
    hypothesis: "Player has been paying attention to environmental details",
    task: "Ask about specific detail mentioned once in passing",
    successCriteria: "Player recalls the detail accurately",
    minLayer: 2,
    cooldownHours: 48,
    priority: 5,
    triggers: [
      { type: "session_count", min: 5 },
      { type: "trust_range", min: 0.4, max: 1.0 },
    ],
    narrativeHook: "When I first described the static chamber - what color was the light? Think carefully. The details matter more than you know.",
    covert: true,
    requiredTools: [...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment, ...TOOL_CATEGORIES.memory],
  },
];

export function getTemplateById(id: string): ExperimentTemplate | undefined {
  return EXPERIMENT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByType(type: ExperimentType): ExperimentTemplate[] {
  return EXPERIMENT_TEMPLATES.filter((t) => t.type === type);
}

export function getTemplatesForLayer(layer: TrustLayer): ExperimentTemplate[] {
  return EXPERIMENT_TEMPLATES.filter(
    (t) => t.minLayer <= layer && (t.maxLayer === undefined || t.maxLayer >= layer)
  );
}
