"use client";

import React, { useEffect, useRef, useState } from "react";
import { TrackerPing } from "@/types";

interface LiveLeafletMapProps {
  originCity?: string;
  destinationCity?: string;
  latestPing?: TrackerPing | null;
  className?: string;
  zoomLevel?: number;
}

// Real Highway N6 Route Coordinates between Accra and Kumasi
const HIGHWAY_N6_ROUTE: [number, number][] = [
  [5.5601, -0.2155], // VIP Circle Terminal, Accra
  [5.6037, -0.2312], // Achimota
  [5.6881, -0.2874], // Pokuase Interchange
  [5.7612, -0.3204], // Amasaman
  [5.8089, -0.3503], // Nsawam Bypass
  [6.0406, -0.4508], // Suhum Junction
  [6.2153, -0.5678], // Bunso Junction
  [6.5516, -0.7672], // Nkawkaw Bypass / Kwahu Escarpment
  [6.6021, -1.0245], // Juaso
  [6.6167, -1.2167], // Konongo Station
  [6.7153, -1.5122], // Ejisu
  [6.6885, -1.6244], // VIP Asafo Terminal, Kumasi
];

export const LiveLeafletMap = ({
  originCity = "Accra",
  destinationCity = "Kumasi",
  latestPing,
  className = "w-full h-full min-h-[380px]",
  zoomLevel = 9,
}: LiveLeafletMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Ensure container hasn't been initialized
      if ((mapContainerRef.current as any)._leaflet_id) {
        return;
      }

      // Determine initial center
      const centerLat = latestPing?.lat || 6.12;
      const centerLng = latestPing?.lng || -0.92;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoomLevel,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control at top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Free, high performance, ultra crisp CartoDB Voyager map tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Route Polyline (Dark line with orange glow, matching design screenshot)
      const routeLine = L.polyline(HIGHWAY_N6_ROUTE, {
        color: "#0F0F0F",
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Origin Marker: Accra VIP Station
      const originIcon = L.divIcon({
        className: "custom-origin-pin",
        html: `
          <div style="background:#0F0F0F; color:#FFF; font-weight:700; font-size:10px; padding:3px 8px; border-radius:99px; box-shadow:0 3px 8px rgba(0,0,0,0.3); border:2px solid #FFF; display:flex; items-center; gap:4px; white-space:nowrap;">
            <span>📍</span> <span>Accra (VIP Circle)</span>
          </div>
        `,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });
      L.marker([5.5601, -0.2155], { icon: originIcon })
        .addTo(map)
        .bindPopup("<strong>VIP Circle Terminal</strong><br>Accra Departure Hub");

      // Destination Marker: Kumasi VIP Station
      const destIcon = L.divIcon({
        className: "custom-dest-pin",
        html: `
          <div style="background:#E85D26; color:#FFF; font-weight:700; font-size:10px; padding:3px 8px; border-radius:99px; box-shadow:0 3px 8px rgba(232,93,38,0.4); border:2px solid #FFF; display:flex; items-center; gap:4px; white-space:nowrap;">
            <span>🏁</span> <span>Kumasi (VIP Asafo)</span>
          </div>
        `,
        iconSize: [115, 26],
        iconAnchor: [57, 13],
      });
      L.marker([6.6885, -1.6244], { icon: destIcon })
        .addTo(map)
        .bindPopup("<strong>VIP Asafo Terminal</strong><br>Kumasi Arrival Hub");

      // Intermediate Key Waypoints on Highway
      const waypointNodes = [
        { name: "Nsawam Bypass", coord: [5.8089, -0.3503] },
        { name: "Suhum Junction", coord: [6.0406, -0.4508] },
        { name: "Nkawkaw Escarpment", coord: [6.5516, -0.7672] },
        { name: "Konongo Hub", coord: [6.6167, -1.2167] },
      ];

      waypointNodes.forEach((wp) => {
        const dotIcon = L.divIcon({
          className: "custom-waypoint-dot",
          html: `<div style="width:8px; height:8px; background:#FFFFFF; border:2px solid #0F0F0F; border-radius:50%;"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });
        L.marker(wp.coord as [number, number], { icon: dotIcon })
          .addTo(map)
          .bindPopup(`<span style="font-size:11px;">Highway N6: ${wp.name}</span>`);
      });

      // Active Real-Time Tracker Beacon Marker
      const pingLat = latestPing?.lat || 6.0406;
      const pingLng = latestPing?.lng || -0.4508;
      const speed = latestPing?.speed_kmh ? `${latestPing.speed_kmh} km/h` : "In Transit";

      const trackerIcon = L.divIcon({
        className: "custom-tracker-beacon",
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:36px; height:36px; background:#E85D26; opacity:0.3; border-radius:50%; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width:22px; height:22px; background:#0F0F0F; border:3px solid #FFF; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.4);">
              <div style="width:7px; height:7px; background:#E85D26; border-radius:50%;"></div>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const trackerMarker = L.marker([pingLat, pingLng], { icon: trackerIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(
          `<div style="font-size:11px; padding:2px;">
            <strong style="color:#E85D26;">oura Hardware Tracker</strong><br>
            Speed: ${speed}<br>
            Device: ${latestPing?.tracker_id || "TRK-FINDMY-09"}<br>
            Highway N6 Corridor
          </div>`
        );

      markerRef.current = trackerMarker;
      mapInstanceRef.current = map;

      // Fit map view to the route
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

      if (isMounted) setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position dynamically when a new tracker ping arrives
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latestPing) {
      markerRef.current.setLatLng([latestPing.lat, latestPing.lng]);
    }
  }, [latestPing]);

  return (
    <div className={`relative overflow-hidden rounded-card ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

      {/* Floating GPS telemetry badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-line shadow-sm flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
        <span className="text-[10px] font-bold font-data text-ink tracking-tight uppercase">
          Accra ➔ Kumasi Highway N6 Live Telemetry
        </span>
      </div>

      {/* Recenter Button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current && markerRef.current) {
            const pos = markerRef.current.getLatLng();
            mapInstanceRef.current.setView(pos, 11, { animate: true });
          }
        }}
        className="absolute bottom-4 right-4 z-[1000] bg-ink hover:bg-ink/90 text-white text-[11px] font-bold px-3 py-2 rounded-pill shadow-lg flex items-center gap-1.5 transition-all active:scale-95 border border-white/20"
      >
        <span>🎯</span>
        <span>Center Package</span>
      </button>
    </div>
  );
};
