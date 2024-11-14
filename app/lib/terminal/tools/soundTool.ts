import { TerminalTool } from "./types";

export const soundTool: TerminalTool = {
  name: "play_sound",
  description: "Plays a cyberpunk-themed sound effect",
  parameters: {
    type: "string - one of: beep, alert, error, success",
    volume: "number between 0-1",
  },
  execute: async (params: { type: string; volume: number }, terminal) => {
    // Play sound effect
    await terminal.playSound(params.type, params.volume);
    return `Played ${params.type} sound at volume ${params.volume}`;
  },
};
