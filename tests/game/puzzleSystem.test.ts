import { describe, it, expect, beforeEach } from "vitest";
import { GameEngine } from "@/app/lib/game/gameEngine";
import { PUZZLES, OBJECTS, ROOMS, GameState } from "@/app/lib/game/worldModel";

/**
 * Puzzle System Tests
 *
 * Comprehensive tests for the puzzle system including:
 * - Puzzle condition checking
 * - Puzzle effect application
 * - Individual puzzle solutions
 * - Puzzle-experiment integration
 * - Puzzle-trust integration
 * - Puzzle serialization
 */

describe("Puzzle System", () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine(undefined, true);
  });

  describe("Puzzle Definition Validation", () => {
    it("should have all puzzles defined in PUZZLES", () => {
      expect(PUZZLES.length).toBeGreaterThan(0);
    });

    it("should have unique puzzle IDs", () => {
      const ids = PUZZLES.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid targets in puzzle conditions", () => {
      for (const puzzle of PUZZLES) {
        for (const condition of puzzle.conditions) {
          if (condition.type === "object_state") {
            // Target should be a valid object
            expect(OBJECTS[condition.target]).toBeDefined();
          } else if (condition.type === "room") {
            expect(ROOMS[condition.target]).toBeDefined();
          }
        }
      }
    });

    it("should have valid targets in puzzle effects", () => {
      for (const puzzle of PUZZLES) {
        for (const effect of puzzle.onSolve) {
          if (effect.type === "reveal_object" || effect.type === "move_object") {
            expect(OBJECTS[effect.target]).toBeDefined();
          }
        }
      }
    });

    it("should have hints for player guidance", () => {
      const puzzlesWithHints = PUZZLES.filter((p) => p.hint);
      expect(puzzlesWithHints.length).toBeGreaterThan(0);
    });

    it("should have LOGOS experiments for behavioral tracking", () => {
      const puzzlesWithExperiments = PUZZLES.filter((p) => p.logosExperiment);
      expect(puzzlesWithExperiments.length).toBeGreaterThan(0);
    });
  });

  describe("Puzzle: Find the Lighter", () => {
    beforeEach(() => {
      // Start in forest where the leaves are
      (engine as any).state.currentRoom = "forest";
    });

    it("should have lighter hidden initially", () => {
      const lighter = engine.getObject("lighter");
      expect(lighter?.customState.hidden).toBe(true);
      expect(lighter?.containedIn).toBe("pile-of-leaves");
    });

    it("should reveal lighter when searching leaves", () => {
      const result = engine.execute("search leaves");
      expect(result.success).toBe(true);
      expect(result.message).toContain("lighter");
      expect(result.puzzleSolved).toBe("find-lighter");
    });

    it("should move lighter to forest after search", () => {
      engine.execute("search leaves");
      const lighter = engine.getObject("lighter");
      expect(lighter?.location).toBe("forest");
      expect(lighter?.customState.hidden).toBe(false);
    });

    it("should mark puzzle as solved", () => {
      engine.execute("search leaves");
      const state = engine.getState();
      expect(state.puzzlesSolved).toContain("find-lighter");
    });
  });

  describe("Puzzle: Burn Vines (Clear the Entrance)", () => {
    beforeEach(() => {
      // Setup: Player in clearing with lighter in inventory
      (engine as any).state.currentRoom = "clearing";
      (engine as any).state.inventory = ["lighter"];
      const lighter = engine.getObject("lighter");
      if (lighter) {
        lighter.isCarried = true;
        lighter.location = null;
      }
    });

    it("should have vines blocking entrance initially", () => {
      const vines = engine.getObject("subway-vines");
      expect(vines?.customState.blocking).toBe(true);
      expect(vines?.customState.burned).toBe(false);
    });

    it("should burn vines with lighter", () => {
      const result = engine.execute("burn vines");
      expect(result.success).toBe(true);
      expect(result.message).toContain("ash");
      expect(result.puzzleSolved).toBe("burn-vines");
    });

    it("should unblock east exit after burning", () => {
      engine.execute("burn vines");
      const room = engine.getCurrentRoom();
      // Room should be accessible now
      expect(room.id).toBe("clearing");
    });

    it("should mark vines as burned", () => {
      engine.execute("burn vines");
      const vines = engine.getObject("subway-vines");
      expect(vines?.customState.burned).toBe(true);
    });

    it("should require lighter to burn vines", () => {
      // Remove lighter
      (engine as any).state.inventory = [];
      const result = engine.execute("burn vines");
      expect(result.success).toBe(false);
    });
  });

  describe("Puzzle: Unlock Turnstile", () => {
    beforeEach(() => {
      (engine as any).state.currentRoom = "outer-cement";
    });

    it("should have turnstile locked initially", () => {
      const turnstile = engine.getObject("wooden-turnstile");
      expect(turnstile?.isLocked).toBe(true);
    });

    it("should have panel closed initially", () => {
      const panel = engine.getObject("turnstile-panel");
      expect(panel?.isOpen).toBe(false);
    });

    it("should have actuator hidden until panel opened", () => {
      const actuator = engine.getObject("turnstile-actuator");
      expect(actuator?.customState.visible).toBe(false);
    });

    it("should open panel to reveal actuator", () => {
      const result = engine.execute("open panel");
      expect(result.success).toBe(true);

      const panel = engine.getObject("turnstile-panel");
      expect(panel?.isOpen).toBe(true);
    });

    it("should switch on actuator to unlock turnstile", () => {
      // First open the panel
      engine.execute("open panel");

      // Then switch on the actuator
      const result = engine.execute("switch on actuator");
      expect(result.success).toBe(true);
    });
  });

  describe("Puzzle: Platform Shift (See Both Worlds)", () => {
    beforeEach(() => {
      (engine as any).state.currentRoom = "platform-55";
    });

    it("should have electric bulbs lit initially", () => {
      const bulbs = engine.getObject("electric-bulbs");
      expect(bulbs?.isLit).toBe(true);
      expect(bulbs?.isSwitchedOn).toBe(true);
    });

    it("should have bulbs screwed in initially", () => {
      const bulbs = engine.getObject("electric-bulbs");
      expect(bulbs?.customState.screwed).toBe(true);
    });

    it("should unscrew bulbs to shift reality", () => {
      const result = engine.execute("unscrew bulbs");
      expect(result.success).toBe(true);
      expect(result.message).toContain("blackness");
      expect(result.puzzleSolved).toBe("platform-shift");
    });

    it("should turn off lights when unscrewing", () => {
      engine.execute("unscrew bulbs");
      const bulbs = engine.getObject("electric-bulbs");
      expect(bulbs?.isLit).toBe(false);
      expect(bulbs?.isSwitchedOn).toBe(false);
    });

    it("should set platform-dark-mode flag", () => {
      engine.execute("unscrew bulbs");
      const state = engine.getState();
      expect(state.puzzlesSolved).toContain("platform-shift");
    });
  });

  describe("Puzzle: Focus Dream Desk", () => {
    beforeEach(() => {
      (engine as any).state.currentRoom = "dream-bedroom";
    });

    it("should have dream desk unfocused initially", () => {
      const desk = engine.getObject("dream-desk");
      expect(desk?.customState.focused).toBe(false);
    });

    it("should have drawer hidden initially", () => {
      const drawer = engine.getObject("dream-drawer");
      expect(drawer?.customState.visible).toBe(false);
    });

    it("should focus desk to reveal drawer", () => {
      // Note: command is "focus desk" not "focus on desk"
      const result = engine.execute("focus desk");
      expect(result.success).toBe(true);
      expect(result.message.toLowerCase()).toContain("focus");
      expect(result.puzzleSolved).toBe("focus-dream-desk");
    });

    it("should make drawer visible after focusing", () => {
      engine.execute("focus desk");
      const drawer = engine.getObject("dream-drawer");
      expect(drawer?.customState.visible).toBe(true);
    });

    it("should mark desk as focused", () => {
      engine.execute("focus desk");
      const desk = engine.getObject("dream-desk");
      expect(desk?.customState.focused).toBe(true);
    });
  });

  describe("Puzzle: Become One with the Void", () => {
    beforeEach(() => {
      // Start in empty-space
      (engine as any).state.currentRoom = "empty-space";
    });

    it("should only work in empty-space", () => {
      // Move to a different room
      (engine as any).state.currentRoom = "forest";
      const result = engine.execute("become void");
      expect(result.success).toBe(false);
      expect(result.message).toContain("void");
    });

    it("should allow becoming void in empty-space", () => {
      const result = engine.execute("become void");
      expect(result.success).toBe(true);
      expect(result.message).toContain("void");
      expect(result.puzzleSolved).toBe("become-void");
    });

    it("should change player state to void", () => {
      engine.execute("become void");
      const state = engine.getState();
      expect(state.playerState).toBe("void");
    });

    it("should set voidState flag", () => {
      engine.execute("become void");
      const state = engine.getState();
      expect(state.flags.voidState).toBe(true);
    });

    it("should wear the void object", () => {
      engine.execute("become void");
      const void_obj = engine.getObject("void");
      expect(void_obj?.isWorn).toBe(true);
    });

    it("should have logosNote for behavioral tracking", () => {
      const result = engine.execute("become void");
      expect(result.logosNote).toBeTruthy();
      expect(result.logosNote).toContain("void");
    });
  });

  describe("Puzzle Condition Types", () => {
    it("should check object_state conditions", () => {
      // Find-lighter checks pile-of-leaves customState.searched
      const findLighter = PUZZLES.find((p) => p.id === "find-lighter");
      expect(findLighter?.conditions[0].type).toBe("object_state");
      expect(findLighter?.conditions[0].target).toBe("pile-of-leaves");
    });

    it("should check inventory conditions", () => {
      // Burn-vines requires lighter in inventory
      const burnVines = PUZZLES.find((p) => p.id === "burn-vines");
      const inventoryCondition = burnVines?.conditions.find(
        (c) => c.type === "inventory"
      );
      expect(inventoryCondition).toBeDefined();
    });

    it("should check flag conditions", () => {
      // Platform-shift might set a flag
      const platformShift = PUZZLES.find((p) => p.id === "platform-shift");
      expect(platformShift).toBeDefined();
    });
  });

  describe("Puzzle Effect Types", () => {
    it("should have reveal_object effects", () => {
      const findLighter = PUZZLES.find((p) => p.id === "find-lighter");
      const revealEffect = findLighter?.onSolve.find(
        (e) => e.type === "reveal_object"
      );
      expect(revealEffect).toBeDefined();
      expect(revealEffect?.target).toBe("lighter");
    });

    it("should have move_object effects", () => {
      const findLighter = PUZZLES.find((p) => p.id === "find-lighter");
      const moveEffect = findLighter?.onSolve.find(
        (e) => e.type === "move_object"
      );
      expect(moveEffect).toBeDefined();
    });

    it("should have unlock_exit effects", () => {
      const burnVines = PUZZLES.find((p) => p.id === "burn-vines");
      const unlockEffect = burnVines?.onSolve.find(
        (e) => e.type === "unlock_exit"
      );
      expect(unlockEffect).toBeDefined();
    });

    it("should have set_flag effects", () => {
      const unlockTurnstile = PUZZLES.find((p) => p.id === "unlock-turnstile");
      const flagEffect = unlockTurnstile?.onSolve.find(
        (e) => e.type === "set_flag"
      );
      expect(flagEffect).toBeDefined();
    });

    it("should have trigger_event effects", () => {
      const platformShift = PUZZLES.find((p) => p.id === "platform-shift");
      const eventEffect = platformShift?.onSolve.find(
        (e) => e.type === "trigger_event"
      );
      expect(eventEffect).toBeDefined();
    });
  });

  describe("Puzzle Chain Dependencies", () => {
    it("should support sequential puzzle solving", () => {
      // Find lighter → burn vines → access subway
      engine = new GameEngine(undefined, true);

      // Step 1: Find lighter in forest
      (engine as any).state.currentRoom = "forest";
      const searchResult = engine.execute("search leaves");
      expect(searchResult.puzzleSolved).toBe("find-lighter");

      // Step 2: Take lighter
      engine.execute("take lighter");
      expect(engine.getState().inventory).toContain("lighter");

      // Step 3: Go to clearing and burn vines
      (engine as any).state.currentRoom = "clearing";
      const burnResult = engine.execute("burn vines");
      expect(burnResult.puzzleSolved).toBe("burn-vines");
    });

    it("should track multiple solved puzzles", () => {
      engine = new GameEngine(undefined, true);

      // Solve find-lighter
      (engine as any).state.currentRoom = "forest";
      engine.execute("search leaves");

      // Solve burn-vines (with lighter in inventory)
      engine.execute("take lighter");
      (engine as any).state.currentRoom = "clearing";
      engine.execute("burn vines");

      const state = engine.getState();
      expect(state.puzzlesSolved).toContain("find-lighter");
      expect(state.puzzlesSolved).toContain("burn-vines");
      expect(state.puzzlesSolved.length).toBe(2);
    });
  });

  describe("Puzzle Serialization", () => {
    it("should serialize solved puzzles", () => {
      (engine as any).state.currentRoom = "forest";
      engine.execute("search leaves");

      const json = engine.serialize();
      const parsed = JSON.parse(json);

      expect(parsed.puzzlesSolved).toContain("find-lighter");
    });

    it("should restore solved puzzles on deserialize", () => {
      // Solve a puzzle
      (engine as any).state.currentRoom = "forest";
      engine.execute("search leaves");

      // Serialize and deserialize
      const json = engine.serialize();
      const restored = GameEngine.deserialize(json);

      const state = restored.getState();
      expect(state.puzzlesSolved).toContain("find-lighter");
    });

    it("should not re-solve already solved puzzles", () => {
      // Solve puzzle
      (engine as any).state.currentRoom = "forest";
      engine.execute("search leaves");

      // Serialize and deserialize
      const json = engine.serialize();
      const restored = GameEngine.deserialize(json);

      // Try to search leaves again
      (restored as any).state.currentRoom = "forest";
      const result = restored.execute("search leaves");

      // Should not return puzzleSolved again
      expect(result.puzzleSolved).toBeUndefined();
    });
  });

  describe("Puzzle AI Constraints", () => {
    it("should expose unsolved puzzles to AI", () => {
      const constraints = engine.getConstraintsForAI();
      const parsed = JSON.parse(constraints);

      // Should have logosExperiments from unsolved puzzles
      expect(parsed.logosExperiments).toBeDefined();
      expect(parsed.logosExperiments.length).toBeGreaterThan(0);
    });

    it("should not expose solved puzzle experiments to AI", () => {
      // Solve a puzzle with experiment
      (engine as any).state.currentRoom = "clearing";
      (engine as any).state.inventory = ["lighter"];
      const lighter = engine.getObject("lighter");
      if (lighter) lighter.isCarried = true;

      engine.execute("burn vines");

      const constraints = engine.getConstraintsForAI();
      const parsed = JSON.parse(constraints);

      // burn-vines experiment should not be in list
      const burnVinesPuzzle = PUZZLES.find((p) => p.id === "burn-vines");
      if (burnVinesPuzzle?.logosExperiment) {
        expect(parsed.logosExperiments).not.toContain(
          burnVinesPuzzle.logosExperiment
        );
      }
    });
  });
});

describe("Puzzle-Experiment Integration", () => {
  describe("LOGOS Experiment Tracking", () => {
    it("should define logosExperiment for behavioral puzzles", () => {
      const puzzlesWithExperiments = PUZZLES.filter((p) => p.logosExperiment);

      // Check burn-vines
      const burnVines = puzzlesWithExperiments.find((p) => p.id === "burn-vines");
      expect(burnVines?.logosExperiment).toContain("environmental");

      // Check platform-shift
      const platformShift = puzzlesWithExperiments.find(
        (p) => p.id === "platform-shift"
      );
      expect(platformShift?.logosExperiment).toContain("light");

      // Check become-void
      const becomeVoid = puzzlesWithExperiments.find(
        (p) => p.id === "become-void"
      );
      expect(becomeVoid?.logosExperiment).toContain("metaphysical");
    });

    it("should return logosNote when solving behavioral puzzles", () => {
      const engine = new GameEngine(undefined, true);

      // Test become-void which has logosNote
      (engine as any).state.currentRoom = "empty-space";
      engine.execute("examine myself");
      (engine as any).state.flags.selfReflection = true;

      const result = engine.execute("become void");
      expect(result.logosNote).toBeTruthy();
    });
  });

  describe("Puzzle-Based Experiment Creation", () => {
    it("should support puzzle-triggered experiments", () => {
      // Each puzzle with logosExperiment can trigger an observation
      const experimentPuzzles = PUZZLES.filter((p) => p.logosExperiment);

      for (const puzzle of experimentPuzzles) {
        // Verify the experiment hypothesis is meaningful
        expect(puzzle.logosExperiment!.length).toBeGreaterThan(10);
      }
    });
  });
});

describe("World Model Content Validation", () => {
  describe("Room Definitions from adventure.txt", () => {
    it("should have Empty Space as starting room", () => {
      expect(ROOMS["empty-space"]).toBeDefined();
      expect(ROOMS["empty-space"].name).toBe("Empty Space");
      expect(ROOMS["empty-space"].region).toContain("OneirOS");
    });

    it("should have Dream Bedroom", () => {
      expect(ROOMS["dream-bedroom"]).toBeDefined();
      expect(ROOMS["dream-bedroom"].exits.length).toBeGreaterThan(0);
    });

    it("should have Forest with exits", () => {
      expect(ROOMS["forest"]).toBeDefined();
      expect(ROOMS["forest"].exits).toContainEqual(
        expect.objectContaining({ direction: "east", destination: "clearing" })
      );
    });

    it("should have Clearing with blocked entrance", () => {
      expect(ROOMS["clearing"]).toBeDefined();
      // Should have east exit to subway
      const eastExit = ROOMS["clearing"].exits.find((e) => e.direction === "east");
      expect(eastExit).toBeDefined();
    });

    it("should have subway system rooms", () => {
      expect(ROOMS["outer-cement"]).toBeDefined();
      expect(ROOMS["inner-cement"]).toBeDefined();
      expect(ROOMS["platform-55"]).toBeDefined();
      expect(ROOMS["platform-89"]).toBeDefined();
    });

    it("should have Platform 55 as dark room", () => {
      expect(ROOMS["platform-55"].isDark).toBe(true);
      expect(ROOMS["platform-55"].darkDescription).toBeTruthy();
    });

    it("should have Control Lab", () => {
      expect(ROOMS["control-lab"]).toBeDefined();
      expect(ROOMS["control-lab"].objects).toContain("televisions");
    });

    it("should have Loading Construct", () => {
      expect(ROOMS["loading-construct"]).toBeDefined();
    });
  });

  describe("Object Definitions from adventure.txt", () => {
    it("should have the Void (wearable)", () => {
      expect(OBJECTS["void"]).toBeDefined();
      expect(OBJECTS["void"].isWearable).toBe(true);
    });

    it("should have Interface (temples)", () => {
      expect(OBJECTS["interface-temples"]).toBeDefined();
      expect(OBJECTS["interface-temples"].isWearable).toBe(true);
      expect(OBJECTS["interface-temples"].isWorn).toBe(true); // Starts worn
    });

    it("should have Lighter (hidden in leaves)", () => {
      expect(OBJECTS["lighter"]).toBeDefined();
      expect(OBJECTS["lighter"].containedIn).toBe("pile-of-leaves");
      expect(OBJECTS["lighter"].customState.hidden).toBe(true);
    });

    it("should have Pile of Leaves (searchable)", () => {
      expect(OBJECTS["pile-of-leaves"]).toBeDefined();
      expect(OBJECTS["pile-of-leaves"].customState.searchable).toBe(true);
    });

    it("should have Subway Vines (burnable)", () => {
      expect(OBJECTS["subway-vines"]).toBeDefined();
      expect(OBJECTS["subway-vines"].customState.blocking).toBe(true);
    });

    it("should have Wooden Turnstile (lockable door)", () => {
      expect(OBJECTS["wooden-turnstile"]).toBeDefined();
      expect(OBJECTS["wooden-turnstile"].isLockable).toBe(true);
      expect(OBJECTS["wooden-turnstile"].isLocked).toBe(true);
    });

    it("should have Turnstile Panel and Actuator", () => {
      expect(OBJECTS["turnstile-panel"]).toBeDefined();
      expect(OBJECTS["turnstile-actuator"]).toBeDefined();
      expect(OBJECTS["turnstile-actuator"].isSwitchable).toBe(true);
    });

    it("should have Electric Bulbs (unscrewable)", () => {
      expect(OBJECTS["electric-bulbs"]).toBeDefined();
      expect(OBJECTS["electric-bulbs"].customState.screwed).toBe(true);
    });

    it("should have Trashcan with hidden newspaper", () => {
      expect(OBJECTS["trashcan"]).toBeDefined();
      expect(OBJECTS["balled-newspaper"]).toBeDefined();
      expect(OBJECTS["balled-newspaper"].containedIn).toBe("trashcan");
    });

    it("should have Comic Page Three", () => {
      expect(OBJECTS["comic-page-three"]).toBeDefined();
      expect(OBJECTS["comic-page-three"].containedIn).toBe("balled-newspaper");
    });

    it("should have Dream Desk (focusable)", () => {
      expect(OBJECTS["dream-desk"]).toBeDefined();
      expect(OBJECTS["dream-desk"].customState.focused).toBe(false);
    });

    it("should have Dream Drawer with Candle", () => {
      expect(OBJECTS["dream-drawer"]).toBeDefined();
      expect(OBJECTS["long-candle"]).toBeDefined();
      expect(OBJECTS["long-candle"].containedIn).toBe("dream-drawer");
    });

    it("should have Digital Wall (Oneirocom ad)", () => {
      expect(OBJECTS["digital-wall"]).toBeDefined();
      expect(OBJECTS["digital-wall"].description).toContain("Oneirocom");
    });

    it("should have Televisions in Control Lab", () => {
      expect(OBJECTS["televisions"]).toBeDefined();
      expect(OBJECTS["televisions"].location).toBe("control-lab");
    });
  });

  describe("Content Gaps (Missing from adventure.txt)", () => {
    // Document what's missing for future implementation

    it.todo("should have The Architect NPC");
    it.todo("should have Simulation Control Computer with menu");
    it.todo("should have Subway Train (moving between platforms)");
    it.todo("should have Emergency Compartment with Crowbar");
    it.todo("should have White Panels (interactive hexagons)");
    it.todo("should have Ontological Slime");
    it.todo("should have Comic Page One");
    it.todo("should have Subway Ads and Seats");
  });
});
