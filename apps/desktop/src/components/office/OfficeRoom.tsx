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
          height: "30%",
          background: "linear-gradient(180deg, #1e1540 0%, #251a50 60%, #2a1d58 100%)",
          borderBottom: "3px solid #3d2d70",
        }}
      />

      {/* Floor */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "70%",
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
          height: "70%",
          background: "linear-gradient(180deg, transparent 0%, rgba(30, 20, 60, 0.4) 100%)",
        }}
      />

      {/* Center rug */}
      <div
        className="absolute rounded-sm"
        style={{
          left: "15%",
          top: "45%",
          width: "55%",
          height: "38%",
          background: "rgba(100, 60, 160, 0.12)",
          border: "1px solid rgba(139, 92, 246, 0.1)",
          borderRadius: 4,
        }}
      />

      {/* Coffee zone floor accent */}
      <div
        className="absolute"
        style={{
          right: 0,
          top: "30%",
          width: "18%",
          height: "25%",
          background: `
            repeating-conic-gradient(#1e1540 0% 25%, #221848 0% 50%)
            0 0 / 40px 40px`,
          opacity: 0.5,
          borderLeft: "1px solid rgba(139, 92, 246, 0.08)",
        }}
      />

      {/* Wall decorative line (wainscoting) */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "28%",
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
