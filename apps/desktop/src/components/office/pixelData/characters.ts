import type { CharacterSprites, Palette } from "./types";
import { parsePixelGrid } from "./parser";

// ── ARIA (Leader) — Crown, golden robe, multi-monitor ──────────────

const ARIA_PAL: Palette = {
  G: "#F59E0B", // gold crown
  S: "#F5CBA0", // skin
  R: "#7C3AED", // robe
  D: "#5B21B6", // robe dark
  H: "#1a0f30", // hair
  W: "#E2E0F0", // white accent
  E: "#1a1030", // eyes
};

const ARIA_IDLE_1 = [
  "....GGG.....",
  "...GGGGG....",
  "...HHHHH....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...RRRR.....",
  "..RRRRRR....",
  "..RDRRDR....",
  ".RRRRRRRR...",
  ".RRRRRRRR...",
  "..RRRRRR....",
  "...RR.RR....",
  "...DD.DD....",
  "...DD.DD....",
];

const ARIA_IDLE_2 = [
  "....GGG.....",
  "...GGGGG....",
  "...HHHHH....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...RRRR.....",
  "..RRRRRR....",
  "..RDRRDR....",
  ".RRRRRRRR...",
  ".RRRRRRRR...",
  "..RRRRRR....",
  "...RR.RR....",
  "...DD.DD....",
  "..DD..DD....",
];

const ARIA_WORK_1 = [
  "....GGG.....",
  "...GGGGG....",
  "...HHHHH....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...RRRR.....",
  "..RRRRRRR...",
  "..RDRRDRR...",
  ".RRRRRRRR...",
  ".RRRRRRRR...",
  "..RRRRRR....",
  "...RR.RR....",
  "...DD.DD....",
  "...DD.DD....",
];

const ARIA_WORK_2 = [
  "....GGG.....",
  "...GGGGG....",
  "...HHHHH....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...RRRR.....",
  "..RRRRRRR...",
  "..RDRRDR.R..",
  ".RRRRRRRR...",
  ".RRRRRRRR...",
  "..RRRRRR....",
  "...RR.RR....",
  "...DD.DD....",
  "...DD.DD....",
];

const ARIA_WORK_3 = [
  "....GGG.....",
  "...GGGGG....",
  "...HHHHH....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...RRRR.....",
  ".RRRRRRRR...",
  ".RDRRDR..R..",
  ".RRRRRRRR...",
  ".RRRRRRRR...",
  "..RRRRRR....",
  "...RR.RR....",
  "...DD.DD....",
  "...DD.DD....",
];

const ARIA_ERR_1 = [
  "....GGG.....",
  "...GGGGG....",
  "...HHHHH....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSSS.....",
  "...RRRR.....",
  "..RRRRRR....",
  "..RDRRDR....",
  ".RRRRRRRR...",
  ".RRRRRRRR...",
  "..RRRRRR....",
  "...RR.RR....",
  "...DD.DD....",
  "...DD.DD....",
];

const ARIA_ERR_2 = ARIA_IDLE_1;

export const ARIA_SPRITES: CharacterSprites = {
  idle: {
    frames: [ARIA_IDLE_1, ARIA_IDLE_2].map((r) => parsePixelGrid(r, ARIA_PAL)),
    frameDuration: 800,
  },
  working: {
    frames: [ARIA_WORK_1, ARIA_WORK_2, ARIA_WORK_3, ARIA_WORK_2].map((r) =>
      parsePixelGrid(r, ARIA_PAL),
    ),
    frameDuration: 300,
  },
  error: {
    frames: [ARIA_ERR_1, ARIA_ERR_2].map((r) => parsePixelGrid(r, ARIA_PAL)),
    frameDuration: 500,
  },
};

// ── BOLT (Developer) — Hood, headphones, coffee ─────────────────

const BOLT_PAL: Palette = {
  B: "#3B82F6", // blue hood
  D: "#1D4ED8", // dark blue
  S: "#F5CBA0", // skin
  H: "#1a0f30", // hair
  W: "#E2E0F0", // white
  E: "#1a1030", // eyes
  G: "#6B7280", // headphones gray
  C: "#8B4513", // coffee
};

const BOLT_IDLE_1 = [
  "...BBBBB....",
  "..BBBBBBB...",
  "..BBHHHBB...",
  ".GBSSSSBG..",
  ".GSSEESSSG.",
  "..SSSSSSS...",
  "...SSWSS....",
  "...BBBB.....",
  "..BBBBBB....",
  "..BDBDBB....",
  ".BBBBBBBB...",
  ".BBBBBBBB...",
  "..BBBBBB....",
  "...BB.BB....",
  "...DD.DD....",
  "...DD.DD....",
];

const BOLT_IDLE_2 = [
  "...BBBBB....",
  "..BBBBBBB...",
  "..BBHHHBB...",
  ".GBSSSSBG..",
  ".GSSESSSSG.",
  "..SSSSSSS...",
  "...SSWSS....",
  "...BBBB.....",
  "..BBBBBB....",
  "..BDBDBB....",
  ".BBBBBBBB...",
  ".BBBBBBBB...",
  "..BBBBBB....",
  "...BB.BB....",
  "...DD.DD....",
  "..DD..DD....",
];

const BOLT_WORK_1 = [
  "...BBBBB....",
  "..BBBBBBB...",
  "..BBHHHBB...",
  ".GBSSSSBG..",
  ".GSSESSSG...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...BBBB.....",
  "..BBBBBBS...",
  "..BDBDBB.S..",
  ".BBBBBBBB...",
  ".BBBBBBBB...",
  "..BBBBBB....",
  "...BB.BB....",
  "...DD.DD....",
  "...DD.DD....",
];

const BOLT_WORK_2 = [
  "...BBBBB....",
  "..BBBBBBB...",
  "..BBHHHBB...",
  ".GBSSSSBG..",
  ".GSSESSSG...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...BBBB.....",
  "..BBBBBBS...",
  "..BDBDBBS...",
  ".BBBBBBBB...",
  ".BBBBBBBB...",
  "..BBBBBB....",
  "...BB.BB....",
  "...DD.DD....",
  "...DD.DD....",
];

const BOLT_WORK_3 = [
  "...BBBBB....",
  "..BBBBBBB...",
  "..BBHHHBB...",
  ".GBSSSSBG..",
  ".GSSESSSG...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...BBBB.....",
  ".SBBBBBBS...",
  ".SBDBDBB.S..",
  ".BBBBBBBB...",
  ".BBBBBBBB...",
  "..BBBBBB....",
  "...BB.BB....",
  "...DD.DD....",
  "...DD.DD....",
];

const BOLT_ERR_1 = [
  "...BBBBB....",
  "..BBBBBBB...",
  "..BBHHHBB...",
  ".GBSSSSBG..",
  ".GSSESSSG...",
  "..SSSSSSS...",
  "...SSSS.....",
  "...BBBB.....",
  "..BBBBBB....",
  "..BDBDBB....",
  ".BBBBBBBB...",
  ".BBBBBBBB...",
  "..BBBBBB....",
  "...BB.BB....",
  "...DD.DD....",
  "...DD.DD....",
];

export const BOLT_SPRITES: CharacterSprites = {
  idle: {
    frames: [BOLT_IDLE_1, BOLT_IDLE_2].map((r) => parsePixelGrid(r, BOLT_PAL)),
    frameDuration: 800,
  },
  working: {
    frames: [BOLT_WORK_1, BOLT_WORK_2, BOLT_WORK_3, BOLT_WORK_2].map((r) =>
      parsePixelGrid(r, BOLT_PAL),
    ),
    frameDuration: 250,
  },
  error: {
    frames: [BOLT_ERR_1, BOLT_IDLE_1].map((r) => parsePixelGrid(r, BOLT_PAL)),
    frameDuration: 500,
  },
};

// ── SAGE (Researcher) — Robe, glasses, floating book ────────────

const SAGE_PAL: Palette = {
  P: "#8B5CF6", // purple robe
  D: "#6D28D9", // dark purple
  S: "#F5CBA0", // skin
  H: "#E2E0F0", // white/silver hair
  W: "#E2E0F0", // white
  E: "#1a1030", // eyes
  G: "#A78BFA", // glasses
  L: "#C4B5FD", // light purple
};

const SAGE_IDLE_1 = [
  "...HHHHH....",
  "..HHHHHHH...",
  "..HHHHHH....",
  "..HSSSSSH...",
  "..GSEGSEGS..",
  "..SSSSSSS...",
  "...SSWSS....",
  "...PPPP.....",
  "..PPPPPP....",
  "..PDPPPP....",
  ".PPPPPPPP...",
  ".PPPPPPPP...",
  "..PPPPPP....",
  "...PP.PP....",
  "...DD.DD....",
  "...DD.DD....",
];

const SAGE_IDLE_2 = [
  "...HHHHH....",
  "..HHHHHHH...",
  "..HHHHHH....",
  "..HSSSSSH...",
  "..GSEGSEGS..",
  "..SSSSSSS...",
  "...SSWSS....",
  "...PPPP.....",
  "..PPPPPP....",
  "..PDPPPP....",
  ".PPPPPPPP...",
  ".PPPPPPPP...",
  "..PPPPPP....",
  "...PP.PP....",
  "...DD.DD....",
  "..DD..DD....",
];

const SAGE_WORK_1 = [
  "...HHHHH....",
  "..HHHHHHH...",
  "..HHHHHH....",
  "..HSSSSSH...",
  "..GSEGSEGS..",
  "..SSSSSSS...",
  "...SSWSS....",
  "...PPPP.....",
  "..PPPPPPS...",
  "..PDPPPP.S..",
  ".PPPPPPPP...",
  ".PPPPPPPP...",
  "..PPPPPP....",
  "...PP.PP....",
  "...DD.DD....",
  "...DD.DD....",
];

const SAGE_WORK_2 = [
  "...HHHHH....",
  "..HHHHHHH...",
  "..HHHHHH....",
  "..HSSSSSH...",
  "..GSEGSEGS..",
  "..SSSSSSS...",
  "...SSWSS....",
  "...PPPP.....",
  "..PPPPPP.S..",
  "..PDPPPPS...",
  ".PPPPPPPP...",
  ".PPPPPPPP...",
  "..PPPPPP....",
  "...PP.PP....",
  "...DD.DD....",
  "...DD.DD....",
];

const SAGE_ERR_1 = [
  "...HHHHH....",
  "..HHHHHHH...",
  "..HHHHHH....",
  "..HSSSSSH...",
  "..GSEGSEGS..",
  "..SSSSSSS...",
  "...SSSS.....",
  "...PPPP.....",
  "..PPPPPP....",
  "..PDPPPP....",
  ".PPPPPPPP...",
  ".PPPPPPPP...",
  "..PPPPPP....",
  "...PP.PP....",
  "...DD.DD....",
  "...DD.DD....",
];

export const SAGE_SPRITES: CharacterSprites = {
  idle: {
    frames: [SAGE_IDLE_1, SAGE_IDLE_2].map((r) => parsePixelGrid(r, SAGE_PAL)),
    frameDuration: 900,
  },
  working: {
    frames: [SAGE_WORK_1, SAGE_WORK_2, SAGE_WORK_1, SAGE_WORK_2].map((r) =>
      parsePixelGrid(r, SAGE_PAL),
    ),
    frameDuration: 300,
  },
  error: {
    frames: [SAGE_ERR_1, SAGE_IDLE_1].map((r) => parsePixelGrid(r, SAGE_PAL)),
    frameDuration: 500,
  },
};

// ── PIXEL (Designer) — Beret, stylus, palette ───────────────────

const PIXEL_PAL: Palette = {
  K: "#EC4899", // pink
  D: "#BE185D", // dark pink
  S: "#F5CBA0", // skin
  H: "#4A1942", // dark hair
  W: "#E2E0F0", // white
  E: "#1a1030", // eyes
  B: "#1a0f30", // beret
};

const PIXEL_IDLE_1 = [
  "..BBBBB.....",
  ".BBBBBBB....",
  ".BBKKKBB....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...KKKK.....",
  "..KKKKKK....",
  "..KDKKDK....",
  ".KKKKKKKK...",
  ".KKKKKKKK...",
  "..KKKKKK....",
  "...KK.KK....",
  "...DD.DD....",
  "...DD.DD....",
];

const PIXEL_IDLE_2 = [
  "..BBBBB.....",
  ".BBBBBBB....",
  ".BBKKKBB....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...KKKK.....",
  "..KKKKKK....",
  "..KDKKDK....",
  ".KKKKKKKK...",
  ".KKKKKKKK...",
  "..KKKKKK....",
  "...KK.KK....",
  "...DD.DD....",
  "..DD..DD....",
];

const PIXEL_WORK_1 = [
  "..BBBBB.....",
  ".BBBBBBB....",
  ".BBKKKBB....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...KKKK.....",
  "..KKKKKKS...",
  "..KDKKDK.S..",
  ".KKKKKKKK...",
  ".KKKKKKKK...",
  "..KKKKKK....",
  "...KK.KK....",
  "...DD.DD....",
  "...DD.DD....",
];

const PIXEL_WORK_2 = [
  "..BBBBB.....",
  ".BBBBBBB....",
  ".BBKKKBB....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSWSS....",
  "...KKKK.....",
  "..KKKKKK.S..",
  "..KDKKDKS...",
  ".KKKKKKKK...",
  ".KKKKKKKK...",
  "..KKKKKK....",
  "...KK.KK....",
  "...DD.DD....",
  "...DD.DD....",
];

const PIXEL_ERR_1 = [
  "..BBBBB.....",
  ".BBBBBBB....",
  ".BBKKKBB....",
  "..HSSSSSH...",
  "..SSEESSE...",
  "..SSSSSSS...",
  "...SSSS.....",
  "...KKKK.....",
  "..KKKKKK....",
  "..KDKKDK....",
  ".KKKKKKKK...",
  ".KKKKKKKK...",
  "..KKKKKK....",
  "...KK.KK....",
  "...DD.DD....",
  "...DD.DD....",
];

export const PIXEL_SPRITES: CharacterSprites = {
  idle: {
    frames: [PIXEL_IDLE_1, PIXEL_IDLE_2].map((r) =>
      parsePixelGrid(r, PIXEL_PAL),
    ),
    frameDuration: 800,
  },
  working: {
    frames: [PIXEL_WORK_1, PIXEL_WORK_2, PIXEL_WORK_1, PIXEL_WORK_2].map(
      (r) => parsePixelGrid(r, PIXEL_PAL),
    ),
    frameDuration: 280,
  },
  error: {
    frames: [PIXEL_ERR_1, PIXEL_IDLE_1].map((r) =>
      parsePixelGrid(r, PIXEL_PAL),
    ),
    frameDuration: 500,
  },
};

// ── Utility Agent Base (shared office worker template) ──────────

function makeUtilitySprites(accentColor: string, darkAccent: string): CharacterSprites {
  const pal: Palette = {
    A: accentColor,
    D: darkAccent,
    S: "#F5CBA0",
    H: "#4A3728",
    W: "#E2E0F0",
    E: "#1a1030",
    T: "#2a1d3a", // shirt
  };

  const idle1 = [
    "...HHHHH....",
    "..HHHHHHH...",
    "..HHHHHHH...",
    "..HSSSSSH...",
    "..SSEESSE...",
    "..SSSSSSS...",
    "...SSWSS....",
    "...AAAA.....",
    "..AATAAA....",
    "..ADAADA....",
    ".AAAAAAAA...",
    ".AAAAAAAA...",
    "..AAAAAA....",
    "...AA.AA....",
    "...DD.DD....",
    "...DD.DD....",
  ];

  const idle2 = [
    "...HHHHH....",
    "..HHHHHHH...",
    "..HHHHHHH...",
    "..HSSSSSH...",
    "..SSEESSE...",
    "..SSSSSSS...",
    "...SSWSS....",
    "...AAAA.....",
    "..AATAAA....",
    "..ADAADA....",
    ".AAAAAAAA...",
    ".AAAAAAAA...",
    "..AAAAAA....",
    "...AA.AA....",
    "...DD.DD....",
    "..DD..DD....",
  ];

  const work1 = [
    "...HHHHH....",
    "..HHHHHHH...",
    "..HHHHHHH...",
    "..HSSSSSH...",
    "..SSEESSE...",
    "..SSSSSSS...",
    "...SSWSS....",
    "...AAAA.....",
    "..AATAAAS...",
    "..ADAAD.S...",
    ".AAAAAAAA...",
    ".AAAAAAAA...",
    "..AAAAAA....",
    "...AA.AA....",
    "...DD.DD....",
    "...DD.DD....",
  ];

  const work2 = [
    "...HHHHH....",
    "..HHHHHHH...",
    "..HHHHHHH...",
    "..HSSSSSH...",
    "..SSEESSE...",
    "..SSSSSSS...",
    "...SSWSS....",
    "...AAAA.....",
    "..AATAAA.S..",
    "..ADADAAS...",
    ".AAAAAAAA...",
    ".AAAAAAAA...",
    "..AAAAAA....",
    "...AA.AA....",
    "...DD.DD....",
    "...DD.DD....",
  ];

  const err1 = [
    "...HHHHH....",
    "..HHHHHHH...",
    "..HHHHHHH...",
    "..HSSSSSH...",
    "..SSEESSE...",
    "..SSSSSSS...",
    "...SSSS.....",
    "...AAAA.....",
    "..AATAAA....",
    "..ADAADA....",
    ".AAAAAAAA...",
    ".AAAAAAAA...",
    "..AAAAAA....",
    "...AA.AA....",
    "...DD.DD....",
    "...DD.DD....",
  ];

  return {
    idle: {
      frames: [idle1, idle2].map((r) => parsePixelGrid(r, pal)),
      frameDuration: 800,
    },
    working: {
      frames: [work1, work2, work1, work2].map((r) => parsePixelGrid(r, pal)),
      frameDuration: 280,
    },
    error: {
      frames: [err1, idle1].map((r) => parsePixelGrid(r, pal)),
      frameDuration: 500,
    },
  };
}

export const SECURITY_SPRITES = makeUtilitySprites("#EF4444", "#B91C1C");
export const READABILITY_SPRITES = makeUtilitySprites("#22C55E", "#15803D");
export const EFFICIENCY_SPRITES = makeUtilitySprites("#F97316", "#C2410C");
export const MODERNIZATION_SPRITES = makeUtilitySprites("#A855F7", "#7E22CE");
export const TEST_AGENT_SPRITES = makeUtilitySprites("#14B8A6", "#0D9488");
export const COMMIT_AGENT_SPRITES = makeUtilitySprites("#A78BFA", "#7C3AED");

// ── Export map by agent ID ──────────────────────────────────────

export const CHARACTER_SPRITES: Record<string, CharacterSprites> = {
  leader: ARIA_SPRITES,
  bolt: BOLT_SPRITES,
  sage: SAGE_SPRITES,
  pixel: PIXEL_SPRITES,
  "review-security": SECURITY_SPRITES,
  "review-readability": READABILITY_SPRITES,
  "review-efficiency": EFFICIENCY_SPRITES,
  "review-modernization": MODERNIZATION_SPRITES,
  "test-agent": TEST_AGENT_SPRITES,
  "commit-agent": COMMIT_AGENT_SPRITES,
};
