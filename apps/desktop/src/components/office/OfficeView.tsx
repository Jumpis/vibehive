import { useRef, useState, useEffect, useCallback } from "react";
import { OfficeRoom } from "./OfficeRoom";
import { AgentWorkstation } from "./AgentWorkstation";
import { useAgentStore } from "@/stores/agentStore";
import type { AgentSeat } from "./pixelData/types";

const BASE_W = 800;
const BASE_H = 500;

const SEATS: AgentSeat[] = [
  // ── Back cluster — Leader + core (near the wall) ──
  { id: "bolt",   x: 60,  y: 155, row: 0, facing: "right" },
  { id: "leader", x: 290, y: 160, row: 0, facing: "down"  },
  { id: "sage",   x: 520, y: 155, row: 0, facing: "left"  },

  // ── Middle cluster — Designer + reviewers (mid-floor) ──
  { id: "pixel",              x: 80,  y: 250, row: 1, facing: "down"  },
  { id: "review-readability", x: 310, y: 260, row: 1, facing: "down"  },
  { id: "review-security",    x: 550, y: 250, row: 1, facing: "left"  },

  // ── Front cluster — Review + ops (front floor) ──
  { id: "review-modernization", x: 50,  y: 345, row: 2, facing: "right" },
  { id: "test-agent",           x: 270, y: 350, row: 2, facing: "down"  },
  { id: "review-efficiency",    x: 480, y: 345, row: 2, facing: "left"  },
  { id: "commit-agent",         x: 650, y: 350, row: 2, facing: "left"  },
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
