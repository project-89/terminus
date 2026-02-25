import { describe, expect, it } from "vitest";
import {
  DEFAULT_RENDER_STYLE_PRESET,
  listRenderStylePresets,
  resolveRenderStylePreset,
} from "@/app/lib/render/stylePresets";

describe("render style presets", () => {
  it("resolves default preset when input is missing", () => {
    const preset = resolveRenderStylePreset(undefined);
    expect(preset.id).toBe(DEFAULT_RENDER_STYLE_PRESET);
  });

  it("resolves a known preset id", () => {
    const preset = resolveRenderStylePreset("signal-noir");
    expect(preset.id).toBe("signal-noir");
    expect(preset.stylePrompt.toLowerCase()).toContain("noir");
  });

  it("falls back to default for unknown id", () => {
    const preset = resolveRenderStylePreset("unknown-preset");
    expect(preset.id).toBe(DEFAULT_RENDER_STYLE_PRESET);
  });

  it("lists all presets", () => {
    const presets = listRenderStylePresets();
    expect(presets.length).toBeGreaterThanOrEqual(4);
  });
});

