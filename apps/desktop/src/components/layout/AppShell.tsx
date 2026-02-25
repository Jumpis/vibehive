import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ConnectionIndicator } from "./ConnectionIndicator";

export type ViewId = "office" | "dashboard" | "mission" | "history";

interface AppShellProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  children: ReactNode;
}

export function AppShell({ currentView, onNavigate, children }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#0f0a1e] via-[#150d2e] to-[#1a0f35]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-hive-border shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🐝</span>
          <h1 className="text-sm font-semibold tracking-wide text-hive-text">
            HIVE
          </h1>
          <span className="text-[10px] text-hive-text-dim font-medium tracking-wider uppercase">
            Agent Orchestration
          </span>
        </div>
        <ConnectionIndicator />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
