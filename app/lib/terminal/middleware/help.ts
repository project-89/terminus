import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";

export const helpMiddleware: TerminalMiddleware = async (ctx, next) => {
  if (ctx.command === "help") {
    const { terminal } = ctx;
    const colors = terminal.getColors();

    await terminal.print("Available Commands:", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("  help     - Show this help message", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("  clear    - Clear the terminal", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("  main     - Return to main interface", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("  status   - Show system status", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("  connect  - Connect to quantum mainframe", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("", { speed: "instant" }); // Empty line for spacing

    await terminal.print("Available Tools:", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("  [1] Hyperstition Machine", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print(
      "      └─ Manipulate belief systems and reality tunnels",
      { color: colors.secondary, speed: "fast" }
    );
    await terminal.print("  [2] Reality Matrix Scanner", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print("      └─ Analyze quantum probability fields", {
      color: colors.secondary,
      speed: "fast",
    });
    await terminal.print("  [3] Quantum Sigil Generator", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print(
      "      └─ Create and deploy reality-altering symbols",
      { color: colors.secondary, speed: "fast" }
    );
    await terminal.print("  [4] Consciousness Interface", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print(
      "      └─ Direct neural connection to the quantum substrate",
      { color: colors.secondary, speed: "fast" }
    );
    await terminal.print("  [5] Dreamscape Navigator", {
      color: colors.primary,
      speed: "fast",
    });
    await terminal.print(
      "      └─ Traverse and manipulate collective unconscious spaces",
      { color: colors.secondary, speed: "fast" }
    );

    ctx.handled = true;
    return;
  }
  await next();
};
