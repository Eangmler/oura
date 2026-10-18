"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Bell,
  Search,
  ScanLine,
  Package,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusStepper } from "@/components/ui/status-stepper";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Shipment } from "@/types";

export default function HomePage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {
        if (data.shipments) setShipments(data.shipments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentShipment = shipments.find((s) => s.status === "in_transit") || shipments[0];
  const recentShipments = shipments.slice(0, 4);

  return (
    <main className="min-h-screen bg-paper pb-32">
      {/* Top Header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-data text-muted leading-none">Intercity Express</div>
            <div className="text-sm font-semibold text-ink flex items-center gap-1 mt-0.5">
              <span>oura</span>
              <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.2 rounded font-medium">
                accra ↔ kumasi
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/admin"
          className="relative w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center text-ink shadow-subtle hover:bg-soft transition-colors"
          title="Admin & Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
        </Link>
      </header>

      {/* Main Content Area (Max width phone-like on mobile, centered on desktop) */}
      <div className="max-w-md mx-auto px-5 pt-3 space-y-5">
        {/* Search Bar matching screenshot */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Tracking ID or item..."
            className="w-full pl-10 pr-11 py-3 bg-white border border-line/70 rounded-card text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent shadow-subtle font-data"
          />
          <Link
            href="/track"
            className="absolute right-3 p-1 text-muted hover:text-ink transition-colors"
            title="Scan or Track"
          >
            <ScanLine className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Action Cards (New Delivery + Track Package) */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* New Delivery Card */}
          <Link
            href="/book"
            className="group relative bg-white border border-line/60 rounded-card p-4 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between overflow-hidden min-h-[120px]"
          >
            <div>
              <div className="text-xs font-bold text-ink leading-tight">New</div>
              <div className="text-xs font-bold text-ink leading-tight">Delivery</div>
            </div>
            {/* Visual Truck Graphic */}
            <div className="absolute right-2 bottom-1.5 w-16 h-12 flex items-end justify-end group-hover:scale-105 transition-transform">
              <span className="text-3xl select-none">🚚</span>
            </div>
          </Link>

          {/* Track Package Card */}
          <Link
            href="/track"
            className="group relative bg-white border border-line/60 rounded-card p-4 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between overflow-hidden min-h-[120px]"
          >
            <div>
              <div className="text-xs font-bold text-ink leading-tight">Track</div>
              <div className="text-xs font-bold text-ink leading-tight">Package</div>
            </div>
            {/* Visual Box Graphic */}
            <div className="absolute right-2 bottom-1.5 w-16 h-12 flex items-end justify-end group-hover:scale-105 transition-transform">
              <span className="text-3xl select-none">📦</span>
            </div>
          </Link>
        </div>

        {/* Current Shipment Section (Matching screenshot) */}
        {currentShipment && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Current Shipment</h2>
              <Link href="/track" className="text-xs text-muted hover:text-ink font-medium">
                See All
              </Link>
            </div>

            <Link
              href={`/track/${currentShipment.tracking_id}`}
              className="block group bg-white border border-line/60 rounded-card p-4.5 shadow-subtle hover:shadow-card transition-all relative overflow-hidden"
            >
              {/* Header inside card: Thumbnail, ID, Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-soft border border-line flex items-center justify-center text-xl shadow-inner">
                    📦
                  </div>
                  <div>
                    <div className="text-xs font-bold font-data text-ink tracking-tight">
                      ID: {currentShipment.tracking_id}
                    </div>
                    <div className="text-[11px] text-muted truncate max-w-[170px] mt-0.5">
                      {currentShipment.item_description}
                    </div>
                  </div>
                </div>

                <Badge status={currentShipment.status} />
              </div>

              {/* Status Stepper with active progress line and ETA */}
              <div className="mt-3">
                <StatusStepper status={currentShipment.status} showEta={true} />
              </div>

              {/* Dates & Locations row */}
              <div className="mt-2 pt-2 border-t border-line/50 grid grid-cols-2 gap-2 text-[11px] font-data">
                <div>
                  <div className="text-muted text-[10px]">Origin</div>
                  <div className="text-ink font-semibold truncate">
                    {currentShipment.origin_address || currentShipment.origin_city}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted text-[10px]">Destination</div>
                  <div className="text-ink font-semibold truncate">
                    {currentShipment.destination_address || currentShipment.destination_city}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Recent Shipment Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Recent Shipment</h2>
            <Link href="/track" className="text-xs text-muted hover:text-ink font-medium">
              See All
            </Link>
          </div>

          <div className="space-y-2">
            {recentShipments.map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.tracking_id}`}
                className="flex items-center justify-between p-3.5 bg-white border border-line/60 rounded-card shadow-subtle hover:bg-soft/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-soft flex items-center justify-center text-lg">
                    📦
                  </div>
                  <div>
                    <div className="text-xs font-bold font-data text-ink">
                      ID: {shipment.tracking_id}
                    </div>
                    <div className="text-[11px] text-muted truncate max-w-[150px]">
                      {shipment.item_description}
                    </div>
                  </div>
                </div>

                <Badge status={shipment.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Value Proposition / Guarantee Footer Banner */}
        <div className="p-4 rounded-card bg-ink text-white/90 space-y-1.5 shadow-subtle">
          <div className="flex items-center gap-1.5 text-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>oura Promise</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Direct door-to-door courier service via VIP intercity transit. Track your parcel live with hardware accuracy.
          </p>
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <BottomNav />
    </main>
  );
}
