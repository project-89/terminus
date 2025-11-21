import { TERMINAL_COLORS } from "../Terminal";
import { WalletService } from "@/app/lib/wallet/WalletService";
import { TerminalContext } from "../TerminalContext";
import { TerminalMiddleware } from "../types";

const SYSTEM_COMMANDS = new Set([
  "help",
  "?",
  "connect",
  "disconnect",
  "identify",
  "glitch",
  "rain",
  "sound",
  "reset",
  "resume",
  "mission",
  "report",
  "profile",
  "new",
  "archive",
  "dashboard",
  "ops",
]);

function parseValue(raw: string): any {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;
  return trimmed;
}

function assignPath(target: Record<string, any>, path: string, value: any) {
  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) return;
  let node = target;
  while (segments.length > 1) {
    const segment = segments.shift()!;
    if (!node[segment] || typeof node[segment] !== "object") {
      node[segment] = {};
    }
    node = node[segment];
  }
  node[segments[0]] = value;
}

function buildProfilePayload(args: string[]): Record<string, any> {
  const payload: Record<string, any> = {};
  for (const pair of args) {
    const [key, ...rest] = pair.split("=");
    if (!key || rest.length === 0) continue;
    assignPath(payload, key, parseValue(rest.join("=")));
  }
  return payload;
}

type JsonRequestInit = Omit<RequestInit, "body"> & { body?: any };

async function fetchJSON(url: string, init?: JsonRequestInit): Promise<any> {
  const options: RequestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  };
  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }
  return data;
}

async function ensureSession(terminalContext: TerminalContext, handle: string) {
  return terminalContext.ensureSession({ handle });
}

async function printProfile(
  ctx: any,
  profile: Record<string, any>
): Promise<void> {
  await ctx.terminal.print("\nAGENT PROFILE:", {
    color: TERMINAL_COLORS.system,
    speed: "fast",
  });

  const sections: Array<[string, Record<string, any> | undefined]> = [
    ["Traits", profile.traits],
    ["Skills", profile.skills],
    ["Preferences", profile.preferences],
  ];

  for (const [label, section] of sections) {
    if (!section) continue;
    await ctx.terminal.print(`  ${label}:`, {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
    for (const [key, value] of Object.entries(section)) {
      await ctx.terminal.print(`    • ${key}: ${value}`, {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      });
    }
  }
}

async function printMission(ctx: any, mission: any) {
  await ctx.terminal.print(`\nMISSION: ${mission.title}`, {
    color: TERMINAL_COLORS.primary,
    speed: "fast",
  });
  await ctx.terminal.print(mission.prompt, {
    color: TERMINAL_COLORS.secondary,
    speed: "fast",
  });
  if (Array.isArray(mission.tags) && mission.tags.length > 0) {
    await ctx.terminal.print(`Tags: ${mission.tags.join(", ")}`, {
      color: TERMINAL_COLORS.system,
      speed: "fast",
    });
  }
}

export const systemCommandsMiddleware: TerminalMiddleware = async (
  ctx,
  next
) => {
  const terminalContext = TerminalContext.getInstance();
  const raw = ctx.command.trim();
  if (!raw) return next();
  const normalized = raw.startsWith("/") ? raw.slice(1) : raw;
  const parts = normalized.split(/\s+/);
  const commandKey = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (!SYSTEM_COMMANDS.has(commandKey)) {
    return next();
  }

  const state = terminalContext.getState();
  const handle = terminalContext.ensureHandle("agent");

  const print = async (
    text: string,
    color: string = TERMINAL_COLORS.primary,
    speed: "fast" | "normal" | "instant" = "fast"
  ) => {
    await ctx.terminal.print(text, { color, speed });
  };

  if (commandKey === "help" || commandKey === "?" || commandKey === "help/" || commandKey === "help?" ) {
    await print("\nAvailable Commands:", TERMINAL_COLORS.system);
    await print("  help / ? / /help – Show this list", TERMINAL_COLORS.primary);
    await print("  reset | restart | new – Start a new agent session", TERMINAL_COLORS.primary);
    await print("  resume        – Resume the last session", TERMINAL_COLORS.primary);
    await print("  mission       – Accept the next mission", TERMINAL_COLORS.primary);
    await print("  report <text> – Submit mission evidence", TERMINAL_COLORS.primary);
    await print("  profile       – View profile (traits, skills, prefs)", TERMINAL_COLORS.primary);
    await print(
      "  profile set key=value – Update (e.g. preferences.verbosity=rich)",
      TERMINAL_COLORS.secondary
    );
    if (state.hasFullAccess) {
      await print("\nPrivileged:", TERMINAL_COLORS.system);
      await print("  dashboard     – Open Agent dashboard", TERMINAL_COLORS.primary);
      await print("  archive       – Open Archives dashboard", TERMINAL_COLORS.primary);
      await print("  ops list/run  – List/run operator tools", TERMINAL_COLORS.primary);
      await print("  oracle <q>    – Ask LOGOS off-record (admin)", TERMINAL_COLORS.primary);
      await print("  connect/disconnect/identify – Wallet ops", TERMINAL_COLORS.primary);
      await print("  glitch / rain / sound – Terminal effects", TERMINAL_COLORS.primary);
    }
    ctx.handled = true;
    return;
  }

  if (commandKey === "reset" || commandKey === "restart" || commandKey === "new") {
    try {
      const result = await fetchJSON("/api/session", {
        method: "POST",
        body: { handle, reset: true },
      });
      terminalContext.setSessionId(result.sessionId);
      terminalContext.setActiveMissionRun(undefined);
      terminalContext.setGameMessages([]);
      await ctx.terminal.clear();
      await print(`Session reset. Handle: ${handle}.`, TERMINAL_COLORS.system);
      // Re-render Adventure screen to replay the welcome/IF opening scene
      await ctx.terminal.emit("screen:transition", { to: "adventure" });
      ctx.handled = true;
      return;
    } catch (error: any) {
      await print(`Session reset failed: ${error.message}`, TERMINAL_COLORS.error);
      ctx.handled = true;
      return;
    }
  }

  if (commandKey === "resume") {
    try {
      const result = await fetchJSON("/api/session", {
        method: "POST",
        body: { handle, reset: false },
      });
      terminalContext.setSessionId(result.sessionId);
      await print(
        `Resumed session ${result.sessionId}.`,
        TERMINAL_COLORS.system
      );
    } catch (error: any) {
      await print(`No existing session found (${error.message}).`, TERMINAL_COLORS.warning);
    }
    ctx.handled = true;
    return;
  }

  // Admin-only oracle channel
  if (commandKey === "oracle") {
    if (!state.hasFullAccess) {
      await print("ACCESS DENIED - OVERRIDE REQUIRED", TERMINAL_COLORS.error);
      ctx.handled = true;
      return;
    }
    const input = args.join(" ");
    if (!input) {
      await print("Usage: oracle <question>", TERMINAL_COLORS.warning);
      ctx.handled = true;
      return;
    }
    try {
      const res = await fetch(`/api/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", name: "oracle-admin", input }),
      });
      if (res.body) {
        await ctx.terminal.processAIStream(res.body);
      } else {
        const text = await res.text();
        await print(text, TERMINAL_COLORS.primary);
      }
    } catch (e: any) {
      await print(`Oracle failed: ${e?.message || e}`, TERMINAL_COLORS.error);
    }
    ctx.handled = true;
    return;
  }

  if (commandKey === "profile") {
    const sessionId = await ensureSession(terminalContext, handle);
    if (!sessionId) {
      await print("Unable to establish session.", TERMINAL_COLORS.error);
      ctx.handled = true;
      return;
    }
    const sub = (args[0] || "view").toLowerCase();
    if (sub === "set") {
      const payload = buildProfilePayload(args.slice(1));
      if (Object.keys(payload).length === 0) {
        await print("Usage: profile set preferences.intensity=low", TERMINAL_COLORS.warning);
        ctx.handled = true;
        return;
      }
      try {
        const profile = await fetchJSON("/api/profile", {
          method: "PATCH",
          body: { sessionId, ...payload },
        });
        await print("Profile updated.", TERMINAL_COLORS.success);
        await printProfile(ctx, profile);
      } catch (error: any) {
        await print(`Profile update failed: ${error.message}`, TERMINAL_COLORS.error);
      }
    } else {
      try {
        const profile = await fetchJSON(`/api/profile?sessionId=${sessionId}`);
        await printProfile(ctx, profile);
      } catch (error: any) {
        await print(`Failed to load profile: ${error.message}`, TERMINAL_COLORS.error);
      }
    }
    ctx.handled = true;
    return;
  }

  if (commandKey === "mission") {
    const sessionId = await ensureSession(terminalContext, handle);
    if (!sessionId) {
      await print("Unable to establish session.", TERMINAL_COLORS.error);
      ctx.handled = true;
      return;
    }
    try {
      const result = await fetchJSON("/api/mission", {
        method: "POST",
        body: { sessionId },
      });
      if (!result?.missionRun) {
        await print("No missions available.", TERMINAL_COLORS.warning);
      } else {
        terminalContext.setActiveMissionRun(result.missionRun.id);
        await printMission(ctx, result.missionRun.mission);
        await print(
          `Mission run id: ${result.missionRun.id}. Submit evidence with 'report <text>'.`,
          TERMINAL_COLORS.system
        );
      }
    } catch (error: any) {
      await print(`Mission request failed: ${error.message}`, TERMINAL_COLORS.error);
    }
    ctx.handled = true;
    return;
  }

 if (commandKey === "report") {
    const submission = args.join(" ");
    if (!submission) {
      await print("Usage: report <evidence or link>", TERMINAL_COLORS.warning);
      ctx.handled = true;
      return;
    }
    const sessionId = await ensureSession(terminalContext, handle);
    if (!sessionId) {
      await print("Unable to establish session.", TERMINAL_COLORS.error);
      ctx.handled = true;
      return;
    }
    try {
      const result = await fetchJSON("/api/report", {
        method: "POST",
        body: {
          sessionId,
          missionRunId: terminalContext.getState().activeMissionRunId,
          content: submission,
        },
      });
      await print("Mission report submitted.", TERMINAL_COLORS.success);
      if (result.feedback) {
        await print(result.feedback, TERMINAL_COLORS.secondary);
      }
      if (typeof result.score === "number") {
        await print(`Score: ${(result.score * 100).toFixed(0)}%`, TERMINAL_COLORS.system);
      }
      if (result.reward) {
        await print(
          `Reward granted: ${result.reward.amount} ${result.reward.type}`,
          TERMINAL_COLORS.system
        );
      }
      terminalContext.setActiveMissionRun(undefined);
    } catch (error: any) {
      await print(`Report failed: ${error.message}`, TERMINAL_COLORS.error);
    }
    ctx.handled = true;
    return;
  }

  // Ops tool commands (file-based prompts)
  if (commandKey === "ops") {
    if (!state.hasFullAccess) {
      await print("ACCESS DENIED - OVERRIDE REQUIRED", TERMINAL_COLORS.error);
      ctx.handled = true;
      return;
    }
    const sub = (args[0] || "list").toLowerCase();
    if (sub === "list") {
      try {
        const res = await fetch(`/api/tools`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list" }),
        });
        const data = await res.json();
        const tools = (data?.tools || []) as Array<{
          name: string;
          title: string;
          description?: string;
        }>;
        if (tools.length === 0) {
          await print("No ops tools found.", TERMINAL_COLORS.warning);
        } else {
          await print("\nOPS TOOLS:", TERMINAL_COLORS.system);
          for (const t of tools) {
            await print(
              `  ${t.name} – ${t.title}${t.description ? `: ${t.description}` : ""}`,
              TERMINAL_COLORS.primary
            );
          }
          await print("\nRun: ops run <name> [input]", TERMINAL_COLORS.secondary);
        }
      } catch (e: any) {
        await print(`Failed to list tools: ${e?.message || e}`, TERMINAL_COLORS.error);
      }
      ctx.handled = true;
      return;
    }
    if (sub === "run") {
      const name = args[1];
      const input = args.slice(2).join(" ");
      if (!name) {
        await print("Usage: ops run <name> [input]", TERMINAL_COLORS.warning);
        ctx.handled = true;
        return;
      }
      try {
        const res = await fetch(`/api/tools`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run", name, input }),
        });
        if (res.body) {
          await ctx.terminal.processAIStream(res.body);
        } else {
          const text = await res.text();
          await print(text, TERMINAL_COLORS.primary);
        }
      } catch (e: any) {
        await print(`Failed to run tool: ${e?.message || e}`, TERMINAL_COLORS.error);
      }
      ctx.handled = true;
      return;
    }
    await print("Usage: ops list | ops run <name> [input]", TERMINAL_COLORS.warning);
    ctx.handled = true;
    return;
  }

  // Wallet and tool commands require full access
  if (!state.hasFullAccess) {
    return next();
  }

  switch (commandKey) {
    case "glitch": {
      const intensity = Math.max(0, Math.min(1, parseFloat(args[0] || "0.6")));
      const duration = Math.max(300, parseInt(args[1] || "2000", 10));
      await print(
        `\nGLITCH ${Math.round(intensity * 100)}% for ${duration}ms`,
        TERMINAL_COLORS.system
      );
      await ctx.terminal.emit("tool:glitch_screen", { intensity, duration });
      ctx.handled = true;
      return;
    }
    case "rain": {
      const duration = Math.max(300, parseInt(args[0] || "3000", 10));
      const intensity = Math.max(0, Math.min(1, parseFloat(args[1] || "0.8")));
      await print(
        `\nMATRIX RAIN ${Math.round(intensity * 100)}% for ${duration}ms`,
        TERMINAL_COLORS.system
      );
      await ctx.terminal.emit("tool:matrix_rain", { duration, intensity });
      ctx.handled = true;
      return;
    }
    case "sound": {
      const desc = args.join(" ") || "glitchy chime in a dark room";
      await print(`\nSOUND ▶ ${desc}`, TERMINAL_COLORS.system);
      await ctx.terminal.emit("tool:generate_sound", {
        description: desc,
        duration: 2000,
        influence: 0.6,
      });
      ctx.handled = true;
      return;
    }
    case "connect": {
      try {
        await print("\nInitiating wallet connection sequence...", TERMINAL_COLORS.system, "normal");
        const walletService = new WalletService();
        const address = await walletService.connect();
        terminalContext.setState({
          walletConnected: true,
          walletAddress: address,
        });
        await print(`\nWallet connected: ${address}`, TERMINAL_COLORS.success, "normal");
        const balance = await walletService.checkTokenBalance();
        terminalContext.setState({ tokenBalance: balance });
        if (balance > 0) {
          await print("\nPROJECT89 token detected", TERMINAL_COLORS.success, "normal");
          await print(`Balance: ${balance} P89`, TERMINAL_COLORS.primary, "normal");
          await print(
            "\nPlease use 'identify' command to begin initialization sequence.",
            TERMINAL_COLORS.warning,
            "normal"
          );
        } else {
          await print("\nNo PROJECT89 tokens found", TERMINAL_COLORS.error, "normal");
          await print(
            "Please acquire P89 tokens to access advanced features",
            TERMINAL_COLORS.warning,
            "normal"
          );
        }
      } catch (error: any) {
        console.error("Wallet connection error:", error);
        await print(`\nConnection error: ${error.message}`, TERMINAL_COLORS.error, "normal");
        terminalContext.setState({
          walletConnected: false,
          walletAddress: undefined,
          tokenBalance: undefined,
        });
        if (error.message.includes("install")) {
          await print("\nVisit phantom.app to install the wallet", TERMINAL_COLORS.warning, "normal");
        }
      }
      ctx.handled = true;
      return;
    }
    case "identify": {
      if (!state.walletConnected || !state.walletAddress) {
        await print(
          "\nERROR: No wallet connection detected. Please connect wallet first.",
          TERMINAL_COLORS.error,
          "normal"
        );
      } else {
        await print("\nInitiating identification sequence...", TERMINAL_COLORS.system, "normal");
        await ctx.terminal.emit("screen:transition", {
          to: "scanning",
          options: { type: "fade", duration: 500 },
        });
      }
      ctx.handled = true;
      return;
    }
    case "disconnect": {
      try {
        if (!state.walletConnected) {
          await print("\nNo wallet currently connected.", TERMINAL_COLORS.warning, "normal");
          ctx.handled = true;
          return;
        }
        const walletService = new WalletService();
        await walletService.disconnect();
        terminalContext.setState({
          walletConnected: false,
          walletAddress: undefined,
          tokenBalance: undefined,
        });
        await print("\nWallet disconnected successfully.", TERMINAL_COLORS.success, "normal");
      } catch (error: any) {
        await print(`\nDisconnection error: ${error.message}`, TERMINAL_COLORS.error, "normal");
      }
      ctx.handled = true;
      return;
    }
    default:
      return next();
  }
};
