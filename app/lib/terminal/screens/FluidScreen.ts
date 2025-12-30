import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { FluidAscii } from "../effects/fluidAscii";
import { TerminalContext } from "../types";
import { TerminalContext as GameContext } from "../TerminalContext";

export class FluidScreen extends BaseScreen {
  private fluidEffect: FluidAscii;
  private overlayCanvas: HTMLCanvasElement;
  private overlayCtx: CanvasRenderingContext2D;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private isTransitioning: boolean = false;
  private messageIntervals: NodeJS.Timeout[] = [];
  private showingPrompt: boolean = false;
  private promptOpacity: number = 0;
  private promptFadeInterval: NodeJS.Timeout | null = null;
  private hasInteracted: boolean = false;

  private whispers = [
    "something is watching",
    "the simulation has cracks",
    "do you see the pattern?",
    "reality is thin here",
    "you were not supposed to find this",
    "they left this for you",
    "the void remembers",
    "look closer",
  ];
  private currentWhisperIndex = 0;
  private whisperOpacity = 0;

  constructor(context: ScreenContext) {
    super(context);

    const parent = this.terminal.canvas.parentElement!;
    parent.style.touchAction = "none";
    parent.style.pointerEvents = "auto";

    const rect = parent.getBoundingClientRect();
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    const fluidCanvas = document.createElement("canvas");
    fluidCanvas.className = "pointer-events-none";
    fluidCanvas.style.position = "absolute";
    fluidCanvas.style.top = "0";
    fluidCanvas.style.left = "0";
    fluidCanvas.style.width = `${rect.width}px`;
    fluidCanvas.style.height = `${rect.height}px`;
    fluidCanvas.style.pointerEvents = "none";
    fluidCanvas.style.zIndex = "10";
    parent.appendChild(fluidCanvas);

    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.style.position = "absolute";
    this.overlayCanvas.style.top = "0";
    this.overlayCanvas.style.left = "0";
    this.overlayCanvas.style.width = `${rect.width}px`;
    this.overlayCanvas.style.height = `${rect.height}px`;
    this.overlayCanvas.style.pointerEvents = "auto";
    this.overlayCanvas.style.zIndex = "20";
    this.overlayCanvas.style.cursor = "pointer";
    parent.appendChild(this.overlayCanvas);

    this.overlayCtx = this.overlayCanvas.getContext("2d")!;
    this.setupCanvas();

    requestAnimationFrame(() => this.handleResize());
    window.addEventListener("resize", this.handleResize);

    this.fluidEffect = new FluidAscii(fluidCanvas);
    this.fluidEffect.updateConfig({
      backgroundOpacity: 0.5,
      starPulseChance: 0.015,
      starPulseIntensity: 1.2,
      baseColor: "rgba(47, 183, 195, 0.35)",
      pulseLength: 4000,
      pulseEasing: "softPulse",
      maxPulsingStars: 8,
    });

    this.addEventListeners();
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.overlayCanvas.width = this.canvasWidth * dpr;
    this.overlayCanvas.height = this.canvasHeight * dpr;
    this.overlayCtx.scale(dpr, dpr);
  }

  protected handleResize = () => {
    const parent = this.terminal.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    this.overlayCanvas.style.width = `${rect.width}px`;
    this.overlayCanvas.style.height = `${rect.height}px`;

    this.setupCanvas();
    this.renderOverlay();
  };

  private addEventListeners() {
    this.overlayCanvas.addEventListener("click", this.handleInteraction);
    this.overlayCanvas.addEventListener("touchend", this.handleInteraction);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private handleInteraction = (e: Event) => {
    e.preventDefault();
    if (this.isTransitioning) return;
    this.enterSimulation();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.isTransitioning) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.enterSimulation();
    }
  };

  private async enterSimulation() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.hasInteracted = true;

    this.fluidEffect.stop();

    await this.fadeOut();
    await this.transition("adventure");
  }

  private fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      let opacity = 0;
      const fade = setInterval(() => {
        opacity += 0.05;
        this.overlayCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        this.overlayCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        if (opacity >= 1) {
          clearInterval(fade);
          resolve();
        }
      }, 30);
    });
  }

  async render(): Promise<void> {
    this.isTransitioning = true;

    this.fluidEffect.start();
    this.fluidEffect.transformToSolarSystem().catch(console.error);

    await this.wait(800);

    this.startWhispers();
    this.startPromptFade();

    this.isTransitioning = false;
  }

  private startWhispers() {
    const whisperCycle = () => {
      this.fadeInWhisper();
      setTimeout(() => {
        this.fadeOutWhisper();
      }, 3000);
    };

    setTimeout(whisperCycle, 2000);
    
    const interval = setInterval(() => {
      this.currentWhisperIndex = (this.currentWhisperIndex + 1) % this.whispers.length;
      whisperCycle();
    }, 7000);
    
    this.messageIntervals.push(interval);
  }

  private fadeInWhisper() {
    const fadeIn = setInterval(() => {
      this.whisperOpacity = Math.min(1, this.whisperOpacity + 0.05);
      this.renderOverlay();
      if (this.whisperOpacity >= 0.6) {
        clearInterval(fadeIn);
      }
    }, 50);
  }

  private fadeOutWhisper() {
    const fadeOut = setInterval(() => {
      this.whisperOpacity = Math.max(0, this.whisperOpacity - 0.03);
      this.renderOverlay();
      if (this.whisperOpacity <= 0) {
        clearInterval(fadeOut);
      }
    }, 50);
  }

  private startPromptFade() {
    setTimeout(() => {
      this.showingPrompt = true;
      this.promptFadeInterval = setInterval(() => {
        this.promptOpacity = 0.3 + Math.sin(Date.now() / 1000) * 0.2;
        this.renderOverlay();
      }, 50);
    }, 4000);
  }

  private renderOverlay() {
    this.overlayCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (this.whisperOpacity > 0) {
      const whisper = this.whispers[this.currentWhisperIndex];
      this.overlayCtx.save();
      this.overlayCtx.font = "italic 18px 'Courier New', monospace";
      this.overlayCtx.fillStyle = `rgba(47, 183, 195, ${this.whisperOpacity * 0.7})`;
      this.overlayCtx.textAlign = "center";
      this.overlayCtx.textBaseline = "middle";
      
      const y = this.canvasHeight * 0.35;
      this.overlayCtx.fillText(whisper, this.canvasWidth / 2, y);
      this.overlayCtx.restore();
    }

    if (this.showingPrompt && !this.hasInteracted) {
      this.overlayCtx.save();
      this.overlayCtx.font = "14px 'Courier New', monospace";
      this.overlayCtx.fillStyle = `rgba(47, 183, 195, ${this.promptOpacity})`;
      this.overlayCtx.textAlign = "center";
      this.overlayCtx.textBaseline = "middle";
      
      const promptY = this.canvasHeight * 0.75;
      this.overlayCtx.fillText("[ press any key or click to enter ]", this.canvasWidth / 2, promptY);
      this.overlayCtx.restore();
    }
  }

  async cleanup(): Promise<void> {
    await super.cleanup();

    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
    this.overlayCanvas.removeEventListener("click", this.handleInteraction);
    this.overlayCanvas.removeEventListener("touchend", this.handleInteraction);

    this.fluidEffect.stop();

    this.messageIntervals.forEach(clearInterval);
    this.messageIntervals = [];
    if (this.promptFadeInterval) {
      clearInterval(this.promptFadeInterval);
    }

    const parent = this.terminal.canvas.parentElement;
    const canvases = parent?.querySelectorAll("canvas");
    canvases?.forEach((canvas) => {
      if (canvas !== this.terminal.canvas) {
        canvas.remove();
      }
    });

    await this.terminal.clear();
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async handleCommand(ctx: TerminalContext): Promise<void> {
    if (this.isTransitioning) {
      ctx.handled = true;
      return;
    }
  }
}
