"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Truck,
  Package,
  ArrowRight,
  MapPin,
  Search,
  ScanLine,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusStepper } from "@/components/ui/status-stepper";
import { Shipment, TrackerPing } from "@/types";

// Dynamic import for Leaflet map to guarantee SSR safety
const LiveLeafletMap = dynamic(
  () => import("@/components/map/live-leaflet-map").then((mod) => mod.LiveLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[360px] bg-soft rounded-card flex items-center justify-center text-xs text-muted">
        Loading real-time highway map...
      </div>
    ),
  }
);

export default function HomePage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [latestPing, setLatestPing] = useState<TrackerPing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {
        if (data.shipments) {
          setShipments(data.shipments);
          const inTransit = data.shipments.find((s: Shipment) => s.status === "in_transit") || data.shipments[0];
          if (inTransit) {
            fetch(`/api/pings?shipment_id=${inTransit.tracking_id}`)
              .then((r) => r.json())
              .then((p) => {
                if (p.latest) setLatestPing(p.latest);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentShipment = shipments.find((s) => s.status === "in_transit") || shipments[0];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* HERO SECTION: Minimalist, spacious on Desktop/Mac, sleek on Mobile */}
        <section className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-line rounded-pill text-xs font-semibold text-ink shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Doorstep Pickup to VIP Intercity Transit</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink leading-tight">
              Intercity parcel delivery, <br className="hidden sm:inline" />
              <span className="text-accent">tracked in real-time.</span>
            </h1>

            <p className="text-sm sm:text-base text-muted max-w-xl leading-relaxed">
              Send documents, electronics, cartons, and cargo between <strong className="text-ink">Accra</strong> and <strong className="text-ink">Kumasi</strong>. Your package travels securely on trusted VIP express buses with hardware GPS tracking.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/book">
                <Button size="lg" className="shadow-md">
                  Book a Delivery <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" size="lg">
                  Track Package
                </Button>
              </Link>
            </div>

            {/* Quick Tracking Search Bar */}
            <div className="pt-2 max-w-md">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/track/${searchQuery.trim().toUpperCase()}`;
                    }
                  }}
                  placeholder="Enter Tracking ID (e.g. H314315796)..."
                  className="w-full pl-10 pr-24 py-3 bg-white border border-line rounded-card text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent shadow-subtle font-data"
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `/track/${searchQuery.trim().toUpperCase()}`;
                    }
                  }}
                  className="absolute right-2 px-3 py-1.5 bg-ink text-white rounded-lg text-xs font-semibold hover:bg-ink/80 transition-colors"
                >
                  Track
                </button>
              </div>
            </div>
          </div>

          {/* Current Shipment Card (Matching the design reference) */}
          <div className="lg:col-span-5">
            {currentShipment ? (
              <Card className="p-6 bg-white border border-line/80 shadow-card hover:shadow-float transition-all relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-soft border border-line flex items-center justify-center text-xl">
                      📦
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink">Active Shipment</div>
                      <div className="text-sm font-extrabold font-data text-ink">
                        ID: {currentShipment.tracking_id}
                      </div>
                    </div>
                  </div>
                  <Badge status={currentShipment.status} />
                </div>

                <div className="text-xs text-muted font-medium">
                  {currentShipment.item_description} ({currentShipment.weight_kg}kg)
                </div>

                {/* Status Stepper */}
                <div className="pt-1">
                  <StatusStepper status={currentShipment.status} showEta={true} />
                </div>

                {/* Origin ➔ Destination */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-line/60">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">From</div>
                    <div className="font-semibold text-ink truncate mt-0.5">
                      {currentShipment.origin_address || currentShipment.origin_city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-muted">To</div>
                    <div className="font-semibold text-ink truncate mt-0.5">
                      {currentShipment.destination_address || currentShipment.destination_city}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/track/${currentShipment.tracking_id}`}
                  className="block w-full py-2.5 text-center bg-ink text-white rounded-pill text-xs font-bold hover:bg-ink/90 transition-colors mt-2"
                >
                  View Full Tracking Screen
                </Link>
              </Card>
            ) : (
              <Card className="p-8 text-center space-y-3">
                <div className="text-3xl">🚚</div>
                <div className="text-sm font-bold text-ink">No active delivery right now</div>
                <p className="text-xs text-muted">Book a new parcel to see live tracking</p>
                <Link href="/book">
                  <Button size="sm">Book Now</Button>
                </Link>
              </Card>
            )}
          </div>
        </section>

        {/* REAL INTERACTIVE HIGHWAY MAP SECTION (Addresses: "the map does not fully show anything substantial") */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <span>Accra ↔ Kumasi Highway N6 Corridor</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-status-green-bg text-status-green font-data">
                  Live Satellite Telemetry
                </span>
              </h2>
              <p className="text-xs text-muted">
                Real location mappings via VIP Circle, Suhum, Nkawkaw, Konongo to VIP Asafo
              </p>
            </div>
            <Link
              href={currentShipment ? `/track/${currentShipment.tracking_id}` : "/track"}
              className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
            >
              Open Fullscreen Tracking View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[420px] w-full rounded-card overflow-hidden border border-line shadow-card">
            <LiveLeafletMap
              originCity="Accra"
              destinationCity="Kumasi"
              latestPing={latestPing}
              className="w-full h-full"
            />
          </div>
        </section>

        {/* 3 APP PORTALS HIGHLIGHT SECTION */}
        <section className="space-y-4 pt-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl font-bold text-ink">Three Dedicated Portals for oura</h2>
            <p className="text-xs text-muted">
              Built for seamless intercity delivery operations across Ghana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* 1. Demand App */}
            <Card className="p-5 flex flex-col justify-between space-y-4 hover:shadow-card transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-ink">Client Demand App</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Fast booking wizard with AI perceived weight estimation, route quotes, MoMo payment instructions, and live tracking.
                </p>
              </div>
              <Link href="/book" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                Book Parcel <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* 2. Rep Portal */}
            <Card className="p-5 flex flex-col justify-between space-y-4 hover:shadow-card transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-ink">Terminal Rep Portal</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Mobile & tablet terminal workstation for reps at VIP Circle and Asafo to log parcels, assign hardware trackers, and update status.
                </p>
              </div>
              <Link href="/rep" className="text-xs font-bold text-ink hover:underline flex items-center gap-1">
                Open Rep Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* 3. Admin Command */}
            <Card className="p-5 flex flex-col justify-between space-y-4 hover:shadow-card transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-status-green-bg text-status-green flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-ink">Admin Command Center</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Operations dashboard with live revenue metrics, manual MoMo verification, rep access controls, and full rate table configuration.
                </p>
              </div>
              <Link href="/admin" className="text-xs font-bold text-status-green hover:underline flex items-center gap-1">
                Open Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-line/60 bg-white mt-12 py-6 text-center text-xs text-muted">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="oura" className="w-5 h-5 rounded-md object-cover" />
            <span className="font-extrabold text-ink">oura</span>
            <span>— intercity parcel logistics</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/book" className="hover:text-ink">Book</Link>
            <Link href="/track" className="hover:text-ink">Track</Link>
            <Link href="/rep" className="hover:text-ink">Reps</Link>
            <Link href="/admin" className="hover:text-ink">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
