import type { AgentMeta } from "@/types/agent";

export const API_BASE_URL = "http://127.0.0.1:8420";
export const WS_URL = "ws://127.0.0.1:8420/ws/events";

export const AGENT_META: Record<string, AgentMeta> = {
  leader: {
    id: "leader",
    name: "ARIA",
    emoji: "👑",
    color: "#F59E0B",
    role: "Team Leader",
  },
  bolt: {
    id: "bolt",
    name: "BOLT",
    emoji: "⚡",
    color: "#3B82F6",
    role: "Developer",
  },
  sage: {
    id: "sage",
    name: "SAGE",
    emoji: "🔮",
    color: "#8B5CF6",
    role: "Researcher",
  },
  pixel: {
    id: "pixel",
    name: "PIXEL",
    emoji: "🎨",
    color: "#EC4899",
    role: "Designer",
  },
};

export const HEALTH_CHECK_INTERVAL_MS = 5_000;
export const WS_RECONNECT_BASE_MS = 1_000;
export const WS_RECONNECT_MAX_MS = 30_000;
