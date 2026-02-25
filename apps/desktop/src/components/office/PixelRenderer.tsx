import { useMemo } from "react";
import type { PixelFrame } from "./pixelData/types";

interface PixelRendererProps {
  frame: PixelFrame;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

function pixelsToBoxShadow(pixels: PixelFrame, scale: number): string {
  return pixels
    .map(
      (p) =>
        `${p.x * scale}px ${p.y * scale}px 0 ${scale / 2}px ${p.color}`,
    )
    .join(",");
}

export function PixelRenderer({
  frame,
  scale = 3,
  className,
  style,
}: PixelRendererProps) {
  const boxShadow = useMemo(
    () => pixelsToBoxShadow(frame, scale),
    [frame, scale],
  );

  return (
    <div
      className={className}
      style={{
        width: "1px",
        height: "1px",
        boxShadow,
        position: "absolute",
        top: 0,
        left: 0,
        willChange: "box-shadow",
        ...style,
      }}
    />
  );
}
