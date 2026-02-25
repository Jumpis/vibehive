import { useEffect, useRef } from "react";
import { fetchHealth } from "@/lib/api";
import { useConnectionStore } from "@/stores/connectionStore";
import { useAgentStore } from "@/stores/agentStore";
import { useMissionStore } from "@/stores/missionStore";
import { HEALTH_CHECK_INTERVAL_MS } from "@/lib/constants";

export function useHealthCheck() {
  const setApiHealthy = useConnectionStore((s) => s.setApiHealthy);
  const loadAgents = useAgentStore((s) => s.loadAgents);
  const loadMissions = useMissionStore((s) => s.loadMissions);
  const initialLoaded = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    async function check() {
      try {
        await fetchHealth();
        setApiHealthy(true);
        if (!initialLoaded.current) {
          initialLoaded.current = true;
          await loadAgents();
          await loadMissions();
        }
      } catch {
        setApiHealthy(false);
      }
    }

    check();
    timer = setInterval(check, HEALTH_CHECK_INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
