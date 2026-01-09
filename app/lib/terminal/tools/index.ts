import { registerTool, toolEvents } from "./registry";

// Register glitch effect
registerTool({
  name: "glitch_screen",
  description: "Creates a visual glitch effect on the terminal screen",
  parameters: {
    intensity: {
      type: "number",
      description: "Glitch intensity (0-1)",
    },
    duration: {
      type: "number",
      description: "Duration in milliseconds",
    },
  },
});

// Register sound effect
registerTool({
  name: "play_sound",
  description: "Plays a cyberpunk-themed sound effect",
  parameters: {
    type: {
      type: "string",
      description: "Sound type: beep, alert, error, success",
    },
    volume: {
      type: "number",
      description: "Volume level (0-1)",
    },
  },
});

// Register matrix rain effect
registerTool({
  name: "matrix_rain",
  description: "Triggers a matrix-style digital rain effect",
  parameters: {
    duration: {
      type: "number",
      description: "Duration in milliseconds",
    },
    intensity: {
      type: "number",
      description: "Effect intensity (0-1)",
    },
  },
});

// Register hidden message embedding tool (experiment-controlled)
registerTool({
  name: "embed_hidden_message",
  description:
    "Embeds a hidden message in the terminal buffer by capitalizing letters that spell out the message. " +
    "Use for puzzles, clues, narrative hints, or perception experiments. " +
    "Players must notice the capitalized letter pattern.",
  parameters: {
    message: {
      type: "string",
      description:
        "The message to embed (e.g., 'LOOK CLOSER', 'CODE IS 89', coordinates, character names)",
    },
    intensity: {
      type: "number",
      description: "How obvious (0-1). Higher = more letters. Default 0.8",
    },
  },
});
