import { useMemo } from "react";
import { PixelRenderer } from "./PixelRenderer";
import { ROOM_DECORATIONS } from "./pixelData/room";
import { offsetFrame } from "./pixelData/parser";

interface OfficeRoomProps {
  width: number;
  height: number;
}

export function OfficeRoom({ width, height }: OfficeRoomProps) {
  const decorationFrames = useMemo(
    () => ROOM_DECORATIONS.map((d) => offsetFrame(d.pixels, d.x, d.y)),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ width, height }}>
      {/* Wall */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "45%",
          background: "linear-gradient(180deg, #1e1540 0%, #251a50 60%, #2a1d58 100%)",
          borderBottom: "3px solid #3d2d70",
        }}
      />

      {/* Floor */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "55%",
          background: `
            repeating-conic-gradient(#1a1335 0% 25%, #1e1640 0% 50%)
            0 0 / 40px 40px`,
          opacity: 0.8,
        }}
      />

      {/* Floor highlight for depth */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "55%",
          background: "linear-gradient(180deg, transparent 0%, rgba(30, 20, 60, 0.4) 100%)",
        }}
      />

      {/* Wall decorative line (wainscoting) */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "43%",
          height: "4px",
          background: "linear-gradient(90deg, #3d2d70, #5b3fa0, #3d2d70)",
          opacity: 0.6,
        }}
      />

      {/* Room decorations (window, clock, plant, bookshelf) */}
      {decorationFrames.map((frame, i) => (
        <PixelRenderer key={i} frame={frame} scale={3} />
      ))}
    </div>
  );
}
