export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export type PixelFrame = Pixel[];

export interface PixelAnimation {
  frames: PixelFrame[];
  /** ms per frame */
  frameDuration: number;
}

export interface CharacterSprites {
  idle: PixelAnimation;
  working: PixelAnimation;
  error: PixelAnimation;
}

export interface DeskSprite {
  base: PixelFrame;
  /** Optional overlay for working state (monitor glow, etc.) */
  workingOverlay?: PixelFrame;
}

export interface RoomDecoration {
  pixels: PixelFrame;
  x: number;
  y: number;
}

export type Palette = Record<string, string>;

// ── Shared pixel dimension constants ────────────────────────────
export const PIXEL_SCALE = 3;
export const CHAR_PIXEL_W = 12;
export const CHAR_PIXEL_H = 16;
export const DESK_PIXEL_W = 16;
export const DESK_PIXEL_H = 11;

export interface AgentSeat {
  id: string;
  x: number;
  y: number;
  /** Row index for z-ordering (higher = closer to viewer) */
  row: number;
}
