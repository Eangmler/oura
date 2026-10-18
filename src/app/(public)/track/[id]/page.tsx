"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  RefreshCw,
  MapPin,
  ExternalLink,
  Navigation,
  Radio,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { StatusStepper } from "@/components/ui/status-stepper";
import { Badge } from "@/components/ui/badge";
import { Shipment, TrackerPing } from "@/types";

// Dynamic import for Leaflet map to guarantee SSR safety
const LiveLeafletMap = dynamic(
  () => import("@/components/map/live-leaflet-map").then((mod) => mod.LiveLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] bg-[#E5E9E7] flex items-center justify-center text-xs text-muted">
        Loading real-time highway telemetry...
      </div>
    ),
  }
);

const HIGHWAY_CHECKPOINTS = [
  { name: "Accra VIP", lat: 5.5698, lng: -0.2141, speed: 0 },
  { name: "Nsawam", lat: 5.8089, lng: -0.3522, speed: 68 },
  { name: "Suhum", lat: 6.0409, lng: -0.4505, speed: 75 },
  { name: "Nkawkaw", lat: 6.5512, lng: -0.7681, speed: 72 },
  { name: "Konongo", lat: 6.6184, lng: -1.2179, speed: 64 },
  { name: "Kumasi VIP", lat: 6.6885, lng: -1.6163, speed: 0 },
];

export default function TrackingDetailPage() {
  const params = useParams();
  const trackingId = (params.id as string) || "H314315796";

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [latestPing, setLatestPing] = useState<TrackerPing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState("");

  const fetchStatus = () => {
    fetch(`/api/shipments/${trackingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.shipment) {
          setShipment(data.shipment);
        } else {
          setError("Shipment not found");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching shipment");
      })
      .finally(() => setLoading(false));

    // Fetch latest coordinates
    fetch(`/api/pings?shipment_id=${trackingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.latest) {
          setLatestPing(data.latest);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, [trackingId]);

  const handleSimulateMove = async (cp: { name: string; lat: number; lng: number; speed: number }) => {
    if (!shipment) return;
    const tagId = shipment.tracker_id || "oura-tag-01";
    await fetch("/api/trackers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "gps_ping",
        tracker_id: tagId,
        lat: cp.lat,
        lng: cp.lng,
        speed_kmh: cp.speed,
        source: "manual_rep",
      }),
    });
    setTestNotice(`Moved ${tagId} to ${cp.name} (${cp.speed} km/h)`);
    fetchStatus();
  };

  const handleUseMyDeviceGps = () => {
    if (!shipment) return;
    const tagId = shipment.tracker_id || "oura-tag-01";
    if (!("geolocation" in navigator)) {
      setTestNotice("Geolocation not supported. Tap a town button instead.");
      return;
    }
    setTestNotice("Locating your device GPS...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        await fetch("/api/trackers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "gps_ping",
            tracker_id: tagId,
            lat,
            lng,
            speed_kmh: 50,
            source: "device_browser_gps",
          }),
        });
        setTestNotice(`✓ Map updated to your live device GPS (${lat}, ${lng})`);
        fetchStatus();
      },
      () => {
        setTestNotice("Location permission blocked. Tap a Highway N6 town button to test!");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-5">
          <div className="w-9 h-9 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted mt-3">Connecting to oura satellite tracking...</p>
        </main>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-5 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h1 className="text-base font-bold text-ink">Tracking ID Not Found</h1>
          <p className="text-xs text-muted max-w-xs mt-1">
            We couldn&apos;t locate shipment &quot;{trackingId}&quot;. Please check your tracking number or book a new delivery.
          </p>
          <Link
            href="/track"
            className="mt-4 px-5 py-2.5 bg-accent text-white rounded-pill text-xs font-semibold"
          >
            Try Another ID
          </Link>
        </main>
      </div>
    );
  }

  const courierName = shipment.courier?.name || "Khalid Omor";
  const courierPhone = shipment.courier?.phone || "0248147952";
  const findMyUrl = shipment.google_maps_share_url || "https://www.google.com/android/find/";

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Responsive Grid: On Desktop/Mac/iPad: 2 Columns. On Mobile: Stacked Map & Drawer */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* MAP COLUMN (7 cols on Desktop, full height) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href="/track"
                  className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center text-ink hover:bg-soft"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="text-sm font-bold text-ink">Live Route Tracking</h1>
                  <p className="text-[11px] text-muted font-data">Accra VIP Circle ➔ Kumasi VIP Asafo</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {shipment.tracker_id && (
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-extrabold font-data">
                    🏷️ {shipment.tracker_id}
                  </span>
                )}
                <button
                  onClick={fetchStatus}
                  className="px-3 py-1.5 rounded-full bg-white border border-line text-xs font-semibold text-ink flex items-center gap-1.5 shadow-subtle hover:bg-soft"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* REAL INTERACTIVE LEAFLET MAP */}
            <div className="h-[400px] lg:h-[540px] w-full rounded-card overflow-hidden border border-line/80 shadow-card relative">
              <LiveLeafletMap
                originCity={shipment.origin_city}
                destinationCity={shipment.destination_city}
                latestPing={latestPing}
                className="w-full h-full"
              />
            </div>

            {/* Interactive Live Test Bar (So you can test moving the tag right now without physical hardware) */}
            <div className="p-3.5 rounded-card bg-white border border-line shadow-subtle space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Live Hardware Test Controls (Click to move pin on map):</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseMyDeviceGps}
                  className="px-2.5 py-1 rounded-pill bg-ink text-white text-[10px] font-bold inline-flex items-center gap-1 hover:bg-ink/90"
                >
                  <Navigation className="w-3 h-3" /> Use My Device GPS
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HIGHWAY_CHECKPOINTS.map((cp) => (
                  <button
                    key={cp.name}
                    type="button"
                    onClick={() => handleSimulateMove(cp)}
                    className="px-2.5 py-1 rounded-pill bg-soft hover:bg-accent hover:text-white text-[10px] font-semibold text-ink border border-line transition-all"
                  >
                    📍 {cp.name}
                  </button>
                ))}
              </div>
              {testNotice && (
                <div className="text-[11px] font-data font-semibold text-status-green">{testNotice}</div>
              )}
            </div>
          </div>

          {/* DRAWER / DETAILS COLUMN (5 cols on Desktop, matching screenshot dark design) */}
          <div className="lg:col-span-5">
            <div className="bg-ink text-white rounded-drawer lg:rounded-card p-6 shadow-float space-y-4 border border-white/10">
              {/* Top Handle for mobile feel */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2 lg:hidden" />

              {/* Row 1: Booking ID & Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-white/50 font-data">Booking Id:</div>
                  <div className="text-xl font-extrabold font-data text-white tracking-tight">
                    {shipment.tracking_id}
                  </div>
                </div>
                <Badge status={shipment.status} variant="dark" />
              </div>

              {/* Row 2: Status Stepper */}
              <div className="py-1">
                <StatusStepper status={shipment.status} variant="dark" showEta={false} />
              </div>

              {/* Row 3: Timestamps & Route */}
              <div className="grid grid-cols-2 gap-4 text-xs font-data border-b border-white/10 pb-3 pt-1">
                <div>
                  <div className="text-[10px] text-white/40">
                    Created,{" "}
                    {new Date(shipment.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="font-semibold text-white/90 truncate mt-0.5">
                    {shipment.origin_address || `${shipment.origin_city} Station`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40">
                    Estimated,{" "}
                    {shipment.estimated_delivery
                      ? new Date(shipment.estimated_delivery).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Today"}
                  </div>
                  <div className="font-semibold text-white/90 truncate mt-0.5">
                    {shipment.destination_address || `${shipment.destination_city} Hub`}
                  </div>
                </div>
              </div>

              {/* Row 4: Detail Grid & 3D Box Illustration */}
              <div className="grid grid-cols-12 gap-3 py-3 border-b border-white/10 items-center">
                <div className="col-span-7 grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] font-data">
                  <div>
                    <div className="text-[10px] text-white/40">From</div>
                    <div className="font-semibold text-white truncate">{shipment.origin_city}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">To</div>
                    <div className="font-semibold text-white truncate">{shipment.destination_city}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">Customer</div>
                    <div className="font-semibold text-white truncate">{shipment.sender_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">Order Cost</div>
                    <div className="font-semibold text-accent font-data">
                      GHS {shipment.pricing?.total || 120}.00
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">Quantity</div>
                    <div className="font-semibold text-white">{shipment.quantity} Box</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">Weight</div>
                    <div className="font-semibold text-white">{shipment.weight_kg} Kg</div>
                  </div>
                </div>

                <div className="col-span-5 flex justify-end">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E2A662] to-[#B37837] p-2.5 flex flex-col justify-between shadow-lg relative border border-white/20 select-none">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] bg-white/80 text-ink font-bold px-1.5 py-0.5 rounded">
                        VIP
                      </span>
                      <span className="w-3 h-3 rounded-full bg-white/30" />
                    </div>
                    <div className="w-8 h-4 bg-white/70 rounded-sm self-center" />
                    <div className="text-[9px] font-bold text-ink/80 text-center tracking-tight truncate">
                      {shipment.item_description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Assigned Courier / Rep Card */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-lg font-bold">
                    👨🏾‍✈️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{courierName}</div>
                    <div className="text-[10px] text-white/50 leading-tight mt-0.5">
                      VIP Transit Dispatch
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href={`tel:${courierPhone}`}
                    className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    title="Call Courier"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                  </a>

                  <a
                    href={`https://wa.me/233${courierPhone.replace(/^0/, "")}?text=Hello%20oura%20courier,%20regarding%20shipment%20${shipment.tracking_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white text-ink flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    title="Message on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 fill-ink" />
                  </a>
                </div>
              </div>

              {/* Permanent Google Find My / Hardware Tag Live Pin Button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-data">
                  <Radio className="w-3.5 h-3.5 text-accent" />
                  <span>Tag: {shipment.tracker_id || "oura-tag-01"}</span>
                </div>
                <a
                  href={findMyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-pill bg-white/10 hover:bg-white/20 text-accent font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open Google Find My Pin</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
