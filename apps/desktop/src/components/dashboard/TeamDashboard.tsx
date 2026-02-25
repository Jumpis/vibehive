import { useAgentStore } from "@/stores/agentStore";
import { AgentCard } from "./AgentCard";

export function TeamDashboard() {
  const agents = useAgentStore((s) => s.agents);
  const entries = Object.entries(agents);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-hive-text-dim text-sm">
        Waiting for API connection...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-hive-text">Team Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {entries.map(([id, agent]) => (
          <AgentCard key={id} agentId={id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
