import { describe, it, expect, vi } from "vitest";
import { ScreenCommandRegistry } from "@/app/lib/terminal/commands/registry";

describe("ScreenCommandRegistry", () => {
  it("matches commands by base token when arguments are present", () => {
    const registry = new ScreenCommandRegistry();
    const handler = vi.fn();
    registry.registerCommand({
      name: "!activate",
      type: "system",
      description: "Apply referral code",
      handler,
    });

    const command = registry.getCommand("!activate CODE-1234");
    expect(command).toBeDefined();
    expect(command?.name).toBe("!activate");
  });

  it("matches commands case-insensitively", () => {
    const registry = new ScreenCommandRegistry();
    const handler = vi.fn();
    registry.registerCommand({
      name: "!whoami",
      type: "system",
      description: "Identity status",
      handler,
    });

    const command = registry.getCommand("!WHOAMI");
    expect(command).toBeDefined();
    expect(command?.name).toBe("!whoami");
  });
});

