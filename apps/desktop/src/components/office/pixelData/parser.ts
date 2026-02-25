import type { Pixel, PixelFrame, Palette } from "./types";

/**
 * Parse a compact string grid into a PixelFrame.
 * Each character maps to a palette color. '.' is transparent (skipped).
 */
export function parsePixelGrid(rows: string[], palette: Palette): PixelFrame {
  const pixels: Pixel[] = [];
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]!;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]!;
      if (ch === ".") continue;
      const color = palette[ch];
      if (color) {
        pixels.push({ x, y, color });
      }
    }
  }
  return pixels;
}

/**
 * Offset all pixels in a frame by (dx, dy).
 */
export function offsetFrame(frame: PixelFrame, dx: number, dy: number): PixelFrame {
  return frame.map((p) => ({ x: p.x + dx, y: p.y + dy, color: p.color }));
}

/**
 * Mirror a frame horizontally within a bounding box of `width` pixel columns.
 */
export function mirrorFrame(frame: PixelFrame, width: number): PixelFrame {
  return frame.map((p) => ({ ...p, x: width - 1 - p.x }));
}

/**
 * Merge multiple pixel frames into one (later frames overwrite earlier on collision).
 */
export function mergeFrames(...frames: PixelFrame[]): PixelFrame {
  return frames.flat();
}

/**
 * Recolor all pixels matching oldColor to newColor.
 */
export function recolorFrame(frame: PixelFrame, colorMap: Record<string, string>): PixelFrame {
  return frame.map((p) => ({
    ...p,
    color: colorMap[p.color] ?? p.color,
  }));
}
