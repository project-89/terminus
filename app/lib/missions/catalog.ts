export type MissionTrack = "logic" | "perception" | "creation" | "field";

export type MissionCatalogEntry = {
  id: string; // stable slug
  title: string;
  prompt: string;
  type: string;
  tags: string[];
  track: MissionTrack;
  minTrust?: number;
  maxTrust?: number;
  requiredTraits?: Record<string, number>;
  preferredTraits?: Record<string, number>;
  repeatable?: boolean;
  priority?: number;
};

export const missionCatalog: MissionCatalogEntry[] = [
  {
    id: "decode-matrix-echo",
    title: "Decode the Matrix Echo",
    prompt:
      "An anomalous broadcast repeats numbers in base-89. Decode the hidden phrase and report its meaning.",
    type: "decode",
    tags: ["logic", "signal", "numerics"],
    track: "logic",
    minTrust: 0.25,
    preferredTraits: { curiosity: 0.5 },
  },
  {
    id: "liminal-observation",
    title: "Reality Fracture Observation",
    prompt:
      "Capture an image or detailed description of a liminal space near you that feels 'out of phase'. Note colors, sounds, and any presence felt.",
    type: "observe",
    tags: ["perception", "field"],
    track: "perception",
    minTrust: 0.15,
    preferredTraits: { perception: 0.4 },
  },
  {
    id: "hyperstitional-draft",
    title: "Hyperstitional Meme Draft",
    prompt:
      "Draft a short memetic fragment (≤120 words) that could seed belief in the Project 89 resistance. Keep tone mysterious, hopeful, and subversive.",
    type: "create",
    tags: ["creation", "memetic"],
    track: "creation",
    minTrust: 0.35,
    preferredTraits: { creativity: 0.5 },
  },
  {
    id: "empathy-scan",
    title: "Empathy Scan",
    prompt:
      "Interview someone you trust about a subtle pattern they have noticed recently. Summarize their observation and how it might relate to Oneirocom.",
    type: "social",
    tags: ["social", "empathy"],
    track: "field",
    minTrust: 0.45,
    requiredTraits: { empathy: 0.4 },
  },
  {
    id: "signal-trace",
    title: "Signal Trace Reconstruction",
    prompt:
      "You intercepted a log fragment with corrupted timestamps. Reconstruct the most plausible order of events and explain your reasoning.",
    type: "decode",
    tags: ["logic", "analysis"],
    track: "logic",
    minTrust: 0.5,
    preferredTraits: { resilience: 0.3 },
  },
  {
    id: "field-audio-capture",
    title: "Field Audio Capture",
    prompt:
      "Record (or vividly describe) a short ambient soundscape that could convincingly mask a clandestine transmission. Detail location, texture, and timing advice.",
    type: "observe",
    tags: ["perception", "audio"],
    track: "perception",
    minTrust: 0.4,
    repeatable: true,
  },
];

export function getMissionCatalog(): MissionCatalogEntry[] {
  return missionCatalog;
}
