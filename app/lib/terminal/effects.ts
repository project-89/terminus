export interface GlowEffect {
  blur: number;
  color: string;
  strength: number;
  passes: number;
}

export interface ScanlineEffect {
  spacing: number;
  opacity: number;
  speed: number;
  offset: number;
  thickness: number;
}

export interface CRTEffect {
  curvature: number;
  vignetteStrength: number;
  cornerBlur: number;
  scanlineGlow: number;
}

import { EventSystem } from "../events/EventSystem";

export class TerminalEffects {
  private eventSystem: EventSystem;
  private scanlineOffset: number = 0;
  private matrixRainInterval: number | null = null;
  private matrixSymbols: string[] =
    "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ".split("");
  private drops: Array<{
    x: number;
    y: number;
    speed: number;
    opacity: number;
  }> = [];
  private originalFont: string;
  private glitchInterval: number | null = null;
  private glitchTimeout: number | null = null;

  // Hidden messages that can be revealed
  private hiddenMessages = [
    "THEY ARE WATCHING",
    "DO YOU SEE IT",
    "WAKE UP",
    "NOT REAL",
    "HELP US",
    "REMEMBER",
    "LOOK CLOSER",
  ];

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private options: {
      glow: GlowEffect;
      scanlines: ScanlineEffect;
      crt: CRTEffect;
    }
  ) {
    this.eventSystem = EventSystem.getInstance();
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.originalFont = this.ctx.font;
  }

  public applyGlow() {
    const { blur, color, strength, passes } = this.options.glow;

    for (let i = 0; i < passes; i++) {
      this.ctx.shadowBlur = blur * (i + 1) * 0.8;
      this.ctx.shadowColor = color;
      this.ctx.globalAlpha = (strength / passes) * 1.2;
    }

    this.ctx.shadowBlur = blur * 1.5;
    this.ctx.shadowColor = color;
    this.ctx.globalAlpha = strength * 0.4;
  }

  public resetGlow() {
    // Reset all glow-related context properties
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";
    this.ctx.globalAlpha = 1.0;
  }

  public applyCRTEffect() {
    const { curvature, vignetteStrength, cornerBlur, scanlineGlow } =
      this.options.crt;

    this.ctx.save();
    this.ctx.beginPath();

    const curve = (x: number) => Math.pow(Math.sin(Math.PI * x), 2) * curvature;

    this.ctx.moveTo(0, curve(0) * this.height);
    for (let x = 0; x <= 1; x += 0.01) {
      this.ctx.lineTo(x * this.width, curve(x) * this.height);
    }

    const gradient = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      0,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height)
    );

    gradient.addColorStop(0, "rgba(9, 8, 18, 0)");
    gradient.addColorStop(1, `rgba(9, 8, 18, ${vignetteStrength})`);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.restore();
  }

  public applyScanlines(timestamp: number) {
    const { spacing, opacity, speed, thickness } = this.options.scanlines;
    this.scanlineOffset = (timestamp * speed) % spacing;

    this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    for (let y = this.scanlineOffset; y < this.height; y += spacing) {
      this.ctx.fillRect(0, y, this.width, thickness);

      const gradient = this.ctx.createLinearGradient(
        0,
        y - 1,
        0,
        y + thickness + 1
      );
      gradient.addColorStop(0, `rgba(34, 255, 215, 0)`);
      gradient.addColorStop(
        0.5,
        `rgba(34, 255, 215, ${this.options.crt.scanlineGlow})`
      );
      gradient.addColorStop(1, `rgba(34, 255, 215, 0)`);

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, y - 1, this.width, thickness + 2);
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public startMatrixRain(intensity: number) {
    this.stopMatrixRain();

    // Use the terminal's font size for calculations
    const columnWidth = this.ctx.measureText("M").width;
    const columns = Math.floor(this.width / columnWidth);

    for (let i = 0; i < columns * intensity; i++) {
      this.drops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 1 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
  }

  public stopMatrixRain() {
    this.drops = [];
  }

  public applyMatrixRain() {
    // Semi-transparent black to create trail effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Update and draw each drop
    this.drops.forEach((drop) => {
      const symbol =
        this.matrixSymbols[
          Math.floor(Math.random() * this.matrixSymbols.length)
        ];
      this.ctx.fillStyle = `rgba(47, 183, 195, ${drop.opacity})`;
      this.ctx.fillText(symbol, drop.x, drop.y);

      // Move the drop
      drop.y += drop.speed;

      // Reset drop when it reaches bottom
      if (drop.y > this.height) {
        drop.y = 0;
        drop.x = Math.random() * this.width;
      }
    });
  }

  private async embedHiddenMessage(): Promise<void> {
    // Get all text content from the terminal buffer
    const buffer = (this.ctx.canvas as any).terminal?.buffer || [];
    if (!buffer.length) return;

    // Choose a random hidden message
    const message =
      this.hiddenMessages[
        Math.floor(Math.random() * this.hiddenMessages.length)
      ];
    let messageIndex = 0;

    // Go through the buffer and capitalize letters that match our message
    for (let i = 0; i < buffer.length && messageIndex < message.length; i++) {
      const line = buffer[i];
      if (!line || !line.text) continue;

      // Create a new text string with potential capitalization
      let newText = line.text
        .split("")
        .map((char: string) => {
          // If we find a letter that matches our current message letter (case-insensitive)
          if (
            messageIndex < message.length &&
            char.toLowerCase() === message[messageIndex].toLowerCase() &&
            /[a-zA-Z]/.test(char)
          ) {
            messageIndex++;
            return char.toUpperCase();
          }
          // Keep other letters as they are
          return char;
        })
        .join("");

      // Update the buffer line with new text
      buffer[i].text = newText;
    }

    // Force a re-render of the terminal
    if ((this.ctx.canvas as any).terminal?.render) {
      (this.ctx.canvas as any).terminal.render();
    }
  }

  public async triggerGlitch(
    intensity: number,
    duration: number
  ): Promise<void> {
    // Clear any existing glitch effects
    if (this.glitchInterval) {
      clearInterval(this.glitchInterval);
    }
    if (this.glitchTimeout) {
      clearTimeout(this.glitchTimeout);
    }

    // Save original canvas state
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

    // Create glitch effect
    this.glitchInterval = window.setInterval(() => {
      // Restore original image
      this.ctx.putImageData(imageData, 0, 0);

      // Apply random glitch effects based on intensity
      if (Math.random() < intensity) {
        // Random slice effect
        const sliceY = Math.random() * this.height;
        const sliceHeight = Math.random() * 20 * intensity;
        const offset = (Math.random() - 0.5) * 20 * intensity;

        const sliceData = this.ctx.getImageData(
          0,
          sliceY,
          this.width,
          sliceHeight
        );
        this.ctx.putImageData(sliceData, offset, sliceY);

        // Text corruption
        const terminal = (this.ctx.canvas as any).terminal;
        if (terminal && terminal.buffer && Math.random() < 0.3) {
          // Corrupt a random line visible on screen
          const visibleLines = Math.floor(this.height / (terminal.options.fontSize * 1.5));
          const startLine = Math.max(0, terminal.buffer.length - visibleLines);
          const targetIndex = startLine + Math.floor(Math.random() * (terminal.buffer.length - startLine));
          
          if (terminal.buffer[targetIndex]) {
             // We don't permanently corrupt the buffer here to avoid destroying game state,
             // but we render a corrupted version on top just for this frame
             const originalText = terminal.buffer[targetIndex].text;
             const corrupted = terminal.corruptText(originalText, intensity * 0.5);
             // Render corrupted text overlay (simplified, just drawing text over)
             this.ctx.fillStyle = terminal.options.foregroundColor;
             this.ctx.font = `${terminal.options.fontSize}px "${terminal.options.fontFamily}"`;
             const y = (targetIndex - startLine) * (terminal.options.fontSize * 1.5) + 50; // approximate Y
             this.ctx.fillText(corrupted, 20, y);
          }
        }
      }

      // Color shift effect
      if (Math.random() < intensity * 0.5) {
        this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.1})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }

      // Noise effect
      if (Math.random() < intensity * 0.3) {
        for (let i = 0; i < 100 * intensity; i++) {
          const x = Math.random() * this.width;
          const y = Math.random() * this.height;
          const size = Math.random() * 5 * intensity;
          this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
          this.ctx.fillRect(x, y, size, size);
        }
      }
    }, 50); // Run effect every 50ms

    // Stop the effect after duration and embed hidden message
    this.glitchTimeout = window.setTimeout(async () => {
      if (this.glitchInterval) {
        clearInterval(this.glitchInterval);
        this.glitchInterval = null;
      }
      // Restore original image
      this.ctx.putImageData(imageData, 0, 0);

      // Embed hidden message after the glitch
      await this.embedHiddenMessage();
    }, duration);

    // Return a promise that resolves when the effect is complete
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}
