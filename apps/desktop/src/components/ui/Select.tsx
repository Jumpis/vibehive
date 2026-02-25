import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "rounded-lg bg-white/5 border border-hive-border px-3 py-2",
        "text-sm text-hive-text",
        "focus:outline-none focus:border-hive-accent/50",
        "transition-colors cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
