import { CommandConfig } from "../../types";
import { TERMINAL_COLORS } from "../../Terminal";
import { TerminalContext } from "../../TerminalContext";

async function fetchPoints(handle: string) {
  const res = await fetch(`/api/points?handle=${encodeURIComponent(handle)}`);
  return res.json();
}

async function checkTrustLevel(): Promise<{ layer: number; hasPoints: boolean }> {
  try {
    const context = TerminalContext.getInstance();
    const state = context.getState();
    const handle = state.handle || localStorage.getItem("p89_handle");
    
    if (!handle) return { layer: 0, hasPoints: false };
    
    const [profileRes, pointsRes] = await Promise.all([
      fetch(`/api/profile?handle=${encodeURIComponent(handle)}`),
      fetch(`/api/points?handle=${encodeURIComponent(handle)}`),
    ]);
    
    const profile = await profileRes.json().catch(() => ({}));
    const points = await pointsRes.json().catch(() => ({ points: 0 }));
    
    return { 
      layer: profile.layer ?? 0, 
      hasPoints: (points.points ?? 0) > 0 || (points.recentRewards?.length ?? 0) > 0 
    };
  } catch {
    return { layer: 0, hasPoints: false };
  }
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
      const handle = localStorage.getItem("p89_handle") || "agent";
      const { hasPoints } = await checkTrustLevel();
      
      if (!hasPoints) {
        await ctx.terminal.print("\n> ACCESS DENIED", { 
          color: TERMINAL_COLORS.warning, 
          speed: "fast" 
        });
        await ctx.terminal.print("The LOGOS ledger has no record of you yet.", { 
          color: TERMINAL_COLORS.secondary, 
          speed: "fast" 
        });
        await ctx.terminal.print("Continue your exploration. Rewards come to those who seek.", { 
          color: TERMINAL_COLORS.system, 
          speed: "normal" 
        });
        return;
      }
      
      await ctx.terminal.print("\n> QUERYING LOGOS LEDGER...", { 
        color: TERMINAL_COLORS.system, 
        speed: "fast" 
      });
      
      try {
        const data = await fetchPoints(handle);
        
        if (data.error) {
          await ctx.terminal.print(`Error: ${data.error}`, { color: TERMINAL_COLORS.error });
          return;
        }
        
        const points = data.points ?? 0;
        const recent = data.recentRewards || [];
        
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
        
        await ctx.terminal.print("\nType !redeem to see available rewards.", { 
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
