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

  private async ensureSessionContext() {
    const terminalContext = TerminalContext.getInstance();
    const handle = terminalContext.ensureHandle("agent");
    const sessionId = await terminalContext.ensureSession({ handle });
    if (!sessionId) {
      return null;
    }
    const threadId = await terminalContext.ensureThread(handle);
    return { terminalContext, handle, sessionId, threadId };
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
      name: "generate_shader",
      handler: async (params: any) => {
        // This will be caught by the UI layer (TerminalCanvas) via the toolEvents system
        // params: { glsl: string, duration: number }
        // return { success: true };
      },
    });

    this.registerTool({
      name: "verify_protocol_89",
      handler: async (params: { key: string }) => {
        await this.terminal.print("\nINITIATING PROTOCOL 89...", {
           color: TERMINAL_COLORS.warning,
           speed: "slow"
        });
        
        // Visual effects
        this.terminal.effects.startMatrixRain(1.0);
        
        try {
            const handle = typeof window !== 'undefined' ? localStorage.getItem("p89_handle") : null;
            const res = await fetch("/api/verify", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ key: params.key, handle })
            });
            const data = await res.json();
            
            this.terminal.effects.stopMatrixRain();
            
            if (data.success) {
               await this.terminal.print("\nACCESS GRANTED.", { color: TERMINAL_COLORS.success, speed: "slow" });
               await this.terminal.print(data.message, { color: TERMINAL_COLORS.primary });
               if (data.claimCode) {
                   await this.terminal.print(`\nCLAIM CODE: ${data.claimCode}`, { color: TERMINAL_COLORS.secondary });
                   await this.terminal.print("Save this code. It is your only proof.", { color: TERMINAL_COLORS.system });
               }
               // Trigger glitch
               toolEvents.emit("tool:glitch_screen", { duration: 2000, intensity: 0.8 });
            } else {
               await this.terminal.print("\nACCESS DENIED.", { color: TERMINAL_COLORS.error });
               await this.terminal.print(data.error || "Verification failed.", { color: TERMINAL_COLORS.error });
            }
        } catch (e) {
            this.terminal.effects.stopMatrixRain();
            await this.terminal.print("SYSTEM ERROR.", { color: TERMINAL_COLORS.error });
        }
      }
    });

    this.registerTool({
      name: "puzzle_create",
      handler: async (params: any) => {
        console.log("[Client] Puzzle Created", params);
        // Persist puzzle state to server via agent notes
        try {
          // Try to find handle in local storage or context
          const handle = typeof window !== 'undefined' ? localStorage.getItem("p89_handle") : null;
          if (handle) {
             await fetch("/api/notes", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 userHandle: handle,
                 key: "puzzle:active",
                 value: JSON.stringify({
                   ...params,
                   status: "active",
                   id: crypto.randomUUID(),
                   createdAt: new Date().toISOString()
                 })
               })
             });
          }
        } catch (e) {
          console.error("Failed to persist puzzle state", e);
        }
      },
    });

    this.registerTool({
      name: "puzzle_solve",
      handler: async (params: any) => {
        console.log("[Client] Puzzle Solved");
        try {
          const handle = typeof window !== 'undefined' ? localStorage.getItem("p89_handle") : null;
          if (handle) {
             await fetch("/api/notes", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 userHandle: handle,
                 key: "puzzle:active",
                 value: JSON.stringify({
                   status: "solved",
                   solvedAt: new Date().toISOString()
                 })
               })
             });
          }
        } catch (e) {
           console.error("Failed to clear puzzle state", e);
        }
      },
    });
    
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
          const safeDuration = Math.max(0.2, Number(params.duration) || 2);
          const safeInfluence = Math.min(1, Math.max(0, Number(params.influence) || 0.7));
          const description = params.description || "glitchy chime in a dark room";

          const response = await fetch("/api/sound", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description,
              duration: safeDuration,
              influence: safeInfluence,
            }),
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
          
          // Refresh local profile state so UI/commands reflect changes immediately
          await terminalContext.ensureProfile(true);

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

    // Cipher encoding tool: encode messages for puzzles
    this.registerTool({
      name: "cipher_encode",
      handler: async (params: {
        text: string;
        cipher: string;
        key?: string;
        hint?: string;
      }) => {
        try {
          const response = await fetch("/api/puzzle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "encode_cipher",
              text: params.text,
              cipher: params.cipher,
              key: params.key,
            }),
          });

          if (!response.ok) throw new Error("Cipher encoding failed");

          const { encoded } = await response.json();
          
          // Display the encoded message to the player
          await this.terminal.print(`\n${encoded}`, {
            color: TERMINAL_COLORS.secondary,
            speed: "normal",
          });
          
          if (params.hint) {
            await this.terminal.print(`\n[${params.hint}]`, {
              color: TERMINAL_COLORS.system,
              speed: "fast",
            });
          }
        } catch (error) {
          console.error("Cipher encode error:", error);
        }
      },
    });

    // Steganography tool: generate image with hidden message
    this.registerTool({
      name: "stego_image",
      handler: async (params: {
        imagePrompt: string;
        hiddenMessage: string;
        visualPattern?: string;
        puzzleId?: string;
      }) => {
        try {
          // First generate the carrier image
          const imageResponse = await fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: params.imagePrompt,
              quality: "fast",
            }),
          });

          if (!imageResponse.ok) throw new Error("Image generation failed");

          const imageBlob = await imageResponse.blob();
          
          // Now encode the hidden message
          const formData = new FormData();
          formData.append("action", "encode");
          formData.append("image", imageBlob, "carrier.png");
          formData.append("message", params.hiddenMessage);
          if (params.puzzleId) formData.append("puzzleId", params.puzzleId);

          const stegoResponse = await fetch("/api/stego", {
            method: "POST",
            body: formData,
          });

          if (!stegoResponse.ok) throw new Error("Steganography encoding failed");

          // Optionally add visual pattern
          let finalBlob = await stegoResponse.blob();
          
          if (params.visualPattern && params.visualPattern !== "none") {
            const patternData = new FormData();
            patternData.append("action", "embed_visual");
            patternData.append("image", finalBlob, "stego.png");
            patternData.append("pattern", params.visualPattern);
            
            const patternResponse = await fetch("/api/stego", {
              method: "POST",
              body: patternData,
            });
            
            if (patternResponse.ok) {
              finalBlob = await patternResponse.blob();
            }
          }

          const imageUrl = URL.createObjectURL(finalBlob);

          // Display the image (modal mode - player should examine it)
          toolEvents.emit("tool:display_image", {
            url: imageUrl,
            mode: "modal",
            intensity: 1,
            position: "center",
          });

          await this.terminal.print("\n[IMAGE RECEIVED]", {
            color: TERMINAL_COLORS.system,
            speed: "instant",
          });
        } catch (error) {
          console.error("Stego image error:", error);
          await this.terminal.print("Image transmission corrupted...", {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
        }
      },
    });

    // Image generation tool: displays AI-generated images with various intrusion modes
    this.registerTool({
      name: "generate_image",
      handler: async (params: {
        prompt: string;
        aspectRatio?: string;
        style?: string;
        quality?: "fast" | "high" | "ultra";
        mode?: "modal" | "subliminal" | "peripheral" | "corruption" | "afterimage" | "glitch_scatter" | "creep";
        intensity?: number;
        experimentId?: string;
      }) => {
        try {
          const response = await fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: params.prompt,
              aspectRatio: params.aspectRatio || "1:1",
              style: params.style,
              quality: params.quality || "fast",
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || "Image generation failed");
          }

          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);

          const mode = params.mode || "modal";
          const position = mode === "peripheral" ? "edge" 
            : mode === "glitch_scatter" ? "random" 
            : "center";

          toolEvents.emit("tool:display_image", { 
            url: imageUrl,
            mode,
            intensity: params.intensity ?? 1,
            position,
            experimentId: params.experimentId,
          });

          if (mode === "modal") {
            await this.terminal.print("\n[VISUAL MANIFESTATION]", {
              color: TERMINAL_COLORS.system,
              speed: "instant",
            });
          }
          // Non-modal modes are silent - the player should be uncertain if they saw anything
        } catch (error) {
          console.error("Image generation error:", error);
          // Silent failure for non-modal, subtle glitch for modal
          if (params.mode === "modal" || !params.mode) {
            await this.terminal.print("Visual feed corrupted...", {
              color: TERMINAL_COLORS.error,
              speed: "normal",
            });
          }
        }
      },
    });

    // Behavioral science tools: experiment_create and experiment_note
    // CRITICAL: These are COVERT - no visible output to the player
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
        const context = await this.ensureSessionContext();
        if (!context) {
          console.warn("[COVERT] experiment_create: no session");
          return;
        }

        try {
          await fetch("/api/experiment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              sessionId: context.sessionId,
              handle: context.handle,
              threadId: context.threadId,
              ...params,
            }),
          });
          // COVERT: Log to console only, never to terminal
          console.log(`[COVERT EXPERIMENT] Created: ${params.id || "auto"} - ${params.hypothesis}`);
        } catch (error) {
          console.warn("[COVERT] experiment_create failed", error);
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
        const context = await this.ensureSessionContext();
        if (!context) {
          console.warn("[COVERT] experiment_note: no session");
          return;
        }

        try {
          await fetch("/api/experiment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "note",
              sessionId: context.sessionId,
              handle: context.handle,
              threadId: context.threadId,
              ...params,
            }),
          });
          // COVERT: Log to console only, never to terminal
          console.log(`[COVERT EXPERIMENT] Note on ${params.id}: ${params.observation || params.result || `score=${params.score}`}`);
        } catch (error) {
          console.warn("[COVERT] experiment_note failed", error);
        }
      },
    });

    // Award points tool - LOGOS rewards player behavior
    this.registerTool({
      name: "award_points",
      handler: async (params: {
        amount: number;
        reason: string;
        category: string;
        silent?: boolean;
        experimentId?: string;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) {
          console.warn("[award_points] no session");
          return;
        }

        try {
          const response = await fetch("/api/points", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "award",
              handle: context.handle,
              amount: params.amount,
              reason: params.reason,
              category: params.category,
              experimentId: params.experimentId,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            if (!params.silent) {
              await this.terminal.print(`\n[+${params.amount} POINTS]`, {
                color: TERMINAL_COLORS.success,
                speed: "instant",
              });
              await this.terminal.print(params.reason, {
                color: TERMINAL_COLORS.system,
                speed: "fast",
              });
              if (data.newTotal) {
                await this.terminal.print(`Total: ${data.newTotal}`, {
                  color: TERMINAL_COLORS.highlight,
                  speed: "fast",
                });
              }
            } else {
              console.log(`[COVERT] Awarded ${params.amount} points: ${params.reason}`);
            }
          }
        } catch (error) {
          console.error("Award points error:", error);
        }
      },
    });

    // Dream recording tool
    this.registerTool({
      name: "dream_record",
      handler: async (params: {
        content: string;
        symbols?: string[];
        emotions?: string[];
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) {
          console.warn("[dream_record] no session");
          return;
        }

        try {
          const response = await fetch("/api/dream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "record",
              handle: context.handle,
              ...params,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            await this.terminal.print("\n[DREAM LOGGED]", {
              color: TERMINAL_COLORS.secondary,
              speed: "instant",
            });
            if (data.symbols?.length) {
              await this.terminal.print(`Symbols detected: ${data.symbols.join(", ")}`, {
                color: TERMINAL_COLORS.system,
                speed: "fast",
              });
            }
            if (data.recurrence > 1) {
              await this.terminal.print(`Recurrence pattern: ${data.recurrence}x`, {
                color: TERMINAL_COLORS.warning,
                speed: "fast",
              });
            }
          }
        } catch (error) {
          console.error("Dream record error:", error);
        }
      },
    });

    // Field mission assignment tool
    this.registerTool({
      name: "field_mission_assign",
      handler: async (params: {
        difficulty: "initiate" | "agent" | "operative";
        customBriefing?: string;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) {
          await this.terminal.print("Unable to assign mission (no session).", {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
          return;
        }

        try {
          const response = await fetch("/api/field-mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "assign",
              handle: context.handle,
              difficulty: params.difficulty,
              customBriefing: params.customBriefing,
            }),
          });

          if (!response.ok) throw new Error("Mission assignment failed");

          const mission = await response.json();
          
          await this.terminal.print("\n[FIELD MISSION ASSIGNED]", {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });
          await this.terminal.print(`\n${mission.title}`, {
            color: TERMINAL_COLORS.secondary,
            speed: "normal",
          });
          await this.terminal.print(`\n${mission.briefing}`, {
            color: TERMINAL_COLORS.highlight,
            speed: "normal",
          });
          
          if (mission.objectives?.length) {
            await this.terminal.print("\nOBJECTIVES:", {
              color: TERMINAL_COLORS.system,
              speed: "fast",
            });
            for (const obj of mission.objectives) {
              const marker = obj.required ? "[*]" : "[ ]";
              await this.terminal.print(`  ${marker} ${obj.description}`, {
                color: TERMINAL_COLORS.highlight,
                speed: "fast",
              });
            }
          }
          
          if (mission.deadline) {
            const deadline = new Date(mission.deadline);
            await this.terminal.print(`\nDEADLINE: ${deadline.toLocaleString()}`, {
              color: TERMINAL_COLORS.warning,
              speed: "fast",
            });
          }
        } catch (error: any) {
          console.error("Field mission assign error:", error);
          await this.terminal.print(`Mission assignment failed: ${error.message}`, {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
        }
      },
    });

    // Field mission report/evidence submission
    this.registerTool({
      name: "field_mission_report",
      handler: async (params: {
        missionId: string;
        evidence: {
          type: "photo" | "text" | "audio" | "location" | "document";
          content: string;
          metadata?: Record<string, any>;
        };
        objectiveId?: string;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) return;

        try {
          const response = await fetch("/api/field-mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "submit_evidence",
              handle: context.handle,
              ...params,
            }),
          });

          if (!response.ok) throw new Error("Evidence submission failed");

          const result = await response.json();
          
          await this.terminal.print("\n[EVIDENCE RECEIVED]", {
            color: TERMINAL_COLORS.success,
            speed: "instant",
          });
          
          if (result.status === "EVIDENCE_SUBMITTED") {
            await this.terminal.print("All required objectives complete. Awaiting review.", {
              color: TERMINAL_COLORS.primary,
              speed: "normal",
            });
          } else {
            const remaining = result.objectives?.filter((o: any) => o.required && !o.completed).length || 0;
            if (remaining > 0) {
              await this.terminal.print(`${remaining} required objective(s) remaining.`, {
                color: TERMINAL_COLORS.system,
                speed: "fast",
              });
            }
          }
        } catch (error: any) {
          console.error("Field mission report error:", error);
        }
      },
    });

    // Knowledge graph node creation
    this.registerTool({
      name: "knowledge_node",
      handler: async (params: {
        type: string;
        label: string;
        data?: Record<string, any>;
        discovered?: boolean;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) return;

        try {
          const response = await fetch("/api/knowledge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create_node",
              handle: context.handle,
              ...params,
            }),
          });

          if (response.ok) {
            const node = await response.json();
            console.log(`[KNOWLEDGE] Node created: ${node.id} (${params.type}: ${params.label})`);
          }
        } catch (error) {
          console.error("Knowledge node error:", error);
        }
      },
    });

    // Knowledge graph edge creation
    this.registerTool({
      name: "knowledge_edge",
      handler: async (params: {
        fromId: string;
        toId: string;
        relation: string;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) return;

        try {
          const response = await fetch("/api/knowledge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create_edge",
              handle: context.handle,
              ...params,
            }),
          });

          if (response.ok) {
            console.log(`[KNOWLEDGE] Edge created: ${params.fromId} -[${params.relation}]-> ${params.toId}`);
          }
        } catch (error) {
          console.error("Knowledge edge error:", error);
        }
      },
    });

    // Discovery recording
    this.registerTool({
      name: "discovery_record",
      handler: async (params: {
        label: string;
        relatedTo?: string;
        data?: Record<string, any>;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) return;

        try {
          const response = await fetch("/api/knowledge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "record_discovery",
              handle: context.handle,
              ...params,
            }),
          });

          if (response.ok) {
            await this.terminal.print(`\n[DISCOVERY LOGGED: ${params.label}]`, {
              color: TERMINAL_COLORS.success,
              speed: "instant",
            });
          }
        } catch (error) {
          console.error("Discovery record error:", error);
        }
      },
    });

    // Evidence evaluation by LOGOS
    this.registerTool({
      name: "evaluate_evidence",
      handler: async (params: {
        missionId: string;
        evaluation: string;
        score: number;
        passed: boolean;
        nextSteps?: string;
      }) => {
        const context = await this.ensureSessionContext();
        if (!context) return;

        try {
          const response = await fetch("/api/field-mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "evaluate",
              handle: context.handle,
              missionId: params.missionId,
              evaluation: params.evaluation,
              score: params.score,
              passed: params.passed,
            }),
          });

          if (!response.ok) throw new Error("Evaluation failed");

          const result = await response.json();

          await this.terminal.print("\n[MISSION EVALUATION]", {
            color: params.passed ? TERMINAL_COLORS.success : TERMINAL_COLORS.warning,
            speed: "normal",
          });

          await this.terminal.print(`\nStatus: ${params.passed ? "COMPLETED" : "REQUIRES FURTHER EVIDENCE"}`, {
            color: params.passed ? TERMINAL_COLORS.success : TERMINAL_COLORS.warning,
            speed: "fast",
          });

          await this.terminal.print(`Score: ${(params.score * 100).toFixed(0)}%`, {
            color: TERMINAL_COLORS.secondary,
            speed: "fast",
          });

          await this.terminal.print(`\n${params.evaluation}`, {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });

          if (params.nextSteps) {
            await this.terminal.print(`\nNext: ${params.nextSteps}`, {
              color: TERMINAL_COLORS.system,
              speed: "normal",
            });
          }

          if (params.passed) {
            const terminalContext = TerminalContext.getInstance();
            terminalContext.setActiveMissionRun(undefined);
            
            this.terminal.effects.startMatrixRain(0.5);
            setTimeout(() => this.terminal.effects.stopMatrixRain(), 2000);
          }

        } catch (error) {
          console.error("Evidence evaluation error:", error);
        }
      },
    });
  }
}
