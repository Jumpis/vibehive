import type { AgentInfo } from "@/types/agent";
import { AGENT_META } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useChatStore } from "@/stores/chatStore";

interface AgentCardProps {
  agentId: string;
  agent: AgentInfo;
}

export function AgentCard({ agentId, agent }: AgentCardProps) {
  const meta = AGENT_META[agentId];
  const color = meta?.color ?? "#8b5cf6";
  const openChat = useChatStore((s) => s.openChat);

  return (
    <div onClick={() => openChat(agentId)} className="cursor-pointer">
    <GlassPanel glowColor={agent.status === "working" ? color : undefined} className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-hive-text">{agent.name}</h3>
            <p className="text-[11px] text-hive-text-dim">{meta?.role ?? "Agent"}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {agent.current_task && (
        <div className="mb-3 px-2.5 py-1.5 rounded-md bg-white/5 border border-hive-border">
          <p className="text-xs text-hive-text-dim leading-relaxed line-clamp-2">
            {agent.current_task}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-hive-text-dim">
        <span>Max: {agent.max_tokens.toLocaleString()} tok</span>
        {agent.last_usage && (
          <span
            className="font-mono"
            style={{ color }}
          >
            {agent.last_usage.total.toLocaleString()} used ({agent.last_usage.ratio})
          </span>
        )}
      </div>
    </GlassPanel>
    </div>
  );
}
