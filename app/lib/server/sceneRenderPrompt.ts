export type RenderPuzzleSnapshot = {
  id: string;
  name: string;
  hint?: string | null;
  solved?: boolean;
};

export type SceneRenderSnapshot = {
  roomId?: string;
  roomName: string;
  region?: string;
  roomDescription: string;
  visibleObjects: string[];
  visibleObjectDetails?: string[];
  diegeticTextAnchors?: string[];
  allowDiegeticText?: boolean;
  inventory: string[];
  recentMoments: string[];
  playerFocus?: string;
  styleHint?: string;
  clueHint?: string;
};

function cleanText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanMoment(value: string): string {
  return cleanText(value, 220)
    .replace(/^(USER|ASSISTANT|SYSTEM)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldUseFirstPerson(snapshot: SceneRenderSnapshot): boolean {
  const combined = `${snapshot.playerFocus || ""} ${snapshot.styleHint || ""}`.toLowerCase();
  return /\b(first[\s-]?person|pov|point of view|bodycam|from my eyes)\b/.test(combined);
}

function inferSetDressing(snapshot: SceneRenderSnapshot): string[] {
  const source = `${snapshot.roomName} ${snapshot.region || ""} ${snapshot.roomDescription}`.toLowerCase();
  const details: string[] = [];

  const isBedroom = /\b(bedroom|bed|poster|desk|closet|teen|teenage|room)\b/.test(source);
  const hasElectronics = /\b(computer|monitor|crt|tv|radio|speaker|console|terminal|keyboard)\b/.test(source);

  if (isBedroom || hasElectronics) {
    details.push("mid-1990s teenage bedroom set dressing");
    details.push("beige CRT monitor and chunky plastic peripherals");
    details.push("messy desk with cassettes, floppy disks, cables, and scribbled notes");
    details.push("aged posters, stickered hardware, and worn particleboard furniture");
  }

  if (/\b(window|rain|storm|fog|night)\b/.test(source)) {
    details.push("rain-streaked window glass and humid nighttime atmosphere");
  }

  if (/\b(subway|station|tunnel|concrete|industrial)\b/.test(source)) {
    details.push("industrial concrete textures with practical sodium/fluorescent spill");
  }

  if (details.length === 0) {
    details.push("analog cyber-noir set dressing with tactile clutter and lived-in imperfections");
  }

  return details;
}

export function choosePuzzleClue(
  puzzles: RenderPuzzleSnapshot[],
  solvedIds: string[] = []
): string | undefined {
  const solved = new Set(solvedIds);
  const unresolved = puzzles.filter(
    (p) => !p.solved && !solved.has(p.id)
  );

  const withHint = unresolved.find((p) => typeof p.hint === "string" && p.hint.trim().length > 0);
  if (withHint?.hint) {
    return cleanText(withHint.hint, 180);
  }

  const fallback = unresolved[0];
  if (!fallback) return undefined;
  return `A subtle motif tied to "${cleanText(fallback.name, 80)}".`;
}

export function buildSceneRenderPrompt(snapshot: SceneRenderSnapshot): string {
  const roomName = cleanText(snapshot.roomName, 120);
  const region = snapshot.region ? cleanText(snapshot.region, 80) : "Unknown region";
  const roomDescription = cleanText(snapshot.roomDescription, 1800);
  const objects = snapshot.visibleObjects.length
    ? snapshot.visibleObjects.map((o) => cleanText(o, 80)).join(", ")
    : "none visible";
  const objectDetails = (snapshot.visibleObjectDetails || [])
    .slice(0, 12)
    .map((d) => cleanText(d, 200))
    .filter(Boolean)
    .map((d) => `- ${d}`)
    .join("\n");
  const textAnchors = (snapshot.diegeticTextAnchors || [])
    .slice(0, 10)
    .map((value) => cleanText(value, 120))
    .filter(Boolean)
    .map((value) => `- "${value}"`)
    .join("\n");
  const allowDiegeticText = Boolean(snapshot.allowDiegeticText);
  const inventory = snapshot.inventory.length
    ? snapshot.inventory.map((i) => cleanText(i, 80)).join(", ")
    : "empty";
  const moments = snapshot.recentMoments
    .slice(-6)
    .map((m) => cleanMoment(m))
    .filter(Boolean)
    .map((m) => `- ${m}`)
    .join("\n");
  const setDressing = inferSetDressing(snapshot)
    .map((item) => `- ${item}`)
    .join("\n");
  const firstPerson = shouldUseFirstPerson(snapshot);

  const lines = [
    "Create one high-fidelity cinematic still.",
    "Visual direction: Matrix-like cyber-noir mood fused with late-90s analog nostalgia (Ready Player One vibe, but grounded and moody).",
    firstPerson
      ? "Camera perspective: immersive first-person floating camera, bodiless viewpoint (no hands, arms, or player body in frame)."
      : "Camera perspective: immersive floating observer camera at eye-line, bodiless viewpoint (no hands, arms, or player body in frame).",
    "Embodiment policy: player actions are intent only. Do not depict a protagonist body, face, silhouette, gloves, or hands unless explicitly requested for a third-person shot.",
    "Character policy: environmental scene-first composition. Do not add a main human figure unless explicitly demanded by narrative context.",
    "Target look: photoreal live-action production frame with coherent geometry, physically plausible materials, and filmic practical lighting.",
    "Color language: CRT phosphor greens and cyans balanced with warm tungsten amber and deep shadow detail.",
    allowDiegeticText
      ? "Hard constraints: no UI/HUD, no subtitles, no captions, no watermarks, no terminal text overlays."
      : "Hard constraints: no UI/HUD, no subtitles, no captions, no logos, no letters, no watermarks, no terminal text overlays.",
    "Do not render brand/model names, packaging, product mockups, or floating hero objects unless explicitly requested in scene grounding.",
    allowDiegeticText
      ? "Text policy: include only diegetic in-world text grounded by scene anchors (notes/posters/screens). Keep spelling exact and concise; do not invent brand copy."
      : "Text policy: avoid readable text unless explicitly grounded in-world.",
    allowDiegeticText
      ? "For note/book/comic/screen close-ups: render anchor text exactly as provided. Never replace with generic placeholder labels like 'sticky note' or 'note'."
      : "If no explicit text anchors are provided, avoid readable typography.",
    "Avoid synthetic artifacts: no low-poly look, no plastic skin, no simplistic CGI render, no game-engine screenshot aesthetic unless explicitly requested.",
    "",
    "[SCENE GROUNDING]",
    `Room: ${roomName}`,
    `Region: ${region}`,
    `Description: ${roomDescription}`,
    `Visible objects: ${objects}`,
    `Inventory context: ${inventory}`,
    "Scene completeness: include room-defining anchors (bed, walls/posters, desk/computers, window, shelving) when grounded by room/object details.",
    "Continuity priority: preserve established room topology and object placement; avoid replacing key anchors with unrelated hero props.",
    "",
    "[ART DIRECTION DETAILS]",
    setDressing,
  ];

  if (objectDetails.length > 0) {
    lines.push("");
    lines.push("[OBJECT DETAIL ANCHORS]");
    lines.push(objectDetails);
  }

  if (allowDiegeticText && textAnchors.length > 0) {
    lines.push("");
    lines.push("[DIEGETIC TEXT ANCHORS]");
    lines.push(textAnchors);
  }

  if (moments.length > 0) {
    lines.push("");
    lines.push("[NARRATIVE BEATS TO ENCODE VISUALLY]");
    lines.push(moments);
  }

  if (snapshot.playerFocus?.trim()) {
    lines.push(
      `Player requested emphasis: ${cleanText(snapshot.playerFocus, 300)}. Frame this focus clearly while preserving surrounding room continuity.`
    );
  }

  if (snapshot.styleHint?.trim()) {
    lines.push(`Stylistic guidance: ${cleanText(snapshot.styleHint, 240)}`);
  } else {
    lines.push(
      "Stylistic guidance: cinematic psychological thriller frame, retro-tech production design, subtle surreal tension, high-fidelity textures."
    );
  }

  if (snapshot.clueHint?.trim()) {
    lines.push(
      `Optional covert clue: weave this subtly into scene details without explicit callout -> ${cleanText(
        snapshot.clueHint,
        220
      )}`
    );
  }

  lines.push(
    "Use narrative beats as atmosphere and object choices, not as literal rendered text.",
    "Preserve continuity with prior visuals if reference images are provided while upgrading aesthetic quality and composition."
  );

  return lines.join("\n");
}
