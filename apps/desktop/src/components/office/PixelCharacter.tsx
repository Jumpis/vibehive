import { memo, useState, useEffect, useMemo } from "react";
import { PixelRenderer } from "./PixelRenderer";
import { CHARACTER_SPRITES } from "./pixelData/characters";
import { CHAR_PIXEL_W, CHAR_PIXEL_H, PIXEL_SCALE } from "./pixelData/types";
import type { PixelFrame } from "./pixelData/types";
import type { AgentStatusValue } from "@/types/agent";
import { cn } from "@/lib/cn";

const EMPTY_FRAMES: PixelFrame[] = [];

interface PixelCharacterProps {
  agentId: string;
  status: AgentStatusValue;
  scale?: number;
}

export const PixelCharacter = memo(function PixelCharacter({ agentId, status, scale = PIXEL_SCALE }: PixelCharacterProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  const sprites = CHARACTER_SPRITES[agentId];
  const animation = sprites?.[status] ?? sprites?.idle;

  const frames = useMemo(() => animation?.frames ?? EMPTY_FRAMES, [animation]);
  const frameDuration = animation?.frameDuration ?? 800;

  useEffect(() => {
    if (frames.length <= 1) return;
    setFrameIndex(0);
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, frameDuration);
    return () => clearInterval(interval);
  }, [frames, frameDuration]);

  if (!sprites || frames.length === 0) return null;

  const currentFrame = frames[frameIndex % frames.length]!;

  return (
    <div
      className={cn(
        "relative",
        status === "idle" && "pixel-breathe",
        status === "error" && "pixel-error-flash",
      )}
      style={{ width: CHAR_PIXEL_W * scale, height: CHAR_PIXEL_H * scale }}
    >
      <PixelRenderer frame={currentFrame} scale={scale} />
    </div>
  );
});
