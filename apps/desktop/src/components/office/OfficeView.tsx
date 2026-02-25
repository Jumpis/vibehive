import { useRef, useState, useEffect, useCallback } from "react";
import { OfficeRoom } from "./OfficeRoom";
import { AgentWorkstation } from "./AgentWorkstation";
import { useAgentStore } from "@/stores/agentStore";
import type { AgentSeat } from "./pixelData/types";

const BASE_W = 800;
const BASE_H = 500;

const SEATS: AgentSeat[] = [
  // ── Back cluster (y ~55-80) — Leader + core ──
  { id: "bolt",   x: 60,  y: 55,  row: 0, facing: "right" },
  { id: "leader", x: 290, y: 60,  row: 0, facing: "down"  },
  { id: "sage",   x: 520, y: 55,  row: 0, facing: "left"  },

  // ── Middle cluster (y ~170-200) — Designer + reviewers ──
  { id: "pixel",              x: 80,  y: 175, row: 1, facing: "down"  },
  { id: "review-readability", x: 310, y: 185, row: 1, facing: "down"  },
  { id: "review-security",    x: 550, y: 170, row: 1, facing: "left"  },

  // ── Front cluster (y ~300-330) — Review + ops ──
  { id: "review-modernization", x: 50,  y: 305, row: 2, facing: "right" },
  { id: "test-agent",           x: 270, y: 310, row: 2, facing: "down"  },
  { id: "review-efficiency",    x: 480, y: 300, row: 2, facing: "left"  },
  { id: "commit-agent",         x: 650, y: 315, row: 2, facing: "left"  },
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
