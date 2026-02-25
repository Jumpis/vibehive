import type { ViewId } from "./AppShell";
import { cn } from "@/lib/cn";

const NAV_ITEMS: { id: ViewId; icon: string; label: string }[] = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "mission", icon: "🚀", label: "Mission" },
  { id: "history", icon: "📜", label: "History" },
];

interface SidebarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <nav className="w-48 shrink-0 border-r border-hive-border p-3 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            "hover:bg-white/5",
            currentView === item.id
              ? "bg-hive-accent/10 text-hive-accent font-medium"
              : "text-hive-text-dim",
          )}
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
