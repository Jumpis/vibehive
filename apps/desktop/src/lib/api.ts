import { API_BASE_URL } from "./constants";
import type { AgentInfo } from "@/types/agent";
import type { Mission } from "@/types/mission";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function fetchHealth() {
  return fetchJSON<{ status: string; agents: number; context_strategy: string }>(
    "/api/health",
  );
}

export function fetchAgents() {
  return fetchJSON<Record<string, AgentInfo>>("/api/agents");
}

export function fetchMissions() {
  return fetchJSON<Mission[]>("/api/missions");
}

export function submitTeamMission(mission: string, files: string[] = []) {
  return fetchJSON<Mission>("/api/missions/team", {
    method: "POST",
    body: JSON.stringify({ mission, files }),
  });
}

export function submitDirectMission(agentId: string, task: string, files: string[] = []) {
  return fetchJSON<Mission>("/api/missions/direct", {
    method: "POST",
    body: JSON.stringify({ agent_id: agentId, task, files }),
  });
}
