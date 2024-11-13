import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { WalletService } from "@/app/lib/wallet/WalletService";
import { TerminalContext } from "../TerminalContext";

// Define known system commands
const SYSTEM_COMMANDS = new Set(["help", "connect"]);

export const systemCommandsMiddleware: TerminalMiddleware = async (
  ctx,
  next
) => {
  const terminalContext = TerminalContext.getInstance();
  const { hasFullAccess } = terminalContext.getState();

  // Only handle system commands if we have full access
  if (!hasFullAccess) {
    return next();
  }

  // Check if this is a known system command
  const command = ctx.command.toLowerCase();
  if (!SYSTEM_COMMANDS.has(command)) {
    return next();
  }

  // Handle system commands
  switch (command) {
    case "connect":
      try {
        await ctx.terminal.print("\nInitiating wallet connection sequence...", {
          color: TERMINAL_COLORS.system,
          speed: "normal",
        });

        const walletService = new WalletService();
        const address = await walletService.connect();
        await ctx.terminal.print(`\nWallet connected: ${address}`, {
          color: TERMINAL_COLORS.success,
          speed: "normal",
        });

        // Check for PROJECT89 token
        const balance = await walletService.checkTokenBalance();
        if (balance > 0) {
          await ctx.terminal.print("\nPROJECT89 token detected", {
            color: TERMINAL_COLORS.success,
            speed: "normal",
          });
          await ctx.terminal.print(`Balance: ${balance} P89`, {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });
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

        // Update wallet state in context
        terminalContext.setState({
          walletConnected: true,
          tokenBalance: balance,
        });
      } catch (error: any) {
        await ctx.terminal.print(`\nConnection error: ${error.message}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
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

    case "help":
      await ctx.terminal.print("\nSYSTEM ACCESS GRANTED", {
        color: TERMINAL_COLORS.success,
        speed: "fast",
      });

      await ctx.terminal.print("\nSystem Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });
      await ctx.terminal.print("  connect  - Connect Phantom wallet", {
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
  }
};
