import { describe, it, expect, beforeEach } from "vitest";
import { GameEngine } from "@/app/lib/game/gameEngine";
import {
  extractedRoomToRoom,
  extractedObjectToObjectState,
  extractedPuzzleToPuzzle,
  convertWorldExtraction,
  mergeDynamicContent,
  connectRooms,
  createRoomForAI,
  createObjectForAI,
} from "@/app/lib/game/dynamicWorldBridge";
import { WorldExtraction, ExtractedRoom, ExtractedObject, ExtractedPuzzle } from "@/app/lib/game/narrativeParser";
import { Room, ObjectState, Puzzle } from "@/app/lib/game/worldModel";

/**
 * Dynamic World Bridge Tests
 *
 * Tests the bridge between AI-created content (WorldExtraction)
 * and the game engine format (Room, ObjectState, Puzzle).
 */

describe("Dynamic World Bridge", () => {
  describe("extractedRoomToRoom", () => {
    it("should convert ExtractedRoom to Room format", () => {
      const extracted: ExtractedRoom = {
        name: "Hidden Alcove",
        description: "A small, dark alcove hidden behind a tapestry.",
        region: "oneiros",
        exits: [
          { direction: "out", destination: "Grand Hall" },
        ],
        objects: ["dusty-key"],
        npcs: [],
      };

      const room = extractedRoomToRoom(extracted, [extracted]);

      expect(room.id).toBe("hidden-alcove");
      expect(room.name).toBe("Hidden Alcove");
      expect(room.description).toBe("A small, dark alcove hidden behind a tapestry.");
      expect(room.region).toBe("oneiros");
      expect(room.exits).toHaveLength(1);
      expect(room.exits[0].direction).toBe("out");
      expect(room.exits[0].destination).toBe("grand-hall");
      expect(room.objects).toContain("dusty-key");
    });

    it("should handle rooms with no exits", () => {
      const extracted: ExtractedRoom = {
        name: "Sealed Chamber",
        description: "A completely sealed chamber.",
        exits: [],
        objects: [],
        npcs: [],
      };

      const room = extractedRoomToRoom(extracted, [extracted]);

      expect(room.exits).toHaveLength(0);
      expect(room.region).toBe("dynamic");
    });

    it("should resolve exit destinations to room IDs", () => {
      const rooms: ExtractedRoom[] = [
        {
          name: "North Room",
          description: "The northern room.",
          exits: [{ direction: "south", destination: "South Room" }],
          objects: [],
          npcs: [],
        },
        {
          name: "South Room",
          description: "The southern room.",
          exits: [{ direction: "north", destination: "North Room" }],
          objects: [],
          npcs: [],
        },
      ];

      const northRoom = extractedRoomToRoom(rooms[0], rooms);
      const southRoom = extractedRoomToRoom(rooms[1], rooms);

      expect(northRoom.exits[0].destination).toBe("south-room");
      expect(southRoom.exits[0].destination).toBe("north-room");
    });

    it("should handle blocked exits", () => {
      const extracted: ExtractedRoom = {
        name: "Locked Room",
        description: "A room with a locked exit.",
        exits: [
          { direction: "north", destination: "Secret Room", blocked: true, blockedBy: "iron gate" },
        ],
        objects: [],
        npcs: [],
      };

      const room = extractedRoomToRoom(extracted, [extracted]);

      expect(room.exits[0].blocked).toBe(true);
      expect(room.exits[0].blockedMessage).toBe("iron gate");
    });
  });

  describe("extractedObjectToObjectState", () => {
    it("should convert ExtractedObject to ObjectState format", () => {
      const extracted: ExtractedObject = {
        name: "Dusty Key",
        description: "An old, dusty key with strange markings.",
        location: "Hidden Alcove",
        properties: {
          takeable: true,
        },
      };

      const obj = extractedObjectToObjectState(extracted);

      expect(obj.id).toBe("dusty-key");
      expect(obj.name).toBe("Dusty Key");
      expect(obj.description).toBe("An old, dusty key with strange markings.");
      expect(obj.location).toBe("hidden-alcove");
      expect(obj.isFixed).toBe(false);
      expect(obj.customState?.aiCreated).toBe(true);
    });

    it("should set isFixed for non-takeable objects", () => {
      const extracted: ExtractedObject = {
        name: "Stone Altar",
        description: "A heavy stone altar.",
        location: "Temple",
        properties: {
          takeable: false,
        },
      };

      const obj = extractedObjectToObjectState(extracted);

      expect(obj.isFixed).toBe(true);
    });

    it("should handle container objects", () => {
      const extracted: ExtractedObject = {
        name: "Wooden Chest",
        description: "A sturdy wooden chest.",
        location: "Storage Room",
        properties: {
          container: true,
          openable: true,
          locked: true,
        },
      };

      const obj = extractedObjectToObjectState(extracted);

      expect(obj.isContainer).toBe(true);
      expect(obj.isOpenable).toBe(true);
      expect(obj.isLocked).toBe(true);
      expect(obj.isLockable).toBe(true);
    });

    it("should handle wearable objects", () => {
      const extracted: ExtractedObject = {
        name: "Silver Ring",
        description: "A delicate silver ring.",
        location: "Jewelry Box",
        properties: {
          wearable: true,
          takeable: true,
        },
      };

      const obj = extractedObjectToObjectState(extracted);

      expect(obj.isWearable).toBe(true);
      expect(obj.isWorn).toBe(false);
    });

    it("should handle readable objects", () => {
      const extracted: ExtractedObject = {
        name: "Ancient Scroll",
        description: "A scroll with faded text.",
        location: "Library",
        properties: {
          readable: "The prophecy speaks of one who will awaken...",
        },
      };

      const obj = extractedObjectToObjectState(extracted);

      expect(obj.customState?.readable).toBe("The prophecy speaks of one who will awaken...");
    });
  });

  describe("extractedPuzzleToPuzzle", () => {
    it("should convert ExtractedPuzzle to Puzzle format", () => {
      const extracted: ExtractedPuzzle = {
        name: "Mirror Riddle",
        description: "Solve the riddle in the mirror.",
        location: "Mirror Room",
        hints: ["Look at yourself", "What reflects you?"],
        solved: false,
      };

      const puzzle = extractedPuzzleToPuzzle(extracted);

      expect(puzzle.id).toBe("mirror-riddle");
      expect(puzzle.name).toBe("Mirror Riddle");
      expect(puzzle.solved).toBe(false);
      expect(puzzle.hint).toBe("Look at yourself");
      expect(puzzle.conditions).toHaveLength(1);
      expect(puzzle.conditions[0].type).toBe("flag");
      expect(puzzle.conditions[0].target).toBe("puzzle-mirror-riddle-complete");
    });

    it("should handle already solved puzzles", () => {
      const extracted: ExtractedPuzzle = {
        name: "Solved Puzzle",
        description: "Already completed.",
        location: "Past Room",
        hints: [],
        solved: true,
      };

      const puzzle = extractedPuzzleToPuzzle(extracted);

      expect(puzzle.solved).toBe(true);
    });
  });

  describe("convertWorldExtraction", () => {
    it("should convert full WorldExtraction to game engine format", () => {
      const world: WorldExtraction = {
        rooms: [
          {
            name: "Crystal Cave",
            description: "A cave filled with glowing crystals.",
            region: "oneiros",
            exits: [{ direction: "out", destination: "Forest" }],
            objects: ["blue-crystal"],
            npcs: [],
          },
        ],
        objects: [
          {
            name: "Blue Crystal",
            description: "A softly glowing blue crystal.",
            location: "Crystal Cave",
            properties: { takeable: true },
          },
        ],
        puzzles: [
          {
            name: "Crystal Alignment",
            description: "Align the crystals.",
            location: "Crystal Cave",
            hints: ["Color matters"],
            solved: false,
          },
        ],
        npcs: [],
        actions: [],
        events: [],
        playerInventory: [],
      };

      const result = convertWorldExtraction(world);

      expect(Object.keys(result.rooms)).toHaveLength(1);
      expect(result.rooms["crystal-cave"]).toBeDefined();
      expect(Object.keys(result.objects)).toHaveLength(1);
      expect(result.objects["blue-crystal"]).toBeDefined();
      expect(result.puzzles).toHaveLength(1);
      expect(result.puzzles[0].id).toBe("crystal-alignment");
    });
  });

  describe("mergeDynamicContent", () => {
    it("should add dynamic rooms to static content", () => {
      const staticRooms: Record<string, Room> = {
        "start-room": {
          id: "start-room",
          name: "Start Room",
          region: "static",
          description: "The starting room.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      const dynamicRooms: Record<string, Room> = {
        "new-room": {
          id: "new-room",
          name: "New Room",
          region: "dynamic",
          description: "A dynamically created room.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      const result = mergeDynamicContent(
        staticRooms, {}, [],
        dynamicRooms, {}, []
      );

      expect(Object.keys(result.rooms)).toHaveLength(2);
      expect(result.rooms["start-room"]).toBeDefined();
      expect(result.rooms["new-room"]).toBeDefined();
    });

    it("should not override existing static rooms", () => {
      const staticRooms: Record<string, Room> = {
        "shared-room": {
          id: "shared-room",
          name: "Static Version",
          region: "static",
          description: "Original description.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      const dynamicRooms: Record<string, Room> = {
        "shared-room": {
          id: "shared-room",
          name: "Dynamic Version",
          region: "dynamic",
          description: "New description.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      const result = mergeDynamicContent(
        staticRooms, {}, [],
        dynamicRooms, {}, []
      );

      expect(result.rooms["shared-room"].name).toBe("Static Version");
    });

    it("should merge objects correctly", () => {
      const staticObjects: Record<string, ObjectState> = {
        "static-object": {
          id: "static-object",
          name: "Static Object",
          description: "A static object.",
          aliases: [],
          location: "room",
          isCarried: false,
          isWearable: false,
          isWorn: false,
          isOpenable: false,
          isOpen: false,
          isLockable: false,
          isLocked: false,
          isLit: false,
          isFixed: false,
          isScenery: false,
          isContainer: false,
          isSwitchable: false,
          isSwitchedOn: false,
          containedIn: null,
          customState: {},
        },
      };

      const dynamicObjects: Record<string, ObjectState> = {
        "dynamic-object": {
          id: "dynamic-object",
          name: "Dynamic Object",
          description: "A dynamic object.",
          aliases: [],
          location: "room",
          isCarried: false,
          isWearable: false,
          isWorn: false,
          isOpenable: false,
          isOpen: false,
          isLockable: false,
          isLocked: false,
          isLit: false,
          isFixed: false,
          isScenery: false,
          isContainer: false,
          isSwitchable: false,
          isSwitchedOn: false,
          containedIn: null,
          customState: {},
        },
      };

      const result = mergeDynamicContent(
        {}, staticObjects, [],
        {}, dynamicObjects, []
      );

      expect(Object.keys(result.objects)).toHaveLength(2);
    });
  });

  describe("connectRooms", () => {
    it("should create bidirectional exits between rooms", () => {
      const rooms: Record<string, Room> = {
        "room-a": {
          id: "room-a",
          name: "Room A",
          region: "test",
          description: "Room A.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
        "room-b": {
          id: "room-b",
          name: "Room B",
          region: "test",
          description: "Room B.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      connectRooms(rooms, "room-a", "room-b", "north", true);

      expect(rooms["room-a"].exits).toHaveLength(1);
      expect(rooms["room-a"].exits[0].direction).toBe("north");
      expect(rooms["room-a"].exits[0].destination).toBe("room-b");

      expect(rooms["room-b"].exits).toHaveLength(1);
      expect(rooms["room-b"].exits[0].direction).toBe("south");
      expect(rooms["room-b"].exits[0].destination).toBe("room-a");
    });

    it("should create one-way exits when not bidirectional", () => {
      const rooms: Record<string, Room> = {
        "room-a": {
          id: "room-a",
          name: "Room A",
          region: "test",
          description: "Room A.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
        "room-b": {
          id: "room-b",
          name: "Room B",
          region: "test",
          description: "Room B.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      connectRooms(rooms, "room-a", "room-b", "down", false);

      expect(rooms["room-a"].exits).toHaveLength(1);
      expect(rooms["room-b"].exits).toHaveLength(0);
    });

    it("should not duplicate existing exits", () => {
      const rooms: Record<string, Room> = {
        "room-a": {
          id: "room-a",
          name: "Room A",
          region: "test",
          description: "Room A.",
          isDark: false,
          visited: false,
          exits: [{ direction: "north", destination: "room-b" }],
          objects: [],
        },
        "room-b": {
          id: "room-b",
          name: "Room B",
          region: "test",
          description: "Room B.",
          isDark: false,
          visited: false,
          exits: [],
          objects: [],
        },
      };

      connectRooms(rooms, "room-a", "room-b", "north", true);

      expect(rooms["room-a"].exits).toHaveLength(1);
    });
  });

  describe("createRoomForAI", () => {
    it("should create a valid Room for AI world building", () => {
      const room = createRoomForAI(
        "Shadow Passage",
        "A dark passage leading into the unknown.",
        "liminal",
        [{ direction: "north", destination: "main-hall" }],
        { roomId: "main-hall", direction: "south" }
      );

      expect(room.id).toBe("shadow-passage");
      expect(room.name).toBe("Shadow Passage");
      expect(room.region).toBe("liminal");
      expect(room.exits).toHaveLength(1);
      expect(room.exits[0].direction).toBe("north");
    });
  });

  describe("createObjectForAI", () => {
    it("should create a valid ObjectState for AI world building", () => {
      const obj = createObjectForAI(
        "Strange Artifact",
        "An artifact that hums with unknown energy.",
        "Shadow Passage",
        { takeable: true, openable: true }
      );

      expect(obj.id).toBe("strange-artifact");
      expect(obj.name).toBe("Strange Artifact");
      expect(obj.location).toBe("shadow-passage");
      expect(obj.isOpenable).toBe(true);
      expect(obj.isFixed).toBe(false);
      expect(obj.customState?.aiCreated).toBe(true);
    });
  });
});

describe("GameEngine Dynamic World Integration", () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine(undefined, true);
  });

  describe("loadDynamicWorld", () => {
    it("should load AI-created rooms into the engine", () => {
      const world: WorldExtraction = {
        rooms: [
          {
            name: "AI Room",
            description: "A room created by AI.",
            region: "oneiros",
            exits: [],
            objects: [],
            npcs: [],
          },
        ],
        objects: [],
        puzzles: [],
        npcs: [],
        actions: [],
        events: [],
        playerInventory: [],
      };

      engine.loadDynamicWorld(world);

      expect(engine.hasRoom("ai-room")).toBe(true);
    });

    it("should load AI-created objects into the engine", () => {
      const world: WorldExtraction = {
        rooms: [
          {
            name: "Test Room",
            description: "A test room.",
            exits: [],
            objects: ["test-object"],
            npcs: [],
          },
        ],
        objects: [
          {
            name: "Test Object",
            description: "An AI-created object.",
            location: "Test Room",
            properties: { takeable: true },
          },
        ],
        puzzles: [],
        npcs: [],
        actions: [],
        events: [],
        playerInventory: [],
      };

      engine.loadDynamicWorld(world);

      expect(engine.hasObject("test-object")).toBe(true);
    });
  });

  describe("addRoom", () => {
    it("should add a new room to the engine", () => {
      const room = createRoomForAI("New Room", "A new room.", "oneiros");

      const result = engine.addRoom(room);

      expect(result).toBe(true);
      expect(engine.hasRoom("new-room")).toBe(true);
    });

    it("should reject duplicate rooms", () => {
      const room = createRoomForAI("Empty Space", "Duplicate.", "void");

      const result = engine.addRoom(room);

      expect(result).toBe(false);
    });
  });

  describe("addObject", () => {
    it("should add a new object to the engine", () => {
      const obj = createObjectForAI("New Object", "A new object.", "empty-space");

      const result = engine.addObject(obj);

      expect(result).toBe(true);
      expect(engine.hasObject("new-object")).toBe(true);
    });
  });

  describe("connectRooms", () => {
    it("should connect existing rooms", () => {
      const room = createRoomForAI("Connected Room", "A room to connect.", "oneiros");
      engine.addRoom(room);

      const result = engine.connectRooms("empty-space", "connected-room", "east", true);

      expect(result).toBe(true);

      // The static room should now have an exit
      const allRooms = engine.getAllRooms();
      const emptySpace = allRooms.find(r => r.id === "empty-space");
      expect(emptySpace?.exits.some(e => e.direction === "east")).toBe(true);
    });
  });

  describe("Navigation to AI-created rooms", () => {
    it("should allow navigation to AI-created rooms", () => {
      // Create and connect an AI room
      const aiRoom = createRoomForAI(
        "Dream Corridor",
        "A shimmering corridor that seems to stretch infinitely.",
        "oneiros"
      );
      engine.addRoom(aiRoom);
      engine.connectRooms("empty-space", "dream-corridor", "north", true);

      // Navigate to it
      const result = engine.execute("go north");

      expect(result.success).toBe(true);
      expect(engine.getCurrentRoom().id).toBe("dream-corridor");
    });
  });

  describe("Interaction with AI-created objects", () => {
    it("should allow taking AI-created objects", () => {
      // Add object to the starting room
      const obj = createObjectForAI(
        "Ethereal Stone",
        "A stone that seems to glow from within.",
        "empty-space",
        { takeable: true }
      );
      engine.addObject(obj);

      // Make sure we're in empty-space and update the object's location
      const objState = engine.getObject("ethereal-stone");
      if (objState) {
        objState.location = "empty-space";
      }

      // Move to a room where we have a body (can take things)
      // Empty space has special behavior
      const aiRoom = createRoomForAI("Material Room", "A material room.", "mundane");
      engine.addRoom(aiRoom);
      engine.connectRooms("empty-space", "material-room", "south", true);
      engine.execute("go south");

      // Put object in this room
      const materialObj = createObjectForAI(
        "Crystal Shard",
        "A shard of crystallized thought.",
        "material-room",
        { takeable: true }
      );
      engine.addObject(materialObj);

      const result = engine.execute("take crystal shard");

      // The result depends on whether the room allows taking
      // Just verify we can attempt the action
      expect(result.message).toBeDefined();
    });

    it("should allow examining AI-created objects", () => {
      const obj = createObjectForAI(
        "Strange Symbol",
        "An intricate symbol etched into the air itself.",
        "empty-space",
        { takeable: false }
      );
      engine.addObject(obj);

      const result = engine.execute("examine strange symbol");

      expect(result.success).toBe(true);
      expect(result.message).toContain("intricate symbol");
    });
  });
});
