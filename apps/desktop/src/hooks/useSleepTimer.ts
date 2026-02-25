import { useState, useEffect, useCallback, useRef } from "react";
import type { AgentStatusValue } from "@/types/agent";
import { SLEEP_IDLE_THRESHOLD_MS } from "@/lib/constants";

interface UseSleepTimerReturn {
  isSleeping: boolean;
  wake: () => void;
}

export function useSleepTimer(status: AgentStatusValue): UseSleepTimerReturn {
  const [isSleeping, setIsSleeping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(() => {
      setIsSleeping(true);
    }, SLEEP_IDLE_THRESHOLD_MS);
  }, []);

  const wake = useCallback(() => {
    setIsSleeping(false);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (status !== "idle") {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsSleeping(false);
      return;
    }

    startTimer();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, startTimer]);

  return { isSleeping, wake };
}
