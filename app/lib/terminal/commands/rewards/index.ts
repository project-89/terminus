import { CommandConfig } from "../../types";
import { TERMINAL_COLORS } from "../../Terminal";
import { TerminalContext } from "../../TerminalContext";
import { toolEvents } from "../../tools/registry";

async function fetchPoints(identity: { userId?: string; handle?: string }) {
  const query = identity.userId
    ? `userId=${encodeURIComponent(identity.userId)}`
    : `handle=${encodeURIComponent(identity.handle || "")}`;
  const res = await fetch(`/api/points?${query}`);
  return res.json();
}

async function resolveIdentity() {
  const context = TerminalContext.getInstance();
  const identity = await context.ensureIdentity();
  if (!identity) return undefined;

  const state = context.getState();
  const handle =
    state.handle ||
    (typeof window !== "undefined" ? localStorage.getItem("p89_handle") : null) ||
    identity.agentId.toLowerCase();

  return {
    userId: identity.userId,
    handle: handle || undefined,
  };
}

// Helper to fetch rewards
async function fetchRewards(userId: string) {
  const res = await fetch(`/api/rewards?userId=${userId}`);
  return res.json();
}

async function redeemItem(userId: string, itemId: string) {
  const res = await fetch("/api/rewards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, action: "redeem", itemId }),
  });
  return res.json();
}

export const rewardCommands: CommandConfig[] = [
  {
    name: "!status",
    type: "game",
    description: "View your LOGOS points and recent rewards",
    handler: async (ctx) => {
      const identity = await resolveIdentity();
      if (!identity?.userId) {
        await ctx.terminal.print("Identity not established. Unable to query LOGOS ledger.", {
          color: TERMINAL_COLORS.error,
          speed: "fast",
        });
        return;
      }

      await ctx.terminal.print("> QUERYING LOGOS LEDGER...", { 
        color: TERMINAL_COLORS.system, 
        speed: "fast" 
      });
      
      try {
        let data = await fetchPoints(identity);

        // One self-heal retry in case stale local identity was just rotated.
        if (data?.error === "User not found") {
          const recovered = await resolveIdentity();
          if (recovered?.userId) {
            data = await fetchPoints(recovered);
          }
        }
        
        if (data.error) {
          await ctx.terminal.print(`Error: ${data.error}`, { color: TERMINAL_COLORS.error });
          return;
        }
        
        const points = data.points ?? 0;
        const recent = data.recentRewards || [];

        toolEvents.emit("tool:points_sync", { points });
        
        await ctx.terminal.print(`
╔══════════════════════════════════════════════════════════════╗
║  ◈ LOGOS STATUS                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  POINTS: ${String(points).padEnd(49)}║
║                                                              ║`, {
          color: TERMINAL_COLORS.primary,
          speed: "fast",
        });
        
        if (recent.length > 0) {
          await ctx.terminal.print(`║  RECENT ACTIVITY:                                            ║`, {
            color: TERMINAL_COLORS.primary,
            speed: "fast",
          });
          
          for (const r of recent.slice(0, 5)) {
            const meta = r.metadata as { reason?: string } || {};
            const reason = (meta.reason || r.type || "reward").slice(0, 40);
            const line = `  +${r.amount} - ${reason}`;
            await ctx.terminal.print(`║${line.padEnd(62)}║`, {
              color: TERMINAL_COLORS.success,
              speed: "fast",
            });
          }
        } else {
          await ctx.terminal.print(`║  No rewards yet. LOGOS is watching.                          ║`, {
            color: TERMINAL_COLORS.secondary,
            speed: "fast",
          });
        }
        
        await ctx.terminal.print(`║                                                              ║
╚══════════════════════════════════════════════════════════════╝`, {
          color: TERMINAL_COLORS.primary,
          speed: "fast",
        });
        
        await ctx.terminal.print("Type !redeem to see available rewards.", { 
          color: TERMINAL_COLORS.system, 
          speed: "fast" 
        });
        
      } catch (error) {
        await ctx.terminal.print("Connection to ledger failed.", { color: TERMINAL_COLORS.error });
      }
    },
  },
  {
    name: "!redeem",
    type: "game",
    description: "View or redeem rewards. Usage: !redeem [itemId]",
    handler: async (ctx) => {
      const [_, itemId] = ctx.command.split(" ");
      // Use p89_userId for API calls (rewards API expects userId, not handle)
      const userId = localStorage.getItem("p89_userId");

      if (!userId) {
        await ctx.terminal.print("Identity not established. Cannot access reward ledger.", {
          color: TERMINAL_COLORS.error
        });
        return;
      }

      // 1. List Mode
      if (!itemId) {
        await ctx.terminal.print("Connecting to Reward Ledger...", { color: TERMINAL_COLORS.system, speed: "fast" });
        
        const data = await fetchRewards(userId);
        if (data.error) {
            await ctx.terminal.print(`Error: ${data.error}`, { color: TERMINAL_COLORS.error });
            return;
        }

        await ctx.terminal.print(`Current Credits: ${data.balance} CR`, { color: TERMINAL_COLORS.success });
        await ctx.terminal.print("\nAvailable Rewards:", { color: TERMINAL_COLORS.primary });

        for (const item of data.catalog) {
             const color = data.balance >= item.cost ? TERMINAL_COLORS.secondary : TERMINAL_COLORS.secondary;
             await ctx.terminal.print(
               `[${item.id.padEnd(15)}] ${item.cost.toString().padEnd(4)} CR - ${item.name}`,
               { color }
             );
             await ctx.terminal.print(`   ${item.description}`, { color: TERMINAL_COLORS.secondary });
        }
        
        await ctx.terminal.print("\nUsage: !redeem <item_id>", { color: TERMINAL_COLORS.system });
        return;
      }

      // 2. Redeem Mode
      await ctx.terminal.print(`Attempting to redeem [${itemId}]...`, { color: TERMINAL_COLORS.system });
      const result = await redeemItem(userId, itemId);

      if (result.error) {
         await ctx.terminal.print(`Transaction Failed: ${result.error}`, { color: TERMINAL_COLORS.error });
         // Play error sound if possible
      } else {
         await ctx.terminal.print(`Transaction Approved.`, { color: TERMINAL_COLORS.success });
         await ctx.terminal.print(`Acquired: ${result.item.name}`, { color: TERMINAL_COLORS.primary });
         
         if (result.item.type === "LORE") {
             await ctx.terminal.print("\n--- DECRYPTED FILE ---", { color: TERMINAL_COLORS.warning });
             await ctx.terminal.print(result.item.data.title, { color: TERMINAL_COLORS.secondary });
             await ctx.terminal.print(result.item.data.content, { color: TERMINAL_COLORS.primary });
             await ctx.terminal.print("----------------------", { color: TERMINAL_COLORS.warning });
         }
      }
    },
  },
];
