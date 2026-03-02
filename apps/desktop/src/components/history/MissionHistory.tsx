import { useState, useMemo } from "react";
import { useMissionStore } from "@/stores/missionStore";
import { MissionHistoryItem } from "./MissionHistoryItem";
import { MissionDetailPanel } from "./MissionDetailPanel";
import type { Mission } from "@/types/mission";

export function MissionHistory() {
  const missions = useMissionStore((s) => s.missions);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const sorted = useMemo(() => [...missions].reverse(), [missions]);

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
          <MissionHistoryItem key={m.id} mission={m} onSelect={setSelectedMission} />
        ))}
      </div>

      {selectedMission && (
        <MissionDetailPanel
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  );
}
