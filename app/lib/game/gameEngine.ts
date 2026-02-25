import {
  GameState,
  Room,
  ObjectState,
  Direction,
  Puzzle,
  PuzzleEffect,
  ROOMS,
  OBJECTS,
  PUZZLES,
  getDefaultGameState,
} from "./worldModel";
import { loadPuzzles, getPuzzlesByLayer } from "./puzzleLoader";
import { loadRooms } from "./roomLoader";
import { loadObjects } from "./objectLoader";
import {
  convertWorldExtraction,
  mergeDynamicContent,
  connectRooms,
} from "./dynamicWorldBridge";
import { WorldExtraction } from "./narrativeParser";

export type ActionResult = {
  success: boolean;
  message: string;
  stateChanges?: Partial<GameState>;
  objectChanges?: Record<string, Partial<ObjectState>>;
  puzzleSolved?: string;
  logosNote?: string;
};

export type ParsedCommand = {
  verb: string;
  noun?: string;
  preposition?: string;
  secondNoun?: string;
  raw: string;
};

const DIRECTION_ALIASES: Record<string, Direction> = {
  n: "north", north: "north",
  s: "south", south: "south",
  e: "east", east: "east",
  w: "west", west: "west",
  u: "up", up: "up",
  d: "down", down: "down",
  "in": "in", enter: "in",
  out: "out", exit: "out",
};

const VERB_ALIASES: Record<string, string> = {
  l: "look", look: "look",
  x: "examine", examine: "examine", ex: "examine", inspect: "examine",
  i: "inventory", inv: "inventory", inventory: "inventory",
  get: "take", take: "take", grab: "take", pick: "take",
  drop: "drop", put: "drop", leave: "drop",
  open: "open",
  close: "close", shut: "close",
  lock: "lock",
  unlock: "unlock",
  wear: "wear", don: "wear", "put on": "wear",
  remove: "remove", doff: "remove", "take off": "remove",
  go: "go", walk: "go", move: "go",
  wait: "wait", z: "wait",
  sleep: "sleep",
  wake: "wake",
  help: "help",
  "switch on": "switchon", "turn on": "switchon", activate: "switchon",
  "switch off": "switchoff", "turn off": "switchoff", deactivate: "switchoff",
  burn: "burn", light: "burn", ignite: "burn",
  search: "search", "look in": "search", "look through": "search",
  focus: "focus", concentrate: "focus",
  become: "become",
  unscrew: "unscrew",
  screw: "screw",
  climb: "climb",
  jump: "jump",
  read: "read",
};

export class GameEngine {
  private state: GameState;
  private rooms: Record<string, Room>;
  private objects: Record<string, ObjectState>;
  private puzzles: Puzzle[];

  constructor(savedState?: GameState, useHardcodedData = false, maxPuzzleLayer?: number) {
    this.state = savedState || getDefaultGameState();

    // Use hardcoded data if explicitly requested or GAME_USE_HARDCODED env is set
    const forceHardcoded = useHardcodedData || process.env.GAME_USE_HARDCODED === "true";

    // Load rooms from JSON files, fall back to hardcoded if not available
    if (forceHardcoded) {
      this.rooms = JSON.parse(JSON.stringify(ROOMS));
    } else {
      try {
        const loadedRooms = loadRooms();
        if (loadedRooms.length > 0) {
          this.rooms = {};
          for (const room of loadedRooms) {
            this.rooms[room.id] = JSON.parse(JSON.stringify(room));
          }
        } else {
          this.rooms = JSON.parse(JSON.stringify(ROOMS));
        }
      } catch {
        this.rooms = JSON.parse(JSON.stringify(ROOMS));
      }
    }

    // Load objects from JSON files, fall back to hardcoded if not available
    if (forceHardcoded) {
      this.objects = JSON.parse(JSON.stringify(OBJECTS));
    } else {
      try {
        const loadedObjects = loadObjects();
        this.objects = Object.keys(loadedObjects).length > 0
          ? JSON.parse(JSON.stringify(loadedObjects))
          : JSON.parse(JSON.stringify(OBJECTS));
      } catch {
        this.objects = JSON.parse(JSON.stringify(OBJECTS));
      }
    }

    // Load puzzles from JSON files, fall back to hardcoded if not available
    if (forceHardcoded) {
      this.puzzles = JSON.parse(JSON.stringify(PUZZLES));
    } else {
      try {
        const loadedPuzzles =
          maxPuzzleLayer !== undefined
            ? getPuzzlesByLayer(maxPuzzleLayer)
            : loadPuzzles();
        this.puzzles = loadedPuzzles.length > 0
          ? JSON.parse(JSON.stringify(loadedPuzzles))
          : JSON.parse(JSON.stringify(PUZZLES));
      } catch {
        this.puzzles = JSON.parse(JSON.stringify(PUZZLES));
      }
    }
    
    if (savedState?.objectStates) {
      for (const [id, changes] of Object.entries(savedState.objectStates)) {
        if (this.objects[id]) {
          Object.assign(this.objects[id], changes);
        }
      }
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  getCurrentRoom(): Room {
    return this.rooms[this.state.currentRoom];
  }

  getObject(id: string): ObjectState | undefined {
    return this.objects[id];
  }

  // ============================================
  // Dynamic World Manipulation (for AI/LOGOS)
  // ============================================

  /**
   * Load dynamic content from a WorldExtraction (from session)
   * Merges AI-created rooms/objects/puzzles with static content
   */
  loadDynamicWorld(world: WorldExtraction): void {
    const dynamic = convertWorldExtraction(world);
    const merged = mergeDynamicContent(
      this.rooms,
      this.objects,
      this.puzzles,
      dynamic.rooms,
      dynamic.objects,
      dynamic.puzzles
    );
    this.rooms = merged.rooms;
    this.objects = merged.objects;
    this.puzzles = merged.puzzles;
    console.log(`[GameEngine] Loaded dynamic world: ${Object.keys(dynamic.rooms).length} rooms, ${Object.keys(dynamic.objects).length} objects`);
  }

  /**
   * Add a new room dynamically (AI-created)
   */
  addRoom(room: Room): boolean {
    if (this.rooms[room.id]) {
      console.warn(`[GameEngine] Room ${room.id} already exists`);
      return false;
    }
    this.rooms[room.id] = room;
    console.log(`[GameEngine] Added dynamic room: ${room.id}`);
    return true;
  }

  /**
   * Add a new object dynamically (AI-created)
   */
  addObject(obj: ObjectState): boolean {
    if (this.objects[obj.id]) {
      console.warn(`[GameEngine] Object ${obj.id} already exists`);
      return false;
    }
    this.objects[obj.id] = obj;

    // Add to room's object list if it has a location
    if (obj.location && this.rooms[obj.location]) {
      if (!this.rooms[obj.location].objects.includes(obj.id)) {
        this.rooms[obj.location].objects.push(obj.id);
      }
    }
    console.log(`[GameEngine] Added dynamic object: ${obj.id} at ${obj.location}`);
    return true;
  }

  /**
   * Add a new puzzle dynamically (AI-created)
   */
  addPuzzle(puzzle: Puzzle): boolean {
    if (this.puzzles.some(p => p.id === puzzle.id)) {
      console.warn(`[GameEngine] Puzzle ${puzzle.id} already exists`);
      return false;
    }
    this.puzzles.push(puzzle);
    console.log(`[GameEngine] Added dynamic puzzle: ${puzzle.id}`);
    return true;
  }

  /**
   * Connect two rooms with exits
   */
  connectRooms(fromId: string, toId: string, direction: Direction, bidirectional = true): boolean {
    if (!this.rooms[fromId] || !this.rooms[toId]) {
      console.warn(`[GameEngine] Cannot connect rooms: ${fromId} or ${toId} not found`);
      return false;
    }
    connectRooms(this.rooms, fromId, toId, direction, bidirectional);
    return true;
  }

  /**
   * Get all rooms (for AI context)
   */
  getAllRooms(): Room[] {
    return Object.values(this.rooms);
  }

  /**
   * Get all objects (for AI context)
   */
  getAllObjects(): ObjectState[] {
    return Object.values(this.objects);
  }

  /**
   * Get all puzzles (for AI context)
   */
  getAllPuzzles(): Puzzle[] {
    return [...this.puzzles];
  }

  /**
   * Check if a room exists
   */
  hasRoom(id: string): boolean {
    return !!this.rooms[id];
  }

  /**
   * Check if an object exists
   */
  hasObject(id: string): boolean {
    return !!this.objects[id];
  }

  parseCommand(input: string): ParsedCommand {
    const raw = input.toLowerCase().trim();
    const words = raw.split(/\s+/);
    
    if (DIRECTION_ALIASES[words[0]]) {
      return { verb: "go", noun: DIRECTION_ALIASES[words[0]], raw };
    }
    
    const twoWordVerbs = ["pick up", "put on", "take off", "switch on", "switch off", "turn on", "turn off", "look at", "look in", "become one"];
    for (const twoWord of twoWordVerbs) {
      if (raw.startsWith(twoWord)) {
        const rest = raw.slice(twoWord.length).trim();
        return { verb: VERB_ALIASES[twoWord] || twoWord.replace(" ", ""), noun: rest || undefined, raw };
      }
    }

    let verb = VERB_ALIASES[words[0]] || words[0];
    let noun: string | undefined;
    let preposition: string | undefined;
    let secondNoun: string | undefined;

    if (words.length > 1) {
      const prepIndex = words.findIndex((w, i) => i > 0 && ["with", "on", "in", "to", "from", "at"].includes(w));
      if (prepIndex > 0) {
        noun = words.slice(1, prepIndex).join(" ");
        preposition = words[prepIndex];
        secondNoun = words.slice(prepIndex + 1).join(" ");
      } else {
        noun = words.slice(1).join(" ");
      }
    }

    return { verb, noun, preposition, secondNoun, raw };
  }

  findObject(name: string): ObjectState | undefined {
    if (!name) return undefined;
    const lower = name.toLowerCase();
    
    for (const obj of Object.values(this.objects)) {
      if (obj.name.toLowerCase() === lower) return obj;
      if (obj.aliases.some(a => a.toLowerCase() === lower)) return obj;
    }
    
    for (const obj of Object.values(this.objects)) {
      if (obj.name.toLowerCase().includes(lower)) return obj;
      if (obj.aliases.some(a => a.toLowerCase().includes(lower))) return obj;
    }
    
    return undefined;
  }

  isObjectAccessible(obj: ObjectState): boolean {
    if (obj.isCarried || this.state.inventory.includes(obj.id)) return true;
    if (obj.location === this.state.currentRoom) return true;
    if (obj.containedIn) {
      const container = this.objects[obj.containedIn];
      if (container && container.isOpen && this.isObjectAccessible(container)) {
        if (obj.customState?.hidden) return false;
        return true;
      }
    }
    return false;
  }

  execute(input: string): ActionResult {
    const cmd = this.parseCommand(input);
    this.state.turnsElapsed++;

    switch (cmd.verb) {
      case "look": return this.doLook(cmd.noun);
      case "examine": return this.doExamine(cmd.noun);
      case "inventory": return this.doInventory();
      case "go": return this.doGo(cmd.noun as Direction);
      case "take": return this.doTake(cmd.noun);
      case "drop": return this.doDrop(cmd.noun);
      case "open": return this.doOpen(cmd.noun);
      case "close": return this.doClose(cmd.noun);
      case "wear": return this.doWear(cmd.noun);
      case "remove": return this.doRemove(cmd.noun);
      case "switchon": return this.doSwitchOn(cmd.noun);
      case "switchoff": return this.doSwitchOff(cmd.noun);
      case "burn": return this.doBurn(cmd.noun, cmd.secondNoun);
      case "search": return this.doSearch(cmd.noun);
      case "focus": return this.doFocus(cmd.noun);
      case "become": return this.doBecome(cmd.noun);
      case "wait": return this.doWait();
      case "sleep": return this.doSleep();
      case "unscrew": return this.doUnscrew(cmd.noun);
      case "screw": return this.doScrew(cmd.noun);
      case "help": return this.doHelp();
      case "read": return this.doRead(cmd.noun);
      default:
        if (DIRECTION_ALIASES[cmd.verb]) {
          return this.doGo(DIRECTION_ALIASES[cmd.verb]);
        }
        return { success: false, message: "I don't understand that command. Type HELP for available actions." };
    }
  }

  private doLook(target?: string): ActionResult {
    if (target) {
      return this.doExamine(target);
    }
    
    const room = this.getCurrentRoom();
    if (!this.state.roomsVisited.includes(room.id)) {
      this.state.roomsVisited.push(room.id);
      room.visited = true;
    }

    const isDark = room.isDark && !this.hasLight();
    let description = isDark && room.darkDescription ? room.darkDescription : room.description;

    const visibleObjects = room.objects
      .map(id => this.objects[id])
      .filter(obj => obj && !obj.isScenery && !obj.customState?.hidden);

    if (visibleObjects.length > 0) {
      description += "\n\nYou can see: " + visibleObjects.map(o => o.name).join(", ") + ".";
    }

    return { success: true, message: description };
  }

  private doExamine(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to examine?" };
    }

    if (target === "self" || target === "myself" || target === "me") {
      if (this.state.playerState === "void") {
        return { success: true, message: "You are the void - infinite, eternal, containing all and nothing." };
      }
      if (this.state.currentRoom === "empty-space" && !this.state.flags.voidState) {
        this.state.flags.selfReflection = true;
        return { success: true, message: "You try to examine yourself, but there is no self to examine. You are nothing, floating in nothingness." };
      }
      return { success: true, message: `You are ${this.state.playerName}. You feel... present.` };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!this.isObjectAccessible(obj)) {
      return { success: false, message: `You can't see that from here.` };
    }

    let description = obj.description;
    
    if (obj.isOpenable) {
      description += obj.isOpen ? " It is open." : " It is closed.";
    }
    if (obj.isLockable && obj.isLocked) {
      description += " It appears to be locked.";
    }
    if (obj.isSwitchable) {
      description += obj.isSwitchedOn ? " It is switched on." : " It is switched off.";
    }

    return { success: true, message: description };
  }

  private doInventory(): ActionResult {
    if (this.state.currentRoom === "empty-space" && !this.state.flags.voidState) {
      return { success: true, message: "You have no body, no form, no possessions. You are nothing." };
    }

    if (this.state.inventory.length === 0) {
      return { success: true, message: "You are carrying nothing." };
    }

    const items = this.state.inventory.map(id => {
      const obj = this.objects[id];
      let name = obj?.name || id;
      if (this.state.wornItems.includes(id)) name += " (worn)";
      return name;
    });

    return { success: true, message: "You are carrying: " + items.join(", ") + "." };
  }

  private doGo(direction?: Direction | string): ActionResult {
    if (!direction) {
      return { success: false, message: "Which direction?" };
    }

    const dir = DIRECTION_ALIASES[direction.toLowerCase()] || direction as Direction;
    const room = this.getCurrentRoom();
    const exit = room.exits.find(e => e.direction === dir);

    if (!exit) {
      if (this.state.currentRoom === "empty-space") {
        return { success: false, message: "There is no direction in the void. There is only here, and here is nowhere." };
      }
      return { success: false, message: `You can't go ${dir} from here.` };
    }

    if (exit.blocked) {
      return { success: false, message: exit.blockedMessage || "The way is blocked." };
    }

    if (exit.door) {
      const door = this.objects[exit.door];
      if (door) {
        if (door.isLocked) {
          return { success: false, message: `The ${door.name} is locked.` };
        }
        if (door.isOpenable && !door.isOpen) {
          door.isOpen = true;
        }
      }
    }

    this.state.previousRoom = this.state.currentRoom;
    this.state.currentRoom = exit.destination;

    const newRoom = this.getCurrentRoom();
    if (!this.state.roomsVisited.includes(newRoom.id)) {
      this.state.roomsVisited.push(newRoom.id);
      newRoom.visited = true;
    }

    return this.doLook();
  }

  private doTake(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to take?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!this.isObjectAccessible(obj)) {
      return { success: false, message: "You can't reach that." };
    }

    if (obj.isFixed || obj.isScenery) {
      return { success: false, message: "That's not something you can take." };
    }

    if (this.state.inventory.includes(obj.id)) {
      return { success: false, message: "You already have that." };
    }

    obj.isCarried = true;
    obj.location = null;
    obj.containedIn = null;
    this.state.inventory.push(obj.id);
    this.state.objectStates[obj.id] = { isCarried: true, location: null, containedIn: null };

    return { success: true, message: `Taken.` };
  }

  private doDrop(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to drop?" };
    }

    const obj = this.findObject(target);
    if (!obj || !this.state.inventory.includes(obj.id)) {
      return { success: false, message: "You're not carrying that." };
    }

    obj.isCarried = false;
    obj.location = this.state.currentRoom;
    this.state.inventory = this.state.inventory.filter(id => id !== obj.id);
    if (this.state.wornItems.includes(obj.id)) {
      this.state.wornItems = this.state.wornItems.filter(id => id !== obj.id);
      obj.isWorn = false;
    }
    this.state.objectStates[obj.id] = { isCarried: false, location: this.state.currentRoom };

    return { success: true, message: "Dropped." };
  }

  private doOpen(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to open?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!obj.isOpenable) {
      return { success: false, message: "That's not something you can open." };
    }

    if (obj.isOpen) {
      return { success: false, message: "It's already open." };
    }

    if (obj.isLocked) {
      return { success: false, message: "It's locked." };
    }

    obj.isOpen = true;
    this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], isOpen: true };

    let message = "Opened.";
    
    if (obj.id === "turnstile-panel") {
      const actuator = this.objects["turnstile-actuator"];
      if (actuator) {
        actuator.customState.visible = true;
        message = "Prying it open, you find the actuator inside.";
      }
    }

    this.checkPuzzles();
    return { success: true, message };
  }

  private doClose(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to close?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!obj.isOpenable) {
      return { success: false, message: "That's not something you can close." };
    }

    if (!obj.isOpen) {
      return { success: false, message: "It's already closed." };
    }

    obj.isOpen = false;
    this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], isOpen: false };

    return { success: true, message: "Closed." };
  }

  private doWear(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to wear?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!obj.isWearable) {
      if (obj.id === "void" && this.state.currentRoom === "empty-space") {
        return this.doBecome("void");
      }
      return { success: false, message: "You can't wear that." };
    }

    if (!this.state.inventory.includes(obj.id) && !this.isObjectAccessible(obj)) {
      return { success: false, message: "You don't have that." };
    }

    obj.isWorn = true;
    if (!this.state.wornItems.includes(obj.id)) {
      this.state.wornItems.push(obj.id);
    }
    if (!this.state.inventory.includes(obj.id)) {
      obj.isCarried = true;
      this.state.inventory.push(obj.id);
    }
    this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], isWorn: true };

    this.checkPuzzles();
    return { success: true, message: `You put on the ${obj.name}.` };
  }

  private doRemove(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to remove?" };
    }

    const obj = this.findObject(target);
    if (!obj || !this.state.wornItems.includes(obj.id)) {
      return { success: false, message: "You're not wearing that." };
    }

    obj.isWorn = false;
    this.state.wornItems = this.state.wornItems.filter(id => id !== obj.id);
    this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], isWorn: false };

    if (obj.id === "void") {
      this.state.flags.voidState = false;
      this.state.playerState = "normal";
    }

    return { success: true, message: `You remove the ${obj.name}.` };
  }

  private doSwitchOn(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to switch on?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!obj.isSwitchable) {
      return { success: false, message: "That's not something you can switch." };
    }

    if (obj.isSwitchedOn) {
      return { success: false, message: "It's already on." };
    }

    obj.isSwitchedOn = true;
    this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], isSwitchedOn: true };

    let message = "Switched on.";
    
    if (obj.id === "turnstile-actuator") {
      const turnstile = this.objects["wooden-turnstile"];
      if (turnstile) {
        turnstile.isLocked = false;
        this.state.objectStates["wooden-turnstile"] = { ...this.state.objectStates["wooden-turnstile"], isLocked: false };
        message = "The turnstile hums to life, warm and vibrant. You hear a gentle click as the bars unlock.";
      }
    }

    this.checkPuzzles();
    return { success: true, message };
  }

  private doSwitchOff(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to switch off?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!obj.isSwitchable) {
      return { success: false, message: "That's not something you can switch." };
    }

    if (!obj.isSwitchedOn) {
      return { success: false, message: "It's already off." };
    }

    obj.isSwitchedOn = false;
    this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], isSwitchedOn: false };

    this.checkPuzzles();
    return { success: true, message: "Switched off." };
  }

  private doBurn(target?: string, tool?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to burn?" };
    }

    const hasLighter = this.state.inventory.includes("lighter");
    if (!hasLighter) {
      return { success: false, message: "You don't have anything to start a fire with." };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (obj.id === "pile-of-leaves") {
      obj.customState.burned = true;
      this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], customState: { ...obj.customState, burned: true } };
      return { success: true, message: "The leaves burst into flames. Smoke curls upward through the trees, swirling around the pitcher plants toward the sky." };
    }

    if (obj.id === "subway-vines") {
      obj.customState.burned = true;
      obj.customState.blocking = false;
      const exit = this.rooms["clearing"].exits.find(e => e.direction === "east");
      if (exit) exit.blocked = false;
      this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], customState: obj.customState };
      this.checkPuzzles();
      return { 
        success: true, 
        message: "It takes a while to get the fresh vines to burn. Eventually, the fire spreads and consumes them. You step back from the heat as they reduce to ash. The entrance is now clear.",
        puzzleSolved: "burn-vines"
      };
    }

    return { success: false, message: "Best not to burn that." };
  }

  private doSearch(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to search?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (!this.isObjectAccessible(obj)) {
      return { success: false, message: "You can't reach that." };
    }

    if (obj.id === "pile-of-leaves" && !obj.customState.searched) {
      obj.customState.searched = true;
      const lighter = this.objects["lighter"];
      if (lighter) {
        lighter.location = "forest";
        lighter.containedIn = null;
        lighter.customState.hidden = false;
        this.state.objectStates["lighter"] = { location: "forest", containedIn: null, customState: { hidden: false } };
      }
      this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], customState: obj.customState };
      this.checkPuzzles();
      return { 
        success: true, 
        message: "You ruffle through the leaves absent-mindedly. After some searching, you uncover an old lighter buried under them.",
        puzzleSolved: "find-lighter"
      };
    }

    if (obj.id === "trashcan") {
      const newspaper = this.objects["balled-newspaper"];
      if (newspaper && newspaper.customState?.hidden) {
        newspaper.location = "platform-55";
        newspaper.containedIn = null;
        newspaper.customState.hidden = false;
        this.state.objectStates["balled-newspaper"] = { location: "platform-55", containedIn: null, customState: { hidden: false } };
        return { success: true, message: "You find an old balled up newspaper that looks like it might have some useful information." };
      }
    }

    if (obj.isContainer && obj.isOpen) {
      const contents = Object.values(this.objects).filter(o => o.containedIn === obj.id && !o.customState?.hidden);
      if (contents.length > 0) {
        return { success: true, message: `Inside you find: ${contents.map(o => o.name).join(", ")}.` };
      }
      return { success: true, message: "You find nothing of interest." };
    }

    return { success: true, message: "You search but find nothing noteworthy." };
  }

  private doFocus(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to focus on?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (obj.id === "dream-desk") {
      obj.customState.focused = true;
      const drawer = this.objects["dream-drawer"];
      if (drawer) {
        drawer.customState.visible = true;
        this.state.objectStates["dream-drawer"] = { ...this.state.objectStates["dream-drawer"], customState: drawer.customState };
      }
      this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], customState: obj.customState };
      this.checkPuzzles();
      return { 
        success: true, 
        message: "The desk shifts into focus slowly, becoming more tangible and real through the power of your attention. You can now make out a drawer.",
        puzzleSolved: "focus-dream-desk"
      };
    }

    return { success: true, message: `You concentrate on the ${obj.name}, but nothing particular happens.` };
  }

  private doBecome(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "Become what?" };
    }

    if (target.includes("void") || target === "one with void" || target === "nothing") {
      if (this.state.currentRoom !== "empty-space") {
        return { success: false, message: "You cannot become the void here. The void is elsewhere." };
      }
      
      const void_obj = this.objects["void"];
      if (void_obj) {
        void_obj.isWorn = true;
        this.state.objectStates["void"] = { isWorn: true };
      }
      this.state.flags.voidState = true;
      this.state.playerState = "void";
      this.checkPuzzles();
      
      return { 
        success: true, 
        message: "You release all sense of self. You expand infinitely outward, becoming one with the void. You are nothing and everything. The void is you and you are the void. Infinite darkness blazes with a fiery light of pure potential.",
        puzzleSolved: "become-void",
        logosNote: "Agent achieved void state - metaphysical exploration confirmed"
      };
    }

    return { success: false, message: "You cannot become that." };
  }

  private doWait(): ActionResult {
    if (this.state.currentRoom === "empty-space") {
      return { success: true, message: "Time passes, but time has no meaning here. You wait in eternity." };
    }
    return { success: true, message: "Time passes." };
  }

  private doSleep(): ActionResult {
    if (this.state.currentRoom === "mundane-bedroom") {
      this.state.currentRoom = "dream-bedroom";
      this.state.playerState = "dreaming";
      return { 
        success: true, 
        message: "You close your eyes. Colors swirl behind your eyelids. You feel yourself slipping away from waking reality...\n\n" + this.doLook().message 
      };
    }
    
    if (this.state.currentRoom === "dream-bedroom") {
      this.state.currentRoom = "mundane-bedroom";
      this.state.playerState = "normal";
      return { 
        success: true, 
        message: "You close your eyes again and drift - not into sleep but into wakefulness. Colors swirl as you're pulled back toward your body.\n\n" + this.doLook().message 
      };
    }

    return { success: false, message: "You can't sleep here." };
  }

  private doUnscrew(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to unscrew?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (obj.id === "electric-bulbs") {
      if (!obj.customState?.screwed) {
        return { success: false, message: "They're already unscrewed." };
      }
      obj.customState.screwed = false;
      obj.isSwitchedOn = false;
      obj.isLit = false;
      this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], customState: obj.customState, isSwitchedOn: false, isLit: false };
      this.checkPuzzles();
      return { 
        success: true, 
        message: "The bulbs flicker for one last moment, then die. The tunnels plunge into almost total blackness. As your eyes adjust, you begin to make out shapes that weren't there before.",
        puzzleSolved: "platform-shift"
      };
    }

    return { success: false, message: "You can't unscrew that." };
  }

  private doScrew(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to screw in?" };
    }

    const obj = this.findObject(target);
    if (!obj) {
      return { success: false, message: `You don't see any "${target}" here.` };
    }

    if (obj.id === "electric-bulbs") {
      if (obj.customState?.screwed) {
        return { success: false, message: "They're already screwed in." };
      }
      obj.customState.screwed = true;
      obj.isSwitchedOn = true;
      obj.isLit = true;
      this.state.objectStates[obj.id] = { ...this.state.objectStates[obj.id], customState: obj.customState, isSwitchedOn: true, isLit: true };
      return { success: true, message: "The bulbs burst to life again, giving off that beautiful gentle glow. The platform fades back into its classic form." };
    }

    return { success: false, message: "You can't screw that in." };
  }

  private doRead(target?: string): ActionResult {
    if (!target) {
      return { success: false, message: "What do you want to read?" };
    }
    return this.doExamine(target);
  }

  private doHelp(): ActionResult {
    return {
      success: true,
      message: `AVAILABLE COMMANDS:
LOOK (L) - Describe your surroundings
EXAMINE (X) [thing] - Look closely at something
INVENTORY (I) - Check what you're carrying
GO [direction] / N/S/E/W/UP/DOWN - Move
TAKE [thing] - Pick something up
DROP [thing] - Put something down
OPEN/CLOSE [thing] - Open or close something
WEAR/REMOVE [thing] - Put on or take off
SEARCH [thing] - Look through something
FOCUS ON [thing] - Concentrate on something
BURN [thing] - Set fire to something
WAIT (Z) - Let time pass
SLEEP - Rest (in appropriate locations)

Special: BECOME [thing] - Transform or merge`
    };
  }

  private hasLight(): boolean {
    const lightSources = this.state.inventory.filter(id => {
      const obj = this.objects[id];
      return obj && obj.isLit;
    });
    
    const roomLights = this.getCurrentRoom().objects.filter(id => {
      const obj = this.objects[id];
      return obj && obj.isLit && obj.isSwitchedOn;
    });

    return lightSources.length > 0 || roomLights.length > 0;
  }

  private checkPuzzles(): void {
    for (const puzzle of this.puzzles) {
      if (puzzle.solved || this.state.puzzlesSolved.includes(puzzle.id)) continue;

      // GATE: Check that all prerequisite puzzles are solved first
      // This enforces the puzzle dependency graph
      if (puzzle.dependsOn && puzzle.dependsOn.length > 0) {
        const allDependenciesSolved = puzzle.dependsOn.every(
          depId => this.state.puzzlesSolved.includes(depId)
        );
        if (!allDependenciesSolved) {
          // Dependencies not met - skip this puzzle even if conditions are met
          continue;
        }
      }

      const allConditionsMet = puzzle.conditions.every(cond => {
        switch (cond.type) {
          case "object_state": {
            const obj = this.objects[cond.target];
            if (!obj) return false;
            if (cond.property?.startsWith("customState.")) {
              const prop = cond.property.split(".")[1];
              return obj.customState?.[prop] === cond.value;
            }
            return (obj as any)[cond.property!] === cond.value;
          }
          case "inventory":
            return this.state.inventory.includes(cond.target) === cond.value;
          case "flag":
            return this.state.flags[cond.target] === cond.value;
          case "room":
            return this.state.currentRoom === cond.target;
          default:
            return false;
        }
      });

      if (allConditionsMet) {
        puzzle.solved = true;
        this.state.puzzlesSolved.push(puzzle.id);

        for (const effect of puzzle.onSolve) {
          this.applyPuzzleEffect(effect);
        }
      }
    }
  }

  private applyPuzzleEffect(effect: PuzzleEffect): void {
    switch (effect.type) {
      case "unlock_exit": {
        const [roomId, dir] = effect.target.split(":");
        const room = this.rooms[roomId];
        if (room) {
          const exit = room.exits.find(e => e.direction === dir);
          if (exit) exit.blocked = false;
        }
        break;
      }
      case "reveal_object": {
        const obj = this.objects[effect.target];
        if (obj) {
          obj.customState.hidden = false;
          obj.customState.visible = true;
        }
        break;
      }
      case "set_flag":
        this.state.flags[effect.target] = effect.value;
        break;
      case "move_object": {
        const obj = this.objects[effect.target];
        if (obj) {
          obj.location = effect.value;
          obj.containedIn = null;
        }
        break;
      }
      case "trigger_event":
        this.state.flags[`event_${effect.target}`] = true;
        break;
    }
  }

  getConstraintsForAI(): string {
    const room = this.getCurrentRoom();

    const unsolvedPuzzles = this.puzzles
      .filter(p => !p.solved && !this.state.puzzlesSolved.includes(p.id))
      .map(p => p.logosExperiment)
      .filter(Boolean);

    return JSON.stringify({
      currentRoom: room.id,
      roomName: room.name,
      region: room.region,
      playerState: this.state.playerState,
      inventory: this.state.inventory.map(id => this.objects[id]?.name || id),
      logosExperiments: unsolvedPuzzles,
      turnsElapsed: this.state.turnsElapsed,
    }, null, 2);
  }

  serialize(): string {
    return JSON.stringify({
      state: this.state,
      objectStates: Object.fromEntries(
        Object.entries(this.objects).map(([id, obj]) => [id, {
          isCarried: obj.isCarried,
          isWorn: obj.isWorn,
          isOpen: obj.isOpen,
          isLocked: obj.isLocked,
          isSwitchedOn: obj.isSwitchedOn,
          isLit: obj.isLit,
          location: obj.location,
          containedIn: obj.containedIn,
          customState: obj.customState,
        }])
      ),
      puzzlesSolved: this.puzzles.filter(p => p.solved).map(p => p.id),
    });
  }

  static deserialize(json: string, maxPuzzleLayer?: number): GameEngine {
    const data = JSON.parse(json);
    const engine = new GameEngine(data.state, false, maxPuzzleLayer);
    
    for (const [id, state] of Object.entries(data.objectStates || {})) {
      if (engine.objects[id]) {
        Object.assign(engine.objects[id], state);
      }
    }
    
    for (const puzzleId of data.puzzlesSolved || []) {
      const puzzle = engine.puzzles.find(p => p.id === puzzleId);
      if (puzzle) puzzle.solved = true;
    }
    
    return engine;
  }
}
