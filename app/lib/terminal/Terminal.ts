import { EventEmitter } from "./eventSystem";
import { TerminalEffects } from "./effects";
import { ScreenManager } from "./ScreenManager";
import { generateOneOffResponse } from "../ai/prompts";
import { toolEvents } from "./tools/registry";
import { InputHandler } from "./components/InputHandler";
import { Renderer } from "./components/Renderer";
import { CommandHandler } from "./components/CommandHandler";
import { ToolHandler } from "./components/ToolHandler";
import { TerminalOptions, PrintOptions } from "./types/options";
import { DEFAULT_OPTIONS, TERMINAL_COLORS } from "./constants";

export { TERMINAL_COLORS };
export class Terminal extends EventEmitter {
  private static instance: Terminal | null = null;

  public canvas!: HTMLCanvasElement;
  public effects!: TerminalEffects;
  public options!: TerminalOptions;
  public colors!: typeof TERMINAL_COLORS;
  public screenManager!: ScreenManager;
  public context: Record<string, any> = {};
  public cursorVisible: boolean = true;
  public isGenerating: boolean = false;
  public matrixRainEnabled: boolean = false;
  public scrollOffset: number = 0;
  public thinkingChars = [".", "..", "...", "....", "...", ".."];
  public thinkingAnimationFrame: number = 0;
  public bottomPadding: number = 0;

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

  public inputHandler!: InputHandler;
  public renderer!: Renderer;
  public commandHandler!: CommandHandler;
  public toolHandler!: ToolHandler;

  private _scrollPosition: number = 0;
  private _contentHeight: number = 0;

  private commandAccess: boolean = false;
  private destroyed: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    options: Partial<TerminalOptions> = {}
  ) {
    super();

    // If instance exists and wasn't destroyed, reuse it with updated canvas
    if (Terminal.instance && !Terminal.instance.destroyed) {
      Terminal.instance.canvas = canvas;
      Terminal.instance.options = {
        ...DEFAULT_OPTIONS,
        ...options,
      };
      // Reinitialize renderer with new canvas
      Terminal.instance.renderer = new Renderer(Terminal.instance, canvas, Terminal.instance.options);
      return Terminal.instance;
    }

    this.canvas = canvas;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.colors = this.options.colors || TERMINAL_COLORS;

    Terminal.instance = this;

    this.initialize();
  }

  private initialize() {
    this.renderer = new Renderer(this, this.canvas, this.options);
    this.effects = new TerminalEffects(
      this.renderer.ctx,
      this.options.width,
      this.options.height,
      this.options.effects
    );
    this.inputHandler = new InputHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.toolHandler = new ToolHandler(this);
    this.screenManager = new ScreenManager(this);

    // Wire screen transition events via router (so URL is updated)
    this.on(
      "screen:transition",
      async ({ to, options }: { to: string; options?: any }) => {
        try {
          const router = this.context?.router;
          if (router && typeof router.navigate === "function") {
            await router.navigate(to, options);
          } else {
            await this.screenManager.navigate(to, options);
          }
        } catch (e) {
          console.error("Screen transition failed", e);
        }
      }
    );

    this.startRenderLoop();
    this.startCursorBlink();
  }

  private startCursorBlink() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }

    this.blinkInterval = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.render();
    }, this.options.blinkRate);
  }

  private startRenderLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const animate = (timestamp: number) => {
      this.render(timestamp);
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  public render(timestamp: number = 0) {
    if (!this.canvas) return;

    // Clear the canvas (use options width/height, not canvas dimensions)
    this.renderer.ctx.fillStyle = this.options.backgroundColor;
    this.renderer.ctx.fillRect(0, 0, this.options.width, this.options.height);

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

    // Only auto-scroll if we're at the bottom
    if (this.isAtBottom) {
      this.scrollToLatest();
    }

    this.render();
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

    for (const line of lines) {
      this.buffer.push({
        text: line,
        color,
        effect: options.effect,
      });

      this.currentPrintY += lineHeight;

      // Only auto-scroll if we're currently at the bottom
      if (this.checkIfAtBottom()) {
        const totalContentHeight = this.currentPrintY + lineHeight;
        const visibleHeight = this.getHeight();
        const maxScroll = Math.max(0, totalContentHeight - visibleHeight);
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
    if (!this.commandAccess) return;
    await this.commandHandler.processCommand(command);
  }

  public destroy() {
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.thinkingInterval) clearInterval(this.thinkingInterval);
    if (this.loadingMessageInterval) clearInterval(this.loadingMessageInterval);
    this.inputHandler.destroy();
    this.toolHandler.destroy();

    // Mark as destroyed and clear singleton so next construction creates fresh instance
    this.destroyed = true;
    if (Terminal.instance === this) {
      Terminal.instance = null as any;
    }
  }

  public resize(width: number, height: number) {
    // Guard against invalid dimensions - minimum 100x100 to prevent shrinking bugs
    const MIN_SIZE = 100;
    if (width < MIN_SIZE || height < MIN_SIZE) {
      console.warn(`[Terminal] Ignoring invalid resize: ${width}x${height}`);
      return;
    }

    this.options.width = width;
    this.options.height = height;
    this.effects.resize(width, height);
    this.renderer.resize(width, height);
    // Force immediate render after resize
    this.render();

    // Ensure render loop continues
    if (!this.animationFrame) {
      this.startRenderLoop();
    }
  }

  public getWidth(): number {
    return this.options.width;
  }

  public getHeight(): number {
    return Math.max(0, this.options.height - this.bottomPadding);
  }

  public setBottomPadding(padding: number) {
    this.bottomPadding = Math.max(0, padding);
    this.isAtBottom = this.checkIfAtBottom();
    this.render();
  }

  public getCursorY(): number {
    const lineHeight = this.options.fontSize * 1.5;
    const inputText = `> ${this.inputHandler.getInputBuffer()}`;
    const wrappedLines = this.renderer.wrapText(inputText);
    const inputHeight = wrappedLines.length * lineHeight;

    // Return current Y position without modifying scroll
    return this.currentPrintY;
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
    const totalBufferHeight = this.currentPrintY;
    const inputText = `> ${this.inputHandler.getInputBuffer()}`;
    const wrappedInputLines = this.renderer.wrapText(inputText);
    const inputHeight = wrappedInputLines.length * lineHeight;
    const totalContentHeight = totalBufferHeight + inputHeight;

    const visibleHeight = this.getHeight();
    const maxScroll = Math.max(
      0,
      totalContentHeight - visibleHeight + lineHeight
    );

    // More precise bottom check
    return this.scrollOffset >= maxScroll - lineHeight / 2;
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
    }, 240);

    // Only scroll if we're already at bottom
    if (this.isAtBottom) {
      this.scrollToLatest();
    }
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

    // Only scroll if we're already at bottom
    if (this.isAtBottom) {
      this.scrollToLatest();
    }
  }

  public scrollToLatest(options: { extraPadding?: number } = {}) {
    const extraPadding = options.extraPadding ?? 0;
    const lineHeight = this.options.fontSize * 1.5;
    const totalBufferHeight = this.currentPrintY;
    const inputText = `> ${this.inputHandler.getInputBuffer()}`;
    const wrappedInputLines = this.renderer.wrapText(inputText);
    const inputHeight = wrappedInputLines.length * lineHeight;
    const totalContentHeight = totalBufferHeight + inputHeight;

    const visibleHeight = this.getHeight();
    const maxScroll = Math.max(
      0,
      totalContentHeight - visibleHeight + lineHeight
    );

    // Update scroll position to bottom
    const nextOffset = Math.max(0, maxScroll - extraPadding);
    this.scrollOffset = nextOffset;
    this.isAtBottom = nextOffset >= maxScroll - lineHeight / 2;

    // Force immediate render
    this.render();
  }

  public corruptText(text: string, intensity: number): string {
    const glitchChars =
      "!@#$%^&*()_+-=[]{}|;:,.<>?`~¡™£¢∞§¶•ªº–≠œ∑´®†¥¨≈æ…÷≥≤µ∂ƒ©∆";
    return text
      .split("")
      .map((char) => {
        if (char === "\n" || char === "\r") return char; // Preserve newlines
        if (char.trim() === "") return char; // Preserve spaces and tabs
        return Math.random() < intensity
          ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
          : char;
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
      // Start loading animation
      this.startGeneration();

      const reader = stream.getReader();
      let buffer = "";
      let fullContent = "";
      let inCodeBlock = false;
      let codeBlockContent = "";
      let paragraphBuffer = "";
      let isFirstLine = true;
      let justExecutedTool = false;

      const flushParagraph = async () => {
        const text = paragraphBuffer.trim();
        if (text) {
          await this.print(text, { speed: "normal" });
        }
        paragraphBuffer = "";
      };

      const processLine = async (line: string) => {
        // Skip empty lines at the start
        if (isFirstLine && !line.trim()) {
          isFirstLine = false;
          return;
        }
        isFirstLine = false;

        // Skip empty lines after tool execution
        if (justExecutedTool && !line.trim()) {
          return;
        }

          // Handle inline JSON
          if (line.startsWith("{") && line.endsWith("}")) {
            try {
              const json = JSON.parse(line);
              if (json.tool && json.parameters) {
                try {
                  await toolEvents.emit(`tool:${json.tool}`, json.parameters);
                  justExecutedTool = true;
                  return;
                } catch (toolErr) {
                  console.warn("Tool execution failed, continuing stream", toolErr);
                  // fall through to treat as text so we don't break the stream
                }
              }
            } catch {
              // If it's not valid JSON, treat it as regular text
            }
          }

        // Reset tool execution flag when we get a non-empty line
        if (line.trim()) {
          justExecutedTool = false;
        }

        // Sentence-aware buffering
        if (!line) {
          // Blank line → flush paragraph and add spacer
          await flushParagraph();
          await this.print("", { speed: "instant" });
          fullContent += "\n";
          return;
        }

        // Accumulate into paragraph buffer
        const needsSpace = paragraphBuffer.length > 0 ? " " : "";
        paragraphBuffer += needsSpace + line;
        fullContent += line + "\n";

        // Heuristic: flush when line likely ends a sentence or buffer gets long
        const trimmed = line.trim();
        const endsSentence = /[\.!?][\)\]"']?$/.test(trimmed);
        const tooLong = paragraphBuffer.length > 420;
        if (endsSentence || tooLong) {
          await flushParagraph();
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);

        // Fix: Add space when concatenating chunks if needed to prevent word collision
        // Only add space if: buffer doesn't end with whitespace/newline AND chunk doesn't start with whitespace/newline/punctuation
        if (buffer.length > 0 && chunk.length > 0) {
          const lastChar = buffer[buffer.length - 1];
          const firstChar = chunk[0];
          const needsSpace = !/[\s\n]/.test(lastChar) &&
                            !/[\s\n.,!?;:)\]}"']/.test(firstChar);
          if (needsSpace) {
            buffer += " ";
          }
        }
        buffer += chunk;

        // Process complete lines
        while (buffer.includes("\n")) {
          const newlineIndex = buffer.indexOf("\n");
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          // Handle code blocks
          if (line === "```json" || line === "```tool") {
            inCodeBlock = true;
            continue;
          }
          if (line === "```" && inCodeBlock) {
            inCodeBlock = false;
            try {
              const json = JSON.parse(codeBlockContent);
              if (json.tool && json.parameters) {
                await toolEvents.emit(`tool:${json.tool}`, json.parameters);
              }
            } catch (e) {
              console.warn("Failed to parse code block JSON:", e);
            }
            codeBlockContent = "";
            continue;
          }
          if (inCodeBlock) {
            codeBlockContent += line + "\n";
            continue;
          }

          // Process regular line
          await processLine(line);
        }
      }

      // Process any remaining buffer
      const remainingLine = buffer.trim();
      if (remainingLine && !inCodeBlock) {
        await processLine(remainingLine);
      }

      // Final flush
      await flushParagraph();

      // Clean up content
      const cleanContent = fullContent
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\n+({[^}]+})\n+/g, "$1\n")
        .replace(/\n+$/, "\n")
        .trim();

      // End generation without forcing scroll
      this.endGeneration();

      return cleanContent;
    } catch (error) {
      this.endGeneration();
      console.error("Error processing AI stream:", error);
      throw error;
    }
  }

  public setCommandAccess(value: boolean): void {
    this.commandAccess = value;
  }

  public getCommandAccess(): boolean {
    return this.commandAccess;
  }

  public handleInput(char: string, event?: KeyboardEvent) {
    if (!this.commandAccess) return;

    // Handle special keys
    if (
      char === "ArrowUp" ||
      char === "ArrowDown" ||
      char === "ArrowLeft" ||
      char === "ArrowRight"
    ) {
      // Handle arrow keys
      if (char === "ArrowLeft" || char === "ArrowRight") {
        this.inputHandler.handleInput(char, event);
        return;
      }

      // Handle command history
      const history = this.inputHandler.getHistory();
      const currentIndex = this.inputHandler.getHistoryIndex();

      if (char === "ArrowUp" && currentIndex < history.length - 1) {
        this.inputHandler.setHistoryIndex(currentIndex + 1);
        this.inputHandler.setBuffer(history[currentIndex + 1]);
      } else if (char === "ArrowDown" && currentIndex > -1) {
        this.inputHandler.setHistoryIndex(currentIndex - 1);
        this.inputHandler.setBuffer(
          currentIndex - 1 >= 0 ? history[currentIndex - 1] : ""
        );
      }

      this.render();
      return;
    }

    // Handle backspace
    if (char === "Backspace") {
      const buffer = this.inputHandler.getInputBuffer();
      if (buffer.length > 0) {
        this.inputHandler.setBuffer(buffer.slice(0, -1));
        this.render();
      }
      return;
    }

    // Handle regular input
    if (char.length === 1) {
      const buffer = this.inputHandler.getInputBuffer();
      this.inputHandler.setBuffer(buffer + char);
      this.render();
      return;
    }

    return this.inputHandler.handleInput(char, event);
  }

  public scroll(direction: number) {
    const lineHeight = this.options.fontSize * 1.5;
    const scrollAmount = direction * lineHeight;

    // Calculate total content height including input
    const totalBufferHeight = this.currentPrintY;
    const inputText = `> ${this.inputHandler.getInputBuffer()}`;
    const wrappedInputLines = this.renderer.wrapText(inputText);
    const inputHeight = wrappedInputLines.length * lineHeight;
    const totalContentHeight = totalBufferHeight + inputHeight;

    const visibleHeight = this.getHeight();
    const maxScroll = Math.max(
      0,
      totalContentHeight - visibleHeight + lineHeight
    );

    // Update scroll position
    const rawNext = this.scrollOffset + scrollAmount;
    this.scrollOffset = Math.max(0, Math.min(maxScroll, rawNext));

    // Snap to pixel grid to prevent blurriness
    this.scrollOffset = Math.round(this.scrollOffset);

    // Update bottom state with a small epsilon tolerance for float math
    this.isAtBottom = this.scrollOffset >= maxScroll - lineHeight / 2 - 1;

    this.render();
  }

  private getScrollPosition(): number {
    // Return current scroll position
    return this._scrollPosition || 0;
  }

  private setScrollPosition(position: number) {
    // Set new scroll position with bounds checking
    const maxScroll = this.getMaxScroll();
    this._scrollPosition = Math.max(0, Math.min(position, maxScroll));
  }

  private getMaxScroll(): number {
    // Calculate maximum possible scroll based on content height
    return Math.max(0, this.getContentHeight() - this.canvas.height);
  }

  private getContentHeight(): number {
    // Calculate total height of terminal content
    // Implementation depends on how you store/track content
    return this._contentHeight || this.canvas.height;
  }

  public setCursorOptions(options: Partial<typeof this.options.cursor>) {
    this.options.cursor = {
      ...this.options.cursor,
      ...options,
    };
    this.render();
  }

  public static getInstance(): Terminal | null {
    return Terminal.instance;
  }

  public focus(): void {
    this.inputHandler.focus();
  }

  public async prompt(prefix: string = "> "): Promise<string> {
    return new Promise((resolve) => {
      this.setCommandAccess(true);
      this.inputHandler.setBuffer("");
      
      const originalHandler = this.commandHandler.processCommand.bind(this.commandHandler);
      
      const promptHandler = async (command: string) => {
        this.commandHandler.processCommand = originalHandler;
        this.setCommandAccess(false);
        resolve(command);
      };
      
      this.commandHandler.processCommand = promptHandler as any;
      
      this.render();
    });
  }
}
