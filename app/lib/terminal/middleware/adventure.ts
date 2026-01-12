import { TERMINAL_COLORS } from "../constants";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { ToolExecution, processToolCall } from "../tools/registry";
import { AdventureScreen } from "../screens/AdventureScreen";
import { TerminalContext } from "../TerminalContext";
import { analytics } from "@/app/lib/analytics";
import {
  TerminalMiddleware,
  TerminalContext as CommandContext,
} from "../types";

export const adventureMiddleware: TerminalMiddleware = async (
  ctx: CommandContext,
  next: () => Promise<void>
) => {
  // Only process commands if we're in the adventure screen
  const currentScreen = ctx.terminal.context?.currentScreen;
  if (!(currentScreen instanceof AdventureScreen)) {
    return next();
  }

  // Skip if command was already handled (like by override middleware)
  if (ctx.handled || ctx.command.startsWith("!")) {
    return next();
  }

  // Skip empty commands (can happen from race conditions or duplicate calls)
  if (!ctx.command || !ctx.command.trim()) {
    console.log("[Adventure] Skipping empty command");
    return next();
  }

  // Track that we're handling this command
  ctx.handled = true;

  try {
    const context = TerminalContext.getInstance();
    const handle = context.ensureHandle("agent");
    // IMPORTANT: Pass reset: false to reuse existing session, not create new one
    const sessionId = await context.ensureSession({ handle, reset: false });
    if (!sessionId) {
      await ctx.terminal.print("Failed to establish session with the Logos.", {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      ctx.handled = true;
      return;
    }

    const state = context.getState();
    let chatHistory = context.getGameMessages();
    const userMessage = {
      role: "user",
      content: ctx.command,
    };

    let reportSummary: string | null = null;

    if (state.expectingReport) {
      if (!state.activeMissionRunId) {
        await ctx.terminal.print(
          "The Logos expected a mission run, but none is active.",
          {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          }
        );
      } else {
        try {
          const response = await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              missionRunId: state.activeMissionRunId,
              content: ctx.command,
            }),
          });
          if (!response.ok) {
            throw new Error(`Report failed (${response.status})`);
          }
          const result = await response.json();

          context.setExpectingReport(false);
          context.setActiveMissionRun(undefined);

          await ctx.terminal.print("\nMission report received.", {
            color: TERMINAL_COLORS.system,
            speed: "normal",
          });
          if (result.feedback) {
            await ctx.terminal.print(result.feedback, {
              color: TERMINAL_COLORS.secondary,
              speed: "normal",
            });
          }
          if (typeof result.score === "number") {
            await ctx.terminal.print(
              `Score: ${(result.score * 100).toFixed(0)}%`,
              {
                color: TERMINAL_COLORS.system,
                speed: "fast",
              }
            );
          }
          if (result.reward) {
            await ctx.terminal.print(
              `Reward: ${result.reward.amount} ${result.reward.type}`,
              {
                color: TERMINAL_COLORS.primary,
                speed: "fast",
              }
            );
          }

          const scorePercent =
            typeof result.score === "number"
              ? `${Math.round(result.score * 100)}%`
              : "N/A";
          reportSummary = `Mission report submitted. Score ${scorePercent}. Reward ${
            result.reward?.amount ?? 0
          } ${result.reward?.type ?? "CREDIT"}.`;
        } catch (error: any) {
          console.error("report submission failed", error);
          await ctx.terminal.print(
            `Failed to submit report: ${error.message}`,
            {
              color: TERMINAL_COLORS.error,
              speed: "normal",
            }
          );
        }
      }
    }

    // Add user message to history
    chatHistory.push(userMessage);

    if (reportSummary) {
      chatHistory.push({
        role: "system",
        content: reportSummary,
      });
    }

    // Start loading animation BEFORE the API call
    ctx.terminal.startGeneration();

    // Get AI response
    const stream = await getAdventureResponse(chatHistory, {
      sessionId,
      handle,
      userId: state.userId,
      activeMissionRunId: context.getState().activeMissionRunId,
      reportJustSubmitted: Boolean(reportSummary),
      accessTier: state.accessTier ?? 0,
      hasFullAccess: Boolean(state.hasFullAccess),
    });
    if (!stream) {
      throw new Error("Failed to get adventure response");
    }

    // Process and store the AI response
    const aiResponse = await ctx.terminal.processAIStream(stream);

    // Add AI response to chat history
    chatHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    // Update chat history with both messages
    context.setGameMessages(chatHistory);

    // CRITICAL: Sync messages to database immediately (don't rely on reconnect)
    try {
      const syncRes = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: chatHistory,
        }),
      });
      if (!syncRes.ok) {
        if (syncRes.status === 404) {
          // Session doesn't exist - clear cached sessionId so next command creates a new one
          console.warn("[Adventure] Session not found during sync, clearing cached sessionId");
          context.setSessionId(undefined);
        } else {
          console.error("[Adventure] Sync failed:", syncRes.status);
        }
      }
    } catch (syncError) {
      console.error("[Adventure] Failed to sync messages to server:", syncError);
    }

    // Check identity status periodically and show prompts
    const identityStatus = await context.checkIdentityStatus();
    if (identityStatus?.promptIdentityLock && identityStatus.narrative) {
      await ctx.terminal.print(identityStatus.narrative, {
        color: TERMINAL_COLORS.warning,
        speed: "normal",
      });
    }
  } catch (error) {
    console.error("Adventure middleware error:", error);
    // Ensure loading indicator is stopped on error
    ctx.terminal.endGeneration();
    await ctx.terminal.print("Error processing command", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
  }
};
