import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS, TerminalContext } from "../Terminal";
import { StaticEffect } from "../effects/static";
import { FaceRenderer } from "../effects/face";

export class StaticScreen extends BaseScreen {
  private staticEffect: StaticEffect;
  private faceRenderer: FaceRenderer;
  private isTransitioning: boolean = false;

  constructor(context: ScreenContext) {
    super(context);

    // Create overlay canvas for static
    const staticCanvas = document.createElement("canvas");
    staticCanvas.className = "absolute inset-0 pointer-events-none";
    staticCanvas.style.position = "absolute";
    staticCanvas.style.top = "0";
    staticCanvas.style.left = "0";
    staticCanvas.style.width = "100%";
    staticCanvas.style.height = "100%";
    staticCanvas.style.zIndex = "10";
    this.terminal.canvas.parentElement?.appendChild(staticCanvas);

    // Create overlay canvas for face with proper positioning
    const faceCanvas = document.createElement("canvas");
    faceCanvas.className = "absolute inset-0 pointer-events-none";
    faceCanvas.style.position = "absolute";
    faceCanvas.style.top = "0";
    faceCanvas.style.left = "0";
    faceCanvas.style.width = "100%";
    faceCanvas.style.height = "100%";
    faceCanvas.style.zIndex = "20";
    this.terminal.canvas.parentElement?.appendChild(faceCanvas);

    console.log("Initializing effects...");
    this.staticEffect = new StaticEffect(staticCanvas);
    this.faceRenderer = new FaceRenderer(faceCanvas);
    console.log("Effects initialized");
  }

  async beforeRender(): Promise<void> {
    // Clear terminal and set initial state
    await this.terminal.clear();
    this.staticEffect.setIntensity(0);
  }

  async render(): Promise<void> {
    this.isTransitioning = true;
    console.log("Starting static screen render");

    try {
      // Start with heavy static
      this.staticEffect.setIntensity(1.0);
      this.staticEffect.start();
      console.log("Static effect started");

      await this.wait(2000);

      // Fade in text
      await this.terminal.print("\n\n    SIGNAL DETECTED", {
        color: TERMINAL_COLORS.warning,
        speed: "slow",
      });

      await this.wait(1000);

      // Start reducing static as face begins to emerge
      const staticTransition = this.staticEffect.transitionIntensity(0.6, 3000);
      const faceEmergence = this.faceRenderer.emergeFromStatic(3000);

      // Wait for both transitions to complete
      await Promise.all([staticTransition, faceEmergence]);

      // Further reduce static to show more of the face
      await this.staticEffect.transitionIntensity(0.4, 1000);

      // Face speaks
      await this.faceRenderer.speak("I have been waiting for you...", {
        intensity: 0.7,
        speed: 1,
        emotionHint: "neutral",
      });

      // Keep static at a level where face is visible but static is still present
      await this.staticEffect.transitionIntensity(0.3, 1000);

      this.isTransitioning = false;
    } catch (error) {
      console.error("Error in static screen render:", error);
      this.isTransitioning = false;
    }
  }

  async cleanup(): Promise<void> {
    console.log("Cleaning up static screen");
    this.staticEffect.stop();
    this.faceRenderer.cleanup();

    // Remove the canvas elements
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

  // Handle user input during the sequence
  async handleCommand(ctx: TerminalContext): Promise<void> {
    if (this.isTransitioning) {
      ctx.handled = true;
      return;
    }

    // Use the command from context
    const command = ctx.command;
    // Process commands through the face
    await this.faceRenderer.speak(command, {
      intensity: 0.7,
      speed: 1,
      emotionHint: this.getEmotionForResponse(command),
    });
  }

  private getEmotionForResponse(
    command: string
  ): "neutral" | "concerned" | "intrigued" {
    // Simple emotion selection based on command content
    if (command.includes("help") || command.includes("what")) {
      return "concerned";
    }
    if (command.includes("why") || command.includes("how")) {
      return "intrigued";
    }
    return "neutral";
  }
}
