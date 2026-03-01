import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { HiveLogo } from "./HiveLogo";

export type ViewId = "office" | "dashboard" | "mission" | "history";

interface AppShellProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  children: ReactNode;
}

export function AppShell({ currentView, onNavigate, theme, onToggleTheme, children }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden app-shell-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-hive-border shrink-0">
        <div className="flex items-center gap-2.5">
          <HiveLogo size={28} />
          <h1 className="text-sm font-extrabold tracking-widest bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
            HIVE
          </h1>
          <span className="text-[10px] text-hive-text-dim font-medium tracking-wider uppercase">
            AI Agent System
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="text-xs px-2.5 py-1.5 rounded-md border border-hive-border text-hive-text-dim hover:text-hive-text hover:bg-white/5 transition-colors"
            aria-label="Toggle color theme"
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <ConnectionIndicator />
        </div>
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
