/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { Terminal } from "@/app/lib/terminal/Terminal";

class MockImage {
  public decoding = "async";
  public naturalWidth = 1920;
  public naturalHeight = 1080;
  public width = 1920;
  public height = 1080;
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;

  set src(_value: string) {
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }
}

describe("Terminal inline image blocks", () => {
  it("appends loading inline image entries and upgrades them after decode", async () => {
    const originalImage = (globalThis as any).Image;
    vi.stubGlobal("Image", MockImage as any);

    const terminalStub: any = {
      renderer: {
        getInlineImageMaxWidth: () => 640,
        getInlineImagePlaceholderHeight: () => 360,
        getInlineImageTotalHeight: (h: number) => h + 20,
        fitInlineImageDimensions: () => ({ width: 640, height: 300 }),
      },
      buffer: [],
      currentPrintY: 50,
      isAtBottom: false,
      render: vi.fn(),
      scrollToLatest: vi.fn(),
    };

    await (Terminal.prototype.printInlineImage as any).call(
      terminalStub,
      "https://example.com/render.png",
      { label: "scene continuity" }
    );

    expect(terminalStub.buffer).toHaveLength(1);
    expect(terminalStub.buffer[0].kind).toBe("image");
    expect(terminalStub.buffer[0].imageStatus).toBe("loading");
    expect(terminalStub.currentPrintY).toBe(430);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(terminalStub.buffer[0].imageStatus).toBe("ready");
    expect(terminalStub.buffer[0].displayHeight).toBe(300);
    expect(terminalStub.currentPrintY).toBe(370);
    expect(terminalStub.render).toHaveBeenCalled();
    expect(terminalStub.scrollToLatest).toHaveBeenCalled();

    (globalThis as any).Image = originalImage;
  });

  it("serializes inline images as markers in exported buffer text", () => {
    const terminalStub: any = {
      buffer: [
        { kind: "text", text: "You inspect the desk." },
        { kind: "image", text: "", imageStatus: "ready" },
        { kind: "text", text: "A hidden note appears." },
      ],
    };

    const text = (Terminal.prototype.getBufferText as any).call(terminalStub);
    expect(text).toContain("[INLINE_IMAGE]");
    expect(text).toContain("You inspect the desk.");
    expect(text).toContain("A hidden note appears.");
  });
});
