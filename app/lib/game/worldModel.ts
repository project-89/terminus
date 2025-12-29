export type Direction = "north" | "south" | "east" | "west" | "up" | "down" | "in" | "out";

export type ObjectState = {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  location: string | null;
  isCarried: boolean;
  isWearable: boolean;
  isWorn: boolean;
  isOpenable: boolean;
  isOpen: boolean;
  isLockable: boolean;
  isLocked: boolean;
  isLit: boolean;
  isFixed: boolean;
  isScenery: boolean;
  isContainer: boolean;
  isSwitchable: boolean;
  isSwitchedOn: boolean;
  containedIn: string | null;
  customState: Record<string, any>;
};

export type Exit = {
  direction: Direction;
  destination: string;
  door?: string;
  blocked?: boolean;
  blockedMessage?: string;
};

export type Room = {
  id: string;
  name: string;
  region: string;
  description: string;
  darkDescription?: string;
  isDark: boolean;
  visited: boolean;
  exits: Exit[];
  objects: string[];
};

export type PuzzleCondition = {
  type: "object_state" | "object_location" | "flag" | "inventory" | "room";
  target: string;
  property?: string;
  value: any;
};

export type Puzzle = {
  id: string;
  name: string;
  solved: boolean;
  conditions: PuzzleCondition[];
  onSolve: PuzzleEffect[];
  hint?: string;
  logosExperiment?: string;
};

export type PuzzleEffect = {
  type: "unlock_exit" | "reveal_object" | "set_flag" | "move_object" | "change_description" | "trigger_event";
  target: string;
  value?: any;
};

export type GameFlag = {
  id: string;
  value: boolean | string | number;
};

export type GameState = {
  currentRoom: string;
  previousRoom: string | null;
  inventory: string[];
  playerName: string;
  playerState: "normal" | "dreaming" | "void" | "dead";
  wornItems: string[];
  flags: Record<string, any>;
  puzzlesSolved: string[];
  turnsElapsed: number;
  roomsVisited: string[];
  objectStates: Record<string, Partial<ObjectState>>;
};

export const REGIONS = {
  ONEIROS: "OneirOS",
  SAMSARA: "Samsara", 
  MUNDANE: "The Mundane World",
  HOUSE: "The House",
  DREAM: "Dream Realm",
  SUBWAY: "Subway System",
} as const;

export const ROOMS: Record<string, Room> = {
  "empty-space": {
    id: "empty-space",
    name: "Empty Space",
    region: REGIONS.ONEIROS,
    description: "You are floating in nondescript space. There is no height, no width, no depth. You have no body, no sense of selfhood or otherness, no volume or mass, and no sense of time. You remember nothing for you are nothing.",
    isDark: false,
    visited: false,
    exits: [],
    objects: ["void", "nothing-thing", "entirety", "identity-self", "interface-temples"],
  },
  "mundane-bedroom": {
    id: "mundane-bedroom",
    name: "Your Bedroom",
    region: REGIONS.HOUSE,
    description: "Your bedroom. The familiar space where you spend so much of your time. Your desk dominates one corner, cluttered with papers and books. Your bed sits against the wall, blankets scattered. A bookshelf lines the opposite wall, filled with dog-eared volumes. The window looks out onto a misty, indistinct neighborhood.",
    isDark: false,
    visited: false,
    exits: [],
    objects: ["large-desk", "comfy-bed", "bookshelf", "window", "bedside-table", "reading-lamp"],
  },
  "dream-bedroom": {
    id: "dream-bedroom",
    name: "Dream Bedroom",
    region: REGIONS.DREAM,
    description: "You find yourself in your bedroom again, or what you think is your bedroom. But nothing is as it was and yet everything is exactly how it is. The furniture around you seems vague, almost fuzzy. You can just barely make out your desk and the bookshelf, but they remain insubstantial and out of focus. You feel like an observer drifting through the world.\n\nNorth is a solid wooden door.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "north", destination: "forest", door: "dream-door" }
    ],
    objects: ["dream-desk", "dream-bed", "dream-pillow", "dream-door"],
  },
  "forest": {
    id: "forest",
    name: "Towering Forest",
    region: REGIONS.DREAM,
    description: "Enormous trees surround you, stretching up like silent giants, a vast landscape of wooden skyscrapers. From each tree hang massive ruby-colored pitcher plants. These immense wooden pillars feel ancient, almost eternal. Shrubs dot the landscape and piles of leaves litter the forest floor.\n\nEast, a path continues through the trees. South, there is a door in a tree.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "south", destination: "dream-bedroom", door: "tree-door" },
      { direction: "east", destination: "clearing" }
    ],
    objects: ["tall-trees", "shrubs", "pitcher-plants", "pile-of-leaves", "tree-door"],
  },
  "clearing": {
    id: "clearing",
    name: "The Clearing",
    region: REGIONS.DREAM,
    description: "The path weaves through massive trees. Light breaks through the canopy, dotting the landscape. Nature here sparkles with iridescent beauty, as though infinity were inscribed into every jewel of light.\n\nThe path ends at a large cement structure with no windows. Vines grow all over it, as though the forest were trying to consume it.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "west", destination: "forest" },
      { direction: "east", destination: "outer-cement", door: "subway-entrance" }
    ],
    objects: ["cement-building", "subway-entrance", "subway-vines"],
  },
  "outer-cement": {
    id: "outer-cement", 
    name: "Outer Cement Structure",
    region: REGIONS.SUBWAY,
    description: "Inside the cement structure, fluorescent lights flicker around you. A musty smell fills the air, as though no one had stepped foot here in centuries.\n\nRising from floor to ceiling are old wooden bars with an opening containing a wooden turnstile. Beyond it, you can see an antique wooden escalator.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "west", destination: "clearing", door: "metal-doors" },
      { direction: "north", destination: "inner-cement", door: "wooden-turnstile" }
    ],
    objects: ["wooden-turnstile", "turnstile-panel", "turnstile-actuator", "metal-doors"],
  },
  "inner-cement": {
    id: "inner-cement",
    name: "Inner Cement Structure",
    region: REGIONS.SUBWAY,
    description: "The walls are covered in yellowing tiles, old chipped paint peeling off, and exposed brick behind cracking cement. It feels like a past that didn't quite get a chance to exist. A deep sense of nostalgia fills you.\n\nIn the center, an escalator descends into inky blackness.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "south", destination: "outer-cement", door: "wooden-turnstile" },
      { direction: "down", destination: "platform-55", door: "wooden-escalator" }
    ],
    objects: ["yellowing-tiles", "old-chipped-paint", "wooden-escalator"],
  },
  "platform-55": {
    id: "platform-55",
    name: "Platform 55",
    region: REGIONS.SUBWAY,
    description: "You find yourself in a vintage subway station. Electric lights along the walls flicker intermittently. In beautiful tiled mosaic you can make out 'Platform 55'.\n\nBetween flickers, the station changes - classic subway when lit, modern graffiti-covered ruin when dark. A trashcan overflows with garbage. The tunnel curves north and south.",
    isDark: true,
    darkDescription: "A broken down subway station. Graffiti covers the walls. Piles of trash scatter the ground. An old rusted trashcan overflows with garbage. Decaying cables run along ceiling and walls. The air smells musty and ancient.",
    visited: false,
    exits: [
      { direction: "up", destination: "inner-cement", door: "wooden-escalator" }
    ],
    objects: ["electric-bulbs", "trashcan", "balled-newspaper", "graffiti", "decaying-cables"],
  },
  "platform-89": {
    id: "platform-89",
    name: "Platform 89",
    region: REGIONS.SUBWAY,
    description: "Around you shines the perfect image of the future. Glowing white hexagonal tiles line the walls. Large typography spells out 'Platform 89'. Why does that number seem so familiar?\n\nA digital wall displays animated advertising. Tracks run into darkness north and south.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "down", destination: "platform-tracks" }
    ],
    objects: ["digital-wall", "tracks", "hexagonal-tiles"],
  },
  "platform-tracks": {
    id: "platform-tracks",
    name: "Platform Tracks",
    region: REGIONS.SUBWAY,
    description: "You are on the tracks below Platform 89, looking up at its glowing walls. The tracks run north and south into the blackness of the tunnels. An old musty smell drifts from somewhere in the depths.",
    isDark: true,
    visited: false,
    exits: [
      { direction: "up", destination: "platform-89" },
      { direction: "north", destination: "north-tracks" }
    ],
    objects: [],
  },
  "north-tracks": {
    id: "north-tracks",
    name: "North Tracks",
    region: REGIONS.SUBWAY,
    description: "The walls of the tunnel are near-black cement, holding up the immense weight of the world above. You ponder what labyrinths lie veiled by the darkness.\n\nTo the east, a maintenance door.",
    isDark: true,
    visited: false,
    exits: [
      { direction: "south", destination: "platform-tracks" },
      { direction: "east", destination: "service-passage", door: "maintenance-door" }
    ],
    objects: ["maintenance-door"],
  },
  "service-passage": {
    id: "service-passage",
    name: "Service Passage",
    region: REGIONS.SUBWAY,
    description: "A narrow confined space, perhaps the size of a large closet. The walls are clean and bare. A service ladder leads up.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "west", destination: "north-tracks", door: "maintenance-door" },
      { direction: "up", destination: "control-lab" }
    ],
    objects: ["service-ladder"],
  },
  "control-lab": {
    id: "control-lab",
    name: "Control Lab",
    region: REGIONS.SUBWAY,
    description: "A large circular room. All around you, lining the walls, are thousands of televisions displaying various images - reality TV shows from infinite realities. Your head swims as you scan them: a man in his apartment, a woman on a hospital bed, children playing. A thousand realities playing in realtime.",
    isDark: false,
    visited: false,
    exits: [
      { direction: "down", destination: "service-passage" }
    ],
    objects: ["televisions", "control-console"],
  },
  "loading-construct": {
    id: "loading-construct", 
    name: "Loading Construct",
    region: REGIONS.ONEIROS,
    description: "A large empty room. The floor, walls and ceiling are all white. You can make out no light source, but everything is visible and clear. You can barely make out the edges.",
    isDark: false,
    visited: false,
    exits: [],
    objects: [],
  },
  "subway-interior": {
    id: "subway-interior",
    name: "Subway Car",
    region: REGIONS.SUBWAY,
    description: "A subway car with multiple timelines overlaid holographically. Beaten plastic interior superimposed onto velvet and wood. Dirty linoleum floors merged with art nouveau carpet. Glowing white panels pulse calmly. Ads litter the space - some animated, others printed.",
    isDark: false,
    visited: false,
    exits: [],
    objects: ["train-time", "subway-ads", "white-panels"],
  },
};

export const OBJECTS: Record<string, ObjectState> = {
  "void": {
    id: "void",
    name: "the void",
    aliases: ["void", "darkness", "nothingness"],
    description: "The void stretches infinitely in all directions. It is not darkness, for there is nothing to contrast with light. It simply is - or rather, is not.",
    location: "empty-space",
    isCarried: false,
    isWearable: true,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {},
  },
  "interface-temples": {
    id: "interface-temples",
    name: "interface",
    aliases: ["interface", "temples", "headset"],
    description: "You can make out the sense of something around your head, resting gently over your temples. It is barely perceptible. It appears to be some kind of interface.",
    location: "empty-space",
    isCarried: false,
    isWearable: true,
    isWorn: true,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: false,
    isScenery: true,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {},
  },
  "lighter": {
    id: "lighter",
    name: "lighter",
    aliases: ["lighter", "old lighter"],
    description: "An old lighter, but it seems to work.",
    location: null,
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
    containedIn: "pile-of-leaves",
    customState: { hidden: true },
  },
  "pile-of-leaves": {
    id: "pile-of-leaves",
    name: "pile of leaves",
    aliases: ["leaves", "pile of leaves", "leaf pile"],
    description: "The leaves seem to glow golden as dappled sunlight hits them. Light scatters off their surface, refracting and swirling. They fill you with longing for childhood autumns.",
    location: "forest",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: true,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { searchable: true, burned: false },
  },
  "subway-vines": {
    id: "subway-vines",
    name: "vines",
    aliases: ["vines", "subway vines"],
    description: "The vines almost completely cover the metal doors, consuming them in green foliage. They bar the way into the cement structure.",
    location: "clearing",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { burned: false, blocking: true },
  },
  "wooden-turnstile": {
    id: "wooden-turnstile",
    name: "wooden turnstile",
    aliases: ["turnstile", "turn stile", "wooden turnstile"],
    description: "An odd combination of wood and metal woven together. It has bars that should rotate, but appear blocked by an internal locking mechanism. Plates and panels cover it.",
    location: "outer-cement",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: true,
    isOpen: false,
    isLockable: true,
    isLocked: true,
    isLit: false,
    isFixed: true,
    isScenery: false,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {},
  },
  "turnstile-panel": {
    id: "turnstile-panel",
    name: "panel",
    aliases: ["panel", "panels", "plate", "plates"],
    description: "A small hinged panel, slightly different from the rest, adorns the side of the turnstile.",
    location: "outer-cement",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: true,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: true,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {},
  },
  "turnstile-actuator": {
    id: "turnstile-actuator",
    name: "actuator",
    aliases: ["actuator", "turnstile actuator", "switch"],
    description: "A small actuator for switching the turnstile on and off. It is currently off.",
    location: "outer-cement",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: false,
    isSwitchable: true,
    isSwitchedOn: false,
    containedIn: "turnstile-panel",
    customState: { visible: false },
  },
  "electric-bulbs": {
    id: "electric-bulbs",
    name: "electric bulbs",
    aliases: ["bulbs", "electric bulbs", "lights", "bulb"],
    description: "They flicker occasionally, giving off a warm yellow glow. They look like you might be able to unscrew them.",
    location: "platform-55",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: true,
    isFixed: true,
    isScenery: false,
    isContainer: false,
    isSwitchable: true,
    isSwitchedOn: true,
    containedIn: null,
    customState: { screwed: true },
  },
  "trashcan": {
    id: "trashcan",
    name: "trashcan",
    aliases: ["trashcan", "trash can", "trash", "garbage"],
    description: "It reminds you of the problems in the world, overflowing with garbage and refuse, neglected and abandoned.",
    location: "platform-55",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: true,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: true,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { searchable: true },
  },
  "balled-newspaper": {
    id: "balled-newspaper",
    name: "balled up newspaper",
    aliases: ["newspaper", "balled newspaper", "paper"],
    description: "A balled up old newspaper. You try to read it but can't make out the date, and the words won't hold still.",
    location: null,
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: true,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: false,
    isScenery: false,
    isContainer: true,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: "trashcan",
    customState: { hidden: true },
  },
  "comic-page-three": {
    id: "comic-page-three",
    name: "comic page three",
    aliases: ["comic page three", "comic three", "page three", "third page"],
    description: "A comic book page depicting you, with voices speaking about you from somewhere else. Whose voices? What do they want?",
    location: null,
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
    containedIn: "balled-newspaper",
    customState: { hidden: true },
  },
  "maintenance-door": {
    id: "maintenance-door",
    name: "maintenance door",
    aliases: ["maintenance door", "metal door", "door"],
    description: "A slab of steel set into the subway tunnel. No visible handle or keyhole. Very different from the futuristic platform.",
    location: "north-tracks",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: true,
    isOpen: false,
    isLockable: true,
    isLocked: true,
    isLit: false,
    isFixed: true,
    isScenery: false,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { requiresTool: "crowbar" },
  },
  "long-candle": {
    id: "long-candle",
    name: "candle",
    aliases: ["candle", "long candle", "golden candle"],
    description: "A long golden candle, elegant and seeming to glow with internal light.",
    location: null,
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
    containedIn: "dream-drawer",
    customState: {},
  },
  "dream-drawer": {
    id: "dream-drawer",
    name: "drawer",
    aliases: ["drawer", "desk drawer"],
    description: "You can vaguely make out the shape of a drawer in the desk.",
    location: "dream-bedroom",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: true,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: true,
    isContainer: true,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { visible: false },
  },
  "dream-desk": {
    id: "dream-desk",
    name: "desk",
    aliases: ["desk", "dream desk"],
    description: "Like everything else, the desk is hazy and insubstantial, as though made of dream substance or distant memory.",
    location: "dream-bedroom",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: false,
    isFixed: true,
    isScenery: false,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: { focused: false },
  },
  "digital-wall": {
    id: "digital-wall",
    name: "digital wall",
    aliases: ["wall", "advertising", "digital wall", "ads"],
    description: "A child running through a field toward her mother. A sunset over mountain ranges. Cut to servers. 'Here at Oneirocom we take your reality very seriously.' Teams behind holographic displays. 'No matter where you want to be, Oneirocom can take you there.' A swirling logo. 'Oneirocom. We make dreams reality.'",
    location: "platform-89",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: true,
    isFixed: true,
    isScenery: true,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {},
  },
  "televisions": {
    id: "televisions",
    name: "televisions",
    aliases: ["tvs", "televisions", "screens", "monitors"],
    description: "Thousands of televisions displaying infinite realities. A man in his apartment. A woman in a hospital. Children playing. Every possible life, every possible choice, every possible world.",
    location: "control-lab",
    isCarried: false,
    isWearable: false,
    isWorn: false,
    isOpenable: false,
    isOpen: false,
    isLockable: false,
    isLocked: false,
    isLit: true,
    isFixed: true,
    isScenery: true,
    isContainer: false,
    isSwitchable: false,
    isSwitchedOn: false,
    containedIn: null,
    customState: {},
  },
};

export const PUZZLES: Puzzle[] = [
  {
    id: "find-lighter",
    name: "Find the Lighter",
    solved: false,
    conditions: [
      { type: "object_state", target: "pile-of-leaves", property: "customState.searched", value: true }
    ],
    onSolve: [
      { type: "reveal_object", target: "lighter" },
      { type: "move_object", target: "lighter", value: "forest" }
    ],
    hint: "The leaves seem to hide something underneath...",
  },
  {
    id: "burn-vines",
    name: "Clear the Entrance",
    solved: false,
    conditions: [
      { type: "inventory", target: "lighter", value: true },
      { type: "object_state", target: "subway-vines", property: "customState.burned", value: true }
    ],
    onSolve: [
      { type: "unlock_exit", target: "clearing:east" }
    ],
    hint: "The vines are fresh but might burn eventually...",
    logosExperiment: "Does agent use environmental objects creatively?",
  },
  {
    id: "unlock-turnstile",
    name: "Activate the Turnstile",
    solved: false,
    conditions: [
      { type: "object_state", target: "turnstile-panel", property: "isOpen", value: true },
      { type: "object_state", target: "turnstile-actuator", property: "isSwitchedOn", value: true }
    ],
    onSolve: [
      { type: "set_flag", target: "turnstile-unlocked", value: true }
    ],
    hint: "The turnstile has panels that might open...",
    logosExperiment: "Agent examines mechanical objects for hidden mechanisms",
  },
  {
    id: "platform-shift",
    name: "See Both Worlds",
    solved: false,
    conditions: [
      { type: "object_state", target: "electric-bulbs", property: "isSwitchedOn", value: false }
    ],
    onSolve: [
      { type: "set_flag", target: "platform-dark-mode", value: true },
      { type: "trigger_event", target: "reality-shift" }
    ],
    hint: "The lights seem to shift reality when they flicker...",
    logosExperiment: "Agent manipulates light to perceive alternate realities",
  },
  {
    id: "focus-dream-desk",
    name: "Focus on Dreams",
    solved: false,
    conditions: [
      { type: "object_state", target: "dream-desk", property: "customState.focused", value: true }
    ],
    onSolve: [
      { type: "reveal_object", target: "dream-drawer" }
    ],
    hint: "Dreams respond to attention and concentration...",
  },
  {
    id: "become-void",
    name: "Become One with the Void",
    solved: false,
    conditions: [
      { type: "object_state", target: "void", property: "isWorn", value: true }
    ],
    onSolve: [
      { type: "set_flag", target: "void-state", value: true },
      { type: "trigger_event", target: "void-transcendence" }
    ],
    hint: "In nothingness, you can become anything...",
    logosExperiment: "Agent attempts metaphysical union with abstract concepts",
  },
];

export function getDefaultGameState(): GameState {
  return {
    currentRoom: "empty-space",
    previousRoom: null,
    inventory: [],
    playerName: "Nemo",
    playerState: "normal",
    wornItems: [],
    flags: {
      beginning: true,
      selfReflection: false,
      voidState: false,
    },
    puzzlesSolved: [],
    turnsElapsed: 0,
    roomsVisited: [],
    objectStates: {},
  };
}
