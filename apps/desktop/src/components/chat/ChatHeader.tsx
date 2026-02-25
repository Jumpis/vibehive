import { AGENT_META } from "@/lib/constants";
import { useAgentStore } from "@/stores/agentStore";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ChatHeaderProps {
  agentId: string;
  onClose: () => void;
}

export function ChatHeader({ agentId, onClose }: ChatHeaderProps) {
  const meta = AGENT_META[agentId];
  const agent = useAgentStore((s) => s.agents[agentId]);
  const status = agent?.status ?? "idle";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-hive-border">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{meta?.emoji ?? "🤖"}</span>
        <div>
          <h3 className="text-sm font-semibold text-hive-text">
            {meta?.name ?? agentId}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-hive-text-dim">{meta?.role ?? "Agent"}</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close chat"
        className="text-hive-text-dim hover:text-hive-text transition-colors p-1.5 rounded-md hover:bg-white/5"
      >
        ✕
      </button>
    </div>
  );
}
