import { useMissionStore } from "@/stores/missionStore";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { AGENT_META } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { TimelineEvent, WSEventType } from "@/types/websocket";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function eventLabel(type: WSEventType): string {
  const labels: Record<WSEventType, string> = {
    agent_status: "Agent Status",
    mission_started: "Mission Started",
    mission_analyzed: "Mission Analyzed",
    mission_status: "Status Changed",
    delegation_started: "Delegation Started",
    delegation_completed: "Delegation Completed",
    task_completed: "Task Completed",
    mission_completed: "Mission Completed",
    token_warning: "Token Warning",
  };
  return labels[type];
}

function eventColor(type: WSEventType): string {
  if (type === "mission_completed") return "#22c55e";
  if (type === "token_warning") return "#ef4444";
  if (type.startsWith("delegation")) return "#3b82f6";
  if (type.startsWith("mission")) return "#f59e0b";
  return "#8b5cf6";
}

function eventDetail(event: TimelineEvent): string {
  const d = event.data as Record<string, unknown>;
  switch (event.type) {
    case "mission_started":
      return (d.description as string) ?? "";
    case "mission_analyzed": {
      const plan = d.plan as Record<string, unknown> | undefined;
      return plan?.analysis ? String(plan.analysis).slice(0, 120) + "..." : "Plan ready";
    }
    case "delegation_started": {
      const agentId = d.agent_id as string;
      const meta = AGENT_META[agentId];
      return `${meta?.emoji ?? ""} ${meta?.name ?? agentId}: ${(d.task as string)?.slice(0, 80) ?? ""}`;
    }
    case "delegation_completed": {
      const del = d.delegation as Record<string, unknown> | undefined;
      const res = d.result as Record<string, unknown> | undefined;
      const aid = del?.agent_id as string;
      const meta = AGENT_META[aid];
      return `${meta?.emoji ?? ""} ${meta?.name ?? aid} ${res?.success ? "done" : "failed"}`;
    }
    case "agent_status": {
      const agentId = d.agent_id as string;
      const meta = AGENT_META[agentId];
      return `${meta?.emoji ?? ""} ${meta?.name ?? agentId} → ${d.status}`;
    }
    case "token_warning":
      return `${d.agent_id}: input ${d.input_tokens}/${d.max_allowed} tokens`;
    default:
      return d.status ? String(d.status) : "";
  }
}

export function MissionTimeline() {
  const timeline = useMissionStore((s) => s.timeline);
  const scrollRef = useAutoScroll<HTMLDivElement>([timeline.length]);

  if (timeline.length === 0) {
    return (
      <GlassPanel subtle className="p-4 text-center text-hive-text-dim text-sm">
        Timeline events will appear here...
      </GlassPanel>
    );
  }

  return (
    <GlassPanel subtle className="p-4 max-h-80 overflow-y-auto" >
      <div ref={scrollRef} className="space-y-2">
        {timeline.map((event) => (
          <div key={event.id} className="flex gap-3 animate-fade-in">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: eventColor(event.type) }}
              />
              <span className="w-px flex-1 bg-hive-border" />
            </div>

            {/* Content */}
            <div className="pb-3 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-medium text-hive-text">
                  {eventLabel(event.type)}
                </span>
                <span className="text-[10px] text-hive-text-dim font-mono">
                  {formatTime(event.timestamp)}
                </span>
              </div>
              <p className="text-xs text-hive-text-dim leading-relaxed truncate">
                {eventDetail(event)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
