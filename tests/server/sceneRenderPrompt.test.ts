import { describe, it, expect } from "vitest";
import {
  buildSceneRenderPrompt,
  choosePuzzleClue,
} from "@/app/lib/server/sceneRenderPrompt";

describe("sceneRenderPrompt", () => {
  it("chooses unresolved puzzle hint when available", () => {
    const clue = choosePuzzleClue(
      [
        { id: "p1", name: "Locked Drawer", hint: "A brass key etched with 89", solved: false },
        { id: "p2", name: "Static Door", hint: "Door hums on odd turns", solved: false },
      ],
      []
    );

    expect(clue).toContain("brass key");
  });

  it("falls back to puzzle name when no hint exists", () => {
    const clue = choosePuzzleClue([{ id: "p1", name: "Signal Wheel", solved: false }], []);
    expect(clue).toContain("Signal Wheel");
  });

  it("builds a scene prompt with core grounding fields", () => {
    const prompt = buildSceneRenderPrompt({
      roomId: "platform-55",
      roomName: "Platform 55",
      region: "Subway",
      roomDescription: "A dim station with flickering lights and old tile.",
      visibleObjects: ["rusted trashcan", "flickering bulbs"],
      visibleObjectDetails: [
        "walls: yellowing tiles and cracked cement",
        "graffiti: layered tags and faded symbols",
      ],
      inventory: ["lighter"],
      recentMoments: ["USER: look", "ASSISTANT: The bulbs flicker unevenly."],
      playerFocus: "emphasize the tunnel mouth",
      clueHint: "A faint spiral hidden in graffiti.",
    });

    expect(prompt).toContain("Platform 55");
    expect(prompt).toContain("Visible objects");
    expect(prompt).toContain("Inventory context");
    expect(prompt.toLowerCase()).toContain("optional covert clue");
    expect(prompt.toLowerCase()).toContain("no subtitles");
    expect(prompt.toLowerCase()).toContain("no low-poly");
    expect(prompt.toLowerCase()).toContain("bodiless viewpoint");
    expect(prompt.toLowerCase()).toContain("matrix-like cyber-noir");
    expect(prompt.toLowerCase()).toContain("object detail anchors");
    expect(prompt.toLowerCase()).not.toContain("nano banana");
    expect(prompt.toLowerCase()).not.toContain("gemini 3 pro image");
  });
});
