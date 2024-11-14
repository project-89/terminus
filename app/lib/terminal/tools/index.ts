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
