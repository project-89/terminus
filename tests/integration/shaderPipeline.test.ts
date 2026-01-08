/**
 * Integration Tests for the Shader Pipeline
 *
 * Tests the full flow from AI response stream → event emission → state handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

// Mock the Terminal class's stream processing logic
// This mirrors what happens in Terminal.processAIStream when it encounters tool JSON
function simulateStreamToolExtraction(streamContent: string): Array<{ tool: string; parameters: any }> {
  const toolCalls: Array<{ tool: string; parameters: any }> = [];
  const lines = streamContent.split("\n");

  for (const line of lines) {
    if (line.startsWith("{") && line.endsWith("}")) {
      try {
        const json = JSON.parse(line);
        if (json.tool && json.parameters) {
          toolCalls.push({ tool: json.tool, parameters: json.parameters });
        }
      } catch {
        // Not valid JSON, skip
      }
    }
  }

  return toolCalls;
}

// Simulate the full stream processing and event emission
async function processStreamWithToolEmission(streamContent: string): Promise<string[]> {
  const emittedTools: string[] = [];
  const toolCalls = simulateStreamToolExtraction(streamContent);

  for (const { tool, parameters } of toolCalls) {
    await toolEvents.emit(`tool:${tool}`, parameters);
    emittedTools.push(tool);
  }

  return emittedTools;
}

describe("Shader Pipeline Integration", () => {
  describe("Stream to Event Flow", () => {
    it("should extract and emit shader tool from AI response stream", async () => {
      const receivedParams: any[] = [];
      const handler = (params: any) => receivedParams.push(params);
      toolEvents.on("tool:generate_shader", handler);

      // Simulate AI response with embedded shader tool call
      const aiResponse = `The reality around you begins to waver...

{"tool": "generate_shader", "parameters": {"glsl": "precision mediump float;\\nuniform float time;\\nvoid main() { gl_FragColor = vec4(sin(time), 0.0, 0.0, 1.0); }", "duration": 5000}}

The walls seem to breathe as colors shift impossibly.`;

      const emittedTools = await processStreamWithToolEmission(aiResponse);

      expect(emittedTools).toContain("generate_shader");
      expect(receivedParams).toHaveLength(1);
      expect(receivedParams[0].glsl).toContain("precision mediump float");
      expect(receivedParams[0].duration).toBe(5000);

      toolEvents.off("tool:generate_shader", handler);
    });

    it("should handle multiple tool calls in single response", async () => {
      const shaderParams: any[] = [];
      const glitchParams: any[] = [];
      const imageParams: any[] = [];

      toolEvents.on("tool:generate_shader", (p) => shaderParams.push(p));
      toolEvents.on("tool:glitch_screen", (p) => glitchParams.push(p));
      toolEvents.on("tool:display_image", (p) => imageParams.push(p));

      // AI response with multiple visual effects
      const aiResponse = `Something is wrong with the simulation...

{"tool": "glitch_screen", "parameters": {"intensity": 0.7, "duration": 500}}

The screen flickers violently.

{"tool": "generate_shader", "parameters": {"glsl": "void main() { gl_FragColor = vec4(1.0); }", "duration": 3000}}

A face emerges from the static...

{"tool": "display_image", "parameters": {"url": "blob:test", "mode": "subliminal", "intensity": 0.9}}`;

      await processStreamWithToolEmission(aiResponse);

      expect(glitchParams).toHaveLength(1);
      expect(glitchParams[0].intensity).toBe(0.7);

      expect(shaderParams).toHaveLength(1);
      expect(shaderParams[0].duration).toBe(3000);

      expect(imageParams).toHaveLength(1);
      expect(imageParams[0].mode).toBe("subliminal");

      toolEvents.off("tool:generate_shader", shaderParams.pop);
      toolEvents.off("tool:glitch_screen", glitchParams.pop);
      toolEvents.off("tool:display_image", imageParams.pop);
    });

    it("should not emit events for malformed JSON", async () => {
      const receivedParams: any[] = [];
      const handler = (params: any) => receivedParams.push(params);
      toolEvents.on("tool:generate_shader", handler);

      const aiResponse = `The simulation glitches...

{tool: generate_shader, parameters: {glsl: "broken"}}

{"not_a_tool": "just data"}

{"tool": "generate_shader"}

This text continues normally.`;

      await processStreamWithToolEmission(aiResponse);

      // None of the malformed JSON should trigger events
      expect(receivedParams).toHaveLength(0);

      toolEvents.off("tool:generate_shader", handler);
    });

    it("should handle complex shader code with escaped characters", async () => {
      const receivedParams: any[] = [];
      const handler = (params: any) => receivedParams.push(params);
      toolEvents.on("tool:generate_shader", handler);

      // Complex shader with all the bells and whistles
      const complexShader = `precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D u_texture;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    // Wave distortion
    float wave = sin(uv.y * 20.0 + time * 3.0) * 0.02;
    uv.x += wave;

    // Chromatic aberration
    float r = texture2D(u_texture, uv + vec2(0.003, 0.0)).r;
    float g = texture2D(u_texture, uv).g;
    float b = texture2D(u_texture, uv - vec2(0.003, 0.0)).b;

    // Color grading
    vec3 color = vec3(r, g, b);
    color = mix(color, vec3(0.0, 1.0, 0.8), 0.1);

    gl_FragColor = vec4(color, 1.0);
}`;

      // Escape for JSON
      const escapedShader = complexShader
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");

      const aiResponse = `Reality bends around you...

{"tool": "generate_shader", "parameters": {"glsl": "${escapedShader}", "duration": 10000}}

You feel yourself slipping between worlds.`;

      await processStreamWithToolEmission(aiResponse);

      expect(receivedParams).toHaveLength(1);
      expect(receivedParams[0].glsl).toContain("precision mediump float");
      expect(receivedParams[0].glsl).toContain("Chromatic aberration");
      expect(receivedParams[0].duration).toBe(10000);

      toolEvents.off("tool:generate_shader", handler);
    });
  });

  describe("State Management Simulation", () => {
    it("should track shader activation state", async () => {
      // Simulate TerminalCanvas state management
      let shaderActive = false;
      let shaderCode = "";
      let shaderDuration = 5000;

      const handleShader = (params: any) => {
        if (params && params.glsl) {
          shaderCode = params.glsl;
          shaderDuration = params.duration || 5000;
          shaderActive = true;
        }
      };

      toolEvents.on("tool:generate_shader", handleShader);

      expect(shaderActive).toBe(false);
      expect(shaderCode).toBe("");

      // Trigger shader
      await toolEvents.emit("tool:generate_shader", {
        glsl: "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }",
        duration: 3000,
      });

      expect(shaderActive).toBe(true);
      expect(shaderCode).toContain("gl_FragColor");
      expect(shaderDuration).toBe(3000);

      toolEvents.off("tool:generate_shader", handleShader);
    });

    it("should handle shader completion callback", async () => {
      let shaderActive = false;
      let completionCalled = false;

      const handleShader = (params: any) => {
        shaderActive = true;

        // Simulate duration-based completion (normally done by ShaderOverlay)
        setTimeout(() => {
          shaderActive = false;
          completionCalled = true;
        }, params.duration);
      };

      toolEvents.on("tool:generate_shader", handleShader);

      await toolEvents.emit("tool:generate_shader", {
        glsl: "void main() { gl_FragColor = vec4(1.0); }",
        duration: 100, // Short duration for test
      });

      expect(shaderActive).toBe(true);

      // Wait for completion
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(shaderActive).toBe(false);
      expect(completionCalled).toBe(true);

      toolEvents.off("tool:generate_shader", handleShader);
    });

    it("should handle rapid shader transitions", async () => {
      const shaderHistory: string[] = [];
      let currentShader = "";

      const handleShader = (params: any) => {
        currentShader = params.glsl;
        shaderHistory.push(params.glsl);
      };

      toolEvents.on("tool:generate_shader", handleShader);

      // Rapid fire shaders (like AI rapidly changing effects)
      await toolEvents.emit("tool:generate_shader", { glsl: "shader1", duration: 1000 });
      await toolEvents.emit("tool:generate_shader", { glsl: "shader2", duration: 1000 });
      await toolEvents.emit("tool:generate_shader", { glsl: "shader3", duration: 1000 });

      expect(shaderHistory).toHaveLength(3);
      expect(currentShader).toBe("shader3"); // Latest shader wins

      toolEvents.off("tool:generate_shader", handleShader);
    });
  });

  describe("Image Intrusion Pipeline", () => {
    it("should process image tool calls with all modes", async () => {
      const intrusions: any[] = [];
      const handleImage = (params: any) => intrusions.push(params);
      toolEvents.on("tool:display_image", handleImage);

      const modes = ["modal", "subliminal", "peripheral", "corruption", "afterimage", "glitch_scatter", "creep"];

      for (const mode of modes) {
        await toolEvents.emit("tool:display_image", {
          url: `blob:test-${mode}`,
          mode,
          intensity: 0.8,
        });
      }

      expect(intrusions).toHaveLength(7);
      expect(intrusions.map((i) => i.mode)).toEqual(modes);

      toolEvents.off("tool:display_image", handleImage);
    });

    it("should track experiment IDs through image pipeline", async () => {
      const experimentLog: Array<{ experimentId: string; mode: string; timestamp: number }> = [];

      const handleImage = (params: any) => {
        if (params.experimentId) {
          experimentLog.push({
            experimentId: params.experimentId,
            mode: params.mode,
            timestamp: Date.now(),
          });
        }
      };

      toolEvents.on("tool:display_image", handleImage);

      // Simulate behavioral experiment with timed subliminal images
      await toolEvents.emit("tool:display_image", {
        url: "blob:exp1",
        mode: "subliminal",
        experimentId: "subliminal-response-001",
      });

      await new Promise((r) => setTimeout(r, 50));

      await toolEvents.emit("tool:display_image", {
        url: "blob:exp2",
        mode: "peripheral",
        experimentId: "subliminal-response-001",
      });

      expect(experimentLog).toHaveLength(2);
      expect(experimentLog[0].experimentId).toBe("subliminal-response-001");
      expect(experimentLog[1].timestamp).toBeGreaterThan(experimentLog[0].timestamp);

      toolEvents.off("tool:display_image", handleImage);
    });
  });

  describe("Combined Visual Effects", () => {
    it("should handle shader + image + glitch combination", async () => {
      const eventSequence: string[] = [];

      const handlers = {
        shader: () => eventSequence.push("shader"),
        image: () => eventSequence.push("image"),
        glitch: () => eventSequence.push("glitch"),
      };

      toolEvents.on("tool:generate_shader", handlers.shader);
      toolEvents.on("tool:display_image", handlers.image);
      toolEvents.on("tool:glitch_screen", handlers.glitch);

      // Simulate a dramatic AI sequence
      const dramaticResponse = `The veil tears open...

{"tool": "glitch_screen", "parameters": {"intensity": 0.9, "duration": 300}}

Static fills your vision.

{"tool": "generate_shader", "parameters": {"glsl": "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5); }", "duration": 5000}}

Through the distortion, a face emerges...

{"tool": "display_image", "parameters": {"url": "blob:face", "mode": "creep", "intensity": 0.6}}

It sees you.`;

      await processStreamWithToolEmission(dramaticResponse);

      expect(eventSequence).toEqual(["glitch", "shader", "image"]);

      toolEvents.off("tool:generate_shader", handlers.shader);
      toolEvents.off("tool:display_image", handlers.image);
      toolEvents.off("tool:glitch_screen", handlers.glitch);
    });

    it("should handle effects with user interaction simulation", async () => {
      // Simulate a modal image that user dismisses
      let activeIntrusions: string[] = [];

      const handleImage = (params: any) => {
        const id = `intrusion-${Date.now()}`;
        activeIntrusions.push(id);

        // Simulate user dismissing modal after delay
        if (params.mode === "modal") {
          setTimeout(() => {
            activeIntrusions = activeIntrusions.filter((i) => i !== id);
          }, 100);
        }
      };

      toolEvents.on("tool:display_image", handleImage);

      await toolEvents.emit("tool:display_image", {
        url: "blob:modal-test",
        mode: "modal",
      });

      expect(activeIntrusions).toHaveLength(1);

      // Wait for simulated dismiss
      await new Promise((r) => setTimeout(r, 150));

      expect(activeIntrusions).toHaveLength(0);

      toolEvents.off("tool:display_image", handleImage);
    });
  });

  describe("Error Handling", () => {
    it("should gracefully handle missing shader parameters", async () => {
      let errorCaught = false;
      let shaderActivated = false;

      const handleShader = (params: any) => {
        if (!params || !params.glsl) {
          errorCaught = true;
          return;
        }
        shaderActivated = true;
      };

      toolEvents.on("tool:generate_shader", handleShader);

      // Missing glsl
      await toolEvents.emit("tool:generate_shader", { duration: 5000 });
      expect(errorCaught).toBe(true);
      expect(shaderActivated).toBe(false);

      // Reset
      errorCaught = false;

      // Null params
      await toolEvents.emit("tool:generate_shader", null);
      expect(errorCaught).toBe(true);
      expect(shaderActivated).toBe(false);

      toolEvents.off("tool:generate_shader", handleShader);
    });

    it("should handle WebGL-invalid shader code gracefully", async () => {
      // This tests the validation logic - actual WebGL compilation would fail
      const receivedShaders: string[] = [];

      const handleShader = (params: any) => {
        // Basic validation similar to what ShaderOverlay might do
        if (params.glsl && typeof params.glsl === "string") {
          receivedShaders.push(params.glsl);
        }
      };

      toolEvents.on("tool:generate_shader", handleShader);

      // Invalid GLSL (would fail compilation but passes event)
      await toolEvents.emit("tool:generate_shader", {
        glsl: "this is not valid glsl code at all",
        duration: 1000,
      });

      // The event system passes it through - ShaderOverlay handles compilation errors
      expect(receivedShaders).toHaveLength(1);
      expect(receivedShaders[0]).toContain("not valid");

      toolEvents.off("tool:generate_shader", handleShader);
    });
  });
});

describe("Realistic AI Response Scenarios", () => {
  it("should handle hallucination scene with full effects", async () => {
    const effects: Array<{ type: string; time: number }> = [];
    const startTime = Date.now();

    toolEvents.on("tool:glitch_screen", () => effects.push({ type: "glitch", time: Date.now() - startTime }));
    toolEvents.on("tool:generate_shader", () => effects.push({ type: "shader", time: Date.now() - startTime }));
    toolEvents.on("tool:display_image", () => effects.push({ type: "image", time: Date.now() - startTime }));

    // Realistic AI response for a hallucination sequence
    const hallucinationScene = `You stare at the terminal screen, but something is wrong. The text begins to swim before your eyes.

{"tool": "glitch_screen", "parameters": {"intensity": 0.3, "duration": 500}}

The letters rearrange themselves into patterns that shouldn't exist. Your reflection in the screen... it's not moving when you move.

{"tool": "generate_shader", "parameters": {"glsl": "precision mediump float;\\nuniform float time;\\nuniform sampler2D u_texture;\\nvarying vec2 vUv;\\nvoid main() {\\n  vec2 uv = vUv;\\n  uv.x += sin(uv.y * 30.0 + time * 2.0) * 0.01;\\n  vec4 c = texture2D(u_texture, uv);\\n  gl_FragColor = c;\\n}", "duration": 8000}}

The walls behind you seem to breathe. In the corner of your vision, something watches.

{"tool": "display_image", "parameters": {"url": "blob:watcher", "mode": "peripheral", "intensity": 0.4, "experimentId": "hallucination-test-001"}}

You blink, and everything is normal again. Was it real?`;

    await processStreamWithToolEmission(hallucinationScene);

    expect(effects).toHaveLength(3);
    expect(effects.map((e) => e.type)).toEqual(["glitch", "shader", "image"]);

    // Effects should be in order
    expect(effects[0].time).toBeLessThanOrEqual(effects[1].time);
    expect(effects[1].time).toBeLessThanOrEqual(effects[2].time);
  });

  it("should handle reality breach scene", async () => {
    const effectLog: string[] = [];

    toolEvents.on("tool:generate_shader", (p) => effectLog.push(`shader:${p.duration}ms`));
    toolEvents.on("tool:display_image", (p) => effectLog.push(`image:${p.mode}`));
    toolEvents.on("tool:glitch_screen", (p) => effectLog.push(`glitch:${p.intensity}`));

    const realityBreach = `[REALITY BREACH DETECTED]

The simulation cannot contain what you've discovered.

{"tool": "glitch_screen", "parameters": {"intensity": 1.0, "duration": 200}}

ERROR: CONSENSUS REALITY DESTABILIZING

{"tool": "generate_shader", "parameters": {"glsl": "precision mediump float;\\nuniform float time;\\nvoid main() {\\n  float t = time * 10.0;\\n  gl_FragColor = vec4(fract(sin(t)*43758.5453), 0.0, 0.0, 1.0);\\n}", "duration": 2000}}

[THEY] are watching through the breach.

{"tool": "display_image", "parameters": {"url": "blob:breach", "mode": "corruption", "intensity": 1.0}}

{"tool": "display_image", "parameters": {"url": "blob:eye", "mode": "subliminal", "intensity": 0.9}}

REINITIALIZING CONSENSUS...

{"tool": "glitch_screen", "parameters": {"intensity": 0.5, "duration": 300}}

Reality stabilizes. The breach seals. But you remember.`;

    await processStreamWithToolEmission(realityBreach);

    expect(effectLog).toEqual([
      "glitch:1",
      "shader:2000ms",
      "image:corruption",
      "image:subliminal",
      "glitch:0.5",
    ]);
  });
});
