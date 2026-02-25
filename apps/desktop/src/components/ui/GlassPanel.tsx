import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  subtle?: boolean;
}

export function GlassPanel({ children, className, glowColor, subtle }: GlassPanelProps) {
  const style: CSSProperties = glowColor
    ? { boxShadow: `0 0 20px ${glowColor}25, 0 0 60px ${glowColor}10` }
    : {};

  return (
    <div
      className={cn(subtle ? "glass-subtle" : "glass", className)}
      style={style}
    >
      {children}
    </div>
  );
}
