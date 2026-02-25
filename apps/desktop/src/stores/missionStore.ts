import { create } from "zustand";
import type { Mission } from "@/types/mission";
import type { TimelineEvent, WSEventType } from "@/types/websocket";
import { fetchMissions, submitTeamMission, submitDirectMission } from "@/lib/api";

let nextEventId = 0;

interface MissionState {
  missions: Mission[];
  activeMission: Mission | null;
  timeline: TimelineEvent[];
  submitting: boolean;

  loadMissions: () => Promise<void>;
  submitTeam: (description: string, files?: string[]) => Promise<void>;
  submitDirect: (agentId: string, task: string, files?: string[]) => Promise<void>;
  handleWSEvent: (type: WSEventType, data: unknown) => void;
  clearTimeline: () => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  activeMission: null,
  timeline: [],
  submitting: false,

  loadMissions: async () => {
    try {
      const data = await fetchMissions();
      set({ missions: data });
    } catch {
      /* API not available yet */
    }
  },

  submitTeam: async (description, files = []) => {
    set({ submitting: true, timeline: [] });
    try {
      const result = await submitTeamMission(description, files);
      set((s) => ({
        activeMission: null,
        missions: [...s.missions, result],
        submitting: false,
      }));
    } catch {
      set({ submitting: false });
    }
  },

  submitDirect: async (agentId, task, files = []) => {
    set({ submitting: true, timeline: [] });
    try {
      const result = await submitDirectMission(agentId, task, files);
      set((s) => ({
        activeMission: null,
        missions: [...s.missions, result],
        submitting: false,
      }));
    } catch {
      set({ submitting: false });
    }
  },

  handleWSEvent: (type, data) => {
    const event: TimelineEvent = {
      id: String(nextEventId++),
      type,
      data,
      timestamp: Date.now(),
    };

    set((s) => {
      const timeline = [...s.timeline, event];
      let activeMission = s.activeMission;

      if (type === "mission_started") {
        activeMission = data as Mission;
      } else if (type === "mission_status" || type === "mission_analyzed") {
        if (activeMission) {
          const patch = data as Record<string, unknown>;
          activeMission = { ...activeMission, ...patch };
        }
      } else if (type === "mission_completed") {
        const completedMission = data as Mission;
        const missions = get().missions;
        const exists = missions.some((m) => m.id === completedMission.id);
        if (!exists) {
          set({ missions: [...missions, completedMission] });
        }
      }

      return { timeline, activeMission };
    });
  },

  clearTimeline: () => set({ timeline: [] }),
}));
