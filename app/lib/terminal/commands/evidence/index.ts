import { CommandConfig } from "../types";
import { TerminalContext } from "../../TerminalContext";
import { TERMINAL_COLORS } from "../../Terminal";
import { toolEvents } from "../../tools/registry";

async function openFilePicker(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,audio/*,.pdf,.txt,.md";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = () => {
      const file = input.files?.[0] || null;
      input.remove();
      resolve(file);
    };

    input.oncancel = () => {
      input.remove();
      resolve(null);
    };

    input.click();
  });
}

async function submitEvidence(ctx: any, file: File | null, textReport?: string) {
  const context = TerminalContext.getInstance();
  const handle = context.ensureHandle();
  const activeMission = context.getState().activeMissionRunId;

  await ctx.terminal.print("\n[TRANSMITTING EVIDENCE...]", {
    color: TERMINAL_COLORS.system,
    speed: "normal",
  });

  try {
    const formData = new FormData();
    formData.append("handle", handle);

    if (activeMission) {
      formData.append("missionId", activeMission);
    }

    let evidenceDescription = "";
    if (file) {
      formData.append("file", file);
      const fileType = file.type.split("/")[0];
      evidenceDescription = `[${fileType.toUpperCase()} EVIDENCE: ${file.name}]`;
      await ctx.terminal.print(`File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`, {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      });
    }

    if (textReport) {
      formData.append("textReport", textReport);
      evidenceDescription = textReport;
    }

    const response = await fetch("/api/evidence", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Submission failed");
    }

    const result = await response.json();

    await ctx.terminal.print("\n[ANALYSIS COMPLETE]", {
      color: TERMINAL_COLORS.success,
      speed: "normal",
    });

    if (result.analysis) {
      await ctx.terminal.print(`\n${result.analysis.summary}`, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });

      if (result.analysis.symbols?.length > 0) {
        await ctx.terminal.print(`\nSymbols detected: ${result.analysis.symbols.join(", ")}`, {
          color: TERMINAL_COLORS.warning,
          speed: "fast",
        });
      }

      if (result.analysis.anomalies?.length > 0) {
        await ctx.terminal.print(`\nAnomalies: ${result.analysis.anomalies.join(", ")}`, {
          color: TERMINAL_COLORS.error,
          speed: "fast",
        });
      }

      await ctx.terminal.print(`\nRelevance: ${(result.analysis.relevance_score * 100).toFixed(0)}%`, {
        color: result.analysis.relevance_score >= 0.6 ? TERMINAL_COLORS.success : TERMINAL_COLORS.warning,
        speed: "fast",
      });

      const analysisMessage = formatEvidenceForAI(result, evidenceDescription);
      context.addGameMessage({ role: "user", content: analysisMessage });
    }

    if (result.message) {
      await ctx.terminal.print(`\n${result.message}`, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }

    if (result.missionUpdate) {
      const remaining = result.missionUpdate.objectives?.filter(
        (o: any) => o.required && !o.completed
      ).length || 0;

      if (remaining === 0) {
        await ctx.terminal.print("\n[ALL OBJECTIVES COMPLETE - AWAITING EVALUATION]", {
          color: TERMINAL_COLORS.success,
          speed: "normal",
        });
      } else {
        await ctx.terminal.print(`\n${remaining} objective(s) remaining.`, {
          color: TERMINAL_COLORS.system,
          speed: "fast",
        });
      }
    }

    toolEvents.emit("evidence:submitted", result);

  } catch (error: any) {
    await ctx.terminal.print(`\n[TRANSMISSION FAILED: ${error.message}]`, {
      color: TERMINAL_COLORS.error,
      speed: "normal",
    });
  }
}

function formatEvidenceForAI(result: any, evidenceDescription: string): string {
  const analysis = result.analysis;
  const typeLabel = result.evidenceType?.toUpperCase() || "EVIDENCE";
  const isVideo = result.evidenceType === "video";
  
  let message = `[EVIDENCE SUBMISSION - ${typeLabel}${isVideo ? " (HIGH FIDELITY)" : ""}]\n`;
  message += `Agent submitted: ${evidenceDescription}\n\n`;
  message += `GEMINI VISION ANALYSIS:\n`;
  message += `Summary: ${analysis.summary}\n`;
  
  if (analysis.objects?.length > 0) {
    message += `Objects identified: ${analysis.objects.join(", ")}\n`;
  }
  if (analysis.text_detected?.length > 0) {
    message += `Text detected: ${analysis.text_detected.join(", ")}\n`;
  }
  if (analysis.symbols?.length > 0) {
    message += `Symbols: ${analysis.symbols.join(", ")}\n`;
  }
  if (analysis.locations?.length > 0) {
    message += `Locations: ${analysis.locations.join(", ")}\n`;
  }
  if (analysis.anomalies?.length > 0) {
    message += `Anomalies: ${analysis.anomalies.join(", ")}\n`;
  }
  
  message += `\nRelevance Score: ${(analysis.relevance_score * 100).toFixed(0)}%`;
  if (isVideo) {
    message += ` (Video evidence weighted +20%)`;
  }
  message += `\nAssessment: ${analysis.assessment}\n`;
  message += `\nFull description: ${analysis.raw_description}`;
  
  return message;
}

export const evidenceCommands: CommandConfig[] = [
  {
    name: "!upload",
    type: "game",
    description: "Upload evidence (image, video, audio, document)",
    handler: async (ctx) => {
      await ctx.terminal.print("\n[OPENING SECURE CHANNEL...]", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      const file = await openFilePicker();

      if (!file) {
        await ctx.terminal.print("[TRANSMISSION CANCELLED]", {
          color: TERMINAL_COLORS.warning,
          speed: "fast",
        });
        return;
      }

      await submitEvidence(ctx, file);
    },
  },
  {
    name: "!submit",
    type: "game",
    description: "Submit a text report as evidence",
    handler: async (ctx) => {
      const [_, ...args] = ctx.command.split(" ");
      const report = args.join(" ");

      if (!report.trim()) {
        await ctx.terminal.print("Usage: !submit <your observation or report>", {
          color: TERMINAL_COLORS.warning,
          speed: "fast",
        });
        return;
      }

      await submitEvidence(ctx, null, report);
    },
  },
  {
    name: "!evidence",
    type: "game",
    description: "Show evidence submission options",
    handler: async (ctx) => {
      await ctx.terminal.print("\n[EVIDENCE SUBMISSION PROTOCOLS]", {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
      await ctx.terminal.print("\n!upload  - Upload file (image, video, audio, document)", {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      });
      await ctx.terminal.print("!submit <text>  - Submit text observation/report", {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      });
      await ctx.terminal.print("!mission  - View current mission objectives", {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      });

      const context = TerminalContext.getInstance();
      const activeMission = context.getState().activeMissionRunId;
      if (activeMission) {
        await ctx.terminal.print(`\nActive mission: ${activeMission}`, {
          color: TERMINAL_COLORS.success,
          speed: "fast",
        });
      } else {
        await ctx.terminal.print("\nNo active mission. Evidence will be logged for analysis.", {
          color: TERMINAL_COLORS.system,
          speed: "fast",
        });
      }
    },
  },
  {
    name: "!dream",
    type: "game",
    description: "Record a dream for analysis",
    handler: async (ctx) => {
      const [_, ...args] = ctx.command.split(" ");
      const dreamContent = args.join(" ");

      if (!dreamContent.trim()) {
        await ctx.terminal.print("Usage: !dream <describe your dream>", {
          color: TERMINAL_COLORS.warning,
          speed: "fast",
        });
        await ctx.terminal.print("\nTell me what you saw. The symbols matter.", {
          color: TERMINAL_COLORS.system,
          speed: "normal",
        });
        return;
      }

      const context = TerminalContext.getInstance();
      const handle = context.ensureHandle();

      await ctx.terminal.print("\n[PROCESSING DREAM IMAGERY...]", {
        color: TERMINAL_COLORS.system,
        speed: "normal",
      });

      try {
        const response = await fetch("/api/dream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record",
            handle,
            content: dreamContent,
          }),
        });

        if (!response.ok) throw new Error("Dream recording failed");

        const result = await response.json();

        await ctx.terminal.print("\n[DREAM LOGGED]", {
          color: TERMINAL_COLORS.success,
          speed: "normal",
        });

        if (result.symbols?.length > 0) {
          await ctx.terminal.print(`\nSymbols: ${result.symbols.join(", ")}`, {
            color: TERMINAL_COLORS.secondary,
            speed: "fast",
          });
        }

        if (result.emotions?.length > 0) {
          await ctx.terminal.print(`Emotions: ${result.emotions.join(", ")}`, {
            color: TERMINAL_COLORS.secondary,
            speed: "fast",
          });
        }

        if (result.recurrence > 1) {
          await ctx.terminal.print(`\nThis dream echoes ${result.recurrence} times. Pay attention.`, {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          });
        }

        if (result.lucidity >= 5) {
          await ctx.terminal.print("\nHigh lucidity detected. You are learning to see.", {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });
        }

      } catch (error: any) {
        await ctx.terminal.print(`\n[ERROR: ${error.message}]`, {
          color: TERMINAL_COLORS.error,
          speed: "fast",
        });
      }
    },
  },
  {
    name: "!patterns",
    type: "game",
    description: "View detected dream patterns",
    handler: async (ctx) => {
      const context = TerminalContext.getInstance();
      const handle = context.ensureHandle();

      try {
        const response = await fetch("/api/dream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "patterns",
            handle,
          }),
        });

        if (!response.ok) throw new Error("Pattern analysis failed");

        const patterns = await response.json();

        await ctx.terminal.print("\n[DREAM PATTERN ANALYSIS]", {
          color: TERMINAL_COLORS.primary,
          speed: "normal",
        });

        await ctx.terminal.print(`\nTotal dreams logged: ${patterns.totalDreams}`, {
          color: TERMINAL_COLORS.secondary,
          speed: "fast",
        });

        await ctx.terminal.print(`Average lucidity: ${patterns.lucidityAverage.toFixed(1)}/10`, {
          color: TERMINAL_COLORS.secondary,
          speed: "fast",
        });

        if (patterns.recurringThemes?.length > 0) {
          await ctx.terminal.print(`\nRecurring themes: ${patterns.recurringThemes.join(", ")}`, {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          });
        }

        if (patterns.insights?.length > 0) {
          await ctx.terminal.print("\n[INSIGHTS]", {
            color: TERMINAL_COLORS.primary,
            speed: "normal",
          });
          for (const insight of patterns.insights) {
            await ctx.terminal.print(`\n${insight}`, {
              color: TERMINAL_COLORS.highlight,
              speed: "normal",
            });
          }
        }

      } catch (error: any) {
        await ctx.terminal.print(`\n[ERROR: ${error.message}]`, {
          color: TERMINAL_COLORS.error,
          speed: "fast",
        });
      }
    },
  },
];
