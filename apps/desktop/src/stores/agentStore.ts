import { create } from "zustand";
import type { AgentInfo } from "@/types/agent";
import { fetchAgents } from "@/lib/api";

interface AgentState {
  agents: Record<string, AgentInfo>;
  loadAgents: () => Promise<void>;
  updateAgent: (agentId: string, patch: Partial<AgentInfo>) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: {},

  loadAgents: async () => {
    try {
      const data = await fetchAgents();
      set({ agents: data });
    } catch {
      /* API not available yet */
    }
  },

  updateAgent: (agentId, patch) =>
    set((s) => {
      const existing = s.agents[agentId];
      if (!existing) return s;
      return {
        agents: { ...s.agents, [agentId]: { ...existing, ...patch } },
      };
    }),
}));
