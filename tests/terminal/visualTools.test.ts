/**
 * Tests for the Visual Tools Pipeline
 *
 * Tests tool event emission, parameter validation, and state management
 * for shader, image intrusion, and glitch tools.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { toolEvents } from "@/app/lib/terminal/tools/registry";
import { z } from "zod";

// Parameter schemas (mirroring what's in adventure/route.ts)
const generateShaderParameters = z.object({
  glsl: z.string().describe("Fragment shader code"),
  duration: z.number().min(100).max(30000).describe("Duration in milliseconds"),
});

const generateImageParameters = z.object({
  prompt: z.string().describe("Image description"),
  mode: z.enum(["modal", "subliminal", "peripheral", "corruption", "afterimage", "glitch_scatter", "creep"]).optional(),
  intensity: z.number().min(0).max(1).optional(),
  experimentId: z.string().optional(),
});

const glitchScreenParameters = z.object({
  intensity: z.number().min(0).max(1).describe("Glitch intensity"),
  duration: z.number().min(100).max(10000).describe("Duration in milliseconds"),
});

describe("Visual Tools Pipeline", () => {
  describe("Tool Event System", () => {
    it("should emit and receive shader events", () => {
      const handler = vi.fn();
      toolEvents.on("tool:generate_shader", handler);

      const shaderParams = {
        glsl: `
          precision mediump float;
          uniform float time;
          void main() {
            gl_FragColor = vec4(sin(time), 0.0, cos(time), 1.0);
          }
        `,
        duration: 5000,
      };

      toolEvents.emit("tool:generate_shader", shaderParams);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(shaderParams);

      toolEvents.off("tool:generate_shader", handler);
    });

    it("should emit and receive image display events", () => {
      const handler = vi.fn();
      toolEvents.on("tool:display_image", handler);

      const imageParams = {
        url: "blob:test-image-url",
        mode: "subliminal" as const,
        intensity: 0.8,
        position: "center" as const,
        experimentId: "exp-visual-001",
      };

      toolEvents.emit("tool:display_image", imageParams);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(imageParams);

      toolEvents.off("tool:display_image", handler);
    });

    it("should emit and receive glitch screen events", () => {
      const handler = vi.fn();
      toolEvents.on("tool:glitch_screen", handler);

      const glitchParams = {
        intensity: 0.7,
        duration: 2000,
      };

      toolEvents.emit("tool:glitch_screen", glitchParams);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(glitchParams);

      toolEvents.off("tool:glitch_screen", handler);
    });

    it("should handle multiple event listeners", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      toolEvents.on("tool:generate_shader", handler1);
      toolEvents.on("tool:generate_shader", handler2);

      toolEvents.emit("tool:generate_shader", { glsl: "test", duration: 1000 });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);

      toolEvents.off("tool:generate_shader", handler1);
      toolEvents.off("tool:generate_shader", handler2);
    });

    it("should properly unregister event handlers", () => {
      const handler = vi.fn();
      toolEvents.on("tool:generate_shader", handler);
      toolEvents.off("tool:generate_shader", handler);

      toolEvents.emit("tool:generate_shader", { glsl: "test", duration: 1000 });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("Shader Parameter Validation", () => {
    it("should validate valid shader parameters", () => {
      const validParams = {
        glsl: `
          precision mediump float;
          uniform float time;
          uniform vec2 resolution;
          uniform sampler2D u_texture;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            uv.x += sin(uv.y * 10.0 + time) * 0.02;
            vec4 color = texture2D(u_texture, uv);
            gl_FragColor = color;
          }
        `,
        duration: 5000,
      };

      const result = generateShaderParameters.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("should reject shader with duration too short", () => {
      const invalidParams = {
        glsl: "void main() { gl_FragColor = vec4(1.0); }",
        duration: 50, // Below minimum of 100
      };

      const result = generateShaderParameters.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it("should reject shader with duration too long", () => {
      const invalidParams = {
        glsl: "void main() { gl_FragColor = vec4(1.0); }",
        duration: 60000, // Above maximum of 30000
      };

      const result = generateShaderParameters.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it("should reject shader without glsl code", () => {
      const invalidParams = {
        duration: 5000,
      };

      const result = generateShaderParameters.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe("Image Intrusion Parameter Validation", () => {
    it("should validate all intrusion modes", () => {
      const modes = ["modal", "subliminal", "peripheral", "corruption", "afterimage", "glitch_scatter", "creep"] as const;

      for (const mode of modes) {
        const params = {
          prompt: "A glitchy cyberpunk face",
          mode,
          intensity: 0.8,
        };

        const result = generateImageParameters.safeParse(params);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid intrusion mode", () => {
      const invalidParams = {
        prompt: "Test image",
        mode: "invalid_mode",
      };

      const result = generateImageParameters.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it("should allow parameters without optional fields", () => {
      const minimalParams = {
        prompt: "A mysterious symbol",
      };

      const result = generateImageParameters.safeParse(minimalParams);
      expect(result.success).toBe(true);
    });

    it("should validate intensity bounds", () => {
      const validLow = { prompt: "test", intensity: 0 };
      const validHigh = { prompt: "test", intensity: 1 };
      const invalidLow = { prompt: "test", intensity: -0.1 };
      const invalidHigh = { prompt: "test", intensity: 1.1 };

      expect(generateImageParameters.safeParse(validLow).success).toBe(true);
      expect(generateImageParameters.safeParse(validHigh).success).toBe(true);
      expect(generateImageParameters.safeParse(invalidLow).success).toBe(false);
      expect(generateImageParameters.safeParse(invalidHigh).success).toBe(false);
    });
  });

  describe("Glitch Screen Parameter Validation", () => {
    it("should validate valid glitch parameters", () => {
      const validParams = {
        intensity: 0.5,
        duration: 2000,
      };

      const result = glitchScreenParameters.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("should reject intensity outside bounds", () => {
      const tooHigh = { intensity: 1.5, duration: 2000 };
      const tooLow = { intensity: -0.1, duration: 2000 };

      expect(glitchScreenParameters.safeParse(tooHigh).success).toBe(false);
      expect(glitchScreenParameters.safeParse(tooLow).success).toBe(false);
    });

    it("should reject duration outside bounds", () => {
      const tooShort = { intensity: 0.5, duration: 50 };
      const tooLong = { intensity: 0.5, duration: 15000 };

      expect(glitchScreenParameters.safeParse(tooShort).success).toBe(false);
      expect(glitchScreenParameters.safeParse(tooLong).success).toBe(false);
    });
  });

  describe("Example Shader Code Patterns", () => {
    it("should accept reality distortion shader", () => {
      const distortionShader = {
        glsl: `
          precision mediump float;
          uniform float time;
          uniform vec2 resolution;
          uniform sampler2D u_texture;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            float distort = sin(uv.y * 20.0 + time * 3.0) * 0.01;
            uv.x += distort;
            vec4 color = texture2D(u_texture, uv);

            // Chromatic aberration
            float r = texture2D(u_texture, uv + vec2(0.002, 0.0)).r;
            float b = texture2D(u_texture, uv - vec2(0.002, 0.0)).b;

            gl_FragColor = vec4(r, color.g, b, 1.0);
          }
        `,
        duration: 8000,
      };

      const result = generateShaderParameters.safeParse(distortionShader);
      expect(result.success).toBe(true);
    });

    it("should accept melting text shader", () => {
      const meltingShader = {
        glsl: `
          precision mediump float;
          uniform float time;
          uniform sampler2D u_texture;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            float melt = sin(uv.x * 10.0) * 0.05 * sin(time * 0.5);
            uv.y += melt * (1.0 - uv.y);

            vec4 color = texture2D(u_texture, uv);
            gl_FragColor = color;
          }
        `,
        duration: 10000,
      };

      const result = generateShaderParameters.safeParse(meltingShader);
      expect(result.success).toBe(true);
    });

    it("should accept hallucination shader", () => {
      const hallucinationShader = {
        glsl: `
          precision mediump float;
          uniform float time;
          uniform vec2 resolution;
          uniform sampler2D u_texture;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;

            // Swirling distortion
            vec2 center = vec2(0.5);
            vec2 delta = uv - center;
            float angle = atan(delta.y, delta.x);
            float dist = length(delta);
            angle += sin(time + dist * 10.0) * 0.2;
            uv = center + vec2(cos(angle), sin(angle)) * dist;

            vec4 color = texture2D(u_texture, uv);

            // Color shift
            color.rgb = mix(color.rgb, color.gbr, sin(time * 0.5) * 0.5 + 0.5);

            gl_FragColor = color;
          }
        `,
        duration: 15000,
      };

      const result = generateShaderParameters.safeParse(hallucinationShader);
      expect(result.success).toBe(true);
    });
  });
});

describe("Visual Tool Integration Points", () => {
  it("should support chaining multiple visual effects", async () => {
    const events: string[] = [];

    const shaderHandler = vi.fn(() => events.push("shader"));
    const glitchHandler = vi.fn(() => events.push("glitch"));
    const imageHandler = vi.fn(() => events.push("image"));

    toolEvents.on("tool:generate_shader", shaderHandler);
    toolEvents.on("tool:glitch_screen", glitchHandler);
    toolEvents.on("tool:display_image", imageHandler);

    // Simulate AI calling multiple effects in sequence
    toolEvents.emit("tool:glitch_screen", { intensity: 0.5, duration: 500 });
    toolEvents.emit("tool:generate_shader", { glsl: "void main(){}", duration: 2000 });
    toolEvents.emit("tool:display_image", { url: "test", mode: "subliminal" });

    expect(events).toEqual(["glitch", "shader", "image"]);

    toolEvents.off("tool:generate_shader", shaderHandler);
    toolEvents.off("tool:glitch_screen", glitchHandler);
    toolEvents.off("tool:display_image", imageHandler);
  });

  it("should track experiment IDs through visual events", () => {
    const receivedExperimentIds: string[] = [];

    const imageHandler = (params: any) => {
      if (params.experimentId) {
        receivedExperimentIds.push(params.experimentId);
      }
    };

    toolEvents.on("tool:display_image", imageHandler);

    // Simulate experiment-driven image intrusions
    toolEvents.emit("tool:display_image", {
      url: "test1",
      mode: "subliminal",
      experimentId: "exp-subliminal-001",
    });

    toolEvents.emit("tool:display_image", {
      url: "test2",
      mode: "peripheral",
      experimentId: "exp-peripheral-001",
    });

    toolEvents.emit("tool:display_image", {
      url: "test3",
      mode: "modal",
      // No experimentId - not part of experiment
    });

    expect(receivedExperimentIds).toEqual(["exp-subliminal-001", "exp-peripheral-001"]);

    toolEvents.off("tool:display_image", imageHandler);
  });
});
