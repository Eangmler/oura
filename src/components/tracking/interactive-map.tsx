"use client";

import React, { useEffect, useState } from "react";
import { TrackerPing } from "@/types";

interface InteractiveMapProps {
  originCity: string;
  destinationCity: string;
  latestPing?: TrackerPing | null;
}

export const InteractiveMap = ({
  originCity,
  destinationCity,
  latestPing,
}: InteractiveMapProps) => {
  // Accra (South-East) and Kumasi (North-West)
  // Highway N6 connects Accra Circle to Kumasi Asafo via Suhum, Nsawam, Nkawkaw
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 1200);
    return () => clearInterval(interval);
  }, []);

  // Map viewport simulation
  // Origin (Accra): approx (120, 290)
  // Destination (Kumasi): approx (280, 70)
  // Current waypoint: between them (e.g. Suhum/Nkawkaw)
  const currentX = latestPing ? 120 + ((latestPing.lat - 5.6) / (6.7 - 5.6)) * 160 : 190;
  const currentY = latestPing ? 290 - ((latestPing.lat - 5.6) / (6.7 - 5.6)) * 220 : 180;

  return (
    <div className="relative w-full h-[360px] bg-[#E5E9E7] overflow-hidden select-none">
      {/* Light Map Street Grid Background Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#D2D9D5"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Secondary street veins */}
        <path d="M 0 80 Q 150 100 400 40" stroke="#FFF" strokeWidth="6" fill="none" />
        <path d="M 80 0 Q 120 200 60 400" stroke="#FFF" strokeWidth="5" fill="none" />
        <path d="M 220 0 Q 240 180 320 400" stroke="#FFF" strokeWidth="4" fill="none" />
        <path d="M 0 240 Q 200 230 400 280" stroke="#FFF" strokeWidth="7" fill="none" />

        {/* Highway Route (Dark Line from Screenshot) */}
        <path
          d="M 120 290 L 120 210 Q 120 180 160 170 L 250 170 Q 280 170 280 130 L 280 70"
          stroke="#1F2421"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Origin Marker (Black circle with navigation arrow - from screenshot) */}
        <g transform="translate(120, 290)">
          <circle r="12" fill="#0F0F0F" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" />
          <path d="M 0 -5 L 4 4 L 0 2 L -4 4 Z" fill="#FFF" />
        </g>

        {/* Destination Marker (Orange concentric target - from screenshot) */}
        <g transform="translate(280, 70)">
          <circle
            r={pulse ? "16" : "12"}
            fill="#E85D26"
            fillOpacity="0.2"
            className="transition-all duration-700"
          />
          <circle r="10" fill="#E85D26" />
          <circle r="4" fill="#FFFFFF" />
        </g>

        {/* Active Real-time Tracker Ping Pulse Marker */}
        <g transform={`translate(${currentX}, ${currentY})`}>
          <circle
            r="18"
            fill="#E85D26"
            fillOpacity="0.25"
            className="animate-ping"
          />
          <circle r="9" fill="#0F0F0F" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle r="3.5" fill="#E85D26" />
        </g>
      </svg>

      {/* Floating GPS live badge */}
      <div className="absolute top-3 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-line shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
        <span className="text-[10px] font-bold font-data text-ink tracking-tight uppercase">
          Live GPS Ingestion: {latestPing?.speed_kmh ? `${latestPing.speed_kmh} km/h` : "Connected"}
        </span>
      </div>

      {/* Origin & Destination Labels */}
      <div className="absolute bottom-16 left-4 z-10 bg-ink text-white px-2.5 py-1 rounded-md text-[10px] font-semibold">
        {originCity} (VIP Terminal)
      </div>
      <div className="absolute top-12 right-4 z-10 bg-accent text-white px-2.5 py-1 rounded-md text-[10px] font-semibold">
        {destinationCity} (Arrival Hub)
      </div>
    </div>
  );
};
