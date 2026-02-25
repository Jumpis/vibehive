import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-hive-accent/50",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-hive-accent/20 text-hive-accent border border-hive-accent/30 hover:bg-hive-accent/30",
        variant === "ghost" &&
          "text-hive-text-dim hover:text-hive-text hover:bg-white/5",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
