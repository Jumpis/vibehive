import { useMissionStore } from "@/stores/missionStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Spinner } from "@/components/ui/Spinner";
import { AnimatedDot } from "@/components/ui/AnimatedDot";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  analyzing: "ARIA analyzing mission...",
  delegating: "Delegating tasks...",
  executing: "Agents executing...",
  completed: "Completed",
  failed: "Failed",
};

export function MissionLiveView() {
  const activeMission = useMissionStore((s) => s.activeMission);
  const submitting = useMissionStore((s) => s.submitting);

  if (!activeMission && !submitting) return null;

  return (
    <GlassPanel glowColor="#a78bfa" className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        {submitting && <Spinner className="h-4 w-4" />}
        {!submitting && activeMission && <AnimatedDot color="#a78bfa" />}
        <h3 className="text-sm font-semibold text-hive-text">
          {activeMission ? "Active Mission" : "Submitting..."}
        </h3>
      </div>

      {activeMission && (
        <>
          <p className="text-xs text-hive-text-dim leading-relaxed">
            {activeMission.description}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-hive-text-dim">Status:</span>
            <span className="text-[11px] font-medium text-hive-accent">
              {STATUS_LABELS[activeMission.status] ?? activeMission.status}
            </span>
          </div>
          {activeMission.plan?.analysis && (
            <div className="px-3 py-2 rounded-md bg-white/5 border border-hive-border">
              <p className="text-[11px] text-hive-text-dim leading-relaxed">
                {activeMission.plan.analysis}
              </p>
            </div>
          )}
        </>
      )}
    </GlassPanel>
  );
}
