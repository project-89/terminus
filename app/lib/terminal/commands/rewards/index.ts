import { CommandConfig } from "../../types";
import { TERMINAL_COLORS } from "../../Terminal";

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
    name: "!redeem",
    type: "game",
    description: "View or redeem rewards. Usage: !redeem [itemId]",
    handler: async (ctx) => {
      const [_, itemId] = ctx.command.split(" ");
      const userId = localStorage.getItem("p89_handle") || "guest";

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
