import type { AgentStatusValue } from "@/types/agent";
import { cn } from "@/lib/cn";

const STATUS_CONFIG: Record<AgentStatusValue, { label: string; dotClass: string; textClass: string }> = {
  idle: { label: "Idle", dotClass: "bg-status-idle", textClass: "text-status-idle" },
  working: { label: "Working", dotClass: "bg-status-working", textClass: "text-status-working" },
  error: { label: "Error", dotClass: "bg-status-error", textClass: "text-status-error" },
};

export function StatusBadge({ status }: { status: AgentStatusValue }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", config.textClass)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          config.dotClass,
          status === "working" && "animate-pulse-dot",
        )}
      />
      {config.label}
    </span>
  );
}
