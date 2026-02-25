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
  "review-security": {
    id: "review-security",
    name: "Security",
    emoji: "🔒",
    color: "#EF4444",
    role: "Security Reviewer",
  },
  "review-readability": {
    id: "review-readability",
    name: "Readability",
    emoji: "📖",
    color: "#22C55E",
    role: "Readability Reviewer",
  },
  "review-efficiency": {
    id: "review-efficiency",
    name: "Efficiency",
    emoji: "⚡",
    color: "#F97316",
    role: "Efficiency Reviewer",
  },
  "review-modernization": {
    id: "review-modernization",
    name: "Modernize",
    emoji: "🔄",
    color: "#A855F7",
    role: "Modernization Reviewer",
  },
  "test-agent": {
    id: "test-agent",
    name: "Tester",
    emoji: "🧪",
    color: "#14B8A6",
    role: "Test Agent",
  },
  "commit-agent": {
    id: "commit-agent",
    name: "Committer",
    emoji: "📝",
    color: "#A78BFA",
    role: "Commit Agent",
  },
};

export const HEALTH_CHECK_INTERVAL_MS = 5_000;
export const WS_RECONNECT_BASE_MS = 1_000;
export const WS_RECONNECT_MAX_MS = 30_000;
