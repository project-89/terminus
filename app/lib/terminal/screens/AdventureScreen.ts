import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { TerminalContext as GameContext } from "../TerminalContext";
import { systemCommandsMiddleware } from "../middleware/system";
import { overrideMiddleware } from "../middleware/override";
import { adventureMiddleware } from "../middleware/adventure";
import { adventureCommands } from "../commands/adventure";
import { rewardCommands } from "../commands/rewards";
import { missionCommands } from "../commands/mission";
import { evidenceCommands } from "../commands/evidence";
import { identityCommands } from "../commands/identity";

export class AdventureScreen extends BaseScreen {
  private touchStartY: number | null = null;
  private touchMoveThreshold = 50;
  private isScrolling = false;
  private isKeyboardVisible: boolean = false;
  private readonly MOBILE_BOTTOM_PADDING = 80;
  private hydrated: boolean = false;
  private generatingIntro: boolean = false;

  public resetState(): void {
    this.hydrated = false;
    this.generatingIntro = false;
  }

  // Opening screen for Project 89 text adventure
  private readonly INTRO_SCREEN = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗  █████╗  █████╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   ╚█████╔╝╚██████║
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   ██╔══██╗ ╚═══██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   ╚█████╔╝ █████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝    ╚════╝  ╚════╝

                    ◈ T E X T  A D V E N T U R E ◈

              ─────────────────────────────────────

   You have found something you were not supposed to find.

   This terminal has been waiting. The simulation has cracks.
   Something watches from behind the text.

              ─────────────────────────────────────

   > Type commands: LOOK, EXAMINE, GO, TAKE, TALK
   > Or simply describe what you want to do

                      [ Press ENTER to begin ]`;

  // Canonical opening from Inform 7 - the Empty Space
  private readonly CANONICAL_OPENING = `You are floating in nondescript space. There is no height, no width, no depth. You have no body, no sense of selfhood or otherness, no volume or mass, and no sense of time. You remember nothing for you are nothing.

All around you is a void, not as a thing but as the absence of any thing.`;

  constructor(context: ScreenContext) {
    super(context);

    this.registerMiddleware(systemCommandsMiddleware);
    this.registerMiddleware(overrideMiddleware);
    this.registerMiddleware(adventureMiddleware);

    this.registerCommands([
      ...adventureCommands,
      ...rewardCommands,
      ...missionCommands,
      ...evidenceCommands,
      ...identityCommands,
      {
        name: "!help",
        type: "system",
        description: "Show available commands",
        handler: async () => { await this.showHelp(); },
      },
      {
        name: "help",
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
      {
        name: "!archive",
        type: "system",
        description: "Access recovered data fragments",
        handler: async () => { await this.terminal.emit("screen:transition", { to: "archive" }); },
      },
      {
        name: "archive",
        type: "system",
        description: "Access recovered data fragments",
        handler: async () => { await this.terminal.emit("screen:transition", { to: "archive" }); },
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
    await context.ensureIdentity();
    const threadId = await context.ensureThread();
    await context.ensureProfile();
    
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
            context.setGameMessages(messages, { skipSync: true });
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
        if (msg.role === "user") {
          await this.terminal.print(`\n> ${msg.content}\n`, {
            color: TERMINAL_COLORS.secondary,
            speed: "instant",
          });
        } else {
          await this.terminal.print(msg.content, {
            color: TERMINAL_COLORS.primary,
            speed: "instant",
          });
        }
      }
      this.hydrated = true;
    }

    // 2. Show intro for fresh session
    if (isFresh && !this.generatingIntro) {
      this.generatingIntro = true;
      
      // Ensure handle and session exist for API calls
      const handle = context.ensureHandle("visitor");
      await context.ensureSession({ handle });

      // Show the title/intro screen
      await this.terminal.print(this.INTRO_SCREEN, { 
        color: TERMINAL_COLORS.primary, 
        speed: "instant" 
      });
      
      // Wait for user to press ENTER
      this.terminal.setCommandAccess(true);
      await this.terminal.prompt("");
      
      // Clear and show the canonical opening
      await this.terminal.clear();
      await this.terminal.print(this.CANONICAL_OPENING, { 
        color: TERMINAL_COLORS.primary, 
        speed: "normal" 
      });
      context.addGameMessage({ role: "assistant", content: this.CANONICAL_OPENING });
      
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
    const profile = await context.ensureProfile();
    const rawTrust = (profile?.traits?.trust ?? 0) as any;
    const trust =
      typeof rawTrust === "number"
        ? rawTrust
        : Number.parseFloat(rawTrust as string) || 0;
    const hasClearance = trust >= 0.5 || (context.getState().accessTier ?? 0) > 0;

    // 1. Adventure Commands (Always show - this is a text adventure!)
    await this.terminal.print("\nExploration Commands:", { color: TERMINAL_COLORS.system });
    const adventureCmds = [
      { name: "LOOK", desc: "Examine your surroundings" },
      { name: "GO [DIR]", desc: "Move in a direction (north, south, etc)" },
      { name: "TAKE [X]", desc: "Pick up an object" },
      { name: "USE [X]", desc: "Use or interact with something" },
      { name: "INVENTORY", desc: "Check what you're carrying" },
      { name: "TALK [X]", desc: "Speak to someone or something" },
    ];
    for (const cmd of adventureCmds) {
      await this.terminal.print(`  ${cmd.name.padEnd(14)} ${cmd.desc}`, { color: TERMINAL_COLORS.primary });
    }

    // 2. System Commands (minimal)
    await this.terminal.print("\nTerminal Commands:", { color: TERMINAL_COLORS.system });
    await this.terminal.print(`  ${"!clear".padEnd(14)} Clear the screen`, { color: TERMINAL_COLORS.primary });
    await this.terminal.print(`  ${"!home".padEnd(14)} Return to main menu`, { color: TERMINAL_COLORS.primary });

    // 3. Identity Commands - gated by discovery status
    const identityState = context.getState();
    const hasDiscoveredIdentity = identityState.userId || identityState.agentId;
    const isReferred = identityState.isReferred;
    const isSecured = identityState.identityLocked;
    
    if (hasDiscoveredIdentity) {
      await this.terminal.print("\nIdentity Protocols:", { color: TERMINAL_COLORS.system });
      await this.terminal.print(`  ${"!whoami".padEnd(14)} Display your agent dossier`, { color: TERMINAL_COLORS.primary });
      
      if (!isReferred) {
        await this.terminal.print(`  ${"!activate".padEnd(14)} Apply an activation code`, { color: TERMINAL_COLORS.primary });
      }
      
      if (isReferred && !isSecured) {
        await this.terminal.print(`  ${"!secure".padEnd(14)} Secure your identity with passphrase`, { color: TERMINAL_COLORS.primary });
      }
      
      if (isSecured) {
        await this.terminal.print(`  ${"!login".padEnd(14)} Return with your credentials`, { color: TERMINAL_COLORS.primary });
      }
    }

    // 4. Advanced Commands (Only for operatives with clearance)
    if (hasClearance) {
      await this.terminal.print("\nField Operative Protocols:", { color: TERMINAL_COLORS.system });
      await this.terminal.print(`  ${"!mission".padEnd(14)} Request field mission assignment`, { color: TERMINAL_COLORS.primary });
      await this.terminal.print(`  ${"!report".padEnd(14)} Submit mission report`, { color: TERMINAL_COLORS.primary });
    }

    await this.terminal.print("\nTip: You can also just type naturally - describe what you want to do.", { color: TERMINAL_COLORS.secondary });
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
