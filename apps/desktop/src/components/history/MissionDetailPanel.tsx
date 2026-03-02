import { useEffect, useRef } from "react";
import type { Mission } from "@/types/mission";
import { AGENT_META } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MissionResultCard } from "@/components/mission/MissionResultCard";
import { cn } from "@/lib/cn";

interface MissionDetailPanelProps {
  mission: Mission;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sumTokens(mission: Mission) {
  let input = 0;
  let output = 0;
  for (const r of mission.results) {
    if (r.token_usage) {
      input += r.token_usage.input_total;
      output += r.token_usage.output_tokens;
    }
  }
  return { input, output, total: input + output };
}

export function MissionDetailPanel({ mission, onClose }: MissionDetailPanelProps) {
  const isCompleted = mission.status === "completed";
  const isFailed = mission.status === "failed";
  const tokens = sumTokens(mission);
  const assignedMeta = AGENT_META[mission.assigned_to];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-[480px] flex flex-col bg-hive-bg/95 backdrop-blur-xl border-l border-hive-border animate-slide-in-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hive-border">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-hive-text-dim">#{mission.id}</span>
            <span
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full font-medium",
                isCompleted && "bg-green-500/15 text-green-400",
                isFailed && "bg-red-500/15 text-red-400",
                !isCompleted && !isFailed && "bg-yellow-500/15 text-yellow-400",
              )}
            >
              {mission.status}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-hive-text-dim">
              {mission.type}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close panel"
            className="text-hive-text-dim hover:text-hive-text transition-colors text-lg leading-none"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Description section */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-hive-text-dim uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm text-hive-text leading-relaxed">
              {mission.description}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-hive-text-dim">
              <span>
                Assigned to:{" "}
                <span className="text-hive-text">
                  {assignedMeta?.emoji ?? "🤖"} {assignedMeta?.name ?? mission.assigned_to}
                </span>
              </span>
              <span>Created: {formatDate(mission.created_at)}</span>
              {mission.completed_at && (
                <span>Completed: {formatDate(mission.completed_at)}</span>
              )}
            </div>
          </section>

          {/* Plan & Analysis */}
          {mission.plan && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-hive-text-dim uppercase tracking-wider">
                Plan & Analysis
              </h3>
              <GlassPanel subtle className="p-3 space-y-3">
                <div>
                  <span className="text-[10px] text-hive-text-dim uppercase tracking-wider">Analysis</span>
                  <p className="text-xs text-hive-text leading-relaxed mt-1">
                    {mission.plan.analysis}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-hive-text-dim uppercase tracking-wider">
                    Strategy: {mission.plan.execution_strategy}
                  </span>
                </div>

                {mission.plan.delegations.length > 0 && (
                  <div>
                    <span className="text-[10px] text-hive-text-dim uppercase tracking-wider">
                      Delegations
                    </span>
                    <div className="mt-1.5 space-y-1.5">
                      {mission.plan.delegations.map((d) => {
                        const meta = AGENT_META[d.agent_id];
                        return (
                          <div key={`${d.agent_id}-${d.execution_order}`} className="flex items-start gap-2 text-xs">
                            <span className="text-hive-text-dim font-mono min-w-[1.5rem]">
                              {d.execution_order}.
                            </span>
                            <span>{meta?.emoji ?? "🤖"}</span>
                            <span className="text-hive-text">{d.task}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </GlassPanel>
            </section>
          )}

          {/* Agent Results */}
          {mission.results.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-hive-text-dim uppercase tracking-wider">
                Agent Results ({mission.results.length})
              </h3>
              <div className="space-y-2">
                {mission.results.map((r) => (
                  <MissionResultCard key={r.agent_id} result={r} />
                ))}
              </div>
            </section>
          )}

          {/* Total Token Usage */}
          {tokens.total > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-hive-text-dim uppercase tracking-wider">
                Total Token Usage
              </h3>
              <GlassPanel subtle className="p-3">
                <div className="flex gap-6 text-xs">
                  <div>
                    <span className="text-hive-text-dim">Input</span>
                    <p className="font-mono text-hive-text">{tokens.input.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-hive-text-dim">Output</span>
                    <p className="font-mono text-hive-text">{tokens.output.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-hive-text-dim">Total</span>
                    <p className="font-mono text-hive-text font-semibold">{tokens.total.toLocaleString()}</p>
                  </div>
                </div>
              </GlassPanel>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
