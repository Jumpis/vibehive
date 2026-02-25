import { useRef, useState, useEffect, useCallback } from "react";
import { OfficeRoom } from "./OfficeRoom";
import { AgentWorkstation } from "./AgentWorkstation";
import { useAgentStore } from "@/stores/agentStore";
import type { AgentSeat } from "./pixelData/types";

const BASE_W = 800;
const BASE_H = 500;

const SEATS: AgentSeat[] = [
  // Row 0 (back wall)
  { id: "leader", x: 100, y: 60, row: 0 },
  { id: "sage", x: 340, y: 60, row: 0 },
  { id: "pixel", x: 580, y: 60, row: 0 },
  // Row 1 (middle)
  { id: "bolt", x: 220, y: 160, row: 1 },
  // Row 2 (front)
  { id: "review-security", x: 60, y: 260, row: 2 },
  { id: "review-readability", x: 280, y: 260, row: 2 },
  { id: "review-efficiency", x: 520, y: 260, row: 2 },
  // Row 3 (frontmost)
  { id: "review-modernization", x: 60, y: 360, row: 3 },
  { id: "test-agent", x: 300, y: 360, row: 3 },
  { id: "commit-agent", x: 540, y: 360, row: 3 },
];

export function OfficeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const agents = useAgentStore((s) => s.agents);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const s = Math.min(width / BASE_W, height / BASE_H, 1.5);
    setScale(s);
  }, []);

  useEffect(() => {
    updateScale();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScale]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div
        className="relative"
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <OfficeRoom width={BASE_W} height={BASE_H} />
        {SEATS.map((seat) => (
          <AgentWorkstation
            key={seat.id}
            seat={seat}
            agent={agents[seat.id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
