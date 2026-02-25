import type { DeskSprite, Palette } from "./types";
import { parsePixelGrid } from "./parser";

// ── Shared desk palette ─────────────────────────────────────────

const DESK_PAL: Palette = {
  W: "#5B3A1A", // wood dark
  L: "#8B6914", // wood light
  T: "#A0782C", // wood top
  M: "#2a2040", // monitor frame
  S: "#3b4f6f", // screen
  G: "#22c55e", // screen glow
  K: "#1a1030", // keyboard
  C: "#6B7280", // chair
  D: "#4B5563", // chair dark
};

// ── Core agent desks (unique designs) ───────────────────────────

// ARIA desk — large, dual monitor
const ARIA_DESK_ROWS = [
  "...MMMM.MMMM...",
  "...MSSSM.MSSSM..",
  "...MSSSM.MSSSM..",
  "...MMMM.MMMM...",
  "....MM...MM.....",
  "TTTTTTTTTTTTTTTT",
  "TTTKKKKKKKTTTTT.",
  "LLLLLLLLLLLLLLLL",
  "W..............W",
  "W..............W",
  "WWWWWWWWWWWWWWWW",
];

const ARIA_DESK_GLOW_ROWS = [
  "...GGGG.GGGG...",
  "...G...G.G...G..",
  "...G...G.G...G..",
  "...GGGG.GGGG...",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const GLOW_PAL: Palette = { G: "rgba(34,197,94,0.3)" };

const SINGLE_MONITOR_GLOW = parsePixelGrid(
  [
    ".....GGGG.......",
    ".....G..G.......",
    ".....G..G.......",
    ".....GGGG.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  GLOW_PAL,
);

export const ARIA_DESK: DeskSprite = {
  base: parsePixelGrid(ARIA_DESK_ROWS, DESK_PAL),
  workingOverlay: parsePixelGrid(ARIA_DESK_GLOW_ROWS, GLOW_PAL),
};

// BOLT desk — single monitor, coffee cup
const BOLT_PAL_EXT: Palette = {
  ...DESK_PAL,
  B: "#8B4513", // coffee
  F: "#D4A574", // coffee foam
};

const BOLT_DESK_ROWS = [
  ".....MMMM.......",
  ".....MSSSM......",
  ".....MSSSM......",
  ".....MMMM.......",
  "......MM........",
  "TTTTTTTTTTTTTTTT",
  "TTTKKKKKTTT.BF..",
  "LLLLLLLLLLLLLLLL",
  "W..............W",
  "W..............W",
  "WWWWWWWWWWWWWWWW",
];

export const BOLT_DESK: DeskSprite = {
  base: parsePixelGrid(BOLT_DESK_ROWS, BOLT_PAL_EXT),
  workingOverlay: SINGLE_MONITOR_GLOW,
};

// SAGE desk — monitor + books stack
const SAGE_PAL_EXT: Palette = {
  ...DESK_PAL,
  P: "#8B5CF6", // book
  R: "#A78BFA", // book light
};

const SAGE_DESK_ROWS = [
  ".....MMMM.......",
  ".....MSSSM......",
  ".....MSSSM......",
  ".....MMMM..PR...",
  "......MM...PP...",
  "TTTTTTTTTTTTTTTT",
  "TTTKKKKKKTTTTTT.",
  "LLLLLLLLLLLLLLLL",
  "W..............W",
  "W..............W",
  "WWWWWWWWWWWWWWWW",
];

export const SAGE_DESK: DeskSprite = {
  base: parsePixelGrid(SAGE_DESK_ROWS, SAGE_PAL_EXT),
  workingOverlay: SINGLE_MONITOR_GLOW,
};

// PIXEL desk — monitor + palette + stylus
const PIXEL_PAL_EXT: Palette = {
  ...DESK_PAL,
  R: "#EF4444",
  Y: "#F59E0B",
  P: "#EC4899",
};

const PIXEL_DESK_ROWS = [
  ".....MMMM.......",
  ".....MSSSM......",
  ".....MSSSM......",
  ".....MMMM.......",
  "......MM........",
  "TTTTTTTTTTTTTTTT",
  "TTTKKKKKT.RYP.T.",
  "LLLLLLLLLLLLLLLL",
  "W..............W",
  "W..............W",
  "WWWWWWWWWWWWWWWW",
];

export const PIXEL_DESK: DeskSprite = {
  base: parsePixelGrid(PIXEL_DESK_ROWS, PIXEL_PAL_EXT),
  workingOverlay: SINGLE_MONITOR_GLOW,
};

// ── Utility agent desk (shared template with accent color) ──────

function makeUtilityDesk(accentColor: string): DeskSprite {
  const pal: Palette = {
    ...DESK_PAL,
    A: accentColor,
  };

  const rows = [
    ".....MMMM.......",
    ".....MSSSM......",
    ".....MSSSM......",
    ".....MMMM.......",
    "......MM........",
    "TTTTTTTTTTTTTTTT",
    "TTTKKKKKTTTAAT..",
    "LLLLLLLLLLLLLLLL",
    "W..............W",
    "W..............W",
    "WWWWWWWWWWWWWWWW",
  ];

  return {
    base: parsePixelGrid(rows, pal),
    workingOverlay: SINGLE_MONITOR_GLOW,
  };
}

// ── Export map by agent ID ──────────────────────────────────────

export const DESK_SPRITES: Record<string, DeskSprite> = {
  leader: ARIA_DESK,
  bolt: BOLT_DESK,
  sage: SAGE_DESK,
  pixel: PIXEL_DESK,
  "review-security": makeUtilityDesk("#EF4444"),
  "review-readability": makeUtilityDesk("#22C55E"),
  "review-efficiency": makeUtilityDesk("#F97316"),
  "review-modernization": makeUtilityDesk("#A855F7"),
  "test-agent": makeUtilityDesk("#14B8A6"),
  "commit-agent": makeUtilityDesk("#A78BFA"),
};
