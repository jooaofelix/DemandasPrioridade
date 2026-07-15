import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
}

export function Card({ raised = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-card border border-border bg-surface-raised p-4",
        raised ? "shadow-raised" : "shadow-card",
        className
      ].join(" ")}
      {...props}
    />
  );
}
