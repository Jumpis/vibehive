import type { RoomDecoration, Palette } from "./types";
import { parsePixelGrid } from "./parser";

// ── Window (arched, with light streaming in) ────────────────────

const WIN_PAL: Palette = {
  F: "#3d2d70", // frame
  S: "#1e3a5f", // sky
  L: "#2a4a7f", // sky light
  C: "#E2E0F0", // cloud
  G: "#4a3a80", // glass edge
};

const WINDOW_ROWS = [
  "..FFFFFF..",
  ".FLLLLLLF.",
  "FLLCCLLLF.",
  "FLLLLLLLLF",
  "FLLLLLLLF.",
  "FFSSSSSFF.",
  "FFSSSSSFF.",
  "FFSSSSSFF.",
  "FFFFFFFFFF",
];

// ── Wall Clock ──────────────────────────────────────────────────

const CLK_PAL: Palette = {
  F: "#5B3A1A", // frame
  W: "#E2E0F0", // face
  H: "#1a1030", // hands
  D: "#6B7280", // dots
  R: "#EF4444", // second hand tip
};

const CLOCK_ROWS = [
  ".FFFF.",
  "FWDWWF",
  "FWWHWF",
  "FDHHDF",
  "FWWWWF",
  "FWWDWF",
  ".FFFF.",
];

// ── Potted Plant ────────────────────────────────────────────────

const PLANT_PAL: Palette = {
  G: "#22C55E", // green leaf
  D: "#15803D", // dark leaf
  B: "#8B4513", // pot
  T: "#A0782C", // pot rim
  S: "#6B4E2A", // soil
};

const PLANT_ROWS = [
  "..GG.GG..",
  ".GDGDGDG.",
  ".GGGGGG..",
  "..GDGDG..",
  "...GGG...",
  "..TTTTT..",
  "..BSSBB..",
  "..BBBBB..",
  "...BBB...",
];

// ── Bookshelf ───────────────────────────────────────────────────

const BOOK_PAL: Palette = {
  W: "#5B3A1A", // wood
  L: "#8B6914", // shelf
  R: "#EF4444", // red book
  B: "#3B82F6", // blue book
  G: "#22C55E", // green book
  P: "#8B5CF6", // purple book
  Y: "#F59E0B", // yellow book
};

const BOOKSHELF_ROWS = [
  "WWWWWWWWWW",
  "WRBGPYRB.W",
  "WRBGPYRB.W",
  "LLLLLLLLLL",
  "WGPRBYGP.W",
  "WGPRBYGP.W",
  "LLLLLLLLLL",
  "WBYRPGBY.W",
  "WBYRPGBY.W",
  "WWWWWWWWWW",
];

// ── Export decorations with positions ────────────────────────────

export const ROOM_DECORATIONS: RoomDecoration[] = [
  // Window (top-left area)
  {
    pixels: parsePixelGrid(WINDOW_ROWS, WIN_PAL),
    x: 30,
    y: 5,
  },
  // Clock (top-center)
  {
    pixels: parsePixelGrid(CLOCK_ROWS, CLK_PAL),
    x: 120,
    y: 8,
  },
  // Plant (top-right area)
  {
    pixels: parsePixelGrid(PLANT_ROWS, PLANT_PAL),
    x: 175,
    y: 6,
  },
  // Bookshelf (far right)
  {
    pixels: parsePixelGrid(BOOKSHELF_ROWS, BOOK_PAL),
    x: 220,
    y: 3,
  },
];
