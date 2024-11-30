import { Terminal } from "../Terminal";
import { toolEvents } from "../tools/registry";
import { TERMINAL_COLORS } from "../constants";

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
  }
}
