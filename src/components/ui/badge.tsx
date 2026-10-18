import React from "react";
import { ShipmentStatus } from "@/types";

export interface BadgeProps {
  status?: ShipmentStatus | string;
  label?: string;
  variant?: "light" | "dark" | "outline";
  className?: string;
}

export const Badge = ({
  status,
  label,
  variant = "light",
  className = "",
}: BadgeProps) => {
  const displayLabel =
    label ||
    (status === "in_transit"
      ? "Transit"
      : status === "pickup_scheduled" || status === "picked_up" || status === "at_terminal"
      ? "On Process"
      : status === "delivered"
      ? "Delivered"
      : status === "pending_payment"
      ? "Pending MoMo"
      : status === "paid"
      ? "Paid"
      : status || "Unknown");

  // Exact pill style as in screenshot: soft gray/white background, subtle text or dark pill
  let style = "bg-soft text-muted font-medium border border-line/60";

  if (displayLabel.toLowerCase() === "transit" || status === "in_transit") {
    style = variant === "dark" 
      ? "bg-white/10 text-white/90 border border-white/20" 
      : "bg-ink/5 text-ink/80 border border-ink/10";
  } else if (displayLabel.toLowerCase() === "delivered" || status === "delivered") {
    style = "bg-status-green-bg text-status-green border border-status-green/20";
  } else if (displayLabel.toLowerCase().includes("process")) {
    style = "bg-soft text-ink/70 border border-line";
  } else if (status === "pending_payment") {
    style = "bg-status-amber-bg text-status-amber border border-status-amber/20";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-pill text-xs font-data tracking-wide ${style} ${className}`}
    >
      {displayLabel}
    </span>
  );
};
