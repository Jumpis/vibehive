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
  isSleeping?: boolean;
}

export const PixelCharacter = memo(function PixelCharacter({ agentId, status, scale = PIXEL_SCALE, isSleeping = false }: PixelCharacterProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  const sprites = CHARACTER_SPRITES[agentId];
  const animation = sprites?.[status] ?? sprites?.idle;

  const frames = useMemo(() => animation?.frames ?? EMPTY_FRAMES, [animation]);
  const baseDuration = animation?.frameDuration ?? 800;
  const frameDuration = isSleeping ? baseDuration * 2 : baseDuration;

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
  // status can change before the parent re-renders, so guard defensively
  const sleeping = isSleeping && status === "idle";

  return (
    <div
      className={cn(
        "relative",
        sleeping && "pixel-sleep-nod",
        !sleeping && status === "idle" && "pixel-breathe",
        status === "error" && "pixel-error-flash",
      )}
      style={{ width: CHAR_PIXEL_W * scale, height: CHAR_PIXEL_H * scale }}
    >
      <PixelRenderer frame={currentFrame} scale={scale} />
    </div>
  );
});
