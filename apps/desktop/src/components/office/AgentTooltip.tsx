import type { AgentInfo } from "@/types/agent";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AGENT_META } from "@/lib/constants";

interface AgentTooltipProps {
  agentId: string;
  agent: AgentInfo | null;
  onClose: () => void;
}

function getAgentDisplay(agentId: string, agent: AgentInfo | null) {
  const meta = AGENT_META[agentId];
  return {
    name: agent?.name ?? meta?.name ?? agentId,
    emoji: agent?.emoji ?? meta?.emoji ?? "🤖",
    role: meta?.role ?? agentId,
  };
}

export function AgentTooltip({ agentId, agent, onClose }: AgentTooltipProps) {
  const display = getAgentDisplay(agentId, agent);
  const status = agent?.status ?? "idle";

  return (
    <div
      className="absolute z-50 animate-fade-in"
      style={{ bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 8 }}
    >
      <div
        className="glass p-3 min-w-[200px] max-w-[280px] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{display.emoji}</span>
            <div>
              <div className="text-sm font-semibold text-hive-text">{display.name}</div>
              <div className="text-[10px] text-hive-text-dim">{display.role}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-hive-text-dim hover:text-hive-text text-xs p-1"
          >
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={status} />
        </div>

        {/* Current Task */}
        {agent?.current_task && (
          <div className="mb-2">
            <div className="text-[10px] text-hive-text-dim uppercase tracking-wider mb-0.5">
              Current Task
            </div>
            <div className="text-xs text-hive-text leading-relaxed line-clamp-3">
              {agent.current_task}
            </div>
          </div>
        )}

        {/* Token Usage */}
        {agent?.last_usage && (
          <div className="border-t border-hive-border pt-2 mt-2">
            <div className="text-[10px] text-hive-text-dim uppercase tracking-wider mb-1">
              Token Usage
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <div>
                <span className="text-hive-text-dim">In: </span>
                <span className="text-hive-text">{agent.last_usage.input.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-hive-text-dim">Out: </span>
                <span className="text-hive-text">{agent.last_usage.output.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-hive-text-dim">Ratio: </span>
                <span className="text-hive-text">{agent.last_usage.ratio}</span>
              </div>
            </div>
          </div>
        )}

        {/* Arrow pointer */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
          style={{ background: "rgba(26, 16, 48, 0.6)", borderRight: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        />
      </div>
    </div>
  );
}
