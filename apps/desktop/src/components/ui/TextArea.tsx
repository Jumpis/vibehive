import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg bg-white/5 border border-hive-border px-3 py-2",
        "text-sm text-hive-text placeholder:text-hive-text-dim/50",
        "focus:outline-none focus:border-hive-accent/50 focus:ring-1 focus:ring-hive-accent/30",
        "resize-none transition-colors",
        className,
      )}
      {...props}
    />
  );
}
