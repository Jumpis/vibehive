import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";
import type { Mission } from "@/types/mission";
import { submitDirectMission } from "@/lib/api";

interface ChatState {
  selectedAgentId: string | null;
  messages: Record<string, ChatMessage[]>;
  sendingTo: Record<string, boolean>;

  openChat: (agentId: string) => void;
  closeChat: () => void;
  sendMessage: (agentId: string, content: string) => Promise<void>;
  addAgentResponse: (mission: Mission) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  selectedAgentId: null,
  messages: {},
  sendingTo: {},

  openChat: (agentId) => set({ selectedAgentId: agentId }),

  closeChat: () => set({ selectedAgentId: null }),

  sendMessage: async (agentId, content) => {
    const userMsgId = crypto.randomUUID();
    const userMsg: ChatMessage = {
      id: userMsgId,
      agentId,
      role: "user",
      content,
      timestamp: Date.now(),
      status: "sending",
    };

    set((s) => ({
      messages: {
        ...s.messages,
        [agentId]: [...(s.messages[agentId] ?? []), userMsg],
      },
      sendingTo: { ...s.sendingTo, [agentId]: true },
    }));

    try {
      const history = get().messages[agentId] ?? [];
      const taskWithContext = buildTaskWithContext(history, content);
      const mission = await submitDirectMission(agentId, taskWithContext);

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        agentId,
        role: "agent",
        content: formatMissionResult(mission),
        timestamp: Date.now(),
        missionId: mission.id,
        status: "complete",
      };

      set((s) => ({
        messages: {
          ...s.messages,
          [agentId]: (s.messages[agentId] ?? []).map((m) =>
            m.id === userMsgId ? { ...m, status: "complete" as const, missionId: mission.id } : m,
          ).concat(agentMsg),
        },
        sendingTo: { ...s.sendingTo, [agentId]: false },
      }));
    } catch {
      set((s) => ({
        messages: {
          ...s.messages,
          [agentId]: (s.messages[agentId] ?? []).map((m) =>
            m.id === userMsgId ? { ...m, status: "error" as const } : m,
          ),
        },
        sendingTo: { ...s.sendingTo, [agentId]: false },
      }));
    }
  },

  addAgentResponse: (mission) => {
    const agentId = mission.assigned_to;
    if (!agentId || mission.type !== "direct") return;

    const existing = get().messages[agentId] ?? [];
    const alreadyHas = existing.some((m) => m.missionId === mission.id && m.role === "agent");
    if (alreadyHas) return;

    const agentMsg: ChatMessage = {
      id: crypto.randomUUID(),
      agentId,
      role: "agent",
      content: formatMissionResult(mission),
      timestamp: Date.now(),
      missionId: mission.id,
      status: "complete",
    };

    set((s) => ({
      messages: {
        ...s.messages,
        [agentId]: [...(s.messages[agentId] ?? []), agentMsg],
      },
    }));
  },
}));

const MAX_CONTEXT_MESSAGES = 20;

function buildTaskWithContext(history: ChatMessage[], newMessage: string): string {
  const completed = history.filter((m) => m.status === "complete");
  if (completed.length === 0) return newMessage;

  const recent = completed.slice(-MAX_CONTEXT_MESSAGES);
  const contextLines = recent
    .map((m) => (m.role === "user" ? `[User]: ${m.content}` : `[Agent]: ${m.content}`))
    .join("\n\n");

  return `[Previous conversation]\n${contextLines}\n\n[Current request]\n${newMessage}`;
}

function formatMissionResult(mission: Mission): string {
  if (mission.results && mission.results.length > 0) {
    return mission.results.map((r) => r.result).join("\n\n");
  }
  if (mission.status === "failed") {
    return "Task failed. Please try again.";
  }
  return `Mission ${mission.status}.`;
}
