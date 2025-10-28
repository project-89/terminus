import { TERMINAL_COLORS } from "../Terminal";
import { WalletService } from "@/app/lib/wallet/WalletService";
import { TerminalContext } from "../TerminalContext";
import { generateCLIResponse } from "@/app/lib/ai/prompts";
import { TerminalMiddleware } from "../types";

// Define known system commands
const SYSTEM_COMMANDS = new Set([
  "help",
  "?",
  "connect",
  "disconnect",
  "identify",
  // New tool commands
  "glitch",
  "rain",
  "sound",
  // Thread management
  "reset",
  "new",
  "clear",
]);

export const systemCommandsMiddleware: TerminalMiddleware = async (
  ctx,
  next
) => {
  const terminalContext = TerminalContext.getInstance();
  const state = terminalContext.getState();

  const command = ctx.command.toLowerCase();
  if (!SYSTEM_COMMANDS.has(command)) {
    return next();
  }

  // Always handle help / ? programmatically (not via AI), regardless of access
  if (command === "help" || command === "?") {
    await ctx.terminal.print("\nProgrammatic Commands:", {
      color: TERMINAL_COLORS.system,
      speed: "fast",
    });
    await ctx.terminal.print("  help | ?    - Show this command list", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  !help       - Show terminal utilities", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  !clear      - Clear terminal display", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  new | clear - Start a new adventure session", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  reset       - Full reset (state + thread)", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  archive     - Open archives UI", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print(
      "  dashboard   - Open admin dashboard (if enabled)",
      {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      }
    );
    await ctx.terminal.print("  glitch <i> <ms> - Visual glitch", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  rain <ms> <i>  - Matrix rain", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print('  sound "desc" - Generate a sound', {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    await ctx.terminal.print("  connect / disconnect / identify", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    ctx.handled = true;
    return;
  }

  // Always intercept session lifecycle commands regardless of access
  if (command === "new" || command === "clear") {
    const tc = TerminalContext.getInstance();
    tc.setState({ gameMessages: [], threadId: undefined });
    await ctx.terminal.clear();
    await ctx.terminal.print("Starting a new adventure session...", {
      color: TERMINAL_COLORS.system,
      speed: "normal",
    });
    await ctx.terminal.emit("screen:transition", { to: "adventure" });
    ctx.handled = true;
    return;
  }

  // For other commands, require access
  if (!state.hasFullAccess) {
    return next();
  }

  switch (command) {
    case "reset": {
      // For now: clear state and messages for a fresh adventure thread
      TerminalContext.getInstance().clearState();
      await ctx.terminal.clear();
      await ctx.terminal.print("Adventure thread reset.", {
        color: TERMINAL_COLORS.warning,
        speed: "normal",
      });
      ctx.handled = true;
      break;
    }

    case "new":
    case "clear": {
      // Soft reset: keep access state, drop messages and thread id
      const tc = TerminalContext.getInstance();
      const {
        hasFullAccess,
        walletConnected,
        walletAddress,
        tokenBalance,
        accessTier,
      } = tc.getState();
      tc.setState({ gameMessages: [], threadId: undefined });
      await ctx.terminal.clear();
      await ctx.terminal.print("Starting a new adventure session...", {
        color: TERMINAL_COLORS.system,
        speed: "normal",
      });
      await ctx.terminal.emit("screen:transition", { to: "adventure" });
      ctx.handled = true;
      break;
    }

    case "glitch": {
      const parts = ctx.args;
      const intensity = Math.max(0, Math.min(1, parseFloat(parts[1] || "0.6")));
      const duration = Math.max(300, parseInt(parts[2] || "2000", 10));
      await ctx.terminal.print(
        `\nGLITCH ${Math.round(intensity * 100)}% for ${duration}ms`,
        {
          color: TERMINAL_COLORS.system,
          speed: "instant",
        }
      );
      await ctx.terminal.emit("tool:glitch_screen", { intensity, duration });
      ctx.handled = true;
      break;
    }

    case "rain": {
      const parts = ctx.args;
      const duration = Math.max(300, parseInt(parts[1] || "3000", 10));
      const intensity = Math.max(0, Math.min(1, parseFloat(parts[2] || "0.8")));
      await ctx.terminal.print(
        `\nMATRIX RAIN ${Math.round(intensity * 100)}% for ${duration}ms`,
        {
          color: TERMINAL_COLORS.system,
          speed: "instant",
        }
      );
      await ctx.terminal.emit("tool:matrix_rain", { duration, intensity });
      ctx.handled = true;
      break;
    }

    case "sound": {
      const desc =
        ctx.args.slice(1).join(" ") || "glitchy chime in a dark room";
      await ctx.terminal.print(`\nSOUND ▶ ${desc}`, {
        color: TERMINAL_COLORS.system,
        speed: "instant",
      });
      await ctx.terminal.emit("tool:generate_sound", {
        description: desc,
        duration: 2000,
        influence: 0.6,
      });
      ctx.handled = true;
      break;
    }
    case "connect":
      try {
        await ctx.terminal.print("\nInitiating wallet connection sequence...", {
          color: TERMINAL_COLORS.system,
          speed: "normal",
        });

        const walletService = new WalletService();
        const address = await walletService.connect();

        terminalContext.setState({
          walletConnected: true,
          walletAddress: address,
        });

        await ctx.terminal.print(`\nWallet connected: ${address}`, {
          color: TERMINAL_COLORS.success,
          speed: "normal",
        });

        const balance = await walletService.checkTokenBalance();

        terminalContext.setState({
          tokenBalance: balance,
        });

        if (balance > 0) {
          await ctx.terminal.print("\nPROJECT89 token detected", {
            color: TERMINAL_COLORS.success,
            speed: "normal",
          });
          await ctx.terminal.print(`Balance: ${balance} P89`, {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });

          await ctx.terminal.print(
            "\nPlease use 'identify' command to begin initialization sequence.",
            {
              color: TERMINAL_COLORS.warning,
              speed: "normal",
            }
          );
        } else {
          await ctx.terminal.print("\nNo PROJECT89 tokens found", {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          });
          await ctx.terminal.print(
            "Please acquire P89 tokens to access advanced features",
            {
              color: TERMINAL_COLORS.warning,
              speed: "normal",
            }
          );
        }
      } catch (error: any) {
        console.error("Wallet connection error:", error);
        await ctx.terminal.print(`\nConnection error: ${error.message}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });

        terminalContext.setState({
          walletConnected: false,
          walletAddress: undefined,
          tokenBalance: undefined,
        });

        if (error.message.includes("install")) {
          await ctx.terminal.print(
            "\nVisit phantom.app to install the wallet",
            {
              color: TERMINAL_COLORS.warning,
              speed: "normal",
            }
          );
        }
      }
      ctx.handled = true;
      break;

    case "identify":
      if (!state.walletConnected || !state.walletAddress) {
        await ctx.terminal.print(
          "\nERROR: No wallet connection detected. Please connect wallet first.",
          {
            color: TERMINAL_COLORS.error,
            speed: "normal",
          }
        );
      } else {
        await ctx.terminal.print("\nInitiating identification sequence...", {
          color: TERMINAL_COLORS.system,
          speed: "normal",
        });

        await ctx.terminal.emit("screen:transition", {
          to: "scanning",
          options: { type: "fade", duration: 500 },
        });
      }
      ctx.handled = true;
      break;

    case "help":
      await ctx.terminal.print("\nSYSTEM ACCESS GRANTED", {
        color: TERMINAL_COLORS.success,
        speed: "fast",
      });

      await ctx.terminal.print("\nSystem Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });
      await ctx.terminal.print("  connect   - Connect Phantom wallet", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  disconnect - Disconnect current wallet", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  identify  - Begin initialization sequence", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });

      await ctx.terminal.print("\nUtility Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });
      await ctx.terminal.print("  !help    - Show terminal utilities", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !clear   - Clear terminal display", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !copy    - Copy all terminal content", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      await ctx.terminal.print("  !copylast - Copy last message only", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });

      ctx.handled = true;
      break;

    case "disconnect":
      try {
        if (!state.walletConnected) {
          await ctx.terminal.print("\nNo wallet currently connected.", {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          });
          break;
        }

        const walletService = new WalletService();
        await walletService.disconnect();

        terminalContext.setState({
          walletConnected: false,
          walletAddress: undefined,
          tokenBalance: undefined,
        });

        await ctx.terminal.print("\nWallet disconnected successfully.", {
          color: TERMINAL_COLORS.success,
          speed: "normal",
        });
      } catch (error: any) {
        await ctx.terminal.print(`\nDisconnection error: ${error.message}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
      }
      ctx.handled = true;
      break;
  }
};
