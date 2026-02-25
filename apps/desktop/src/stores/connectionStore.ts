import { create } from "zustand";

export type WSStatus = "connecting" | "connected" | "disconnected";

interface ConnectionState {
  wsStatus: WSStatus;
  apiHealthy: boolean;
  reconnectAttempt: number;
  setWSStatus: (status: WSStatus) => void;
  setApiHealthy: (healthy: boolean) => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  wsStatus: "disconnected",
  apiHealthy: false,
  reconnectAttempt: 0,
  setWSStatus: (wsStatus) => set({ wsStatus }),
  setApiHealthy: (apiHealthy) => set({ apiHealthy }),
  incrementReconnect: () =>
    set((s) => ({ reconnectAttempt: s.reconnectAttempt + 1 })),
  resetReconnect: () => set({ reconnectAttempt: 0 }),
}));
