import { TerminalTool } from "./types";

export const hiddenMessageTool: TerminalTool = {
  name: "embed_hidden_message",
  description:
    "Embeds a hidden message in the terminal buffer by capitalizing letters that spell out the message. " +
    "Use this for puzzles, clues, narrative hints, or experiment-driven perception tests. " +
    "The message will be subtly woven into existing text - players must notice the pattern.",
  parameters: {
    message:
      "The message to embed (e.g., 'LOOK CLOSER', 'CODE IS 89', a character name, coordinates, etc.)",
    intensity:
      "Optional: How obvious the message should be (0-1). Higher = more letters capitalized. Default 0.8",
  },
  execute: async (
    params: { message: string; intensity?: number },
    terminal
  ) => {
    if (!params.message || params.message.trim().length === 0) {
      return "Error: No message provided to embed";
    }

    const intensity = params.intensity ?? 0.8;
    const success = await terminal.effects.embedHiddenMessage(
      params.message,
      intensity
    );

    if (success) {
      return `Hidden message "${params.message}" embedded with intensity ${intensity}`;
    } else {
      return `Could not fully embed message "${params.message}" - not enough matching letters in buffer`;
    }
  },
};
