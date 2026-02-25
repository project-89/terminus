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
    await handler.processCommand("  examine vision  ");

    expect(print).toHaveBeenCalledTimes(1);
    expect(print).toHaveBeenCalledWith("> examine vision", {
      color: "#00f7ff",
      speed: "instant",
    });
    expect(handleCommand).toHaveBeenCalledTimes(1);
    expect(handleCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "examine vision",
        args: ["examine", "vision"],
      })
    );
  });
});
