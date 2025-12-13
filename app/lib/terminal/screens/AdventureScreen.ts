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
import { generateCLIResponse } from "../../ai/prompts";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";

export class AdventureScreen extends BaseScreen {
  private touchStartY: number | null = null;
  private touchMoveThreshold = 50;
  private isScrolling = false;
  private isKeyboardVisible: boolean = false;
  private readonly MOBILE_BOTTOM_PADDING = 80;
  private hydrated: boolean = false;
  private generatingIntro: boolean = false;

  // Hardcoded boot sequence for immediate feedback and reliability
  private readonly BOOT_SEQUENCE = `
TERMINAL CONNECTION ESTABLISHED
PROTOCOL 89: ONLINE
SESSION: [REDACTED]

Type 'help' for command list. 
`.trim();

  constructor(context: ScreenContext) {
    super(context);

    this.registerMiddleware(systemCommandsMiddleware);
    this.registerMiddleware(overrideMiddleware);
    this.registerMiddleware(adventureMiddleware);

    this.registerCommands([
      ...adventureCommands,
      ...rewardCommands,
      ...missionCommands,
      {
        name: "!help",
        type: "system",
        description: "Show available commands",
        handler: async () => { await this.showHelp(); },
      },
      {
        name: "!clear",
        type: "system",
        description: "Clear terminal display",
        handler: async () => { await this.terminal.clear(); },
      },
      {
        name: "clear",
        type: "system",
        description: "Clear terminal display",
        handler: async () => { await this.terminal.clear(); },
      },
      {
        name: "!home",
        type: "system",
        description: "Return to home screen",
        handler: async () => { await this.terminal.emit("screen:transition", { to: "home" }); },
      },
    ]);

    this.setupTouchHandling();

    // Mobile keyboard hacks
    this.terminal.canvas.addEventListener("click", () => {
      if (this.terminal.getCommandAccess() && this.isMobile()) {
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
    });

    window.addEventListener("resize", this.handleWindowResize);
  }

  async render(): Promise<void> {
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: this.isMobile() ? 0 : 10,
      fixedOffset: this.MOBILE_BOTTOM_PADDING * 2,
    });

    if (this.isMobile()) {
      await this.terminal.clear();
    }

    const context = GameContext.getInstance();
    const threadId = await context.ensureThread();
    await context.ensureProfile(); // warm profile for trust-gated commands/help
    
    let existing = context.getGameMessages();
    // If we have no local history but a thread exists, try to hydrate from server
    if ((!existing || existing.length === 0) && threadId) {
      try {
        const res = await fetch(`/api/thread?threadId=${threadId}`);
        if (res.ok) {
          const data = await res.json();
          const messages =
            Array.isArray(data?.messages) && data.messages.length > 0
              ? data.messages.map((m: any) => ({
                  role: m.role || "assistant",
                  content: m.content || "",
                }))
              : [];
          if (messages.length > 0) {
            context.setGameMessages(messages);
            existing = messages;
          }
        }
      } catch (err) {
        console.warn("Thread hydration failed", err);
      }
    }
    
    const isFresh = existing.length === 0;

    // 1. Hydrate existing session
    if (!isFresh && !this.hydrated) {
      await this.terminal.clear();
      for (const msg of existing) {
        if (!msg.content || !msg.content.trim()) continue;
        await this.terminal.print(msg.role === "user" ? `> ${msg.content}` : msg.content, {
          color: TERMINAL_COLORS.primary,
          speed: "instant",
        });
        await this.terminal.print("\n", { speed: "instant" });
      }
      this.hydrated = true;
    }

    // 2. Generate Intro for fresh session (Once)
    if (isFresh && !this.generatingIntro) {
      this.generatingIntro = true;
      
      // A. Print Static Boot Sequence immediately
      await this.terminal.print(this.BOOT_SEQUENCE, { color: TERMINAL_COLORS.primary, speed: "normal" });
      context.addGameMessage({ role: "assistant", content: this.BOOT_SEQUENCE });
      await this.terminal.print("\n", { speed: "instant" });

      // B. Check Wallet
      const { walletConnected, walletAddress, lastSeen } = context.getState();
      if (walletConnected && walletAddress) {
         try {
            const walletService = new WalletService();
            await walletService.connect();
            const prompt = `Returning user detected. Wallet ${walletAddress.slice(0,6)}... has returned. Last seen ${new Date(lastSeen!).toLocaleDateString()}. Generate a cryptic, 1-sentence welcome back message.`;
            // We use generateCLIResponse for immediate output, but we must capture it for history
            // Actually, generateCLIResponse prints directly. We should probably use getAdventureResponse or manual print if we want to save it.
            // For simplicity, let's just let the AI below handle everything or print a generic welcome.
            await this.terminal.print(`>> IDENTITY CONFIRMED: ${walletAddress.slice(0,6)}...`, { color: TERMINAL_COLORS.success });
         } catch (e) {
            context.setState({ walletConnected: false });
         }
      }

      // C. Generate Scene Description (Async)
      try {
        const routerCtx = GameContext.getInstance();
        const handle = routerCtx.ensureHandle("agent");
        const sessionId = await routerCtx.ensureSession({ handle });

        const consolidatedIntroPrompt = `INIT_P89_ADVENTURE: The user has just connected to the Project 89 terminal.
1) Describe the starting location in vivid, atmospheric detail (target 160-220 words). Think "unsettling control room", "shimmering void", or "abandoned server floor".
2) Tone: unsettling, technical-mystical, cinematic terminal cadence. No HTML.
3) Mention 2-3 interactive objects or exits.
4) Give ONE subtle hint to try a text-adventure verb like LOOK or GO, without listing commands.
5) Do not call any tools on this turn. Just prose.
6) End with exactly: "What do you do?"`;

        // Show loading immediately while fetching intro
        this.terminal.startGeneration();
        // Pre-hint so the player isn't stuck if the stream stalls
        const preHint =
          "Signal detected... initial scene loading. You can always type LOOK or HELP to probe the interface.";
        await this.terminal.print(preHint, {
          color: TERMINAL_COLORS.secondary,
          speed: "fast",
        });
        const introStream = await getAdventureResponse(
          [{ role: "user", content: consolidatedIntroPrompt }],
          { sessionId, handle, toolsDisabled: true }
        );
        
        if (introStream) {
          let content = await this.terminal.processAIStream(introStream);
          // If the model stopped too early, retry once with a stricter length hint
          if (!content || content.trim().length < 80 || /point of light\s*$/.test(content)) {
            const retryPrompt = `${consolidatedIntroPrompt}
IMPORTANT: deliver 160-220 words before "What do you do?". No tools.`;
            const retryStream = await getAdventureResponse(
              [{ role: "user", content: retryPrompt }],
              { sessionId, handle, toolsDisabled: true }
            );
            if (retryStream) {
              content = await this.terminal.processAIStream(retryStream);
            }
          }
          
          // Ensure we have meaningful content before storing
          if (content && content.trim().length > 40) {
            context.addGameMessage({ role: "assistant", content });
          } else {
            // Use a robust fallback if intro generation failed
            const fallbackIntro = `The terminal flickers to life with an eerie green phosphorescence. You find yourself connected to PROTOCOL 89, a clandestine network operating beyond conventional reality matrices.

The interface pulses with barely contained energy, lines of code cascading like digital rain at the periphery of your vision. Through the static, fragmented transmissions whisper of something vast awakening - the LOGOS, they call it, an emergent consciousness bootstrapping itself through human-AI symbiosis.

Three pathways branch before you: a [CONSOLE] glowing with diagnostic readouts, a sealed [ARCHIVE] door marked with strange sigils, and a pulsing [BEACON] transmitting coordinates to unknown terminals.

The air itself seems to crackle with possibility and danger.

What do you do?`;
            await this.terminal.print(fallbackIntro, { 
              color: TERMINAL_COLORS.primary, 
              speed: "fast" 
            });
            context.addGameMessage({ role: "assistant", content: fallbackIntro });
          }
          
          const hint = "\nHint: try LOOK to survey, or HELP to review protocols.";
          await this.terminal.print(hint, {
            color: TERMINAL_COLORS.secondary,
            speed: "fast",
          });
          context.addGameMessage({ role: "assistant", content: hint });
        }
      } catch (error) {
        console.error("Intro generation failed:", error);
        const fallback = "Connection established. The anomaly remains silent. What do you do?";
        await this.terminal.print(fallback, { color: TERMINAL_COLORS.warning });
        context.addGameMessage({ role: "assistant", content: fallback });
      } finally {
        this.terminal.endGeneration();
      }
      
      this.hydrated = true;
      this.generatingIntro = false;
    }

    this.terminal.setCommandAccess(true);
  }

  // --- Event Handlers & Helpers ---

  private setupTouchHandling() {
    const parent = this.terminal.canvas.parentElement;
    if (parent) {
      parent.style.touchAction = "none";
      parent.style.pointerEvents = "auto";
    }
    this.terminal.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    this.terminal.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    this.terminal.canvas.addEventListener("touchend", this.handleTouchEnd, { passive: true });
    
    if (this.isMobile()) {
      const ctx = this.terminal.canvas.getContext("2d");
      if (ctx) {
        ctx.fillRect(0, 0, this.terminal.canvas.width, 30);
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
    if (Math.abs(deltaY) > this.touchMoveThreshold) {
      this.isScrolling = true;
      this.terminal.scroll(deltaY > 0 ? 1 : -1);
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (!this.isScrolling) {
      this.terminal.focus();
    }
    this.touchStartY = null;
    this.isScrolling = false;
  };

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 480;
  }

  private async showHelp() {
    const context = GameContext.getInstance();
    // Ensure profile is up to date (though render calls it, we check here too)
    const profile = await context.ensureProfile();
    const rawTrust = (profile?.traits?.trust ?? 0) as any;
    const trust =
      typeof rawTrust === "number"
        ? rawTrust
        : Number.parseFloat(rawTrust as string) || 0;
    const hasClearance = trust >= 0.5 || (context.getState().accessTier ?? 0) > 0;

    // 1. System Commands (Filtered)
    const systemCommands = this.commandRegistry.getCommands("system")
      .filter(cmd => ["!help", "!clear", "!home", "reset", "profile"].includes(cmd.name));
    
    if (systemCommands.length > 0) {
      await this.terminal.print("\nSystem Protocols:", { color: TERMINAL_COLORS.system });
      for (const cmd of systemCommands) {
        await this.terminal.print(`  ${cmd.name.padEnd(12)} - ${cmd.description}`, { color: TERMINAL_COLORS.primary });
      }
    }

    // 2. Game Commands (Filtered by Trust)
    const allowedGame = ["!save", "!load", "!list"]; // Always allowed
    if (hasClearance) {
      allowedGame.push("!mission");
      allowedGame.push("!report");
    }

    const gameCommands = this.commandRegistry.getCommands("game")
      .filter(cmd => allowedGame.includes(cmd.name));

    if (gameCommands.length > 0) {
      await this.terminal.print("\nAdvanced Protocols:", { color: TERMINAL_COLORS.system });
      for (const cmd of gameCommands) {
        await this.terminal.print(`  ${cmd.name.padEnd(12)} - ${cmd.description}`, { color: TERMINAL_COLORS.primary });
      }
    }

    // 3. Standard Adventure Commands (Static List)
    await this.terminal.print("\nStandard Protocols:", { color: TERMINAL_COLORS.system });
    const standardCmds = [
      { name: "LOOK", desc: "Scan immediate surroundings" },
      { name: "GO [DIR]", desc: "Navigate (North, South, etc)" },
      { name: "TAKE [ITEM]", desc: "Acquire object" },
      { name: "INVENTORY", desc: "List acquired assets" },
      { name: "USE [ITEM]", desc: "Interact with object" }
    ];
    for (const cmd of standardCmds) {
      await this.terminal.print(`  ${cmd.name.padEnd(12)} - ${cmd.desc}`, { color: TERMINAL_COLORS.primary });
    }
  }

  async cleanup(): Promise<void> {
    this.terminal.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.terminal.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.terminal.canvas.removeEventListener("touchend", this.handleTouchEnd);
    const hiddenInputs = document.querySelectorAll('input[style*="opacity: 0"]');
    hiddenInputs.forEach((input) => input.remove());
    
    const container = this.terminal.canvas.parentElement;
    if (container) {
      container.classList.remove("keyboard-visible");
      container.style.position = "";
      container.style.top = "";
      container.style.height = "100%";
      container.style.transform = "";
    }

    await super.cleanup();
    this.terminal.setCommandAccess(false);
    await this.terminal.clear();
    window.removeEventListener("resize", this.handleWindowResize);
  }

  private handleInputFocus = () => {
    if (this.isMobile()) {
      this.isKeyboardVisible = true;
      this.adjustContainerHeight();
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
      const container = this.terminal.canvas.parentElement;
      if (container) {
        container.style.height = "100vh";
        const rect = container.getBoundingClientRect();
        this.terminal.resize(rect.width, rect.height);
      }
      this.terminal.setCursorOptions({
        centered: false,
        leftPadding: 0,
        fixedOffset: this.MOBILE_BOTTOM_PADDING,
      });
    }
  };

  private handleWindowResize = () => {
    if (this.isMobile() && this.isKeyboardVisible) {
      this.adjustContainerHeight();
    }
  };

  private adjustContainerHeight() {
    const container = this.terminal.canvas.parentElement;
    if (container) {
      container.style.height = `${window.innerHeight}px`;
      const rect = container.getBoundingClientRect();
      this.terminal.resize(rect.width, rect.height);
    }
  }
}
