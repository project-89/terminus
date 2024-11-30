import { Terminal } from "../Terminal";
import { TerminalOptions } from "../types/options";

export class Renderer {
  public ctx: CanvasRenderingContext2D;
  private layout = {
    maxWidth: 900,
    sidePadding: 60,
    topPadding: 40,
  };

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

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
    this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
    this.ctx.textBaseline = "top";
  }

  public render(timestamp: number = 0) {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.terminal.effects.applyCRTEffect();

    if (this.terminal.matrixRainEnabled) {
      this.terminal.effects.applyMatrixRain();
    }

    this.terminal.effects.applyGlow();

    this.renderBuffer(timestamp);
    this.renderInput(timestamp);

    this.terminal.effects.resetGlow();
    this.terminal.effects.applyScanlines(timestamp);
  }

  public renderBuffer(timestamp: number) {
    let currentY = this.layout.topPadding - this.terminal.scrollOffset;
    const lineHeight = this.options.fontSize * 1.5;

    this.terminal.buffer.forEach((line) => {
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
    if (this.options.cursor.centered) {
      const terminalWidth = Math.min(
        this.terminal.getWidth(),
        this.layout.maxWidth
      );
      const promptWidth = 2;
      const inputWidth = this.terminal.inputHandler.getInputBuffer().length;
      const totalWidth = promptWidth + inputWidth;
      const padding = Math.max(0, Math.floor((terminalWidth - totalWidth) / 2));
      return this.layout.sidePadding + padding;
    }
    return this.layout.sidePadding + (this.options.cursor.leftPadding || 10);
  }

  public resize(width: number, height: number) {
    this.options.width = width;
    this.options.height = height;
    this.setupCanvas();
  }

  public getMaxCharsPerLine(): number {
    const charWidth = this.ctx.measureText("M").width;
    const availableWidth = Math.min(
      this.terminal.getWidth() - this.layout.sidePadding * 2,
      this.layout.maxWidth
    );
    return Math.floor(availableWidth / charWidth);
  }

  public wrapText(text: string): string[] {
    const maxLayoutWidth = Math.min(
      this.layout.maxWidth || 900,
      this.terminal.getWidth()
    );
    const effectiveWidth = maxLayoutWidth - this.layout.sidePadding * 2;

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
