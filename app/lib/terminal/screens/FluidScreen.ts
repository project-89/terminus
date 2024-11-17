import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { FluidAscii } from "../effects/fluidAscii";

export class FluidScreen extends BaseScreen {
  private fluidEffect: FluidAscii;
  private logoCanvas: HTMLCanvasElement;
  private logoCtx: CanvasRenderingContext2D;
  private isTransitioning: boolean = false;
  private logo = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗     █████╗  █████╗ 
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║       ╚█████╔╝╚██████║
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║       ██╔══██╗ ╚═══██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║       ╚█████╔╝ █████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝        ╚════╝  ╚════╝`;

  constructor(context: ScreenContext) {
    super(context);

    // Create canvas for fluid effect
    const fluidCanvas = document.createElement("canvas");
    fluidCanvas.className = "absolute inset-0 pointer-events-none";
    fluidCanvas.style.position = "absolute";
    fluidCanvas.style.top = "0";
    fluidCanvas.style.left = "0";
    fluidCanvas.style.width = "100%";
    fluidCanvas.style.height = "100%";
    fluidCanvas.style.zIndex = "10";
    this.terminal.canvas.parentElement?.appendChild(fluidCanvas);

    // Create canvas for logo
    this.logoCanvas = document.createElement("canvas");
    this.logoCanvas.className = "absolute inset-0 pointer-events-none";
    this.logoCanvas.style.position = "absolute";
    this.logoCanvas.style.top = "0";
    this.logoCanvas.style.left = "0";
    this.logoCanvas.style.width = "100%";
    this.logoCanvas.style.height = "100%";
    this.logoCanvas.style.zIndex = "20"; // Above fluid effect
    this.terminal.canvas.parentElement?.appendChild(this.logoCanvas);

    this.logoCtx = this.logoCanvas.getContext("2d")!;
    this.setupLogoCanvas();

    this.fluidEffect = new FluidAscii(fluidCanvas);
  }

  private setupLogoCanvas() {
    const parent = this.logoCanvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    this.logoCanvas.width = rect.width;
    this.logoCanvas.height = rect.height;

    this.logoCtx.font = "16px monospace";
    this.logoCtx.textBaseline = "top";
    this.logoCtx.fillStyle = TERMINAL_COLORS.primary;
  }

  private renderLogo() {
    const logoLines = this.logo.trim().split("\n");
    const lineHeight = 20;

    // Calculate centering
    const totalHeight = logoLines.length * lineHeight;
    const startY =
      (this.logoCanvas.height - totalHeight) / 2 -
      this.logoCanvas.height * 0.15;

    // Render each line
    logoLines.forEach((line, index) => {
      const lineWidth = this.logoCtx.measureText(line).width;
      const x = (this.logoCanvas.width - lineWidth) / 2;
      const y = startY + index * lineHeight;
      this.logoCtx.fillText(line, x, y);
    });
  }

  async render(): Promise<void> {
    this.isTransitioning = true;

    // Start the fluid effect
    this.fluidEffect.start();

    // Clear terminal (though we won't be using it for the logo)
    await this.terminal.clear();

    // Render the logo on its canvas
    this.renderLogo();

    // Wait a moment to show the logo
    await this.wait(2000);

    // Fade out logo
    // const fadeOut = async () => {
    //   let opacity = 1;
    //   return new Promise<void>((resolve) => {
    //     const fade = () => {
    //       opacity -= 0.02;
    //       if (opacity > 0) {
    //         this.logoCanvas.style.opacity = opacity.toString();
    //         requestAnimationFrame(fade);
    //       } else {
    //         this.logoCanvas.style.opacity = "0";
    //         resolve();
    //       }
    //     };
    //     requestAnimationFrame(fade);
    //   });
    // };

    // Start the transformation and fade out simultaneously
    await Promise.all([this.fluidEffect.transformToSolarSystem()]);

    this.isTransitioning = false;
  }

  async cleanup(): Promise<void> {
    this.fluidEffect.stop();

    // Remove both canvases
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

  async handleCommand(command: string): Promise<boolean> {
    if (this.isTransitioning) {
      return true;
    }

    // Create fluid effect at cursor position
    const rect = this.terminal.canvas.getBoundingClientRect();
    const cursorY = this.terminal.getCursorY();
    this.fluidEffect.addForce(rect.width / 2, cursorY, 1);

    // Process command normally
    return false;
  }
}
