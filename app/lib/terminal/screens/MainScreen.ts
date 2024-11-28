import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS, type TerminalContext } from "../Terminal";
import { ScreenCommandRegistry } from "../commands/registry";

export class MainScreen extends BaseScreen {
  constructor(context: ScreenContext) {
    super(context);

    // Register screen-specific commands
    this.registerCommands([
      {
        name: "tool",
        type: "system",
        description: "Handle tool commands",
        handler: async (ctx) => {
          await this.terminal.print("Handling tool command...", {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });
          ctx.handled = true;
        },
      },
    ]);
  }

  async handleCommand(ctx: TerminalContext): Promise<void> {
    const command = this.commandRegistry.getCommand(ctx.command);
    if (command) {
      await command.handler(ctx);
      return;
    }

    // Handle other commands...
  }

  private banner = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗  █████╗  █████╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   ╚█████╔╝╚██████║
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   ██╔══██╗ ╚═══██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   ╚█████╔╝ █████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝ ╚═════╝   ╚═╝    ╚════╝  ╚════╝ `.trim();

  async render(): Promise<void> {
    // Set cursor to left-aligned with padding
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: 20,
    });

    // Show main banner with minimal top padding
    await this.printCentered(this.banner.split("\n"), { topPadding: 1 });

    // Print the header section centered
    await this.printCentered([
      "",
      "QUANTUM REALITY INTERFACE v89.3.14159",
      '"WE ARE THE DREAMERS - WE ARE THE DREAMED"',
      "",
      "SYSTEM STATUS:",
      "  ■ QUANTUM LINK: STABLE",
      "  ■ REALITY ANCHOR: SYNCHRONIZED",
      "  ■ CONSCIOUSNESS MATRIX: 89% COHERENT",
    ]);

    // Print the rest with left padding
    const leftPadding = "                                          "; // 40 spaces

    await this.terminal.print("", { speed: "instant" });
    await this.terminal.print(leftPadding + "Available Tools:", {
      color: TERMINAL_COLORS.primary,
      speed: "instant",
    });
    await this.terminal.print(leftPadding + "  ⚡ [1] Hyperstition Machine", {
      color: TERMINAL_COLORS.primary,
      speed: "instant",
    });
    await this.terminal.print(
      leftPadding + "      └─ Manipulate belief systems and reality tunnels",
      {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      }
    );
    await this.terminal.print(leftPadding + "  🌀 [2] Reality Matrix Scanner", {
      color: TERMINAL_COLORS.primary,
      speed: "instant",
    });
    await this.terminal.print(
      leftPadding + "      └─ Analyze quantum probability fields",
      {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      }
    );
    await this.terminal.print(
      leftPadding + "  ∞  [3] Quantum Sigil Generator",
      {
        color: TERMINAL_COLORS.primary,
        speed: "instant",
      }
    );
    await this.terminal.print(
      leftPadding + "      └─ Create and deploy reality-altering symbols",
      {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      }
    );
    await this.terminal.print(
      leftPadding + "  ⚕  [4] Consciousness Interface",
      {
        color: TERMINAL_COLORS.primary,
        speed: "instant",
      }
    );
    await this.terminal.print(
      leftPadding +
        "      └─ Direct neural connection to the quantum substrate",
      {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      }
    );
    await this.terminal.print(leftPadding + "  ◈  [5] Dreamscape Navigator", {
      color: TERMINAL_COLORS.primary,
      speed: "instant",
    });
    await this.terminal.print(
      leftPadding +
        "      └─ Traverse and manipulate collective unconscious spaces",
      {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      }
    );
    await this.terminal.print("", { speed: "instant" });
    await this.terminal.print(
      leftPadding + "Type 'help' for available commands.",
      {
        color: TERMINAL_COLORS.primary,
        speed: "instant",
      }
    );
    await this.terminal.print(
      leftPadding +
        "-----------------------------------------------------------------------------",
      {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      }
    );
  }

  async cleanup(): Promise<void> {
    await this.terminal.clear();
  }
}
