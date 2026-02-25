import { useMemo } from "react";
import { PixelRenderer } from "./PixelRenderer";
import { DESK_SPRITES } from "./pixelData/desks";
import { DESK_PIXEL_W, DESK_PIXEL_H, PIXEL_SCALE } from "./pixelData/types";
import type { AgentStatusValue } from "@/types/agent";
import { cn } from "@/lib/cn";

interface PixelDeskProps {
  agentId: string;
  status: AgentStatusValue;
  scale?: number;
}

export function PixelDesk({ agentId, status, scale = PIXEL_SCALE }: PixelDeskProps) {
  const desk = DESK_SPRITES[agentId];

  const baseFrame = useMemo(() => desk?.base ?? [], [desk]);
  const glowFrame = useMemo(() => desk?.workingOverlay ?? [], [desk]);

  if (!desk) return null;

  return (
    <div className="relative" style={{ width: DESK_PIXEL_W * scale, height: DESK_PIXEL_H * scale }}>
      <PixelRenderer frame={baseFrame} scale={scale} />
      {status === "working" && glowFrame.length > 0 && (
        <div className={cn("absolute inset-0", "pixel-monitor-glow")}>
          <PixelRenderer frame={glowFrame} scale={scale} />
        </div>
      )}
    </div>
  );
}
