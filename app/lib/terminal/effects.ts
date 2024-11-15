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
}
