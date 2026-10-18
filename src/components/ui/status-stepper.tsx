import React from "react";
import { Check } from "lucide-react";
import { ShipmentStatus } from "@/types";

export interface StatusStepperProps {
  status: ShipmentStatus;
  variant?: "light" | "dark";
  className?: string;
  showEta?: boolean;
}

export const StatusStepper = ({
  status,
  variant = "light",
  className = "",
  showEta = true,
}: StatusStepperProps) => {
  // Steps: 1: Picked Up, 2: At VIP Terminal, 3: In Transit, 4: Delivered
  const isPaid = status !== "pending_payment";
  const isPickedUp = isPaid && status !== "paid" && status !== "pickup_scheduled";
  const isAtTerminal = isPickedUp && status !== "picked_up";
  const isInTransit = status === "in_transit" || status === "arrived" || status === "out_for_delivery" || status === "delivered";
  const isDelivered = status === "delivered";

  const isDark = variant === "dark";

  return (
    <div className={`relative flex items-center justify-between w-full py-3 ${className}`}>
      {/* Background connector line */}
      <div
        className={`absolute left-3 right-3 top-1/2 -translate-y-1/2 border-t-2 border-dashed ${
          isDark ? "border-white/20" : "border-line"
        }`}
      />

      {/* Node 1: Booked / Picked Up */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            isPickedUp
              ? "bg-accent text-white"
              : isPaid
              ? "bg-accent/20 border-2 border-accent text-accent"
              : isDark
              ? "bg-white/20 text-white/50"
              : "bg-line text-muted"
          }`}
        >
          {isPickedUp ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
        </div>
      </div>

      {/* Node 2: Terminal Reception */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            isAtTerminal
              ? "bg-accent text-white"
              : isDark
              ? "bg-white/10 border border-white/20"
              : "bg-white border-2 border-line"
          }`}
        >
          {isAtTerminal ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-line" />}
        </div>
      </div>

      {/* Floating ETA Pill (as in screenshot: "4h Away") */}
      {showEta && isInTransit && !isDelivered && (
        <div className="absolute left-[54%] -top-1 -translate-x-1/2 z-20">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
              isDark ? "bg-white/15 text-white/90" : "bg-ink/5 text-muted"
            }`}
          >
            In Transit
          </span>
        </div>
      )}

      {/* Node 3: Highway Transit */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            isInTransit
              ? "bg-accent text-white shadow-sm"
              : isDark
              ? "bg-white/10 border border-white/20"
              : "bg-white border-2 border-line"
          }`}
        >
          {isInTransit ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-line" />}
        </div>
      </div>

      {/* Node 4: Destination Delivered */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            isDelivered
              ? "bg-status-green text-white"
              : isDark
              ? "bg-white/10 border border-white/20"
              : "bg-white border-2 border-line"
          }`}
        >
          {isDelivered ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-line" />}
        </div>
      </div>
    </div>
  );
};
