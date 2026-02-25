import { memo, useCallback } from "react";
import { PixelCharacter } from "./PixelCharacter";
import { PixelDesk } from "./PixelDesk";
import { ZzzParticles } from "./ZzzParticles";
import { AGENT_META } from "@/lib/constants";
import { useSleepTimer } from "@/hooks/useSleepTimer";
import { useChatStore } from "@/stores/chatStore";
import type { AgentInfo } from "@/types/agent";
import { PIXEL_SCALE, CHAR_PIXEL_W, DESK_PIXEL_W } from "./pixelData/types";
import type { AgentSeat } from "./pixelData/types";
import { cn } from "@/lib/cn";

const CHAR_W = CHAR_PIXEL_W * PIXEL_SCALE;
const DESK_W = DESK_PIXEL_W * PIXEL_SCALE;

interface AgentWorkstationProps {
  seat: AgentSeat;
  agent: AgentInfo | null;
}

export const AgentWorkstation = memo(function AgentWorkstation({ seat, agent }: AgentWorkstationProps) {
  const status = agent?.status ?? "idle";
  const { isSleeping, wake } = useSleepTimer(status);
  const openChat = useChatStore((s) => s.openChat);

  const meta = AGENT_META[seat.id];
  const name = agent?.name ?? meta?.name ?? seat.id;
  const emoji = agent?.emoji ?? meta?.emoji ?? "🤖";

  const handleClick = useCallback(() => {
    if (isSleeping) {
      wake();
    }
    openChat(seat.id);
  }, [isSleeping, wake, openChat, seat.id]);

  return (
    <div
      className={cn(
        "absolute cursor-pointer transition-transform duration-200 hover:scale-105",
        "group",
      )}
      style={{
        left: seat.x,
        top: seat.y,
        zIndex: 10 + seat.row * 10,
      }}
      onClick={handleClick}
    >
      {/* Character (positioned above desk) */}
      <div
        className="relative"
        style={{
          marginLeft: (DESK_W - CHAR_W) / 2,
          marginBottom: -4,
        }}
      >
        <PixelCharacter agentId={seat.id} status={status} scale={PIXEL_SCALE} isSleeping={isSleeping} />

        {/* Zzz particles when sleeping */}
        {isSleeping && <ZzzParticles />}
      </div>

      {/* Desk */}
      <PixelDesk agentId={seat.id} status={status} scale={PIXEL_SCALE} />

      {/* Name label */}
      <div className="text-center mt-1">
        <span className="text-[9px] text-hive-text-dim font-medium tracking-wide">
          {emoji} {name}
        </span>
      </div>

      {/* Working indicator particles */}
      {status === "working" && (
        <div className="absolute -top-1 -right-1 pixel-float">
          <div className="w-1.5 h-1.5 rounded-full bg-status-working opacity-60" />
        </div>
      )}
    </div>
  );
});
