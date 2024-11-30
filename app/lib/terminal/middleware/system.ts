import { TERMINAL_COLORS } from "../Terminal";
import { WalletService } from "@/app/lib/wallet/WalletService";
import { TerminalContext } from "../TerminalContext";
import { generateCLIResponse } from "@/app/lib/ai/prompts";
import { TerminalMiddleware } from "../types";

// Define known system commands
const SYSTEM_COMMANDS = new Set(["help", "connect", "disconnect", "identify"]);

export const systemCommandsMiddleware: TerminalMiddleware = async (
  ctx,
  next
) => {
  const terminalContext = TerminalContext.getInstance();
  const state = terminalContext.getState();

  if (!state.hasFullAccess) {
    return next();
  }

  const command = ctx.command.toLowerCase();
  if (!SYSTEM_COMMANDS.has(command)) {
    return next();
  }

  switch (command) {
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
