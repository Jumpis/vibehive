import type { AgentResult } from "@/types/mission";
import { AGENT_META } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface MissionResultCardProps {
  result: AgentResult;
}

export function MissionResultCard({ result }: MissionResultCardProps) {
  const meta = AGENT_META[result.agent_id];
  const color = meta?.color ?? "#8b5cf6";

  return (
    <GlassPanel subtle className="p-3 animate-slide-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta?.emoji ?? "🤖"}</span>
          <span className="text-xs font-semibold text-hive-text">
            {meta?.name ?? result.agent_id}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: result.success ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: result.success ? "#22c55e" : "#ef4444",
            }}
          >
            {result.success ? "Success" : "Failed"}
          </span>
        </div>
        <span className="text-[10px] text-hive-text-dim font-mono">
          {(result.duration_ms / 1000).toFixed(1)}s
        </span>
      </div>

      <p className="text-xs text-hive-text-dim mb-1 line-clamp-1">
        Task: {result.task}
      </p>

      <div className="px-2.5 py-2 rounded-md bg-white/5 border border-hive-border max-h-40 overflow-y-auto">
        <pre className="text-[11px] text-hive-text leading-relaxed whitespace-pre-wrap font-mono">
          {result.result}
        </pre>
      </div>

      {result.token_usage && (
        <div className="mt-2 flex gap-3 text-[10px] text-hive-text-dim">
          <span>
            In: <span className="font-mono" style={{ color }}>{result.token_usage.input_total.toLocaleString()}</span>
          </span>
          <span>
            Out: <span className="font-mono" style={{ color }}>{result.token_usage.output_tokens.toLocaleString()}</span>
          </span>
        </div>
      )}
    </GlassPanel>
  );
}
