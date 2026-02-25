import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { AppShell, type ViewId } from "@/components/layout/AppShell";
import { TeamDashboard } from "@/components/dashboard/TeamDashboard";
import { MissionInput } from "@/components/mission/MissionInput";
import { MissionLiveView } from "@/components/mission/MissionLiveView";
import { MissionTimeline } from "@/components/mission/MissionTimeline";
import { MissionResultCard } from "@/components/mission/MissionResultCard";
import { MissionHistory } from "@/components/history/MissionHistory";
import { useMissionStore } from "@/stores/missionStore";

function MissionView() {
  const missions = useMissionStore((s) => s.missions);
  const latestMission = missions[missions.length - 1];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-hive-text">Mission Control</h2>
      <MissionInput />
      <MissionLiveView />
      <MissionTimeline />

      {latestMission?.results && latestMission.results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-hive-text">Latest Results</h3>
          {latestMission.results.map((r, i) => (
            <MissionResultCard key={i} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");

  useWebSocket();
  useHealthCheck();

  return (
    <AppShell currentView={view} onNavigate={setView}>
      {view === "dashboard" && <TeamDashboard />}
      {view === "mission" && <MissionView />}
      {view === "history" && <MissionHistory />}
    </AppShell>
  );
}
