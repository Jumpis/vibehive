import { useEffect, useRef, type RefObject } from "react";

export function useAutoScroll<T extends HTMLElement>(
  deps: unknown[],
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
