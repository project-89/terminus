import { TerminalTool } from "./types";

export const glitchTool: TerminalTool = {
  name: "glitch_screen",
  description: "Creates a visual glitch effect on the terminal screen",
  parameters: {
    intensity: "number between 0-1 for glitch intensity",
    duration: "duration in milliseconds",
  },
  execute: async (
    params: { intensity: number; duration: number },
    terminal
  ) => {
    // Trigger glitch effect
    await terminal.effects.triggerGlitch(params.intensity, params.duration);
    return `Screen glitched with intensity ${params.intensity} for ${params.duration}ms`;
  },
};
