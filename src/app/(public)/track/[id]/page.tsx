"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  MessageSquare,
  Check,
  RefreshCw,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { InteractiveMap } from "@/components/tracking/interactive-map";
import { StatusStepper } from "@/components/ui/status-stepper";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Shipment, TrackerPing } from "@/types";

export default function TrackingDetailPage() {
  const params = useParams();
  const trackingId = (params.id as string) || "H314315796";

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [latestPing, setLatestPing] = useState<TrackerPing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Auto poll every 10 seconds for live tracker stream
    const timer = setInterval(fetchStatus, 10000);
    return () => clearInterval(timer);
  }, [trackingId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-5">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted mt-3">Connecting to oura satellite tracking...</p>
      </main>
    );
  }

  if (error || !shipment) {
    return (
      <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-5 text-center">
        <div className="text-4xl mb-3">📦</div>
        <h1 className="text-base font-bold text-ink">Tracking ID Not Found</h1>
        <p className="text-xs text-muted max-w-xs mt-1">
          We couldn't locate shipment "{trackingId}". Please check your tracking number or book a new delivery.
        </p>
        <Link
          href="/track"
          className="mt-4 px-5 py-2.5 bg-accent text-white rounded-pill text-xs font-semibold"
        >
          Try Another ID
        </Link>
      </main>
    );
  }

  const courierName = shipment.courier?.name || "Khalid Omor";
  const courierPhone = shipment.courier?.phone || "0248147952";

  return (
    <main className="min-h-screen bg-[#E5E9E7] flex flex-col justify-between overflow-x-hidden">
      {/* Top Header Floating over Map (From screenshot) */}
      <header className="absolute top-0 left-0 right-0 z-30 px-5 pt-4 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-line/60 flex items-center justify-center text-ink shadow-sm hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <h1 className="text-sm font-bold text-ink">Location Tracking</h1>

        <button
          onClick={fetchStatus}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-line/60 flex items-center justify-center text-ink shadow-sm hover:bg-white"
          title="Refresh GPS"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Map View Section (Upper portion) */}
      <div className="w-full relative pt-12">
        <InteractiveMap
          originCity={shipment.origin_city}
          destinationCity={shipment.destination_city}
          latestPing={latestPing}
        />
      </div>

      {/* Dark Sliding Bottom Drawer (Exact match to screenshot) */}
      <div className="relative -mt-6 z-20 bg-ink text-white rounded-t-drawer px-6 pt-3 pb-28 shadow-2xl max-w-md mx-auto w-full">
        {/* Top Drawer Drag Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto my-2" />

        {/* Row 1: Booking Id and Status Pill */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[11px] text-white/50 font-data">Booking Id:</div>
            <div className="text-lg font-extrabold font-data text-white tracking-tight">
              {shipment.tracking_id}
            </div>
          </div>

          <Badge status={shipment.status} variant="dark" />
        </div>

        {/* Row 2: Status Stepper Line */}
        <div className="mt-2">
          <StatusStepper status={shipment.status} variant="dark" showEta={false} />
        </div>

        {/* Row 3: Timestamps and Cities */}
        <div className="grid grid-cols-2 gap-4 text-xs font-data border-b border-white/10 pb-3 pt-1">
          <div>
            <div className="text-[10px] text-white/40">Created, {new Date(shipment.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
            <div className="font-semibold text-white/90 truncate mt-0.5">
              {shipment.origin_address || `${shipment.origin_city} Station`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40">
              Estimated, {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Today"}
            </div>
            <div className="font-semibold text-white/90 truncate mt-0.5">
              {shipment.destination_address || `${shipment.destination_city} Hub`}
            </div>
          </div>
        </div>

        {/* Row 4: Detail Grid & 3D Box Graphic (From screenshot) */}
        <div className="grid grid-cols-12 gap-3 py-4 border-b border-white/10 items-center">
          {/* Details Column (8 cols) */}
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

          {/* 3D Box Illustration Column (5 cols) */}
          <div className="col-span-5 flex justify-end">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E2A662] to-[#B37837] p-2 flex flex-col justify-between shadow-lg relative border border-white/20 select-none">
              <div className="flex justify-between items-start">
                <span className="text-[8px] bg-white/80 text-ink font-bold px-1 rounded">VIP</span>
                <span className="w-3 h-3 rounded-full bg-white/30" />
              </div>
              <div className="w-8 h-4 bg-white/70 rounded-sm self-center" />
              <div className="text-[9px] font-bold text-ink/80 text-center tracking-tight">
                {shipment.item_description.slice(0, 14)}
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Courier Card (Exact from screenshot) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-lg font-bold">
              👨🏾‍✈️
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">{courierName}</div>
              <div className="text-[10px] text-white/50 leading-tight mt-0.5">Courier & Dispatch</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Orange Call Button */}
            <a
              href={`tel:${courierPhone}`}
              className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
              title="Call Courier"
            >
              <Phone className="w-4 h-4 fill-white" />
            </a>

            {/* Chat / Message Button */}
            <a
              href={`https://wa.me/233${courierPhone.replace(/^0/, "")}?text=Hello%20oura%20courier,%20regarding%20shipment%20${shipment.tracking_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white text-ink flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
              title="Message on WhatsApp"
            >
              <MessageSquare className="w-4 h-4 fill-ink" />
            </a>
          </div>
        </div>

        {/* Phase 2: Google Maps Find My Live Link (if present) */}
        {shipment.google_maps_share_url && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <a
              href={shipment.google_maps_share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open Hardware Google Find My Live Pin</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
