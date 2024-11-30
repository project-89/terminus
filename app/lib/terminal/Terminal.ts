import { EventEmitter } from "./eventSystem";
import { TerminalEffects } from "./effects";
import { ScreenManager } from "./ScreenManager";
import { generateOneOffResponse } from "../ai/prompts";
import { toolEvents } from "./tools/registry";
import { InputHandler } from "./components/InputHandler";
import { Renderer } from "./components/Renderer";
import { CommandHandler } from "./components/CommandHandler";
import { TerminalOptions, PrintOptions } from "./types/options";
import { DEFAULT_OPTIONS, TERMINAL_COLORS } from "./constants";

export { TERMINAL_COLORS };
export class Terminal extends EventEmitter {
  public canvas: HTMLCanvasElement;
  public effects!: TerminalEffects;
  public options: TerminalOptions;
  public colors: typeof TERMINAL_COLORS;
  public screenManager: ScreenManager;
  public context: Record<string, any> = {};
  public cursorVisible: boolean = true;
  public isGenerating: boolean = false;
  public matrixRainEnabled: boolean = false;
  public scrollOffset: number = 0;
  public thinkingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  public thinkingAnimationFrame: number = 0;

  public buffer: Array<{
    text: string;
    color?: string;
    effect?: "none" | "glitch" | "flicker";
  }> = [];
  private printQueue: Array<{
    text: string;
    options: PrintOptions;
    resolve: () => void;
  }> = [];
  private isPrinting: boolean = false;
  private currentPrintY: number = 50;
  private blinkInterval: NodeJS.Timeout | null = null;
  private thinkingInterval: NodeJS.Timeout | null = null;
  private loadingInterval: NodeJS.Timeout | null = null;
  private loadingMessageInterval: NodeJS.Timeout | null = null;
  private animationFrame: number | null = null;
  private hasFullAccess: boolean = false;
  private isAtBottom: boolean = true;
  private typingSpeeds = {
    instant: 0,
    fast: 2,
    normal: 15,
    slow: 25,
  };

  public inputHandler: InputHandler;
  public renderer: Renderer;
  public commandHandler: CommandHandler;

  constructor(
    canvas: HTMLCanvasElement,
    options: Partial<TerminalOptions> = {}
  ) {
    super();
    this.canvas = canvas;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.colors = this.options.colors || TERMINAL_COLORS;

    // Initialize components
    this.renderer = new Renderer(this, canvas, this.options);
    this.inputHandler = new InputHandler(this);
    this.commandHandler = new CommandHandler(this);

    // Initialize effects with the renderer's context
    this.effects = new TerminalEffects(
      this.renderer.ctx,
      this.options.width,
      this.options.height,
      this.options.effects
    );

    // Initialize screen manager
    this.screenManager = new ScreenManager(this);

    // Initialize cursor blink
    this.startCursorBlink();

    // Start render loop
    this.startRenderLoop();

    // Initialize tool handlers
    this.registerToolHandlers();
  }

  private startCursorBlink() {
    this.blinkInterval = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.render();
    }, this.options.blinkRate);
  }

  private startRenderLoop() {
    const animate = (timestamp: number) => {
      this.render(timestamp);
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  public render(timestamp: number = 0) {
    // Clear the canvas
    this.renderer.ctx.fillStyle = this.options.backgroundColor;
    this.renderer.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply base effects
    this.effects.applyCRTEffect();
    this.effects.applyGlow();

    // Render buffer and input
    this.renderer.renderBuffer(timestamp);
    this.renderer.renderInput(timestamp);

    // Apply matrix rain if enabled
    if (this.matrixRainEnabled) {
      this.effects.applyMatrixRain();
    }

    // Reset effects and apply scanlines
    this.effects.resetGlow();
    this.effects.applyScanlines(timestamp);
  }

  public async print(text: string, options: PrintOptions = {}) {
    const { color = this.options.foregroundColor, speed = "normal" } = options;

    // Split text into lines and wrap each line
    const lines = text.split("\n").flatMap((line) => {
      if (!line.trim()) return [""];
      return this.renderer.wrapText(line);
    });

    for (const line of lines) {
      this.buffer.push({
        text: line,
        color,
        effect: options.effect,
      });
    }

    this.currentPrintY += lines.length * (this.options.fontSize * 1.5);
    this.render();
    this.scrollToLatest();
  }

  private async processNextPrint(): Promise<void> {
    if (this.printQueue.length === 0) {
      this.isPrinting = false;
      return;
    }

    this.isPrinting = true;
    const { text, options, resolve } = this.printQueue.shift()!;
    const lines = text.split("\n");
    const speed = this.typingSpeeds[options.speed || "normal"];
    const color = options.color || this.options.foregroundColor;
    const lineHeight = this.options.fontSize * 1.5;

    const isAtBottom = this.checkIfAtBottom();

    for (const line of lines) {
      this.buffer.push({
        text: line,
        color,
        effect: options.effect,
      });

      this.currentPrintY += lineHeight;

      if (isAtBottom) {
        const maxScroll = Math.max(
          0,
          this.currentPrintY - this.getHeight() + this.options.fontSize * 2
        );
        this.scrollOffset = maxScroll;
      }

      this.render();

      if (speed > 0) {
        await new Promise((r) => setTimeout(r, speed));
      }
    }

    resolve();
    this.processNextPrint();
  }

  public async processCommand(command: string) {
    await this.commandHandler.processCommand(command);
  }

  public destroy() {
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.thinkingInterval) clearInterval(this.thinkingInterval);
    if (this.loadingMessageInterval) clearInterval(this.loadingMessageInterval);
    this.inputHandler.destroy();
  }

  public resize(width: number, height: number) {
    this.options.width = width;
    this.options.height = height;
    this.effects.resize(width, height);
    this.renderer.resize(width, height);
  }

  public getWidth(): number {
    return this.options.width;
  }

  public getHeight(): number {
    return this.options.height;
  }

  public getCursorY(): number {
    const lineHeight = this.options.fontSize * 1.5;
    const inputText = `> ${this.inputHandler.getInputBuffer()}`;
    const wrappedLines = this.renderer.wrapText(inputText);
    return this.currentPrintY + (wrappedLines.length - 1) * lineHeight;
  }

  public clear() {
    this.clearPrintQueue();
    this.buffer = [];
    this.currentPrintY = 40;
    this.scrollOffset = 0;
    this.isAtBottom = true;
    this.render();
  }

  public clearPrintQueue() {
    this.printQueue = [];
    this.isPrinting = false;
  }

  private checkIfAtBottom(): boolean {
    const lineHeight = this.options.fontSize * 1.5;
    const totalContentHeight = this.currentPrintY + lineHeight;
    const visibleHeight = this.getHeight();
    const maxScroll = Math.max(0, totalContentHeight - visibleHeight);

    return Math.abs(this.scrollOffset - maxScroll) <= lineHeight;
  }

  public startGeneration() {
    this.isGenerating = true;
    this.cursorVisible = true;

    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
    }

    this.thinkingInterval = setInterval(() => {
      this.thinkingAnimationFrame =
        (this.thinkingAnimationFrame + 1) % this.thinkingChars.length;
      this.cursorVisible = true;
      this.render();
    }, 80);

    this.scrollToLatest();
  }

  public endGeneration() {
    this.isGenerating = false;

    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }

    this.thinkingAnimationFrame = 0;
    this.cursorVisible = true;
    this.render();
    this.scrollToLatest();
  }

  public scrollToLatest() {
    const lineHeight = this.options.fontSize * 1.5;
    const totalContentHeight = this.currentPrintY + lineHeight;
    const visibleHeight = this.getHeight();

    if (this.isGenerating || this.isAtBottom) {
      this.scrollOffset = Math.max(
        0,
        totalContentHeight - visibleHeight + lineHeight * 2
      );
      this.render();
    }
  }

  private registerToolHandlers() {
    // Remove existing listeners by replacing them
    toolEvents.off("tool:glitch_screen", this.handleGlitchScreen);
    toolEvents.off("tool:matrix_rain", this.handleMatrixRain);
    toolEvents.off("tool:play_sound", this.handlePlaySound);

    // Add new listeners
    toolEvents.on("tool:glitch_screen", this.handleGlitchScreen);
    toolEvents.on("tool:matrix_rain", this.handleMatrixRain);
    toolEvents.on("tool:play_sound", this.handlePlaySound);
  }

  private handleGlitchScreen = async (params: {
    intensity: number;
    duration: number;
  }) => {
    console.log("Glitch screen effect triggered", params);
    const originalBuffer = [...this.buffer];
    const glitchDuration = Math.min(params.duration, 5000);
    let glitchInterval: NodeJS.Timeout;

    const glitch = () => {
      if (Math.random() < params.intensity) {
        this.buffer = originalBuffer.map((line) => ({
          ...line,
          text: this.corruptText(line.text, params.intensity),
        }));
        this.render();
      }
    };

    // Run glitch effect more frequently for better visual effect
    glitchInterval = setInterval(glitch, 50);
    glitch(); // Run once immediately

    setTimeout(() => {
      clearInterval(glitchInterval);
      this.buffer = originalBuffer;
      this.render();
    }, glitchDuration);
  };

  private handleMatrixRain = async (params: {
    duration: number;
    intensity: number;
  }) => {
    console.log("Matrix rain effect triggered", params);
    this.matrixRainEnabled = true;
    this.effects.startMatrixRain(params.intensity);

    setTimeout(() => {
      this.matrixRainEnabled = false;
      this.effects.stopMatrixRain();
      this.render();
    }, params.duration);
  };

  private handlePlaySound = async (params: {
    type: string;
    volume: number;
  }) => {
    console.log("Play sound triggered", params);
  };

  private corruptText(text: string, intensity: number): string {
    return text
      .split("")
      .map((char) => {
        if (char === " " || char === "\n" || char === ">") {
          return char;
        }
        if (Math.random() < intensity * 0.3) {
          const charCode = 33 + Math.floor(Math.random() * 94);
          return String.fromCharCode(charCode);
        }
        return char;
      })
      .join("");
  }

  public getBufferText(): string {
    return this.buffer.map((line) => line.text).join("\n");
  }

  public getLastMessage(): string {
    let lastMessage = "";
    for (let i = this.buffer.length - 1; i >= 0; i--) {
      const line = this.buffer[i].text;
      if (line.startsWith(">")) {
        break;
      }
      lastMessage = line + "\n" + lastMessage;
    }
    return lastMessage.trim();
  }

  public async copyToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      await this.print("Content copied to clipboard.", {
        color: TERMINAL_COLORS.success,
        speed: "instant",
      });
    } catch (err) {
      await this.print("Failed to copy content.", {
        color: TERMINAL_COLORS.error,
        speed: "instant",
      });
    }
  }

  public async generateOneOffResponse(
    prompt: string,
    options: {
      color?: string;
      addSpacing?: boolean;
    } = {}
  ): Promise<void> {
    try {
      await generateOneOffResponse(prompt, this, options);
    } catch (error) {
      console.error("Error generating one-off response:", error);
      await this.print("Error processing response", {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
    }
  }

  public async processAIStream(stream: ReadableStream): Promise<string> {
    try {
      const reader = stream.getReader();
      let buffer = "";
      let inCodeBlock = false;
      let codeBlockContent = "";
      let consecutiveNewlines = 0;
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        // Process line by line
        while (buffer.includes("\n")) {
          const newlineIndex = buffer.indexOf("\n");
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          // Check for code block markers
          if (line.trim() === "```json") {
            inCodeBlock = true;
            continue;
          }
          if (line.trim() === "```" && inCodeBlock) {
            inCodeBlock = false;
            // Process the collected code block content
            try {
              const json = JSON.parse(codeBlockContent);
              if (json.tool && json.parameters) {
                console.log(
                  `Emitting tool event from code block: tool:${json.tool}`,
                  json.parameters
                );
                toolEvents.emit(`tool:${json.tool}`, json.parameters);
              }
            } catch (e) {
              console.error("Failed to parse code block JSON:", e);
            }
            codeBlockContent = "";
            continue;
          }

          // Collect content inside code block
          if (inCodeBlock) {
            codeBlockContent += line + "\n";
            continue;
          }

          // Process regular lines for raw JSON
          if (line.trim().startsWith("{")) {
            try {
              const json = JSON.parse(line);
              if (json.tool && json.parameters) {
                console.log(
                  `Emitting tool event from raw JSON: tool:${json.tool}`,
                  json.parameters
                );
                toolEvents.emit(`tool:${json.tool}`, json.parameters);
                consecutiveNewlines = 0;
                continue;
              }
            } catch (e) {
              // Not valid JSON, treat as regular text
            }
          }

          // Handle newlines and text printing
          if (line.trim()) {
            await this.print(line, { speed: "normal" });
            fullContent += line + "\n";
            consecutiveNewlines = 0;
          } else {
            consecutiveNewlines++;
            if (consecutiveNewlines === 1) {
              await this.print("", { speed: "instant" });
              fullContent += "\n";
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        await this.print(buffer, { speed: "normal" });
        fullContent += buffer;
      }

      return fullContent.trim();
    } catch (error) {
      console.error("Error processing AI stream:", error);
      throw error;
    }
  }

  public setCommandAccess(enabled: boolean) {
    this.hasFullAccess = enabled;
  }

  public hasCommandAccess(): boolean {
    return this.hasFullAccess;
  }

  public handleInput(char: string, event?: KeyboardEvent) {
    return this.inputHandler.handleInput(char, event);
  }

  public scroll(delta: number) {
    const lineHeight = this.options.fontSize * 1.5;
    const totalContentHeight = this.currentPrintY + lineHeight;
    const visibleHeight = this.getHeight();
    const maxScroll = Math.max(0, totalContentHeight - visibleHeight / 2);

    const newScrollOffset = Math.max(
      0,
      Math.min(maxScroll, this.scrollOffset + delta * 0.5)
    );

    this.scrollOffset = newScrollOffset;
    this.isAtBottom = this.checkIfAtBottom();
    this.render();
  }

  public setCursorOptions(options: Partial<typeof this.options.cursor>) {
    this.options.cursor = {
      ...this.options.cursor,
      ...options,
    };
    this.render();
  }
}
