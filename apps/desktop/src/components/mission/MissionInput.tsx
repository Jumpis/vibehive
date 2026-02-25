import { useState } from "react";
import { useMissionStore } from "@/stores/missionStore";
import { useAgentStore } from "@/stores/agentStore";
import { AGENT_META } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

type Tab = "team" | "direct";

export function MissionInput() {
  const [tab, setTab] = useState<Tab>("team");
  const [text, setText] = useState("");
  const [filesText, setFilesText] = useState("");
  const [agentId, setAgentId] = useState("bolt");
  const submitting = useMissionStore((s) => s.submitting);
  const submitTeam = useMissionStore((s) => s.submitTeam);
  const submitDirect = useMissionStore((s) => s.submitDirect);
  const agents = useAgentStore((s) => s.agents);

  const agentOptions = Object.keys(agents).length > 0
    ? Object.keys(agents)
    : Object.keys(AGENT_META);

  function parseFiles(): string[] {
    return filesText
      .split(/[,\n]/)
      .map((f) => f.trim())
      .filter(Boolean);
  }

  function handleSubmit() {
    if (!text.trim() || submitting) return;
    const files = parseFiles();
    if (tab === "team") {
      submitTeam(text.trim(), files);
    } else {
      submitDirect(agentId, text.trim(), files);
    }
    setText("");
    setFilesText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  return (
    <GlassPanel className="p-4 space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 w-fit">
        {(["team", "direct"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === t
                ? "bg-hive-accent/20 text-hive-accent"
                : "text-hive-text-dim hover:text-hive-text"
            }`}
          >
            {t === "team" ? "🐝 Team Mission" : "📌 Direct"}
          </button>
        ))}
      </div>

      {/* Agent selector for direct mode */}
      {tab === "direct" && (
        <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
          {agentOptions.map((id) => {
            const meta = AGENT_META[id];
            return (
              <option key={id} value={id}>
                {meta ? `${meta.emoji} ${meta.name}` : id}
              </option>
            );
          })}
        </Select>
      )}

      {/* Mission input */}
      <TextArea
        rows={3}
        placeholder={
          tab === "team"
            ? "Describe your mission for the team..."
            : "Task for the agent..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitting}
      />

      {/* File paths */}
      <div className="space-y-1">
        <label className="text-[11px] text-hive-text-dim flex items-center gap-1.5">
          <span>📎</span> Files (comma or newline separated)
        </label>
        <TextArea
          rows={2}
          placeholder="packages/core/orchestrator.py, packages/api/main.py"
          value={filesText}
          onChange={(e) => setFilesText(e.target.value)}
          disabled={submitting}
          className="text-[11px] font-mono"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-hive-text-dim">
          {tab === "team" ? "ARIA will analyze & delegate" : `Direct to ${AGENT_META[agentId]?.name ?? agentId}`}
          {parseFiles().length > 0 && ` · ${parseFiles().length} file(s) attached`}
        </span>
        <Button onClick={handleSubmit} disabled={!text.trim() || submitting} size="sm">
          {submitting ? (
            <>
              <Spinner className="mr-1.5 h-3 w-3" />
              Running...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </GlassPanel>
  );
}
