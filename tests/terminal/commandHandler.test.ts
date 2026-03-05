import { describe, it, expect, vi } from "vitest";
import { CommandHandler } from "@/app/lib/terminal/components/CommandHandler";

describe("CommandHandler.processCommand", () => {
  it("ignores empty commands without echoing a prompt line", async () => {
    const print = vi.fn();
    const handleCommand = vi.fn();
    const terminalStub = {
      print,
      options: {
        foregroundColor: "#00f7ff",
      },
      context: {
        currentScreen: {
          handleCommand,
        },
      },
    } as any;

    const handler = new CommandHandler(terminalStub);
    await handler.processCommand("   ");

    expect(print).not.toHaveBeenCalled();
    expect(handleCommand).not.toHaveBeenCalled();
  });

  it("echoes and forwards normalized commands", async () => {
    const print = vi.fn();
    const handleCommand = vi.fn();
    const terminalStub = {
      print,
      buffer: [],
      options: {
        foregroundColor: "#00f7ff",
        colors: {
          highlight: "#ffffff",
        },
      },
      context: {
        currentScreen: {
          handleCommand,
        },
      },
    } as any;

    const handler = new CommandHandler(terminalStub);
    await handler.processCommand("  examine vision  ");

    expect(print).toHaveBeenCalledTimes(2);
    expect(print).toHaveBeenCalledWith("> examine vision", {
      color: "#ffffff",
      speed: "instant",
    });
    expect(print).toHaveBeenCalledWith("", { speed: "instant" });
    expect(handleCommand).toHaveBeenCalledTimes(1);
    expect(handleCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "examine vision",
        args: ["examine", "vision"],
      })
    );
  });

  it("inserts a spacer line before the prompt when output already exists", async () => {
    const print = vi.fn();
    const handleCommand = vi.fn();
    const terminalStub = {
      print,
      buffer: [{ text: "Existing output" }],
      options: {
        foregroundColor: "#00f7ff",
        colors: {
          highlight: "#ffffff",
        },
      },
      context: {
        currentScreen: {
          handleCommand,
        },
      },
    } as any;

    const handler = new CommandHandler(terminalStub);
    await handler.processCommand("look");

    expect(print).toHaveBeenNthCalledWith(1, "", { speed: "instant" });
    expect(print).toHaveBeenNthCalledWith(2, "> look", {
      color: "#ffffff",
      speed: "instant",
    });
    expect(print).toHaveBeenNthCalledWith(3, "", { speed: "instant" });
  });
});
