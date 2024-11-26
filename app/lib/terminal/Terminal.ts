import {
  TerminalEffects,
  GlowEffect,
  ScanlineEffect,
  CRTEffect,
} from "./effects";
import { EventEmitter } from "events";
import { toolEvents } from "./tools/registry";
import { FaceRenderer } from "./effects/face";
import { ScreenManager } from "./ScreenManager";
import { adventureCommandsMiddleware } from "./middleware/adventure-commands";
import { adventureMiddleware } from "./middleware/adventure";
import { commandsMiddleware } from "./middleware/commands";
import { overrideMiddleware } from "./middleware/override";
import { systemCommandsMiddleware } from "./middleware/system";
import { generateOneOffResponse } from "../ai/prompts";

export const TERMINAL_COLORS = {
  primary: "#2fb7c3",
  secondary: "#1e9fb3",
  highlight: "#ffffff",
  error: "#ff0000",
  success: "#00ff00",
  warning: "#ffff00",
  system: "#2fb7c3",
  prompt: "#2fb7c3",
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
  colors?: typeof TERMINAL_COLORS;
  cursor: {
    centered?: boolean;
    leftPadding?: number;
    mode: "fixed" | "dynamic";
    fixedOffset?: number;
  };
  pixelation: {
    enabled: boolean;
    scale: number;
  };
}

interface PrintOptions {
  color?: string;
  effect?: "none" | "glitch" | "flicker";
  speed?: "instant" | "fast" | "normal" | "slow";
}

export type TerminalContext = {
  command: string;
  args: string[];
  flags: Record<string, any>;
  terminal: Terminal;
  error?: string;
  handled?: boolean;
  [key: string]: any;
};

export type TerminalMiddleware = (
  ctx: TerminalContext,
  next: () => Promise<void>
) => Promise<void>;

export class Terminal extends EventEmitter {
  canvas: HTMLCanvasElement;
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
    fast: 2,
    normal: 15,
    slow: 25,
  };
  private colors: typeof TERMINAL_COLORS;
  private scrollOffset: number = 0;
  private maxScrollback: number = 1000;
  public context: Record<string, any> = {};
  private currentPrintY: number = 50;
  private isGenerating: boolean = false;
  private loadingInterval: NodeJS.Timeout | null = null;
  private loadingMessages: string[] = [
    "Processing",
    "Analyzing",
    "Computing",
    "Decoding",
    "Interfacing",
    "Parsing",
    "Stabilizing",
    "Synchronizing",
  ];

  private layout = {
    maxWidth: 900,
    sidePadding: 60,
    topPadding: 40,
  };

  private hiddenTextarea: HTMLTextAreaElement;
  private inputHistory: string[] = [];
  private historyIndex: number = -1;
  private tempInput: string = "";
  private matrixRainEnabled: boolean = false;
  private faceRenderer: FaceRenderer;
  public screenManager: ScreenManager = new ScreenManager(this);
  private hasFullAccess: boolean = false;
  private isAtBottom: boolean = true;

  // Add new property for thinking animation
  private thinkingAnimationFrame: number = 0;
  private thinkingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private thinkingInterval: NodeJS.Timeout | null = null;

  // Add cursor position tracking
  private cursorPosition: number = 0;

  private loadingMessageIndex: number = 0;
  private loadingMessageInterval: NodeJS.Timeout | null = null;

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
        leftPadding: 10,
        mode: "dynamic",
        fixedOffset: 20,
      },
      pixelation: {
        enabled: false,
        scale: 1,
      },
    }
  ) {
    super();
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

    this.hiddenTextarea = document.createElement("textarea");
    this.hiddenTextarea.style.position = "absolute";
    this.hiddenTextarea.style.left = "-9999px";
    this.hiddenTextarea.style.top = "0";
    document.body.appendChild(this.hiddenTextarea);

    this.registerToolHandlers();

    const faceCanvas = document.createElement("canvas");
    faceCanvas.className = "absolute inset-0 pointer-events-none";
    canvas.parentElement?.appendChild(faceCanvas);

    this.faceRenderer = new FaceRenderer(faceCanvas);

    // Register middlewares in correct order
    this.use(commandsMiddleware); // Global ! commands first
    this.use(overrideMiddleware); // Then override command
    this.use(systemCommandsMiddleware); // Then system commands (connect, etc)
    this.use(adventureMiddleware); // Then game input last

    // Initialize cursor position
    this.cursorPosition = 0;

    // Add screen transition event listener
    this.on("screen:transition", (event) => {
      this.handleScreenTransition(event).catch(console.error);
    });
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;

    if (this.options.pixelation?.enabled) {
      const scale = this.options.pixelation.scale;
      this.canvas.width = this.options.width * dpr * scale;
      this.canvas.height = this.options.height * dpr * scale;

      this.ctx.imageSmoothingEnabled = false;

      this.ctx.scale(dpr * scale, dpr * scale);
    } else {
      this.canvas.width = this.options.width * dpr;
      this.canvas.height = this.options.height * dpr;
      this.ctx.scale(dpr, dpr);
    }

    this.canvas.style.width = `${this.options.width}px`;
    this.canvas.style.height = `${this.options.height}px`;

    console.log(
      "Setting font:",
      `${this.options.fontSize}px "${this.options.fontFamily}"`
    );
    this.ctx.font = `${this.options.fontSize}px "${this.options.fontFamily}"`;
    this.ctx.textBaseline = "top";

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
      const segments = text.split("\n");

      const wrappedLines = segments.flatMap((segment) =>
        segment ? this.wrapText(segment) : [""]
      );

      this.printQueue.push({
        text: wrappedLines.join("\n"),
        options: {
          ...options,
          speed: options.speed || "normal",
        },
        resolve,
      });

      if (!this.isPrinting) {
        this.processNextPrint();
      }

      this.scrollToLatest();
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
    const lineHeight = this.options.fontSize * 1.5;

    this.isAtBottom = this.checkIfAtBottom();

    if (speed === 0) {
      const lines = text.split("\n");
      for (const line of lines) {
        if (!(await this.handleToolCommand(line))) {
          this.buffer.push({
            text: line,
            color: options.color || this.options.foregroundColor,
            effect: options.effect || "none",
          });
          this.currentPrintY += lineHeight;
          if (this.isAtBottom) {
            this.scrollToLatest();
          }
        }
      }
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
          this.currentPrintY += lineHeight;
          if (this.isAtBottom) {
            this.scrollToLatest();
          }
          continue;
        }

        if (!(await this.handleToolCommand(line))) {
          const bufferLine = {
            text: "",
            color: options.color || this.options.foregroundColor,
            effect: options.effect || "none",
          };
          this.buffer.push(bufferLine);

          for (let i = 0; i < line.length; i++) {
            bufferLine.text += line[i];
            if (this.isAtBottom) {
              this.scrollToLatest();
            }
            this.render();
            await this.wait(speed);
          }
          this.currentPrintY += lineHeight;
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

  public use(middleware: TerminalMiddleware) {
    this.middlewares.push(middleware);
    return this;
  }

  private async executeMiddleware(ctx: TerminalContext) {
    ctx = {
      ...ctx,
      ...this.context,
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

  public async handleInput(char: string, event?: KeyboardEvent) {
    if (this.isGenerating) return;

    if (event) {
      switch (event.key) {
        case "ArrowLeft":
          if (this.cursorPosition > 0) {
            this.cursorPosition--;
            this.validateCursorPosition();
            this.render();
          }
          event.preventDefault();
          return;

        case "ArrowRight":
          if (this.cursorPosition < this.inputBuffer.length) {
            this.cursorPosition++;
            this.validateCursorPosition();
            this.render();
          }
          event.preventDefault();
          return;

        case "Home":
          this.cursorPosition = 0;
          this.validateCursorPosition();
          this.render();
          event.preventDefault();
          return;

        case "End":
          this.cursorPosition = this.inputBuffer.length;
          this.validateCursorPosition();
          this.render();
          event.preventDefault();
          return;

        case "ArrowUp":
          if (this.historyIndex < this.inputHistory.length - 1) {
            if (this.historyIndex === -1) {
              this.tempInput = this.inputBuffer;
            }
            this.historyIndex++;
            this.inputBuffer = this.inputHistory[this.historyIndex];
            this.cursorPosition = this.inputBuffer.length;
            this.validateCursorPosition();
            this.render();
          }
          event.preventDefault();
          return;

        case "ArrowDown":
          if (this.historyIndex >= 0) {
            this.historyIndex--;
            this.inputBuffer =
              this.historyIndex === -1
                ? this.tempInput
                : this.inputHistory[this.historyIndex];
            this.cursorPosition = this.inputBuffer.length;
            this.validateCursorPosition();
            this.render();
          }
          event.preventDefault();
          return;

        case "Paste":
        case "v":
          if (event.ctrlKey || event.metaKey) {
            try {
              const text = await navigator.clipboard.readText();
              this.inputBuffer =
                this.inputBuffer.slice(0, this.cursorPosition) +
                text +
                this.inputBuffer.slice(this.cursorPosition);
              this.cursorPosition += text.length;
              this.validateCursorPosition();
              this.render();
            } catch (err) {
              console.error("Failed to paste:", err);
            }
            return;
          }
          break;
      }
    }

    if (char === "Enter") {
      if (this.inputBuffer.trim()) {
        this.inputHistory.unshift(this.inputBuffer);
        this.historyIndex = -1;
        this.tempInput = "";
        const command = this.inputBuffer;
        this.inputBuffer = "";
        this.cursorPosition = 0;
        this.validateCursorPosition();
        this.render();

        const ctx: TerminalContext = {
          command: command.trim(),
          args: command.trim().split(/\s+/),
          flags: {},
          terminal: this,
          handled: false,
          hasFullAccess: false,
        };

        try {
          await this.print(`> ${command}`, {
            color: this.options.foregroundColor,
            speed: "instant",
          });

          await this.print("", { speed: "instant" });

          // Execute middleware chain first
          await this.executeMiddleware(ctx);

          // If still not handled and has full access, show error
          if (!ctx.handled && ctx.hasFullAccess) {
            await this.print(`Command not found: ${ctx.command}`, {
              color: "#ff0000",
              speed: "normal",
            });
          }
        } catch (error: any) {
          await this.print(`System Error: ${error.message}`, {
            color: "#ff0000",
            speed: "normal",
          });
        }
      } else {
        await this.print("", { speed: "instant" });
        this.inputBuffer = "";
      }
      this.render();
    } else if (char === "Backspace") {
      if (this.cursorPosition > 0) {
        this.inputBuffer =
          this.inputBuffer.slice(0, this.cursorPosition - 1) +
          this.inputBuffer.slice(this.cursorPosition);
        this.cursorPosition--;
        this.validateCursorPosition();
        this.render();
      }
    } else if (char === "Delete" && event?.key === "Delete") {
      if (this.cursorPosition < this.inputBuffer.length) {
        this.inputBuffer =
          this.inputBuffer.slice(0, this.cursorPosition) +
          this.inputBuffer.slice(this.cursorPosition + 1);
        this.validateCursorPosition();
        this.render();
      }
    } else if (char.length === 1) {
      this.inputBuffer =
        this.inputBuffer.slice(0, this.cursorPosition) +
        char +
        this.inputBuffer.slice(this.cursorPosition);
      this.cursorPosition++;
      this.validateCursorPosition();
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
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.effects.applyCRTEffect();

    if (this.matrixRainEnabled) {
      this.effects.applyMatrixRain();
    }

    this.effects.applyGlow();

    let currentY = this.layout.topPadding - this.scrollOffset;
    const lineHeight = this.options.fontSize * 1.5;

    this.buffer.forEach((line) => {
      const yOffset = Math.sin(timestamp * 0.001) * 0.8;
      const xOffset = Math.cos(timestamp * 0.002) * 0.3;

      if (Math.random() < 0.08) {
        this.ctx.fillStyle = "rgba(255, 0, 255, 0.15)";
        this.ctx.fillText(
          line.text,
          this.layout.sidePadding + xOffset + 1.5,
          currentY + yOffset
        );
        this.ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
        this.ctx.fillText(
          line.text,
          this.layout.sidePadding + xOffset - 1.5,
          currentY + yOffset
        );
      }

      this.ctx.fillStyle = line.color || this.options.foregroundColor;
      this.ctx.fillText(
        line.text,
        this.layout.sidePadding + xOffset,
        currentY + yOffset
      );

      currentY += lineHeight;
    });

    const cursorY = this.getCursorY() - this.scrollOffset;
    if (cursorY > 0 && cursorY < this.getHeight()) {
      const cursorStartX = this.getCursorStartX();
      const inputText = `> ${this.inputBuffer}`;

      this.ctx.fillStyle = this.options.foregroundColor;
      this.ctx.fillText(inputText, cursorStartX, cursorY);

      if (this.cursorVisible) {
        // Calculate cursor position based on text width up to cursor
        const textBeforeCursor = `> ${this.inputBuffer.slice(
          0,
          this.cursorPosition
        )}`;
        const cursorX =
          cursorStartX + this.ctx.measureText(textBeforeCursor).width;

        if (this.isGenerating) {
          // Show thinking animation with loading message
          this.ctx.fillStyle = this.options.cursorColor;
          this.ctx.font = `${this.options.fontSize}px "${this.options.fontFamily}"`;
          const thinkingChar = this.thinkingChars[this.thinkingAnimationFrame];
          const loadingMessage = this.loadingMessages[this.loadingMessageIndex];
          this.ctx.fillText(
            `${thinkingChar} ${loadingMessage}...`,
            cursorX,
            cursorY
          );
        } else {
          // Show regular cursor block
          this.ctx.fillStyle = this.options.cursorColor;
          this.ctx.fillRect(
            cursorX,
            cursorY,
            this.options.fontSize / 2,
            this.options.fontSize
          );
        }
      }
    }

    this.effects.resetGlow();

    this.effects.applyScanlines(timestamp);
  }

  public destroy() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
    }
    if (this.loadingMessageInterval) {
      clearInterval(this.loadingMessageInterval);
    }
    if (this.hiddenTextarea && this.hiddenTextarea.parentNode) {
      this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea);
    }
  }

  public resize(width: number, height: number) {
    this.options.width = width;
    this.options.height = height;
    this.effects.resize(width, height);
    this.setupCanvas();
  }

  public getColors() {
    return this.colors;
  }

  public clear() {
    // Stop any ongoing printing
    this.clearPrintQueue();

    // Clear all content
    this.buffer = [];

    // Reset all position tracking
    this.currentPrintY = this.layout.topPadding; // Start from top padding instead of 50
    this.scrollOffset = 0;
    this.inputBuffer = "";
    this.cursorPosition = 0;
    this.isAtBottom = true; // Reset scroll tracking

    // Clear the canvas completely
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Re-render empty state
    this.render();
  }

  public getWidth(): number {
    return this.options.width;
  }

  public getHeight(): number {
    return this.options.height;
  }

  public getViewport(): { width: number; height: number } {
    return {
      width: this.options.width,
      height: this.options.height,
    };
  }

  public emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private getCursorStartX(): number {
    if (this.options.cursor.centered) {
      const terminalWidth = Math.min(this.getWidth(), this.layout.maxWidth);
      const promptWidth = 2;
      const inputWidth = this.inputBuffer.length;
      const totalWidth = promptWidth + inputWidth;
      const padding = Math.max(0, Math.floor((terminalWidth - totalWidth) / 2));
      return this.layout.sidePadding + padding;
    }
    return this.layout.sidePadding + (this.options.cursor.leftPadding || 10);
  }

  public setCursorOptions(options: Partial<typeof this.options.cursor>) {
    this.options.cursor = {
      ...this.options.cursor,
      ...options,
    };
    this.render();
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

  private ensureInputVisible() {
    const cursorY = this.getCursorY();
    const visibleHeight = this.getHeight();

    if (cursorY - this.scrollOffset > visibleHeight) {
      this.scrollOffset = cursorY - visibleHeight + this.options.fontSize * 2;
      this.render();
    }
  }

  public clearPrintQueue() {
    this.printQueue = [];
    this.isPrinting = false;
  }

  public cleanup() {
    this.clearPrintQueue();
    this.clear();
    this.inputBuffer = "";
    this.render();
  }

  public getCursorY(): number {
    const lineHeight = this.options.fontSize * 1.5;

    if (this.options.cursor.mode === "fixed") {
      return this.getHeight() - (this.options.cursor.fixedOffset || 20);
    } else {
      let lastTextPosition = this.currentPrintY;
      for (let i = this.buffer.length - 1; i >= 0; i--) {
        if (this.buffer[i].text.trim()) {
          lastTextPosition = i * lineHeight + this.getVerticalPadding();
          break;
        }
      }

      return Math.max(
        lastTextPosition + lineHeight * 2,
        this.getVerticalPadding() + lineHeight
      );
    }
  }

  private getMaxCharsPerLine(): number {
    const charWidth = this.ctx.measureText("M").width;
    const availableWidth = Math.min(
      this.getWidth() - this.layout.sidePadding * 2,
      this.layout.maxWidth
    );
    return Math.floor(availableWidth / charWidth);
  }

  private wrapText(text: string): string[] {
    const maxChars = this.getMaxCharsPerLine();
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if (word.length > maxChars) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        for (let i = 0; i < word.length; i += maxChars) {
          lines.push(word.slice(i, i + maxChars));
        }
        continue;
      }

      if (currentLine.length + word.length + 1 <= maxChars) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  public scrollToLatest() {
    const lineHeight = this.options.fontSize * 1.5;
    const totalContentHeight = this.currentPrintY + lineHeight;
    const visibleHeight = this.getHeight();

    // If generating, always scroll to bottom regardless of isAtBottom state
    if (this.isGenerating || this.isAtBottom) {
      this.scrollOffset = Math.max(
        0,
        totalContentHeight - visibleHeight + lineHeight * 2 // Add extra padding
      );
      this.render();
    }
  }

  private scrollForInput() {
    if (!this.isAtBottom) return;

    const lineHeight = this.options.fontSize * 1.5;
    const extraScrollSpace = lineHeight * 3;
    const totalContentHeight = this.currentPrintY + extraScrollSpace;
    const visibleHeight = this.getHeight();

    if (totalContentHeight > visibleHeight) {
      this.scrollOffset = totalContentHeight - visibleHeight;
      this.render();
    }
  }

  public startGeneration() {
    this.isGenerating = true;
    this.cursorVisible = true;

    // Separate intervals for cursor animation and loading message
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
    }
    if (this.loadingMessageInterval) {
      clearInterval(this.loadingMessageInterval);
    }

    // Faster interval for cursor animation
    this.thinkingInterval = setInterval(() => {
      this.thinkingAnimationFrame =
        (this.thinkingAnimationFrame + 1) % this.thinkingChars.length;
      this.cursorVisible = true;
      this.render();
    }, 150);

    // Slower interval for loading message changes
    this.loadingMessageInterval = setInterval(() => {
      this.loadingMessageIndex =
        (this.loadingMessageIndex + 1) % this.loadingMessages.length;
      this.render();
      this.scrollToLatest();
    }, 2000); // Much slower rotation of messages

    this.scrollToLatest();
  }

  public endGeneration() {
    this.isGenerating = false;

    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }

    this.thinkingAnimationFrame = 0;
    this.loadingMessageIndex = 0;
    this.cursorVisible = true;
    this.render();
    this.scrollToLatest();
    this.scrollForInput();
  }

  public async processAIStream(
    stream: ReadableStream,
    options: {
      color?: string;
      addSpacing?: boolean;
      returnContent?: boolean;
    } = {}
  ): Promise<string | void> {
    const {
      color = TERMINAL_COLORS.primary,
      addSpacing = false,
      returnContent = false,
    } = options;
    let fullContent = "";
    let currentLine = "";
    let consecutiveNewlines = 0;

    try {
      const reader = stream.getReader();
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const text = new TextDecoder().decode(result.value);

          // Process text character by character
          for (const char of text) {
            if (char === "\n") {
              consecutiveNewlines++;

              // Handle current line if it exists
              if (currentLine.trim()) {
                // Check for tool commands in the line
                const toolCommandMatch = currentLine.match(/\{.*?\}/g);
                if (toolCommandMatch) {
                  // Process each tool command found
                  for (const match of toolCommandMatch) {
                    await this.handleToolCommand(match);
                  }
                  // Replace tool commands with empty string and print remaining text
                  const remainingText = currentLine
                    .replace(/\{.*?\}/g, "")
                    .trim();
                  if (remainingText) {
                    await this.print(remainingText, { color, speed: "fast" });
                    fullContent += remainingText + "\n";
                  }
                } else {
                  // No tool command, print the line normally
                  await this.print(currentLine, { color, speed: "fast" });
                  fullContent += currentLine + "\n";
                }
              }

              // Add extra newline if we see two consecutive ones
              if (consecutiveNewlines === 2) {
                await this.print("", { speed: "instant" });
                fullContent += "\n";
                consecutiveNewlines = 0;
              }

              currentLine = "";
            } else {
              currentLine += char;
              consecutiveNewlines = 0;
            }
          }
        }
      }

      // Handle any remaining text
      if (currentLine.trim()) {
        const toolCommandMatch = currentLine.match(/\{.*?\}/g);
        if (toolCommandMatch) {
          for (const match of toolCommandMatch) {
            await this.handleToolCommand(match);
          }
          const remainingText = currentLine.replace(/\{.*?\}/g, "").trim();
          if (remainingText) {
            await this.print(remainingText, { color, speed: "fast" });
            fullContent += remainingText;
          }
        } else {
          await this.print(currentLine, { color, speed: "fast" });
          fullContent += currentLine;
        }
      }

      // Add final spacing if requested
      if (addSpacing) {
        await this.print("", { speed: "instant" });
        fullContent += "\n";
      }

      return returnContent ? fullContent.trim() : undefined;
    } catch (error) {
      console.error("Error processing AI stream:", error);
      throw error;
    }
  }

  private async handleToolCommand(command: string): Promise<boolean> {
    const trimmedCommand = command.trim();
    if (trimmedCommand.startsWith("{") && trimmedCommand.endsWith("}")) {
      try {
        const toolCommand = JSON.parse(trimmedCommand);
        if (toolCommand.tool && toolCommand.parameters) {
          toolEvents.emit(`tool:${toolCommand.tool}`, toolCommand.parameters);
          return true;
        }
      } catch (e) {
        console.error("Error parsing tool command:", e);
      }
    }
    return false;
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
    this.hiddenTextarea.value = content;
    this.hiddenTextarea.select();

    try {
      await navigator.clipboard.writeText(content);
      await this.print("Content copied to clipboard.", {
        color: TERMINAL_COLORS.success,
        speed: "instant",
      });
    } catch (err) {
      try {
        document.execCommand("copy");
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
  }

  private registerToolHandlers() {
    toolEvents.on(
      "tool:glitch_screen",
      async (params: { intensity: number; duration: number }) => {
        const originalBuffer = this.buffer.map((line) => ({
          ...line,
          text: line.text,
        }));
        const glitchDuration = Math.min(params.duration, 5000);

        const glitchInterval = setInterval(() => {
          if (Math.random() < params.intensity) {
            this.buffer = originalBuffer.map((line) => ({
              ...line,
              text: this.corruptText(line.text, params.intensity),
            }));

            while (this.buffer.length > originalBuffer.length) {
              this.buffer.pop();
            }

            while (this.buffer.length < originalBuffer.length) {
              this.buffer.push({ ...originalBuffer[this.buffer.length] });
            }

            this.render();
          }
        }, 50);

        setTimeout(() => {
          clearInterval(glitchInterval);
          this.buffer = originalBuffer;
          this.render();
        }, glitchDuration);
      }
    );

    toolEvents.on(
      "tool:matrix_rain",
      async (params: { duration: number; intensity: number }) => {
        this.matrixRainEnabled = true;
        this.effects.startMatrixRain(params.intensity);

        setTimeout(() => {
          this.matrixRainEnabled = false;
          this.effects.stopMatrixRain();
          this.render();
        }, params.duration);
      }
    );

    toolEvents.on(
      "tool:play_sound",
      async (params: { type: string; volume: number }) => {
        console.log(
          `Would play sound: ${params.type} at volume ${params.volume}`
        );
      }
    );
  }

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

  private getVerticalPadding(): number {
    return this.layout.topPadding || 40;
  }

  public async showFace(
    text: string,
    options: {
      emergeTime?: number;
      intensity?: number;
      emotion?: "neutral" | "concerned" | "intrigued";
    } = {}
  ) {
    const { emergeTime = 3000, intensity = 0.7, emotion = "neutral" } = options;

    await this.faceRenderer.emergeFromStatic(emergeTime);

    await this.faceRenderer.speak(text, {
      intensity,
      speed: 1,
      emotionHint: emotion,
    });
  }

  public setCommandAccess(enabled: boolean) {
    this.hasFullAccess = enabled;
  }

  public hasCommandAccess(): boolean {
    return this.hasFullAccess;
  }

  private checkIfAtBottom(): boolean {
    const lineHeight = this.options.fontSize * 1.5;
    const totalContentHeight = this.currentPrintY + lineHeight;
    const visibleHeight = this.getHeight();
    const maxScroll = Math.max(0, totalContentHeight - visibleHeight);

    return Math.abs(this.scrollOffset - maxScroll) <= lineHeight;
  }

  public async generateOneOffResponse(
    prompt: string,
    options: {
      color?: string;
      addSpacing?: boolean;
    } = {}
  ): Promise<void> {
    const { color = TERMINAL_COLORS.primary, addSpacing = false } = options;

    try {
      const response = await generateOneOffResponse(prompt, this, {
        color,
        addSpacing,
      });
    } catch (error) {
      console.error("Error generating one-off response:", error);
      await this.print("Error processing response", {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
    }
  }

  // Add method to ensure cursor stays in valid range
  private validateCursorPosition() {
    this.cursorPosition = Math.max(
      0,
      Math.min(this.cursorPosition, this.inputBuffer.length)
    );
  }

  // Add screen transition handling
  public async handleScreenTransition(event: { to: string; options?: any }) {
    try {
      console.log("Handling screen transition to:", event.to);
      await this.screenManager.navigate(event.to, event.options);
    } catch (error) {
      console.error("Error during screen transition:", error);
      await this.print("\nError during screen transition", {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
    }
  }
}
