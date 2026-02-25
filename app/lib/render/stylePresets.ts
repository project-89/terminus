export type RenderStylePresetId =
  | "matrix90s"
  | "signal-noir"
  | "liminal-retro"
  | "dreamgrain";

export type RenderStylePreset = {
  id: RenderStylePresetId;
  label: string;
  description: string;
  stylePrompt: string;
};

const PRESET_MAP: Record<RenderStylePresetId, RenderStylePreset> = {
  matrix90s: {
    id: "matrix90s",
    label: "Matrix 90s",
    description:
      "Cyber-noir with late-90s bedroom nostalgia, CRT glow, and practical tungsten lighting.",
    stylePrompt:
      "Matrix-inspired cyber-noir with late-90s teenage bedroom nostalgia, CRT phosphor glow, practical tungsten lamps, analog clutter, and tactile lived-in texture.",
  },
  "signal-noir": {
    id: "signal-noir",
    label: "Signal Noir",
    description:
      "Darker surveillance-thriller framing with deep shadows, scanline ambience, and subtle dread.",
    stylePrompt:
      "Psychological surveillance noir, deep shadow falloff, moody practical lighting, subtle scanline ambiance, and restrained cinematic tension.",
  },
  "liminal-retro": {
    id: "liminal-retro",
    label: "Liminal Retro",
    description:
      "Eerie nostalgic liminal spaces with analog artifacts and muted color separation.",
    stylePrompt:
      "Liminal retro atmosphere, muted analog color separation, soft haze, weathered textures, and uncanny nostalgia rooted in 1990s domestic tech spaces.",
  },
  dreamgrain: {
    id: "dreamgrain",
    label: "Dreamgrain",
    description:
      "Dreamlike realism with soft film grain, shallow haze, and surreal but grounded composition.",
    stylePrompt:
      "Dreamlike photorealism with soft film grain, shallow atmospheric haze, surreal but physically plausible composition, and restrained color bloom.",
  },
};

export const DEFAULT_RENDER_STYLE_PRESET: RenderStylePresetId = "matrix90s";

export function isRenderStylePresetId(value: string): value is RenderStylePresetId {
  return Object.prototype.hasOwnProperty.call(PRESET_MAP, value);
}

export function resolveRenderStylePreset(value?: string | null): RenderStylePreset {
  if (value && isRenderStylePresetId(value)) {
    return PRESET_MAP[value];
  }
  return PRESET_MAP[DEFAULT_RENDER_STYLE_PRESET];
}

export function listRenderStylePresets(): RenderStylePreset[] {
  return Object.values(PRESET_MAP);
}

