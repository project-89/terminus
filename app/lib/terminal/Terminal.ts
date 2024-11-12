import {
  TerminalEffects,
  GlowEffect,
  ScanlineEffect,
  CRTEffect,
} from "./effects";
import { EventEmitter } from "events";

export const TERMINAL_COLORS = {
  primary: "#2fb7c3", // New default color
  secondary: "#22ffd7", // Keep secondary for contrast
  error: "#ff0000", // Keep error red
  success: "#00ff00", // Keep success green
  warning: "#ffff00", // Keep warning yellow
  system: "#2fb7c3", // Match primary
  prompt: "#2fb7c3", // Match primary
} as const;

export interface TerminalOptions {
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  foregroundColor: string;
  cursorColor: string;
  blinkRate: number;
  effects: {
    glow: GlowEffect;
    scanlines: ScanlineEffect;
    crt: CRTEffect;
  };
  colors?: typeof TERMINAL_COLORS; // Allow color customization
  cursor: {
    centered?: boolean;
    leftPadding?: number;
  };
  pixelation: {
    enabled: boolean;
    scale: number; // Lower = more pixelated (e.g., 0.5 = half resolution)
  };
}

interface PrintOptions {
  color?: string;
  effect?: "none" | "glitch" | "flicker";
  speed?: "instant" | "fast" | "normal" | "slow";
}

// First, let's define our types
export type TerminalContext = {
  command: string; // The raw command input
  args: string[]; // Parsed arguments
  flags: Record<string, any>; // Command flags
  terminal: Terminal; // Give middleware access to terminal
  error?: string; // Error message if any
  handled?: boolean; // Whether the command was handled
  [key: string]: any; // Allow middleware to add custom properties
};

export type TerminalMiddleware = (
  ctx: TerminalContext,
  next: () => Promise<void>
) => Promise<void>;

export class Terminal extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cursor: { x: number; y: number } = { x: 0, y: 0 };
  private buffer: Array<{
    text: string;
    color?: string;
    effect?: "none" | "glitch" | "flicker";
  }> = [];
  private inputBuffer: string = "";
  private cursorVisible: boolean = true;
  private blinkInterval: NodeJS.Timeout | null = null;
  private effects: TerminalEffects;
  private animationFrame: number | null = null;
  private middlewares: TerminalMiddleware[] = [];
  private printQueue: Array<{
    text: string;
    options: PrintOptions;
    resolve: () => void;
  }> = [];
  private isPrinting: boolean = false;
  private typingSpeeds = {
    instant: 0,
    fast: 5,
    normal: 30,
    slow: 50,
  };
  private colors: typeof TERMINAL_COLORS;
  private scrollOffset: number = 0;
  private maxScrollback: number = 1000; // Maximum lines to keep in buffer
  public context: Record<string, any> = {};

  constructor(
    canvas: HTMLCanvasElement,
    private options: TerminalOptions = {
      width: 800,
      height: 600,
      fontSize: 16,
      fontFamily: "'Berkeley Mono Variable', monospace",
      backgroundColor: "#000000",
      foregroundColor: "#00ff00",
      cursorColor: "#00ff00",
      blinkRate: 500,
      effects: {
        glow: {
          blur: 4,
          color: "#00ff00",
          strength: 0.5,
          passes: 3,
        },
        scanlines: {
          spacing: 2,
          opacity: 0.1,
          speed: 0.5,
          offset: 0,
          thickness: 1.5,
        },
        crt: {
          curvature: 0.15,
          vignetteStrength: 0.25,
          cornerBlur: 0.12,
          scanlineGlow: 0.15,
        },
      },
      colors: TERMINAL_COLORS,
      cursor: {
        centered: false,
        leftPadding: 10, // Default left padding
      },
      pixelation: {
        enabled: false,
        scale: 1,
      },
    }
  ) {
    super(); // Initialize EventEmitter
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.setupCanvas();
    this.startCursorBlink();
    this.effects = new TerminalEffects(
      this.ctx,
      options.width,
      options.height,
      options.effects
    );
    this.startRenderLoop();
    this.colors = options.colors || TERMINAL_COLORS;
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;

    if (this.options.pixelation?.enabled) {
      // Scale down the canvas resolution
      const scale = this.options.pixelation.scale;
      this.canvas.width = this.options.width * dpr * scale;
      this.canvas.height = this.options.height * dpr * scale;

      // Make rendering pixelated instead of smoothed
      this.ctx.imageSmoothingEnabled = false;

      // Scale context to match the reduced resolution
      this.ctx.scale(dpr * scale, dpr * scale);
    } else {
      // Original high-resolution setup
      this.canvas.width = this.options.width * dpr;
      this.canvas.height = this.options.height * dpr;
      this.ctx.scale(dpr, dpr);
    }

    // Set canvas CSS size
    this.canvas.style.width = `${this.options.width}px`;
    this.canvas.style.height = `${this.options.height}px`;

    // Setup font - Let's make this more explicit
    console.log(
      "Setting font:",
      `${this.options.fontSize}px "${this.options.fontFamily}"`
    ); // Debug log
    this.ctx.font = `${this.options.fontSize}px "${this.options.fontFamily}"`;
    this.ctx.textBaseline = "top";

    // Update the font loading to use the new font
    const font = new FontFace(
      "Berkeley Mono Variable",
      `url(/BerkeleyMonoVariable-Regular.woff)`
    );

    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log("Font loaded successfully");
        this.ctx.font = `${this.options.fontSize}px "${this.options.fontFamily}"`;
        this.render();
      })
      .catch((error) => {
        console.error("Font loading failed:", error);
      });
  }

  private startCursorBlink() {
    this.blinkInterval = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.render();
    }, this.options.blinkRate);
  }

  public async print(text: string, options: PrintOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      this.printQueue.push({
        text,
        options: {
          ...options,
          speed: options.speed || "normal",
        },
        resolve,
      });
      if (!this.isPrinting) {
        this.processNextPrint();
      }
    });
  }

  private async processNextPrint() {
    if (this.printQueue.length === 0) {
      this.isPrinting = false;
      return;
    }

    this.isPrinting = true;
    const { text, options, resolve } = this.printQueue[0];
    const speed = this.typingSpeeds[options.speed || "normal"];

    if (speed === 0) {
      const lines = text.split("\n");
      lines.forEach((line) => {
        this.buffer.push({
          text: line,
          color: options.color || this.options.foregroundColor,
          effect: options.effect || "none",
        });
      });
      this.render();
    } else {
      const lines = text.split("\n");
      for (const line of lines) {
        if (line === "") {
          this.buffer.push({
            text: "",
            color: options.color || this.options.foregroundColor,
            effect: options.effect || "none",
          });
          continue;
        }

        const bufferLine = {
          text: "",
          color: options.color || this.options.foregroundColor,
          effect: options.effect || "none",
        };
        this.buffer.push(bufferLine);

        for (let i = 0; i < line.length; i++) {
          bufferLine.text += line[i];
          this.render();
          await this.wait(speed);
        }
      }
    }

    this.printQueue.shift();
    resolve();
    this.processNextPrint();
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Add middleware
  public use(middleware: TerminalMiddleware) {
    this.middlewares.push(middleware);
    return this; // Allow chaining
  }

  // Execute middleware chain
  private async executeMiddleware(ctx: TerminalContext) {
    // Merge terminal context with command context
    ctx = {
      ...ctx,
      ...this.context, // This will include the router
    };

    let index = 0;
    const executeNext = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index];
        index++;
        await middleware(ctx, executeNext);
      }
    };

    await executeNext();
    return ctx;
  }

  // Modified handleInput to use middleware
  public async handleInput(char: string) {
    if (char === "Enter") {
      if (this.inputBuffer.trim()) {
        // Create context
        const ctx: TerminalContext = {
          command: this.inputBuffer.trim(),
          args: this.inputBuffer.trim().split(/\s+/),
          flags: {},
          terminal: this,
          handled: false,
        };

        try {
          // Print the command first
          await this.print(`${this.inputBuffer}`, {
            color: this.options.foregroundColor,
          });

          // Execute middleware chain
          await this.executeMiddleware(ctx);

          // If command wasn't handled by any middleware
          if (!ctx.handled) {
            await this.print(`Command not found: ${ctx.command}`, {
              color: "#ff0000",
            });
          }
        } catch (error: any) {
          await this.print(`System Error: ${error.message}`, {
            color: "#ff0000",
          });
        }
      }

      this.inputBuffer = "";
      this.render();
    } else if (char === "Backspace") {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      this.render();
    } else if (char.length === 1) {
      this.inputBuffer += char;
      this.ensureInputVisible();
      this.render();
    }
  }

  private startRenderLoop() {
    const animate = (timestamp: number) => {
      this.render(timestamp);
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  private render(timestamp: number = 0) {
    // Clear canvas with background
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply CRT effects first
    this.effects.applyCRTEffect();

    // Apply enhanced glow
    this.effects.applyGlow();

    // Calculate starting Y position with scroll offset
    let currentY = 50 - this.scrollOffset; // Start 50px from top, adjusted for scroll
    const lineHeight = this.options.fontSize * 1.5;

    // Draw buffer
    this.buffer.forEach((line) => {
      // Add subtle vertical displacement for CRT effect
      const yOffset = Math.sin(timestamp * 0.001) * 0.8;
      const xOffset = Math.cos(timestamp * 0.002) * 0.3;

      // Draw text with enhanced chromatic aberration
      if (Math.random() < 0.08) {
        this.ctx.fillStyle = "rgba(255, 0, 255, 0.15)"; // Magenta ghost
        this.ctx.fillText(line.text, 10 + xOffset + 1.5, currentY + yOffset);
        this.ctx.fillStyle = "rgba(0, 255, 255, 0.15)"; // Cyan ghost
        this.ctx.fillText(line.text, 10 + xOffset - 1.5, currentY + yOffset);
      }

      // Draw main text
      this.ctx.fillStyle = line.color || this.options.foregroundColor;
      this.ctx.fillText(line.text, 10 + xOffset, currentY + yOffset);

      // Move to next line
      currentY += lineHeight;
    });

    // Calculate input line position - ensure it's always visible
    const inputY =
      Math.max(
        this.getHeight() - this.options.fontSize * 2, // Keep input line higher up from bottom
        this.buffer.length * this.options.fontSize * 1.5 + this.options.fontSize
      ) - this.scrollOffset; // Apply scroll offset

    // Draw input line and cursor
    if (this.inputBuffer !== undefined) {
      const cursorStartX = this.getCursorStartX();
      this.ctx.fillStyle = this.options.foregroundColor;

      // Ensure input line is visible
      if (inputY > 0 && inputY < this.getHeight()) {
        this.ctx.fillText(`> ${this.inputBuffer}`, cursorStartX, inputY);

        // Draw cursor
        if (this.cursorVisible) {
          const cursorX =
            cursorStartX + this.ctx.measureText(`> ${this.inputBuffer}`).width;
          this.ctx.fillStyle = this.options.cursorColor;
          this.ctx.fillRect(
            cursorX,
            inputY,
            this.options.fontSize / 2,
            this.options.fontSize
          );
        }
      }
    }

    // Reset glow for effects
    this.effects.resetGlow();

    // Apply scanlines on top
    this.effects.applyScanlines(timestamp);
  }

  public destroy() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  public resize(width: number, height: number) {
    this.options.width = width;
    this.options.height = height;
    this.effects.resize(width, height);
    this.setupCanvas();
  }

  // Helper method to get colors
  public getColors() {
    return this.colors;
  }

  // Add to Terminal class
  public clear() {
    this.buffer = [];
    this.render();
  }

  // Add methods to get dimensions
  public getWidth(): number {
    return this.options.width;
  }

  public getHeight(): number {
    return this.options.height;
  }

  // Add method to get viewport dimensions (accounting for padding)
  public getViewport(): { width: number; height: number } {
    return {
      width: this.options.width,
      height: this.options.height,
    };
  }

  // Add emit method if TypeScript complains about the type
  public emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private getCursorStartX(): number {
    if (this.options.cursor.centered) {
      // Calculate center position based on terminal width
      const terminalWidth = Math.floor(this.getWidth() / 10); // Approximate character width
      const promptWidth = 2; // Width of "> "
      const inputWidth = this.inputBuffer.length;
      const totalWidth = promptWidth + inputWidth;
      const padding = Math.max(0, Math.floor((terminalWidth - totalWidth) / 2));
      return padding * 10; // Convert back to pixels
    }

    // Return left-padded position
    return this.options.cursor.leftPadding;
  }

  // Add method to update cursor options
  public setCursorOptions(options: Partial<typeof this.options.cursor>) {
    this.options.cursor = {
      ...this.options.cursor,
      ...options,
    };
    this.render();
  }

  // Add scroll method
  public scroll(delta: number) {
    const lineHeight = this.options.fontSize * 1.5;
    const maxScroll = Math.max(
      0,
      this.buffer.length * lineHeight - this.getHeight() / 2
    );

    // Make scrolling more responsive
    this.scrollOffset = Math.max(
      0,
      Math.min(maxScroll, this.scrollOffset + delta * 0.5)
    );

    this.render();
  }

  // Add method to ensure input is visible
  private ensureInputVisible() {
    const lineHeight = this.options.fontSize * 1.5;
    const inputY = this.buffer.length * lineHeight;
    const visibleHeight = this.getHeight();

    if (inputY - this.scrollOffset > visibleHeight) {
      this.scrollOffset = inputY - visibleHeight + lineHeight * 2;
      this.render();
    }
  }
}
