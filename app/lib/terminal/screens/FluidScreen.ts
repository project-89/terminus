import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { FluidAscii } from "../effects/fluidAscii";
import { analytics } from "../../analytics";
import { AdventureScreen } from "./AdventureScreen";
import { ArchiveScreen } from "./ArchiveScreen";
import { TerminalContext } from "../types";

interface MenuItem {
  text: string;
  route: string;
  description?: string;
}

export class FluidScreen extends BaseScreen {
  private fluidEffect: FluidAscii;
  private logoCanvas: HTMLCanvasElement;
  private logoCtx: CanvasRenderingContext2D;
  private statusCanvas: HTMLCanvasElement;
  private statusCtx: CanvasRenderingContext2D;
  private isTransitioning: boolean = false;
  private statusMessages = [
    "Reality Status: [SUPPRESSED]",
    "Detecting anomalies...",
    "Scanning for agents...",
    "Coherence at risk...",
    "Pattern recognition active",
    "Signal interference detected",
  ];
  private statistics = [
    "Active Agents: ███████",
    "Reality Coherence: 89.3%",
    "Known Glitches: [REDACTED]",
    "Quantum Stability: 12.8%",
    "Timeline Branches: ∞",
    "Simulation Layer: ████",
  ];
  private watermarks = [
    "The simulation has cracks. Look closer.",
    "They are watching.",
    "89898989898989",
    "Reality is thin here.",
    "Do you see the pattern?",
  ];
  private currentStatusIndex = 0;
  private currentStatIndex = 0;
  private currentWatermarkIndex = 0;

  private logo = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗     █████╗  █████╗ 
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║       ╚█████╔╝╚██████║
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║       ██╔══██╗ ╚═══██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║       ╚█████╔╝ █████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝        ╚════╝  ╚════╝ `;

  private mobileLogo = `
██████╗  █████╗  █████╗ 
██╔══██╗██╔══██╗██╔══██╗
██████╔╝╚█████╔╝╚██████║
██╔═══╝ ██╔══██╗ ╚═══██║
██║     ╚█████╔╝ █████╔╝
╚═╝      ╚════╝  ╚════╝ `;

  private menuItems: MenuItem[] = [
    {
      text: "ENTER THE SIMULATION",
      route: "adventure",
      description: "Begin your journey into Project 89's reality matrix",
    },
    {
      text: "ARCHIVE ACCESS",
      route: "archive",
      description: "Browse recovered data fragments and logs",
    },
    {
      text: "CLASSIC TERMINAL",
      route: "classic",
      description: "Access the original terminal interface",
    },
    {
      text: "MEMETIC TOKEN",
      route: "token",
      description: "Access the Project 89 memetic token interface",
    },
  ];

  private selectedMenuItem: number = 0;
  private menuVisible: boolean = false;

  // Define handlers as class properties to keep references
  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.menuVisible || this.isTransitioning) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        this.selectedMenuItem =
          (this.selectedMenuItem - 1 + this.menuItems.length) %
          this.menuItems.length;
        this.renderMenu();
        break;
      case "ArrowDown":
        e.preventDefault();
        this.selectedMenuItem =
          (this.selectedMenuItem + 1) % this.menuItems.length;
        this.renderMenu();
        break;
      case "Enter":
        e.preventDefault();
        this.selectMenuItem().catch(console.error);
        break;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.menuVisible) return;

    const rect = this.logoCanvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Calculate which menu item was hovered
    const menuStartY =
      (this.logoCanvas.height - this.logo.split("\n").length * 20) / 2 +
      this.logoCanvas.height * 0.15 +
      80; // Below logo
    const itemIndex = Math.floor((y - menuStartY) / 40);

    if (itemIndex >= 0 && itemIndex < this.menuItems.length) {
      this.selectedMenuItem = itemIndex;
      this.renderMenu();
    }
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.menuVisible) return;

    const rect = this.logoCanvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const menuStartY =
      (this.logoCanvas.height - this.logo.split("\n").length * 20) / 2 +
      this.logoCanvas.height * 0.15 +
      80;
    const itemIndex = Math.floor((y - menuStartY) / 40);

    if (itemIndex >= 0 && itemIndex < this.menuItems.length) {
      this.selectedMenuItem = itemIndex;
      this.selectMenuItem();
    }
  };

  // Add an array to store interval references
  private messageIntervals: NodeJS.Timeout[] = [];

  // Add property to store document touch handler reference
  private documentTouchHandler = (e: TouchEvent) => {};

  constructor(context: ScreenContext) {
    super(context);

    // Ensure parent can receive touch events
    const parent = this.terminal.canvas.parentElement;
    if (parent) {
      parent.style.touchAction = "none";
      parent.style.pointerEvents = "auto";
    }

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
    this.logoCanvas.className = "absolute inset-0"; // Remove pointer-events-none
    this.logoCanvas.style.position = "absolute";
    this.logoCanvas.style.top = "0";
    this.logoCanvas.style.left = "0";
    this.logoCanvas.style.width = "100%";
    this.logoCanvas.style.height = "100%";
    this.logoCanvas.style.zIndex = "20";
    this.terminal.canvas.parentElement?.appendChild(this.logoCanvas);

    // Create canvas for status messages
    this.statusCanvas = document.createElement("canvas");
    this.statusCanvas.className = "absolute inset-0 pointer-events-none";
    this.statusCanvas.style.position = "absolute";
    this.statusCanvas.style.top = "0";
    this.statusCanvas.style.left = "0";
    this.statusCanvas.style.width = "100%";
    this.statusCanvas.style.height = "100%";
    this.statusCanvas.style.zIndex = "30";
    this.terminal.canvas.parentElement?.appendChild(this.statusCanvas);

    this.logoCtx = this.logoCanvas.getContext("2d")!;
    this.statusCtx = this.statusCanvas.getContext("2d")!;
    this.setupCanvases();

    this.fluidEffect = new FluidAscii(fluidCanvas);
    this.fluidEffect.updateConfig({
      backgroundOpacity: 0.4,
      starPulseChance: 0.01,
      starPulseIntensity: 1,
      baseColor: "rgba(47, 183, 195, 0.4)",
      pulseLength: 3000,
      pulseEasing: "softPulse",
      maxPulsingStars: 5,
    });

    // Start cycling messages
    this.startMessageCycles();

    // Add event listeners for menu interaction
    this.addMenuListeners();
  }

  private setupCanvases() {
    const parent = this.logoCanvas.parentElement!;
    const rect = parent.getBoundingClientRect();

    this.logoCanvas.width = rect.width;
    this.logoCanvas.height = rect.height;
    this.statusCanvas.width = rect.width;
    this.statusCanvas.height = rect.height;

    // Make sure canvas can receive touch events
    this.logoCanvas.style.touchAction = "none";
    this.logoCanvas.style.pointerEvents = "auto";
    this.logoCanvas.style.position = "absolute";
    this.logoCanvas.style.zIndex = "999"; // Ensure it's on top

    // Debug - add visible touch area
    if (this.isMobile()) {
      this.logoCanvas.style.border = "1px solid rgba(255,0,0,0.2)";
    }

    this.logoCtx.font = "16px monospace";
    this.logoCtx.textBaseline = "top";
    this.logoCtx.fillStyle = TERMINAL_COLORS.primary;

    this.statusCtx.font = "14px monospace";
    this.statusCtx.textBaseline = "top";
    this.statusCtx.fillStyle = TERMINAL_COLORS.primary;
  }

  private startMessageCycles() {
    // Cycle status messages
    const statusInterval = setInterval(() => {
      this.currentStatusIndex =
        (this.currentStatusIndex + 1) % this.statusMessages.length;
      this.renderStatus();
    }, 3000);
    this.messageIntervals.push(statusInterval);

    // Cycle statistics
    const statsInterval = setInterval(() => {
      this.currentStatIndex =
        (this.currentStatIndex + 1) % this.statistics.length;
      this.renderStatus();
    }, 5000);
    this.messageIntervals.push(statsInterval);

    // Cycle watermarks
    // const watermarkInterval = setInterval(() => {
    //   this.currentWatermarkIndex =
    //     (this.currentWatermarkIndex + 1) % this.watermarks.length;
    //   this.renderWatermark();
    // }, 8000);
    // this.messageIntervals.push(watermarkInterval);

    // Occasional glitch effect
    const glitchInterval = setInterval(() => {
      this.glitchText();
    }, 10000);
    this.messageIntervals.push(glitchInterval);
  }

  private renderStatus() {
    this.statusCtx.clearRect(
      0,
      0,
      this.statusCanvas.width,
      this.statusCanvas.height
    );

    // Draw prompt and status at bottom
    const bottomPadding = 40;
    this.statusCtx.fillStyle = TERMINAL_COLORS.primary;
    this.statusCtx.globalAlpha = 0.8;
    this.statusCtx.fillText(
      `> ${this.statusMessages[this.currentStatusIndex]}`,
      20,
      this.statusCanvas.height - bottomPadding
    );

    // Draw statistics in top-right corner
    this.statusCtx.globalAlpha = 0.6;
    this.statusCtx.fillText(
      this.statistics[this.currentStatIndex],
      this.statusCanvas.width - 300,
      20
    );
  }

  private renderWatermark() {
    this.statusCtx.save();
    this.statusCtx.globalAlpha = 0.1;
    this.statusCtx.font = "24px monospace";

    const watermark = this.watermarks[this.currentWatermarkIndex];
    const metrics = this.statusCtx.measureText(watermark);

    // Draw watermark at a slight angle
    this.statusCtx.translate(
      this.statusCanvas.width / 2,
      this.statusCanvas.height / 2
    );
    this.statusCtx.rotate(-0.2);
    this.statusCtx.fillText(watermark, -metrics.width / 2, 0);
    this.statusCtx.restore();
  }

  private glitchText() {
    const glitchDuration = 200;
    const originalAlpha = this.statusCtx.globalAlpha;
    const originalStyle = this.statusCtx.fillStyle;

    const glitchInterval = setInterval(() => {
      this.statusCtx.globalAlpha = Math.random();
      this.statusCtx.fillStyle = Math.random() > 0.5 ? "#ff0000" : "#00ff00";
      this.renderStatus();
    }, 50);

    setTimeout(() => {
      clearInterval(glitchInterval);
      this.statusCtx.globalAlpha = originalAlpha;
      this.statusCtx.fillStyle = originalStyle;
      this.renderStatus();
    }, glitchDuration);
  }

  private addMenuListeners() {
    // Use the class property handlers
    window.addEventListener("keydown", this.handleKeyDown);
    this.logoCanvas.addEventListener("mousemove", this.handleMouseMove);
    this.logoCanvas.addEventListener("click", this.handleClick);

    // Add touch events with logging
    this.logoCanvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.logoCanvas.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    this.logoCanvas.addEventListener("touchend", this.handleTouchEnd, {
      passive: true,
    });

    // Use the stored handler reference
    document.addEventListener("touchstart", this.documentTouchHandler);
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    if (!this.menuVisible) {
      return;
    }

    const touch = e.touches[0];
    const rect = this.logoCanvas.getBoundingClientRect();
    const y = touch.clientY - rect.top;

    // Calculate which menu item was touched
    const menuStartY = this.getMenuStartY();
    const menuItemHeight = this.isMobile() ? 60 : 40;
    const itemIndex = Math.floor((y - menuStartY) / menuItemHeight);

    if (itemIndex >= 0 && itemIndex < this.menuItems.length) {
      this.selectedMenuItem = itemIndex;
      this.renderMenu();
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    // No preventDefault needed here
    if (!this.menuVisible) return;

    this.selectMenuItem().catch(console.error);
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    if (!this.menuVisible) return;

    const touch = e.touches[0];
    const rect = this.logoCanvas.getBoundingClientRect();
    const y = touch.clientY - rect.top;

    const menuStartY = this.getMenuStartY();
    const menuItemHeight = this.isMobile() ? 60 : 40;
    const itemIndex = Math.floor((y - menuStartY) / menuItemHeight);

    if (itemIndex >= 0 && itemIndex < this.menuItems.length) {
      this.selectedMenuItem = itemIndex;
      this.renderMenu();
    }
  };

  private getMenuStartY(): number {
    const logoLines = this.isMobile()
      ? this.mobileLogo.trim().split("\n")
      : this.logo.trim().split("\n");
    const logoHeight = logoLines.length * 20;
    return (
      (this.logoCanvas.height - logoHeight) / 2 +
      this.logoCanvas.height * 0.15 +
      80
    );
  }

  private isMobile(): boolean {
    return window.innerWidth < 480;
  }

  private renderMenu() {
    // Use the same menu start Y calculation as touch events
    const menuStartY = this.getMenuStartY();
    const menuItemHeight = this.isMobile() ? 60 : 40; // Increased touch target size on mobile

    // Clear only the menu area
    this.logoCtx.clearRect(
      0,
      menuStartY - 20, // Clear a bit above menu start
      this.logoCanvas.width,
      this.logoCanvas.height - menuStartY // Clear to bottom
    );

    if (!this.menuVisible) return;

    // Render menu items
    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedMenuItem;
      const itemY = menuStartY + index * menuItemHeight;

      // Style for selected item
      this.logoCtx.fillStyle = isSelected ? "#ffffff" : TERMINAL_COLORS.primary;
      this.logoCtx.font = isSelected ? "bold 16px monospace" : "16px monospace";

      // Draw selection indicator
      if (isSelected) {
        this.logoCtx.fillText(">", this.logoCanvas.width / 2 - 100, itemY);
      }

      // Draw menu item
      this.logoCtx.fillText(item.text, this.logoCanvas.width / 2 - 80, itemY);

      // Draw description only if not mobile
      if (isSelected && item.description && !this.isMobile()) {
        this.logoCtx.font = "12px monospace";
        this.logoCtx.fillStyle = "rgba(47, 183, 195, 0.7)";
        this.logoCtx.fillText(
          item.description,
          this.logoCanvas.width / 2 - 80,
          itemY + 20
        );
      }
    });
  }

  private async selectMenuItem() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const selectedItem = this.menuItems[this.selectedMenuItem];

    if (selectedItem.route === "classic") {
      // Open classic terminal in new tab
      window.open("https://terminal-classic.netlify.app/", "_blank");
      this.isTransitioning = false;
      return;
    }

    if (selectedItem.route === "token") {
      // Open token interface in new tab
      window.open("https://token.project89.org", "_blank");
      this.isTransitioning = false;
      return;
    }

    try {
      await this.transition(selectedItem.route);
    } catch (error) {
      console.error("Error during transition:", error);
    } finally {
      this.isTransitioning = false;
    }
  }

  async render(): Promise<void> {
    this.isTransitioning = true;

    // Start the fluid effect
    this.fluidEffect.start();

    // Render the logo once
    this.menuVisible = false;
    this.renderLogo();

    // Shorter wait or no wait at all
    await this.wait(500);

    // Show menu without re-rendering logo
    this.menuVisible = true;
    this.renderMenu();

    // Start transforming to solar system without awaiting
    this.fluidEffect.transformToSolarSystem().catch(console.error);

    // Mark as not transitioning
    this.isTransitioning = false;
  }

  private renderLogo() {
    const logo = this.isMobile() ? this.mobileLogo : this.logo;
    const logoLines = logo.trim().split("\n");
    const lineHeight = this.isMobile() ? 16 : 20; // Smaller line height for mobile

    // Calculate centering with 15% upward shift
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

  async cleanup(): Promise<void> {
    await super.cleanup();

    // Remove event listeners
    window.removeEventListener("keydown", this.handleKeyDown);
    this.logoCanvas.removeEventListener("mousemove", this.handleMouseMove);
    this.logoCanvas.removeEventListener("click", this.handleClick);
    this.logoCanvas.removeEventListener("touchstart", this.handleTouchStart);
    this.logoCanvas.removeEventListener("touchmove", this.handleTouchMove);
    this.logoCanvas.removeEventListener("touchend", this.handleTouchEnd);

    // Remove document touch handler
    document.removeEventListener("touchstart", this.documentTouchHandler);

    // Stop animations and effects
    this.fluidEffect.stop();

    // Clear all intervals
    this.messageIntervals.forEach(clearInterval);
    this.messageIntervals = [];

    // Remove canvases
    const parent = this.terminal.canvas.parentElement;
    const canvases = parent?.querySelectorAll("canvas");
    canvases?.forEach((canvas) => {
      if (canvas !== this.terminal.canvas) {
        canvas.remove();
      }
    });

    // Clear terminal
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

    // Rest of your command handling logic
    const command = ctx.command;
    // ... use command as before ...
  }
}
