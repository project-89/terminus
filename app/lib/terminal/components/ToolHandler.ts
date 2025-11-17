import { Terminal } from "../Terminal";
import { toolEvents } from "../tools/registry";
import { TERMINAL_COLORS } from "../constants";
import { TerminalContext } from "../TerminalContext";

interface ToolHandlerConfig {
  name: string;
  handler: (params: any) => Promise<void>;
}

export class ToolHandler {
  private tools: Map<string, (params: any) => Promise<void>> = new Map();
  private audioContext?: AudioContext;
  private audioElement?: HTMLAudioElement;

  constructor(private terminal: Terminal) {
    this.initializeAudioContext();
    this.registerDefaultTools();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      await this.audioContext.resume();
    } catch (e) {
      console.warn("Audio context failed to initialize:", e);
    }
  }

  public registerTool(config: ToolHandlerConfig) {
    const toolName = `tool:${config.name}`;

    // Remove any existing handler
    if (this.tools.has(toolName)) {
      toolEvents.off(toolName, this.tools.get(toolName)!);
    }

    // Store the handler directly
    this.tools.set(toolName, config.handler);

    // Register event listener with the stored handler
    toolEvents.on(toolName, this.tools.get(toolName)!);
  }

  public destroy() {
    // Clean up all event listeners
    Array.from(this.tools).forEach(([toolName, handler]) => {
      toolEvents.off(toolName, handler);
    });
    this.tools.clear();

    // Clean up audio resources
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.remove();
    }
  }

  private async handleTool(name: string, params: any) {
    const handler = this.tools.get(`tool:${name}`);
    if (handler) {
      try {
        await handler(params);
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        await this.terminal.print(`Failed to execute ${name}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
      }
    }
  }

  private async playSound(audioData: ArrayBuffer) {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      return source;
    } catch (error) {
      console.error("Error playing sound:", error);
      throw error;
    }
  }

  private registerDefaultTools() {
    const assignPath = (target: Record<string, any>, path: string, value: any) => {
      const segments = path.split(".").filter(Boolean);
      if (segments.length === 0) return;
      let node = target;
      while (segments.length > 1) {
        const segment = segments.shift()!;
        if (!node[segment] || typeof node[segment] !== "object") {
          node[segment] = {};
        }
        node = node[segment];
      }
      node[segments[0]] = value;
    };

    this.registerTool({
      name: "glitch_screen",
      handler: async (params: { intensity: number; duration: number }) => {
        console.log("Glitch screen effect triggered", params);
        const originalBuffer = [...this.terminal.buffer];
        const glitchDuration = Math.min(params.duration, 5000);
        let glitchInterval: NodeJS.Timeout;

        const glitch = () => {
          if (Math.random() < params.intensity) {
            this.terminal.buffer = originalBuffer.map((line) => ({
              ...line,
              text: this.terminal.corruptText(
                line.text,
                Math.min(params.intensity * 0.5, 0.7)
              ),
            }));
            this.terminal.render();
          }
        };

        glitchInterval = setInterval(glitch, 50);
        glitch();

        setTimeout(() => {
          clearInterval(glitchInterval);
          this.terminal.buffer = originalBuffer;
          this.terminal.render();
        }, glitchDuration);
      },
    });

    this.registerTool({
      name: "matrix_rain",
      handler: async (params: { duration: number; intensity: number }) => {
        console.log("Matrix rain effect triggered", params);
        this.terminal.matrixRainEnabled = true;
        this.terminal.effects.startMatrixRain(params.intensity);

        setTimeout(() => {
          this.terminal.matrixRainEnabled = false;
          this.terminal.effects.stopMatrixRain();
          this.terminal.render();
        }, params.duration);
      },
    });

    this.registerTool({
      name: "generate_sound",
      handler: async (params: {
        description: string;
        duration: number;
        influence: number;
      }) => {
        try {
          const response = await fetch("/api/sound", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });

          if (!response.ok) throw new Error("Sound generation failed");

          const audioData = await response.arrayBuffer();
          await this.playSound(audioData);
        } catch (error) {
          console.error("Error playing generated sound:", error);
          await this.terminal.print("Failed to generate or play sound", {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
        }
      },
    });

    // Persona toggling: cloak/reveal LOGOS persona
    this.registerTool({
      name: "persona_set",
      handler: async (params: { mode: "cloak" | "reveal" | "neutral"; duration_s?: number }) => {
        const terminalContext = TerminalContext.getInstance();
        terminalContext.setState({
          // Store narrative mode in state for future UI styling or effects hooks
          preferences: {
            ...(terminalContext.getState() as any).preferences,
            narrativeMode: params?.mode,
          },
        } as any);
        // Optional: subtle visual cue when revealing
        if (params?.mode === "reveal") {
          this.terminal.effects.startMatrixRain(0.3);
          setTimeout(() => this.terminal.effects.stopMatrixRain(), (params?.duration_s ?? 1.2) * 1000);
        }
      },
    });

    // Screen transition tool: let LOGOS navigate views (home/adventure/archive/...)
    this.registerTool({
      name: "screen_transition",
      handler: async (params: { to: string; options?: any }) => {
        if (!params?.to) return;
        try {
          // Route via Terminal event so ScreenRouter updates URL
          (this.terminal as any).emit("screen:transition", { to: params.to, options: params?.options });
        } catch (e) {
          console.warn("screen_transition failed", e);
        }
      },
    });

    this.registerTool({
      name: "mission_request",
      handler: async (params: { missionId?: string; intent?: string }) => {
        const terminalContext = TerminalContext.getInstance();
        const sessionId = await terminalContext.ensureSession();
        if (!sessionId) {
          await this.terminal.print("Unable to establish session for mission.", {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
          return;
        }

        try {
          const response = await fetch("/api/mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              missionId: params?.missionId,
            }),
          });

          if (!response.ok) {
            throw new Error(`Mission request failed (${response.status})`);
          }

          const data = await response.json();
          const missionRun = data?.missionRun;
          if (!missionRun) {
            await this.terminal.print("No missions available.", {
              color: TERMINAL_COLORS.warning,
              speed: "normal",
            });
            return;
          }

          terminalContext.setActiveMissionRun(missionRun.id);
          terminalContext.setExpectingReport(false);

          await this.terminal.print(`\nMission channel open: ${missionRun.mission.title}`, {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });
          await this.terminal.print(missionRun.mission.prompt, {
            color: TERMINAL_COLORS.secondary,
            speed: "normal",
          });
          if (Array.isArray(missionRun.mission.tags) && missionRun.mission.tags.length) {
            await this.terminal.print(`Tags: ${missionRun.mission.tags.join(", ")}`, {
              color: TERMINAL_COLORS.system,
              speed: "fast",
            });
          }
          await this.terminal.print(
            "When you have evidence, simply describe it. The Logos will listen.",
            {
              color: TERMINAL_COLORS.system,
              speed: "fast",
            }
          );
        } catch (error: any) {
          console.error("mission_request error", error);
          await this.terminal.print(`Mission error: ${error.message}`, {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
        }
      },
    });

    this.registerTool({
      name: "mission_expect_report",
      handler: async (params: { missionRunId?: string; prompt?: string }) => {
        const terminalContext = TerminalContext.getInstance();
        if (params?.missionRunId) {
          terminalContext.setActiveMissionRun(params.missionRunId);
        }
        terminalContext.setExpectingReport(true);
        const prompt =
          params?.prompt ||
          "Describe the evidence or observations you gathered for this mission.";
        await this.terminal.print(`\nAwaiting report: ${prompt}`, {
          color: TERMINAL_COLORS.system,
          speed: "normal",
        });
      },
    });

    this.registerTool({
      name: "profile_set",
      handler: async (params: { path: string; value: any }) => {
        if (!params?.path) return;
        const terminalContext = TerminalContext.getInstance();
        const sessionId = await terminalContext.ensureSession();
        if (!sessionId) {
          await this.terminal.print("Unable to update profile (no session).", {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
          return;
        }

        const payload: Record<string, any> = {};
        assignPath(payload, params.path, params.value);

        try {
          const response = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, ...payload }),
          });
          if (!response.ok) throw new Error(`Profile update failed (${response.status})`);
          await response.json();
          await this.terminal.print(`Profile tuned (${params.path} → ${params.value}).`, {
            color: TERMINAL_COLORS.success,
            speed: "fast",
          });
        } catch (error: any) {
          console.error("profile_set error", error);
          await this.terminal.print(`Profile update error: ${error.message}`, {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
        }
      },
    });

    // Behavioral science tools: experiment_create and experiment_note
    this.registerTool({
      name: "experiment_create",
      handler: async (params: {
        id?: string;
        title?: string;
        hypothesis: string;
        task: string;
        success_criteria?: string;
        timeout_s?: number;
      }) => {
        try {
          const terminalContext = TerminalContext.getInstance();
          const handle = terminalContext.ensureHandle("agent");
          const threadId = terminalContext.getState().threadId;
          await fetch("/api/experiments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              userHandle: handle,
              threadId,
              id: params?.id,
              title: params?.title,
              hypothesis: params.hypothesis,
              task: params.task,
              success_criteria: params?.success_criteria,
              timeout_s: params?.timeout_s,
            }),
          });
        } catch (error) {
          console.warn("experiment_create failed", error);
        }
      },
    });

    this.registerTool({
      name: "experiment_note",
      handler: async (params: {
        id: string;
        observation?: string;
        result?: string;
        score?: number;
      }) => {
        if (!params?.id) return;
        try {
          const terminalContext = TerminalContext.getInstance();
          const handle = terminalContext.ensureHandle("agent");
          const threadId = terminalContext.getState().threadId;
          await fetch("/api/experiments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "note",
              userHandle: handle,
              threadId,
              id: params.id,
              observation: params?.observation,
              result: params?.result,
              score: params?.score,
            }),
          });
        } catch (error) {
          console.warn("experiment_note failed", error);
        }
      },
    });
  }
}
