import { useMissionStore } from "@/stores/missionStore";
import { MissionHistoryItem } from "./MissionHistoryItem";

export function MissionHistory() {
  const missions = useMissionStore((s) => s.missions);

  const sorted = [...missions].reverse();

  if (sorted.length === 0) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-hive-text">Mission History</h2>
        <div className="flex items-center justify-center h-48 text-hive-text-dim text-sm">
          No missions yet. Submit one from the Mission tab.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-hive-text">Mission History</h2>
        <span className="text-xs text-hive-text-dim">{missions.length} missions</span>
      </div>
      <div className="space-y-2">
        {sorted.map((m) => (
          <MissionHistoryItem key={m.id} mission={m} />
        ))}
      </div>
    </div>
  );
}
