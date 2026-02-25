import { cn } from "@/lib/cn";

export function AnimatedDot({ color, className }: { color?: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full animate-pulse-dot", className)}
      style={{ backgroundColor: color ?? "#a78bfa" }}
    />
  );
}
