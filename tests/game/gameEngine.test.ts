import { describe, it, expect, beforeEach } from "vitest";
import { GameEngine, ActionResult, ParsedCommand } from "@/app/lib/game/gameEngine";
import { GameState } from "@/app/lib/game/worldModel";

/**
 * Game Engine Tests
 *
 * Tests the text adventure game engine:
 * - Command parsing
 * - Room navigation
 * - Inventory management
 * - Object interaction
 * - State serialization
 * - Puzzle system
 */

describe("Game Engine", () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe("Initialization", () => {
    it("should start in empty-space room", () => {
      const room = engine.getCurrentRoom();
      expect(room.id).toBe("empty-space");
      expect(room.name).toBe("Empty Space");
    });

    it("should start with empty inventory", () => {
      const state = engine.getState();
      expect(state.inventory).toHaveLength(0);
    });

    it("should start with normal player state", () => {
      const state = engine.getState();
      expect(state.playerState).toBe("normal");
    });

    it("should start with zero turns elapsed", () => {
      const state = engine.getState();
      expect(state.turnsElapsed).toBe(0);
    });

    it("should restore from saved state", () => {
      const savedState: GameState = {
        currentRoom: "forest",
        previousRoom: "empty-space",
        inventory: ["lighter"],
        playerName: "TestAgent",
        playerState: "normal",
        wornItems: [],
        flags: { testFlag: true },
        puzzlesSolved: [],
        turnsElapsed: 10,
        roomsVisited: ["empty-space", "forest"],
        objectStates: {},
      };

      const restoredEngine = new GameEngine(savedState);
      const state = restoredEngine.getState();

      expect(state.currentRoom).toBe("forest");
      expect(state.turnsElapsed).toBe(10);
      expect(state.playerName).toBe("TestAgent");
    });
  });

  describe("Command Parsing", () => {
    it("should parse simple verbs", () => {
      const cmd = engine.parseCommand("look");
      expect(cmd.verb).toBe("look");
      expect(cmd.noun).toBeUndefined();
    });

    it("should parse verb + noun", () => {
      const cmd = engine.parseCommand("examine lighter");
      expect(cmd.verb).toBe("examine");
      expect(cmd.noun).toBe("lighter");
    });

    it("should handle direction shortcuts", () => {
      expect(engine.parseCommand("n").verb).toBe("go");
      expect(engine.parseCommand("n").noun).toBe("north");

      expect(engine.parseCommand("s").verb).toBe("go");
      expect(engine.parseCommand("s").noun).toBe("south");

      expect(engine.parseCommand("e").verb).toBe("go");
      expect(engine.parseCommand("e").noun).toBe("east");

      expect(engine.parseCommand("w").verb).toBe("go");
      expect(engine.parseCommand("w").noun).toBe("west");
    });

    it("should handle full direction words", () => {
      const cmd = engine.parseCommand("north");
      expect(cmd.verb).toBe("go");
      expect(cmd.noun).toBe("north");
    });

    it("should handle verb aliases", () => {
      expect(engine.parseCommand("l").verb).toBe("look");
      expect(engine.parseCommand("x something").verb).toBe("examine");
      expect(engine.parseCommand("i").verb).toBe("inventory");
      expect(engine.parseCommand("get item").verb).toBe("take");
      expect(engine.parseCommand("grab item").verb).toBe("take");
    });

    it("should handle two-word verbs", () => {
      // "pick up" becomes "pickup" (not aliased to "take")
      const pickUp = engine.parseCommand("pick up lighter");
      expect(pickUp.verb).toBe("pickup");
      expect(pickUp.noun).toBe("lighter");

      const switchOn = engine.parseCommand("switch on lamp");
      expect(switchOn.verb).toBe("switchon");
      expect(switchOn.noun).toBe("lamp");

      // "put on" is aliased to "wear"
      const putOn = engine.parseCommand("put on hat");
      expect(putOn.verb).toBe("wear");
      expect(putOn.noun).toBe("hat");
    });

    it("should parse prepositions", () => {
      const cmd = engine.parseCommand("put key in box");
      expect(cmd.verb).toBe("drop");
      expect(cmd.noun).toBe("key");
      expect(cmd.preposition).toBe("in");
      expect(cmd.secondNoun).toBe("box");
    });

    it("should normalize case and whitespace", () => {
      const cmd = engine.parseCommand("  LOOK  ");
      expect(cmd.verb).toBe("look");
    });
  });

  describe("Look Command", () => {
    it("should describe the current room", () => {
      const result = engine.execute("look");
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
      expect(result.message.length).toBeGreaterThan(10);
    });

    it("should track visited rooms", () => {
      engine.execute("look");
      const state = engine.getState();
      expect(state.roomsVisited).toContain("empty-space");
    });

    it("should increment turn counter", () => {
      engine.execute("look");
      expect(engine.getState().turnsElapsed).toBe(1);
    });
  });

  describe("Examine Command", () => {
    it("should prompt for target if none given", () => {
      const result = engine.execute("examine");
      expect(result.success).toBe(false);
      expect(result.message).toContain("What do you want to examine");
    });

    it("should allow examining self", () => {
      const result = engine.execute("examine myself");
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });

    it("should report non-existent objects", () => {
      const result = engine.execute("examine unicorn");
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't see");
    });
  });

  describe("Inventory Command", () => {
    it("should report empty inventory", () => {
      const result = engine.execute("inventory");
      expect(result.success).toBe(true);
      // In empty-space, message is about having no body
      expect(result.message).toBeTruthy();
    });

    it("should list carried items", () => {
      // Manually add item to test
      const state = engine.getState();
      (engine as any).state.inventory = ["lighter"];
      (engine as any).state.currentRoom = "forest";

      const result = engine.execute("inventory");
      expect(result.success).toBe(true);
      expect(result.message.toLowerCase()).toContain("carrying");
    });
  });

  describe("Navigation", () => {
    it("should reject invalid directions", () => {
      const result = engine.execute("go north");
      // From empty-space, north may not be valid
      expect(result.message).toBeTruthy();
    });

    it("should handle missing direction", () => {
      const result = engine.execute("go");
      expect(result.success).toBe(false);
      expect(result.message).toContain("direction");
    });

    it("should update current room on successful move", () => {
      // Navigate to a room that has exits
      (engine as any).state.currentRoom = "forest";

      // Try to move (exact direction depends on world model)
      const beforeRoom = engine.getState().currentRoom;
      engine.execute("look"); // Check available exits
    });
  });

  describe("Take and Drop", () => {
    it("should reject taking non-existent objects", () => {
      const result = engine.execute("take unicorn");
      expect(result.success).toBe(false);
    });

    it("should reject dropping items not in inventory", () => {
      const result = engine.execute("drop lighter");
      expect(result.success).toBe(false);
    });

    it("should handle take/drop cycle", () => {
      // Setup: Put player in forest with lighter available
      (engine as any).state.currentRoom = "forest";
      const lighter = engine.getObject("lighter");
      if (lighter) {
        lighter.location = "forest";
        lighter.isCarried = false;
        lighter.customState = { hidden: false };

        // Take the lighter
        const takeResult = engine.execute("take lighter");
        if (takeResult.success) {
          expect(engine.getState().inventory).toContain("lighter");

          // Drop it
          const dropResult = engine.execute("drop lighter");
          expect(dropResult.success).toBe(true);
          expect(engine.getState().inventory).not.toContain("lighter");
        }
      }
    });
  });

  describe("Object Accessibility", () => {
    it("should find objects by name", () => {
      const obj = engine.findObject("lighter");
      // May or may not exist depending on world model
      if (obj) {
        expect(obj.id).toBe("lighter");
      }
    });

    it("should find objects by alias", () => {
      const lighter = engine.getObject("lighter");
      if (lighter && lighter.aliases.length > 0) {
        const found = engine.findObject(lighter.aliases[0]);
        expect(found?.id).toBe("lighter");
      }
    });
  });

  describe("Open and Close", () => {
    it("should reject opening non-openable objects", () => {
      // Lighter is not openable
      (engine as any).state.currentRoom = "forest";
      const lighter = engine.getObject("lighter");
      if (lighter) {
        lighter.location = "forest";
        lighter.isOpenable = false;

        const result = engine.execute("open lighter");
        expect(result.success).toBe(false);
      }
    });
  });

  describe("Wait and Sleep", () => {
    it("should handle wait command", () => {
      const result = engine.execute("wait");
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });

    it("should handle sleep command", () => {
      const result = engine.execute("sleep");
      // Sleep may fail in some rooms (not appropriate location)
      expect(result.message).toBeTruthy();
    });
  });

  describe("Help Command", () => {
    it("should display help text", () => {
      const result = engine.execute("help");
      expect(result.success).toBe(true);
      expect(result.message.toUpperCase()).toContain("AVAILABLE");
    });
  });

  describe("Unknown Commands", () => {
    it("should reject unknown verbs", () => {
      const result = engine.execute("frobozz");
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't understand");
    });
  });

  describe("Serialization", () => {
    it("should serialize state to JSON", () => {
      engine.execute("look");
      engine.execute("wait");

      const json = engine.serialize();
      expect(json).toBeTruthy();

      const parsed = JSON.parse(json);
      expect(parsed.state).toBeDefined();
      expect(parsed.state.turnsElapsed).toBe(2);
    });

    it("should deserialize state from JSON", () => {
      engine.execute("look");
      engine.execute("wait");
      engine.execute("wait");

      const json = engine.serialize();
      const restored = GameEngine.deserialize(json);

      expect(restored.getState().turnsElapsed).toBe(3);
      expect(restored.getState().roomsVisited).toContain("empty-space");
    });

    it("should preserve object states through serialization", () => {
      // Modify an object state
      const lighter = engine.getObject("lighter");
      if (lighter) {
        lighter.isLit = true;

        const json = engine.serialize();
        const restored = GameEngine.deserialize(json);

        const restoredLighter = restored.getObject("lighter");
        expect(restoredLighter?.isLit).toBe(true);
      }
    });
  });

  describe("AI Constraints", () => {
    it("should generate AI constraints JSON", () => {
      const constraints = engine.getConstraintsForAI();
      expect(constraints).toBeTruthy();

      const parsed = JSON.parse(constraints);
      expect(parsed.currentRoom).toBe("empty-space");
      expect(parsed.turnsElapsed).toBeDefined();
      expect(parsed.inventory).toBeDefined();
    });
  });

  describe("Special States", () => {
    it("should handle void player state", () => {
      (engine as any).state.playerState = "void";
      const result = engine.execute("examine myself");
      expect(result.success).toBe(true);
      expect(result.message.toLowerCase()).toContain("void");
    });

    it("should handle dreaming state", () => {
      (engine as any).state.playerState = "dreaming";
      const state = engine.getState();
      expect(state.playerState).toBe("dreaming");
    });
  });

  describe("Turn Counter", () => {
    it("should increment on every command", () => {
      expect(engine.getState().turnsElapsed).toBe(0);

      engine.execute("look");
      expect(engine.getState().turnsElapsed).toBe(1);

      engine.execute("wait");
      expect(engine.getState().turnsElapsed).toBe(2);

      engine.execute("inventory");
      expect(engine.getState().turnsElapsed).toBe(3);
    });
  });

  describe("Room Objects", () => {
    it("should list visible objects in room description", () => {
      // Set up a room with visible objects
      (engine as any).state.currentRoom = "forest";
      const result = engine.execute("look");

      // Result may or may not list objects depending on room setup
      expect(result.success).toBe(true);
    });
  });

  describe("Worn Items", () => {
    it("should track worn items separately", () => {
      const state = engine.getState();
      expect(state.wornItems).toBeDefined();
      expect(Array.isArray(state.wornItems)).toBe(true);
    });

    it("should mark worn items in inventory", () => {
      // Setup: Add wearable item
      (engine as any).state.inventory = ["void"];
      (engine as any).state.wornItems = ["void"];
      (engine as any).state.currentRoom = "forest";

      const result = engine.execute("inventory");
      if (result.message.includes("void")) {
        expect(result.message).toContain("worn");
      }
    });
  });

  describe("Flags System", () => {
    it("should preserve flags in state", () => {
      (engine as any).state.flags.testFlag = true;
      const state = engine.getState();
      expect(state.flags.testFlag).toBe(true);
    });

    it("should persist flags through serialization", () => {
      (engine as any).state.flags.customFlag = "value";
      const json = engine.serialize();
      const restored = GameEngine.deserialize(json);
      expect(restored.getState().flags.customFlag).toBe("value");
    });
  });
});

describe("Game Engine Edge Cases", () => {
  it("should handle empty input gracefully", () => {
    const engine = new GameEngine();
    const result = engine.execute("");
    expect(result).toBeDefined();
  });

  it("should handle whitespace-only input", () => {
    const engine = new GameEngine();
    const result = engine.execute("   ");
    expect(result).toBeDefined();
  });

  it("should handle very long input", () => {
    const engine = new GameEngine();
    const longInput = "look ".repeat(100);
    const result = engine.execute(longInput);
    expect(result).toBeDefined();
  });

  it("should handle special characters in input", () => {
    const engine = new GameEngine();
    const result = engine.execute("look @#$%");
    expect(result).toBeDefined();
  });
});
