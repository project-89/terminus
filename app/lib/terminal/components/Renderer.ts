import { Terminal } from "../Terminal";
import { TerminalOptions } from "../types/options";

export class Renderer {
  public ctx: CanvasRenderingContext2D;
  private layout = {
    maxWidth: 900,
    sidePadding: 60,
    topPadding: 40,
  };
  private inlineImageLayout = {
    framePadding: 8,
    bottomSpacingMultiplier: 0.75,
    maxHeightRatio: 0.55,
    placeholderAspectRatio: 16 / 9,
  };

  // Calculate dynamic left margin to center content on wide screens
  private getContentLeftMargin(): number {
    const canvasWidth = this.options.width;
    if (canvasWidth > this.layout.maxWidth) {
      return (canvasWidth - this.layout.maxWidth) / 2 + this.layout.sidePadding;
    }
    return this.layout.sidePadding;
  }

  constructor(
    private terminal: Terminal,
    private canvas: HTMLCanvasElement,
    private options: TerminalOptions
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.setupCanvas();
    this.loadFont();
  }

  private async loadFont() {
    try {
      const font = new FontFace(
        "Berkeley Mono Variable",
        "url(/BerkeleyMonoVariable-Regular.woff)"
      );
      const loadedFont = await font.load();
      document.fonts.add(loadedFont);
      this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
      this.terminal.render();
    } catch (error) {
      console.error("Font loading failed:", error);
    }
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = this.options;

    // Guard against invalid dimensions - minimum 100x100 to prevent shrinking bugs
    const MIN_SIZE = 100;
    if (width < MIN_SIZE || height < MIN_SIZE) {
      console.warn(`[Renderer] Ignoring invalid canvas dimensions: ${width}x${height}`);
      return;
    }

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
    this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}, monospace`;
    this.ctx.textBaseline = "top";
  }

  public render(timestamp: number = 0) {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);

    this.terminal.effects.applyCRTEffect();

    if (this.terminal.matrixRainEnabled) {
      this.terminal.effects.applyMatrixRain();
    }

    this.terminal.effects.applyGlow();

    this.renderBuffer(timestamp);
    this.renderInput(timestamp);

    this.terminal.effects.resetGlow();
    this.terminal.effects.applyScanlines(timestamp);

    // Draw prominent loading indicator if generating
    if (this.terminal.isGenerating) {
      const chars = this.terminal.thinkingChars;
      const frame = chars[this.terminal.thinkingAnimationFrame % chars.length] || "...";
      const phrases = [
        "TUNING CARRIER",
        "ALIGNING VECTORS",
        "LEAKING SIGNAL",
        "LISTENING",
      ];
      const phrase =
        phrases[Math.floor((timestamp / 800) % phrases.length)] || "PROCESSING";
      this.ctx.save();
      this.ctx.font = `14px ${this.options.fontFamily}`;
      this.ctx.fillStyle = this.options.colors?.secondary || "#2fb7c3";
      this.ctx.textAlign = "right";
      // Position relative to content area, not canvas edge
      const contentRightEdge = this.getContentLeftMargin() + this.layout.maxWidth - this.layout.sidePadding;
      const indicatorX = Math.min(contentRightEdge, this.options.width - 20);
      this.ctx.fillText(`${phrase} ${frame}`, indicatorX, 30);
      this.ctx.restore();
    }
  }

  public renderBuffer(timestamp: number) {
    let currentY = this.layout.topPadding - this.terminal.scrollOffset;
    const lineHeight = this.options.fontSize * 1.5;
    const leftMargin = this.getContentLeftMargin();
    const contentWidth = this.getContentWidth();

    this.terminal.buffer.forEach((line) => {
      if (line.kind === "image") {
        const framePadding = this.inlineImageLayout.framePadding;
        const imageWidth = Math.min(contentWidth, line.displayWidth);
        const imageHeight = Math.max(1, line.displayHeight);
        const frameWidth = imageWidth + framePadding * 2;
        const frameHeight = imageHeight + framePadding * 2;
        const frameX = leftMargin + (contentWidth - frameWidth) / 2;
        const frameY = currentY;

        this.ctx.save();
        this.ctx.strokeStyle = "rgba(47, 183, 195, 0.7)";
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = "rgba(9, 8, 18, 0.92)";
        this.ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
        this.ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

        if (line.imageStatus === "ready" && line.image) {
          this.ctx.drawImage(
            line.image,
            frameX + framePadding,
            frameY + framePadding,
            imageWidth,
            imageHeight
          );
        } else {
          this.ctx.fillStyle = "rgba(47, 183, 195, 0.7)";
          this.ctx.font = `${Math.max(12, this.options.fontSize - 1)}px ${this.options.fontFamily}`;
          this.ctx.textAlign = "center";
          this.ctx.fillText(
            line.imageStatus === "error"
              ? "[IMAGE DECODE ERROR]"
              : "[RENDERING INLINE IMAGE...]",
            frameX + frameWidth / 2,
            frameY + frameHeight / 2 - this.options.fontSize / 2
          );
          this.ctx.textAlign = "left";
        }

        this.ctx.restore();

        currentY += this.getInlineImageTotalHeight(imageHeight);
        return;
      }

      const yOffset = Math.sin(timestamp * 0.001) * 0.8;
      const xOffset = Math.cos(timestamp * 0.002) * 0.3;

      if (Math.random() < 0.08) {
        this.ctx.fillStyle = "rgba(255, 0, 255, 0.15)";
        this.ctx.fillText(
          line.text,
          leftMargin + xOffset + 1.5,
          currentY + yOffset
        );
        this.ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
        this.ctx.fillText(
          line.text,
          leftMargin + xOffset - 1.5,
          currentY + yOffset
        );
      }

      this.ctx.fillStyle = line.color || this.options.foregroundColor;
      this.ctx.fillText(
        line.text,
        leftMargin + xOffset,
        currentY + yOffset
      );

      currentY += lineHeight;
    });
  }

  public renderInput(timestamp: number) {
    const lineHeight = this.options.fontSize * 1.5;

    // Adjust cursorY to account for scrollOffset
    const cursorY =
      this.terminal.getCursorY() - this.terminal.scrollOffset + lineHeight / 2;

    if (cursorY > 0 && cursorY < this.terminal.getHeight()) {
      const cursorStartX = this.getCursorStartX();
      const inputText = `> ${this.terminal.inputHandler.getInputBuffer()}`;
      const wrappedLines = this.wrapText(inputText);
      const lineHeight = this.options.fontSize * 1.5;

      // Render each line of wrapped input
      wrappedLines.forEach((line, index) => {
        const lineY = cursorY + index * lineHeight;
        this.ctx.fillStyle = this.options.foregroundColor;
        this.ctx.fillText(line, cursorStartX, lineY);

        // Only show cursor on the last line
        if (index === wrappedLines.length - 1 && this.terminal.cursorVisible) {
          const cursorPosition = this.terminal.inputHandler.getCursorPosition();
          const textBeforeCursor = `> ${this.terminal.inputHandler
            .getInputBuffer()
            .slice(0, cursorPosition)}`;
          const wrappedCursor = this.wrapText(textBeforeCursor);
          const lastLine = wrappedCursor[wrappedCursor.length - 1];
          const cursorX = cursorStartX + this.ctx.measureText(lastLine).width;

          if (this.terminal.isGenerating) {
            this.ctx.fillStyle = this.options.cursorColor;
            this.ctx.fillText(
              this.terminal.thinkingChars[this.terminal.thinkingAnimationFrame],
              cursorX,
              lineY
            );
          } else {
            this.ctx.fillStyle = this.options.cursorColor;
            this.ctx.fillRect(
              cursorX,
              lineY,
              this.options.fontSize / 2,
              this.options.fontSize
            );
          }
        }
      });
    }
  }

  private getCursorStartX(): number {
    const leftMargin = this.getContentLeftMargin();
    if (this.options.cursor.centered) {
      const terminalWidth = Math.min(
        this.terminal.getWidth(),
        this.layout.maxWidth
      );
      const promptWidth = 2;
      const inputWidth = this.terminal.inputHandler.getInputBuffer().length;
      const totalWidth = promptWidth + inputWidth;
      const padding = Math.max(0, Math.floor((terminalWidth - totalWidth) / 2));
      return leftMargin + padding;
    }
    return leftMargin + (this.options.cursor.leftPadding || 10);
  }

  public resize(width: number, height: number) {
    this.options.width = width;
    this.options.height = height;
    this.setupCanvas();
  }

  public getMaxCharsPerLine(): number {
    const charWidth = this.ctx.measureText("M").width;
    const availableWidth = this.getContentWidth();
    return Math.floor(availableWidth / charWidth);
  }

  public getContentWidth(): number {
    const maxLayoutWidth = Math.min(this.layout.maxWidth || 900, this.terminal.getWidth());
    return Math.max(120, maxLayoutWidth - this.layout.sidePadding * 2);
  }

  public getInlineImageMaxWidth(): number {
    return this.getContentWidth();
  }

  public getInlineImagePlaceholderHeight(width = this.getInlineImageMaxWidth()): number {
    return Math.max(120, Math.round(width / this.inlineImageLayout.placeholderAspectRatio));
  }

  public fitInlineImageDimensions(sourceWidth: number, sourceHeight: number): {
    width: number;
    height: number;
  } {
    const safeSourceWidth = Math.max(1, sourceWidth || this.getInlineImageMaxWidth());
    const safeSourceHeight = Math.max(
      1,
      sourceHeight || this.getInlineImagePlaceholderHeight()
    );
    const maxWidth = this.getInlineImageMaxWidth();
    const maxHeight = Math.max(
      180,
      Math.floor(this.terminal.getHeight() * this.inlineImageLayout.maxHeightRatio)
    );
    const scale = Math.min(maxWidth / safeSourceWidth, maxHeight / safeSourceHeight, 1);
    return {
      width: Math.max(120, Math.round(safeSourceWidth * scale)),
      height: Math.max(90, Math.round(safeSourceHeight * scale)),
    };
  }

  public getInlineImageTotalHeight(imageHeight: number): number {
    const framePadding = this.inlineImageLayout.framePadding * 2;
    const spacing = this.options.fontSize * this.inlineImageLayout.bottomSpacingMultiplier;
    return imageHeight + framePadding + spacing;
  }

  public wrapText(text: string): string[] {
    const effectiveWidth = this.getContentWidth();

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > effectiveWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
