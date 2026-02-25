import { useConnectionStore } from "@/stores/connectionStore";
import { cn } from "@/lib/cn";

const WS_LABELS = {
  connected: "WS Connected",
  connecting: "WS Connecting...",
  disconnected: "WS Disconnected",
} as const;

export function ConnectionIndicator() {
  const wsStatus = useConnectionStore((s) => s.wsStatus);
  const apiHealthy = useConnectionStore((s) => s.apiHealthy);

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* API health */}
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            apiHealthy ? "bg-status-working" : "bg-status-error",
          )}
        />
        <span className="text-hive-text-dim">
          API {apiHealthy ? "OK" : "Down"}
        </span>
      </span>

      {/* WebSocket */}
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            wsStatus === "connected" && "bg-status-working",
            wsStatus === "connecting" && "bg-yellow-400 animate-pulse-dot",
            wsStatus === "disconnected" && "bg-status-error",
          )}
        />
        <span className="text-hive-text-dim">{WS_LABELS[wsStatus]}</span>
      </span>
    </div>
  );
}
