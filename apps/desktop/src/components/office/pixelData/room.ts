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

// ── Whiteboard ────────────────────────────────────────────────────

const WB_PAL: Palette = {
  F: "#9CA3AF", // aluminium frame
  W: "#F3F4F6", // white surface
  R: "#EF4444", // red marker line
  B: "#3B82F6", // blue marker line
  G: "#22C55E", // green marker line
  Y: "#F59E0B", // yellow marker dot
};

const WHITEBOARD_ROWS = [
  "FFFFFFFFFFFF",
  "FWWWWWWWWWWF",
  "FWRRR.BBBWWF",
  "FWWWWWWWWWWF",
  "FWWGGGGG.WWF",
  "FWWWWYWWWWWF",
  "FWWWWWWWWWWF",
  "FFFFFFFFFFFF",
];

// ── Coffee Machine ────────────────────────────────────────────────

const COFFEE_PAL: Palette = {
  M: "#5B3A1A", // machine body
  D: "#3D2510", // dark body
  S: "#9CA3AF", // steel
  R: "#EF4444", // power LED
  C: "#E2E0F0", // cup
  K: "#6B4E2A", // coffee liquid
  T: "#8B6914", // drip tray
};

const COFFEE_ROWS = [
  "..SSSS..",
  ".MMMMMM.",
  ".MDDDMM.",
  ".MDRDDM.",
  ".MDDDMM.",
  ".MMMMMM.",
  "..SSSS..",
  "...CC...",
  "...CK...",
  "..TTTT..",
];

// ── Water Cooler ──────────────────────────────────────────────────

const WATER_PAL: Palette = {
  T: "#93C5FD", // water bottle (light blue)
  B: "#60A5FA", // water bottle (medium blue)
  W: "#E2E0F0", // body white
  S: "#9CA3AF", // steel
  D: "#6B7280", // dark base
};

const WATER_ROWS = [
  "..TTTT..",
  "..TBBT..",
  "..TBBT..",
  ".SWWWWS.",
  ".SWWWWS.",
  ".SWWWWS.",
  ".SWWWWS.",
  ".SDDDDS.",
  "..DDDD..",
];

// ── Large Floor Plant ─────────────────────────────────────────────

const FPLANT_PAL: Palette = {
  G: "#22C55E", // green leaf
  D: "#15803D", // dark leaf
  B: "#8B4513", // pot
  T: "#A0782C", // pot rim
  S: "#6B4E2A", // soil
};

const FLOOR_PLANT_ROWS = [
  "...GG.GG...",
  "..GDGDGDG..",
  ".GGGGGGGGG.",
  "..GDGDGDG..",
  "...GGGGG...",
  "....GGG....",
  "...TTTTT...",
  "...BSSBB...",
  "...BBBBB...",
  "...BBBBB...",
  "....BBB....",
];

// ── Export decorations with positions ────────────────────────────

export const ROOM_DECORATIONS: RoomDecoration[] = [
  // Window (top-left area)
  {
    pixels: parsePixelGrid(WINDOW_ROWS, WIN_PAL),
    x: 30,
    y: 5,
  },
  // Whiteboard (wall center-left)
  {
    pixels: parsePixelGrid(WHITEBOARD_ROWS, WB_PAL),
    x: 100,
    y: 4,
  },
  // Clock (top-center)
  {
    pixels: parsePixelGrid(CLOCK_ROWS, CLK_PAL),
    x: 155,
    y: 8,
  },
  // Plant (top-right area)
  {
    pixels: parsePixelGrid(PLANT_ROWS, PLANT_PAL),
    x: 195,
    y: 6,
  },
  // Bookshelf (far right)
  {
    pixels: parsePixelGrid(BOOKSHELF_ROWS, BOOK_PAL),
    x: 235,
    y: 3,
  },
  // Coffee machine (right side, above floor)
  {
    pixels: parsePixelGrid(COFFEE_ROWS, COFFEE_PAL),
    x: 240,
    y: 20,
  },
  // Water cooler (right area)
  {
    pixels: parsePixelGrid(WATER_ROWS, WATER_PAL),
    x: 225,
    y: 55,
  },
  // Large floor plant (bottom-left area)
  {
    pixels: parsePixelGrid(FLOOR_PLANT_ROWS, FPLANT_PAL),
    x: 5,
    y: 110,
  },
];
