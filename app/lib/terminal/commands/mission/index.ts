import { CommandConfig } from "../../types";
import { TERMINAL_COLORS } from "../../Terminal";

// Helper to get user identity (handle and userId for API calls)
function getIdentity() {
  if (typeof window === 'undefined') {
    return { handle: "agent", userId: undefined };
  }
  return {
    handle: localStorage.getItem("p89_handle") || undefined,
    userId: localStorage.getItem("p89_userId") || undefined,
  };
}

// Fetch next mission
async function fetchMission(ctx: any) {
  const { handle, userId } = getIdentity();
  await ctx.terminal.print("Scanning secure channels...", { color: TERMINAL_COLORS.system });

  if (!handle && !userId) {
    await ctx.terminal.print("Identity not established. Cannot access missions.", { color: TERMINAL_COLORS.error });
    return;
  }

  try {
    const params = new URLSearchParams();
    if (handle) params.set("handle", handle);
    if (userId) params.set("userId", userId);
    const res = await fetch(`/api/mission?${params.toString()}`);
    const data = await res.json();
    
    if (data.error || data.message) {
      await ctx.terminal.print(`Status: ${data.error || data.message}`, { color: TERMINAL_COLORS.warning });
      return;
    }

    const m = data.mission;
    await ctx.terminal.print("\n--- INCOMING TRANSMISSION ---", { color: TERMINAL_COLORS.secondary });
    await ctx.terminal.print(`TITLE: ${m.title}`, { color: TERMINAL_COLORS.primary });
    await ctx.terminal.print(`TYPE: ${m.type.toUpperCase()}`, { color: TERMINAL_COLORS.secondary });
    await ctx.terminal.print(`OBJECTIVE: ${m.prompt}`, { color: TERMINAL_COLORS.primary });
    await ctx.terminal.print("\nTo accept this mission, type: !mission accept", { color: TERMINAL_COLORS.system });
  } catch (e) {
    await ctx.terminal.print("Connection failed.", { color: TERMINAL_COLORS.error });
  }
}

// Accept mission
async function acceptMission(ctx: any) {
  const { handle, userId } = getIdentity();
  await ctx.terminal.print("Confirming assignment...", { color: TERMINAL_COLORS.system });

  if (!handle && !userId) {
    await ctx.terminal.print("Identity not established. Cannot accept missions.", { color: TERMINAL_COLORS.error });
    return;
  }

  try {
    const res = await fetch("/api/mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, userId }),
    });
    const data = await res.json();

    if (data.error) {
       await ctx.terminal.print(`Error: ${data.error}`, { color: TERMINAL_COLORS.error });
       return;
    }

    await ctx.terminal.print("Mission Accepted. Good luck, Agent.", { color: TERMINAL_COLORS.success });
    await ctx.terminal.print("Submit your findings using: !report <evidence>", { color: TERMINAL_COLORS.system });
  } catch (e) {
    await ctx.terminal.print("Acceptance failed.", { color: TERMINAL_COLORS.error });
  }
}

// Submit report
async function submitReport(ctx: any, content: string) {
  if (!content) {
     await ctx.terminal.print("Error: Report content empty.", { color: TERMINAL_COLORS.error });
     return;
  }

  const { handle, userId } = getIdentity();

  if (!handle && !userId) {
    await ctx.terminal.print("Identity not established. Cannot submit reports.", { color: TERMINAL_COLORS.error });
    return;
  }

  await ctx.terminal.print("Encrypting and uploading report...", { color: TERMINAL_COLORS.system });

  try {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, userId, content }),
    });
    const data = await res.json();

    if (data.error) {
       await ctx.terminal.print(`Submission Error: ${data.error}`, { color: TERMINAL_COLORS.error });
       return;
    }

    // Display Adjudication Result
    await ctx.terminal.print("\n--- ADJUDICATION REPORT ---", { color: TERMINAL_COLORS.secondary });
    
    const scoreColor = data.score > 0.7 ? TERMINAL_COLORS.success : (data.score > 0.4 ? TERMINAL_COLORS.warning : TERMINAL_COLORS.error);
    await ctx.terminal.print(`SCORE: ${Math.round(data.score * 100)}/100`, { color: scoreColor });
    
    if (data.feedback) {
        await ctx.terminal.print(`FEEDBACK: ${data.feedback}`, { color: TERMINAL_COLORS.primary });
    }
    
    if (data.reward && data.reward.amount > 0) {
        await ctx.terminal.print(`REWARD: +${data.reward.amount} CREDITS`, { color: TERMINAL_COLORS.success });
    } else {
        await ctx.terminal.print("REWARD: 0 CREDITS", { color: TERMINAL_COLORS.secondary });
    }
    
    await ctx.terminal.print("---------------------------", { color: TERMINAL_COLORS.secondary });

  } catch (e) {
    await ctx.terminal.print("Report upload failed.", { color: TERMINAL_COLORS.error });
  }
}

export const missionCommands: CommandConfig[] = [
  {
    name: "!mission",
    type: "game",
    description: "Manage missions. Usage: !mission [accept]",
    handler: async (ctx) => {
      const [_, action] = ctx.command.split(" ");
      if (action === "accept") {
        await acceptMission(ctx);
      } else {
        await fetchMission(ctx);
      }
    },
  },
  {
    name: "!report",
    type: "game",
    description: "Submit mission report. Usage: !report <evidence/text>",
    handler: async (ctx) => {
      const parts = ctx.command.split(" ");
      const content = parts.slice(1).join(" ");
      await submitReport(ctx, content);
    },
  },
];
