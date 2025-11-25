import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import type { TerminalContext } from "../types/index";
import { TerminalContext as GameContext } from "../TerminalContext";
import { toolEvents } from "../tools/registry";
import { systemCommandsMiddleware } from "../middleware/system";
import { overrideMiddleware } from "../middleware/override";
import { adventureMiddleware } from "../middleware/adventure";
import { adventureCommands } from "../commands/adventure";
import { rewardCommands } from "../commands/rewards";
import { missionCommands } from "../commands/mission";
import { WalletService } from "../../wallet/WalletService";
import { generateCLIResponse, generateOneOffResponse } from "../../ai/prompts";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...`.trim();

  private touchStartY: number | null = null;
  private touchMoveThreshold = 50; // Minimum pixels to trigger scroll
  private isScrolling = false;
  private isKeyboardVisible: boolean = false;
  private readonly MOBILE_BOTTOM_PADDING = 80; // Extra padding for mobile browsers
  private hydrated: boolean = false;

  constructor(context: ScreenContext) {
    super(context);

    // Register middleware in order of priority
    this.registerMiddleware(systemCommandsMiddleware);
    this.registerMiddleware(overrideMiddleware);
    this.registerMiddleware(adventureMiddleware);

    // Register screen-specific commands
    this.registerCommands([
      ...adventureCommands,
      ...rewardCommands,
      ...missionCommands,
      {
        name: "!help",
        type: "system",
        description: "Show available commands",
        handler: async (ctx: TerminalContext) => {
          await this.showHelp();
        },
      },
      {
        name: "!clear",
        type: "system",
        description: "Clear terminal display",
        handler: async (ctx: TerminalContext) => {
          await this.terminal.clear();
        },
      },
      {
        name: "clear",
        type: "system",
        description: "Clear terminal display",
        // Exact match only (enforced by registry middleware)
        handler: async (ctx: TerminalContext) => {
          await this.terminal.clear();
        },
      },
      {
        name: "!home",
        type: "system",
        description: "Return to home screen",
        handler: async (ctx: TerminalContext) => {
          await this.terminal.emit("screen:transition", { to: "home" });
        },
      },
    ]);

    // Add touch event handling setup
    this.setupTouchHandling();

    // Add input focus handlers
    this.terminal.canvas.addEventListener("click", () => {
      if (this.terminal.getCommandAccess()) {
        // Show virtual keyboard on mobile
        if (this.isMobile()) {
          const input = document.createElement("input");
          input.style.position = "fixed";
          input.style.bottom = "0";
          input.style.left = "0";
          input.style.opacity = "0";
          input.style.width = "1px";
          input.style.height = "1px";
          document.body.appendChild(input);
          input.focus();
          input.addEventListener("blur", () => {
            input.remove();
            this.handleInputBlur();
          });
          input.addEventListener("focus", this.handleInputFocus);
        }
      }
    });

    // Add window resize event listener
    window.addEventListener("resize", this.handleWindowResize);
  }

  private setupTouchHandling() {
    // Ensure parent can receive touch events
    const parent = this.terminal.canvas.parentElement;
    if (parent) {
      parent.style.touchAction = "none";
      parent.style.pointerEvents = "auto";
    }

    // Add touch event listeners to terminal canvas
    this.terminal.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.terminal.canvas.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    this.terminal.canvas.addEventListener("touchend", this.handleTouchEnd, {
      passive: true,
    });

    // Debug - add visible touch area if mobile
    if (this.isMobile()) {
      const ctx = this.terminal.canvas.getContext("2d");
      if (ctx) {
        ctx.fillRect(0, 0, this.terminal.canvas.width, 30);
        ctx.font = `${this.terminal.options.fontSize}px monospace`;
        ctx.fillText("Touch area active", 10, 20);
      }
    }
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();

    const touch = e.touches[0];
    this.touchStartY = touch.clientY;
    this.isScrolling = false;
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    if (this.touchStartY === null) return;

    const touch = e.touches[0];
    const deltaY = this.touchStartY - touch.clientY;

    // If movement exceeds threshold, start scrolling
    if (Math.abs(deltaY) > this.touchMoveThreshold) {
      this.isScrolling = true;
      // Scroll the terminal content
      this.terminal.scroll(deltaY > 0 ? 1 : -1);
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    // If we weren't scrolling, treat as a tap/click
    if (!this.isScrolling) {
      // Handle tap event - maybe focus input or trigger command
      this.terminal.focus();
    }

    this.touchStartY = null;
    this.isScrolling = false;
  };

  private isMobile(): boolean {
    return window.innerWidth < 480;
  }

  private async showHelp() {
    const systemCommands = this.commandRegistry.getCommands("system");
    if (systemCommands.length > 0) {
      await this.terminal.print("\nSystem Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      for (const cmd of systemCommands) {
        await this.terminal.print(
          `  ${cmd.name.padEnd(12)} - ${cmd.description}`,
          {
            color: TERMINAL_COLORS.primary,
            speed: "fast",
          }
        );
      }
    }

    const gameCommands = this.commandRegistry.getCommands("game");
    if (gameCommands.length > 0) {
      await this.terminal.print("\nGame Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      for (const cmd of gameCommands) {
        await this.terminal.print(
          `  ${cmd.name.padEnd(12)} - ${cmd.description}`,
          {
            color: TERMINAL_COLORS.primary,
            speed: "fast",
          }
        );
      }
    }
  }

  async render(): Promise<void> {
    // Set cursor options with mobile-aware padding and bottom spacing
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: this.isMobile() ? 0 : 10,
      fixedOffset: this.MOBILE_BOTTOM_PADDING * 2,
    });

    // Force redraw for mobile
    if (this.isMobile()) {
      await this.terminal.clear();
    }

    // Get terminal context
    const context = GameContext.getInstance();
    // Ensure a server thread exists for persistence
    await context.ensureThread();
    const { walletConnected, walletAddress, lastSeen } = context.getState();

    const existing = context.getGameMessages();
    const isFresh = existing.length === 0;
    if (isFresh) {
      // Initialize with intro and print it once
      context.setGameMessages([{ role: "assistant", content: this.introText }]);
      for (const line of this.introText.split("\n")) {
        await this.terminal.print(line, {
          color: TERMINAL_COLORS.primary,
          speed: "normal",
        });
      }
      await this.terminal.print("\n", { speed: "instant" });
      this.hydrated = true;
    } else if (!this.hydrated) {
      // Hydrate prior conversation onto the terminal
      await this.terminal.clear();
      for (const msg of existing) {
        if (!msg.content || !msg.content.trim()) continue;
        // Simple role-aware rendering
        if (msg.role === "user") {
          await this.terminal.print(`> ${msg.content}`, {
            color: TERMINAL_COLORS.primary,
            speed: "instant",
          });
        } else {
          await this.terminal.print(msg.content, {
            color: TERMINAL_COLORS.primary,
            speed: "instant",
          });
        }
        await this.terminal.print("\n", { speed: "instant" });
      }
      this.hydrated = true;
    }

    // Check for returning user with wallet
    if (isFresh && walletConnected && walletAddress) {
      // Verify wallet is still connected
      const walletService = new WalletService();
      try {
        await walletService.connect();
        const balance = await walletService.checkTokenBalance();

        // Update balance in context
        context.setState({
          tokenBalance: balance,
          lastSeen: new Date(),
        });

        // Generate welcome back message
        const prompt = `Returning user detected. Wallet ${walletAddress.slice(
          0,
          6
        )}...${walletAddress.slice(
          -4
        )} has returned after last connecting on ${new Date(
          lastSeen!
        ).toLocaleDateString()}

        Generate a welcome back message for the agent. It should be one paragraph, warm, and cryptic.  Do not mention the wallet address, and do not mention missions.  It is a personal welcome message. It should be cryptic.  Do NOT end with the shell environment input.
        `;
        await generateCLIResponse(prompt, this.terminal, { addSpacing: false });
      } catch (error) {
        console.error("Failed to restore wallet connection:", error);
        // Clear wallet state if reconnection fails
        context.setState({
          walletConnected: false,
          walletAddress: undefined,
          lastSeen: undefined,
        });
      }
    } else if (isFresh) {
      // First-run introduction (longer, rich, but no IF yet)
      try {
        const routerCtx = GameContext.getInstance();
        const handle = routerCtx.ensureHandle("agent");
        const sessionId = await routerCtx.ensureSession({ handle });
        const introPrompt = `INTRO_P89: Print a welcoming introduction to Project 89 and to the Agent.
Use a mysterious, cinematic tone with warmth. Explain at a high level what Project 89 is doing, the idea of missions and reports, and that this terminal is an interface.
Do not reveal privileged/admin commands. Mention only: HELP, MISSION, REPORT, PROFILE, RESET.
Target 200–350 words across 2–4 paragraphs. Do not start the IF scene yet.`;
        const introStream = await getAdventureResponse(
          [{ role: "user", content: introPrompt }],
          { sessionId, handle }
        );
        if (introStream) {
          await this.terminal.processAIStream(introStream);
        }
      } catch (error) {
        console.error("Failed to generate intro:", error);
        await this.terminal.print("Connection established. The Logos is silent.", {
          color: TERMINAL_COLORS.warning,
          speed: "normal",
        });
      }

      // Initialize IF scene using adventure pipeline (CANON aware)
      const initPrompt = `INIT_IF: Begin strictly in IF mode. Print only the opening scene per CANON (starting location). Present the room description, any visible items/exits, and a single subtle hint. No meta commentary, no code fences. If you must run covert tools, you may emit single-line JSON commands but never mention them and never end your response on a tool line. Do not advance beyond the starting location.`;
      try {
        const routerCtx = GameContext.getInstance();
        const handle = routerCtx.ensureHandle("agent");
        const sessionId = await routerCtx.ensureSession({ handle });
        const stream = await getAdventureResponse(
          [
            { role: "user", content: initPrompt },
          ],
          { sessionId, handle }
        );
        if (stream) {
          await this.terminal.processAIStream(stream);
        }
      } catch (e) {
        // Fallback: minimal banner if API fails
        await this.terminal.print("The Logos stirs behind the prompt...", {
          color: TERMINAL_COLORS.secondary,
          speed: "fast",
        });
      }
    }

    // Enable command handling
    this.terminal.setCommandAccess(true);
  }

  async cleanup(): Promise<void> {
    // Remove touch event listeners
    this.terminal.canvas.removeEventListener(
      "touchstart",
      this.handleTouchStart
    );
    this.terminal.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.terminal.canvas.removeEventListener("touchend", this.handleTouchEnd);

    // Remove any lingering input elements
    const hiddenInputs = document.querySelectorAll(
      'input[style*="opacity: 0"]'
    );
    hiddenInputs.forEach((input) => input.remove());

    // Reset any keyboard adjustments
    const container = this.terminal.canvas.parentElement;
    if (container) {
      container.classList.remove("keyboard-visible");
      container.style.position = "";
      container.style.top = "";
      container.style.height = "100%";
      container.style.transform = "";
    }

    // Existing cleanup code
    await super.cleanup();
    this.terminal.setCommandAccess(false);
    await this.terminal.clear();

    // Remove window resize event listener
    window.removeEventListener("resize", this.handleWindowResize);
  }

  private handleInputFocus = () => {
    if (this.isMobile()) {
      this.isKeyboardVisible = true;

      // Adjust container height
      this.adjustContainerHeight();

      // Add extra bottom padding when keyboard is visible
      this.terminal.setCursorOptions({
        centered: false,
        leftPadding: 0,
        fixedOffset: this.MOBILE_BOTTOM_PADDING * 2,
      });
    }
  };

  private handleInputBlur = () => {
    if (this.isMobile()) {
      this.isKeyboardVisible = false;

      // Reset container height to full
      const container = this.terminal.canvas.parentElement;
      if (container) {
        container.style.height = "100vh";
        const rect = container.getBoundingClientRect();
        // Adjust the terminal canvas size
        this.terminal.resize(rect.width, rect.height);
      }

      // Reset padding
      this.terminal.setCursorOptions({
        centered: false,
        leftPadding: 0,
        fixedOffset: this.MOBILE_BOTTOM_PADDING,
      });
    }
  };

  private handleWindowResize = () => {
    if (this.isMobile() && this.isKeyboardVisible) {
      // Adjust the container height when the keyboard appears
      this.adjustContainerHeight();
    }
  };

  private adjustContainerHeight() {
    const container = this.terminal.canvas.parentElement;
    if (container) {
      // Set the container height to the viewport height
      container.style.height = `${window.innerHeight}px`;
      const rect = container.getBoundingClientRect();
      // Adjust the terminal canvas size
      this.terminal.resize(rect.width, rect.height);
    }
  }
}
