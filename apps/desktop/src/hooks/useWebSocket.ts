import { useEffect, useRef } from "react";
import { WS_URL, WS_RECONNECT_BASE_MS, WS_RECONNECT_MAX_MS } from "@/lib/constants";
import { useConnectionStore } from "@/stores/connectionStore";
import { useAgentStore } from "@/stores/agentStore";
import { useMissionStore } from "@/stores/missionStore";
import type { WSEvent } from "@/types/websocket";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const disposed = useRef(false);

  const setWSStatus = useConnectionStore((s) => s.setWSStatus);
  const incrementReconnect = useConnectionStore((s) => s.incrementReconnect);
  const resetReconnect = useConnectionStore((s) => s.resetReconnect);
  const reconnectAttempt = useConnectionStore((s) => s.reconnectAttempt);
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const handleWSEvent = useMissionStore((s) => s.handleWSEvent);

  useEffect(() => {
    disposed.current = false;

    function connect() {
      if (disposed.current) return;

      const existing = wsRef.current;
      if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
        return;
      }

      setWSStatus("connecting");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed.current) { ws.close(); return; }
        setWSStatus("connected");
        resetReconnect();
      };

      ws.onmessage = (ev) => {
        if (disposed.current) return;
        try {
          const event = JSON.parse(ev.data) as WSEvent;

          if (event.type === "agent_status") {
            const d = event.data as { agent_id: string; status: string; current_task?: string };
            updateAgent(d.agent_id, {
              status: d.status as "idle" | "working" | "error",
              current_task: d.current_task ?? null,
            });
          }

          handleWSEvent(event.type, event.data);
        } catch {
          /* ignore malformed messages */
        }
      };

      ws.onclose = () => {
        if (disposed.current) return;
        setWSStatus("disconnected");
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    function scheduleReconnect() {
      if (disposed.current) return;
      const delay = Math.min(
        WS_RECONNECT_BASE_MS * 2 ** reconnectAttempt,
        WS_RECONNECT_MAX_MS,
      );
      incrementReconnect();
      reconnectTimer.current = setTimeout(connect, delay);
    }

    connect();

    return () => {
      disposed.current = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
