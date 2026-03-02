import type { Mission } from "@/types/mission";
import { AGENT_META } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MissionHistoryItemProps {
  mission: Mission;
  onSelect?: (mission: Mission) => void;
}

export function MissionHistoryItem({ mission, onSelect }: MissionHistoryItemProps) {
  const isCompleted = mission.status === "completed";
  const isFailed = mission.status === "failed";

  return (
    <GlassPanel subtle className="p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-hive-text-dim">#{mission.id}</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              isCompleted && "bg-green-500/15 text-green-400",
              isFailed && "bg-red-500/15 text-red-400",
              !isCompleted && !isFailed && "bg-yellow-500/15 text-yellow-400",
            )}
          >
            {mission.status}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-hive-text-dim">
            {mission.type}
          </span>
        </div>
        <span className="text-[10px] text-hive-text-dim">
          {formatDate(mission.created_at)}
        </span>
      </div>

      <p className="text-xs text-hive-text leading-relaxed line-clamp-2 mb-2">
        {mission.description}
      </p>

      {mission.results.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {mission.results.map((r) => {
            const meta = AGENT_META[r.agent_id];
            return (
              <span
                key={r.agent_id}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-hive-text-dim"
                title={r.task}
              >
                {meta?.emoji ?? "🤖"} {meta?.name ?? r.agent_id}{" "}
                {r.success ? "✓" : "✗"}
              </span>
            );
          })}
        </div>
      )}

      {onSelect && (
        <button
          onClick={() => onSelect(mission)}
          className="mt-2 w-full text-[11px] text-hive-text-dim hover:text-hive-text py-1 rounded transition-colors hover:bg-white/5"
        >
          자세히 보기
        </button>
      )}
    </GlassPanel>
  );
}
