import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import type { TerminalContext } from "../types/index";
import { TerminalContext as GameContext } from "../TerminalContext";
import { toolEvents } from "../tools/registry";
import { systemCommandsMiddleware } from "../middleware/system";
import { overrideMiddleware } from "../middleware/override";
import { adventureMiddleware } from "../middleware/adventure";
import { adventureCommands } from "../commands/adventure";
import { WalletService } from "../../wallet/WalletService";
import { generateCLIResponse, generateOneOffResponse } from "../../ai/prompts";

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...`.trim();

  private touchStartY: number | null = null;
  private touchMoveThreshold = 50; // Minimum pixels to trigger scroll
  private isScrolling = false;
  private isKeyboardVisible: boolean = false;
  private readonly MOBILE_BOTTOM_PADDING = 80; // Extra padding for mobile browsers

  constructor(context: ScreenContext) {
    super(context);

    // Register middleware in order of priority
    this.registerMiddleware(systemCommandsMiddleware);
    this.registerMiddleware(overrideMiddleware);
    this.registerMiddleware(adventureMiddleware);

    // Register screen-specific commands
    this.registerCommands([
      ...adventureCommands,
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

  private triggerMatrixRain() {
    toolEvents.emit("tool:matrix_rain", {
      duration: 5000, // 5 seconds
      intensity: 0.8, // High intensity
    });
  }

  private triggerGlitch() {
    toolEvents.emit("tool:glitch_screen", {
      duration: 3000, // 3 seconds
      intensity: 0.7, // Medium-high intensity
    });
  }

  public async processCommand(command: string): Promise<void> {
    const context = GameContext.getInstance();

    // Store user command
    context.addGameMessage({
      role: "user",
      content: command,
    });

    // Handle special commands
    if (command.toLowerCase() === "matrix") {
      this.triggerMatrixRain();
      return;
    }

    if (command.toLowerCase() === "glitch") {
      this.triggerGlitch();
      return;
    }

    try {
      const response = await fetch("/api/adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: context.getGameMessages(),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get adventure response");
      }

      // Process the response and store it
      const content = await this.terminal.processAIStream(response.body);
      if (content) {
        context.addGameMessage({
          role: "assistant",
          content: content,
        });
      }
    } catch (error) {
      console.error("Error processing command:", error);
      await this.terminal.print("Error processing command. Please try again.", {
        color: TERMINAL_COLORS.error,
      });
    }
  }

  async render(): Promise<void> {
    // Set cursor options with mobile-aware padding and bottom spacing
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: this.isMobile() ? 0 : 10,
      bottomPadding: this.isMobile() ? this.MOBILE_BOTTOM_PADDING : 0,
    });

    // Force redraw for mobile
    if (this.isMobile()) {
      await this.terminal.clear();
    }

    // Get terminal context
    const context = GameContext.getInstance();
    const { walletConnected, walletAddress, lastSeen } = context.getState();

    // Clear any existing game messages when starting fresh
    if (!context.getGameMessages().length) {
      context.setGameMessages([
        {
          role: "assistant",
          content: this.introText,
        },
      ]);
    } else {
      // Filter out empty messages
      const validMessages = context
        .getGameMessages()
        .filter((msg) => msg.content && msg.content.trim() !== "");
      if (validMessages.length !== context.getGameMessages().length) {
        context.setGameMessages(validMessages);
      }
    }

    // Print intro text
    for (const line of this.introText.split("\n")) {
      await this.terminal.print(line, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }

    await this.terminal.print("\n", { speed: "instant" });

    // Check for returning user with wallet
    if (walletConnected && walletAddress) {
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
    } else {
      // Regular new user flow
      await generateOneOffResponse(
        "Before the game starts, print out a short introduction about the Project and its purpose, and on how to play the text adventure, but DO NOT use weird characters like [object].  Commands are listed with CAPS. You don't need to explain everything.  Show commands as a list with a short description of the command.  Enough to get them started. Interject a couple commands which are ontological and hyperstitial in nature. Do not simulate the text adventure until you receive the first command after this.",
        this.terminal,
        {
          addSpacing: false,
        }
      );
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
  }

  private handleInputFocus = () => {
    if (this.isMobile()) {
      this.isKeyboardVisible = true;

      // Get the terminal container
      const container = this.terminal.canvas.parentElement;
      if (container) {
        // Add a class to handle keyboard visibility
        container.classList.add("keyboard-visible");

        // Apply viewport adjustments
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.height = "50vh"; // Reduce height to half viewport
        container.style.transform = "translateY(0)"; // Ensure it's at the top

        // Force scroll to top
        window.scrollTo(0, 0);

        // Add extra bottom padding when keyboard is visible
        this.terminal.setCursorOptions({
          centered: false,
          leftPadding: 0,
          bottomPadding: this.MOBILE_BOTTOM_PADDING * 2,
        });
      }
    }
  };

  private handleInputBlur = () => {
    if (this.isMobile()) {
      this.isKeyboardVisible = false;

      // Get the terminal container
      const container = this.terminal.canvas.parentElement;
      if (container) {
        // Remove keyboard visibility class
        container.classList.remove("keyboard-visible");

        // Reset viewport adjustments
        container.style.position = "";
        container.style.top = "";
        container.style.height = "100%";
        container.style.transform = "";

        // Reset padding
        this.terminal.setCursorOptions({
          centered: false,
          leftPadding: 0,
          bottomPadding: this.MOBILE_BOTTOM_PADDING,
        });
      }
    }
  };
}
