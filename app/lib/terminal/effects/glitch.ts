import { registerTool, toolEvents } from "../tools/registry";
import { GlitchParameters } from "../tools/types";

// Register the tool definition
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

// Listen for tool executions with proper typing
toolEvents.on("tool:glitch_screen", async (params: GlitchParameters) => {
  // Handle glitch effect
  console.log("Glitch effect triggered:", params);
});
