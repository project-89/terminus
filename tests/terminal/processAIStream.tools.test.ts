import { describe, it, expect, vi } from "vitest";
import { Terminal } from "@/app/lib/terminal/Terminal";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

function makeStream(chunks: string[]): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

async function runStream(chunks: string[]) {
  const printed: string[] = [];
  const terminalStub = {
    startGeneration: vi.fn(),
    endGeneration: vi.fn(),
    print: vi.fn(async (text: string) => {
      printed.push(text);
    }),
  };

  const output = await (Terminal.prototype.processAIStream as any).call(
    terminalStub,
    makeStream(chunks)
  );

  return {
    output: String(output),
    printed,
    terminalStub,
  };
}

describe("Terminal.processAIStream tool filtering", () => {
  it("executes and hides single-line tool JSON", async () => {
    const handler = vi.fn();
    toolEvents.on("tool:experiment_note", handler);

    const result = await runStream([
      '{"tool":"experiment_note","parameters":{"id":"exp-1","observation":"noted"}}\n',
      "The corridor hums softly.\n",
    ]);

    toolEvents.off("tool:experiment_note", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result.output).toContain("The corridor hums softly.");
    expect(result.output).not.toContain('"tool":"experiment_note"');
    expect(result.printed.join("\n")).not.toContain('"tool":"experiment_note"');
  });

  it("executes and hides multi-line tool JSON fragments", async () => {
    const handler = vi.fn();
    toolEvents.on("tool:experiment_note", handler);

    const result = await runStream([
      '{"tool":"experiment_note","parameters":{"id":"exp-2",\n',
      '"observation":"split but valid"}}\n',
      "A figure watches in silence.\n",
    ]);

    toolEvents.off("tool:experiment_note", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result.output).toContain("A figure watches in silence.");
    expect(result.output).not.toContain('"tool":"experiment_note"');
  });

  it("swallows malformed tool fragments and keeps narrative output", async () => {
    const handler = vi.fn();
    toolEvents.on("tool:experiment_note", handler);

    const result = await runStream([
      '{"tool":"experiment_note","parameters":{"id":"exp-\n',
      '123","observation":"broken"}}\n',
      "The lights settle into a steady pulse.\n",
    ]);

    toolEvents.off("tool:experiment_note", handler);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(result.output).toContain("The lights settle into a steady pulse.");
    expect(result.output).not.toContain("experiment_note");
    expect(result.output).not.toContain('"observation":"broken"');
  });

  it("executes and hides tool payloads with padded JSON keys", async () => {
    const handler = vi.fn();
    toolEvents.on("tool:experiment_note", handler);

    const result = await runStream([
      '{ " tool " : "experiment_note", " parameters " : { "id":"exp-3","observation":"normalized" } }\n',
      "The static settles into a low whisper.\n",
    ]);

    toolEvents.off("tool:experiment_note", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result.output).toContain("The static settles into a low whisper.");
    expect(result.output).not.toContain("experiment_note");
    expect(result.printed.join("\n")).not.toContain("experiment_note");
  });

  it("suppresses standalone prompt-marker lines from streamed content", async () => {
    const result = await runStream([
      ">\n",
      "The monitor stabilizes.\n",
    ]);

    expect(result.output).toContain("The monitor stabilizes.");
    expect(result.output).not.toContain("\n>\n");
    expect(result.printed).not.toContain(">");
  });

  it("does not emit trailing spacer lines when the stream ends after a blank line", async () => {
    const result = await runStream([
      "The hum fades.\n",
      "\n",
    ]);

    expect(result.output).toContain("The hum fades.");
    expect(result.printed[result.printed.length - 1]).toBe("The hum fades.");
  });

  it("preserves explicit paragraph breaks in streamed narrative", async () => {
    const result = await runStream([
      "The hallway hums.\n",
      "\n",
      "A second pulse follows.\n",
    ]);

    expect(result.printed).toEqual([
      "The hallway hums.",
      "",
      "A second pulse follows.",
    ]);
  });

  it("suppresses only the first spacer immediately after a tool payload", async () => {
    const handler = vi.fn();
    toolEvents.on("tool:experiment_note", handler);

    const result = await runStream([
      '{"tool":"experiment_note","parameters":{"id":"exp-4","observation":"ok"}}\n',
      "\n",
      "Signal restored.\n",
    ]);

    toolEvents.off("tool:experiment_note", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result.printed[0]).toBe("Signal restored.");
    expect(result.printed).not.toContain("");
  });

  it("keeps paragraph spacing when a tool payload appears between paragraphs", async () => {
    const handler = vi.fn();
    toolEvents.on("tool:experiment_note", handler);

    const result = await runStream([
      "The signal holds.\n",
      '{"tool":"experiment_note","parameters":{"id":"exp-5","observation":"between"}}\n',
      "\n",
      "You feel the room settle.\n",
    ]);

    toolEvents.off("tool:experiment_note", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result.printed).toEqual([
      "The signal holds.",
      "",
      "You feel the room settle.",
    ]);
  });
});
