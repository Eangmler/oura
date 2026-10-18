"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  Navigation,
  Lock,
  ArrowRight,
  Shield,
  Phone,
  Search,
  Radio,
  BatteryCharging,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusStepper } from "@/components/ui/status-stepper";
import { Shipment, TerminalRep, HardwareTracker } from "@/types";

const HIGHWAY_CHECKPOINTS = [
  { name: "Accra VIP Circle", lat: 5.5698, lng: -0.2141, speed: 0 },
  { name: "Nsawam Bypass", lat: 5.8089, lng: -0.3522, speed: 68 },
  { name: "Suhum Junction", lat: 6.0409, lng: -0.4505, speed: 75 },
  { name: "Nkawkaw Bypass", lat: 6.5512, lng: -0.7681, speed: 72 },
  { name: "Konongo Odumasi", lat: 6.6184, lng: -1.2179, speed: 64 },
  { name: "Kumasi VIP Asafo", lat: 6.6885, lng: -1.6163, speed: 0 },
];

export default function RepDashboardPage() {
  const [rep, setRep] = useState<TerminalRep | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trackers, setTrackers] = useState<HardwareTracker[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filter, setFilter] = useState<"all" | "pickup" | "transit" | "arrived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState("");
  const [isStreamingDeviceGps, setIsStreamingDeviceGps] = useState(false);

  // New parcel quick logging modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDesc, setLogDesc] = useState("");
  const [logSender, setLogSender] = useState("");
  const [logSenderPhone, setLogSenderPhone] = useState("");
  const [logRecipient, setLogRecipient] = useState("");
  const [logRecipientPhone, setLogRecipientPhone] = useState("");
  const [logDestCity, setLogDestCity] = useState("Kumasi");

  useEffect(() => {
    const saved = localStorage.getItem("oura_rep_session");
    if (saved) {
      try {
        setRep(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const loadData = () => {
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {
        if (data.shipments) {
          setShipments(data.shipments);
          if (!selectedShipment && data.shipments.length > 0) {
            setSelectedShipment(data.shipments[0]);
          } else if (selectedShipment) {
            const updated = data.shipments.find((s: Shipment) => s.id === selectedShipment.id);
            if (updated) setSelectedShipment(updated);
          }
        }
      })
      .catch((err) => console.error(err));

    fetch("/api/trackers")
      .then((res) => res.json())
      .then((data) => {
        if (data.trackers) setTrackers(data.trackers);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (rep) {
      loadData();
    }
  }, [rep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/rep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (data.success && data.rep) {
        setRep(data.rep);
        localStorage.setItem("oura_rep_session", JSON.stringify(data.rep));
      } else {
        setAuthError(data.error || "Login failed");
      }
    } catch (err) {
      setAuthError("Network error connecting to server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("oura_rep_session");
    setRep(null);
  };

  const handleUpdateStatus = async (
    trackingId: string,
    newStatus: string,
    options?: { tracker_id?: string; courier_name?: string; google_maps_share_url?: string }
  ) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/shipments/${trackingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rep_id: rep?.id,
          tracker_id: options?.tracker_id,
          google_maps_share_url: options?.google_maps_share_url,
          courier_name: options?.courier_name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleBroadcastDeviceGps = () => {
    if (!selectedShipment) return;
    const activeTrackerId = selectedShipment.tracker_id || "test-device-01";

    if (!("geolocation" in navigator)) {
      setGpsStatusMsg("Geolocation not supported by this browser. Use a checkpoint button below.");
      return;
    }

    setIsStreamingDeviceGps(true);
    setGpsStatusMsg("Acquiring live GPS from your device...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 45;

        // Ensure tag is assigned first
        if (!selectedShipment.tracker_id) {
          await fetch(`/api/shipments/${selectedShipment.tracking_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: selectedShipment.status === "at_terminal" ? "in_transit" : selectedShipment.status,
              tracker_id: activeTrackerId,
            }),
          });
        }

        await fetch("/api/trackers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "gps_ping",
            tracker_id: activeTrackerId,
            lat,
            lng,
            speed_kmh: speed,
            source: "device_browser_gps",
          }),
        });

        setGpsStatusMsg(`✓ Live Device GPS sent (${lat}, ${lng}) → Tag ${activeTrackerId}`);
        setIsStreamingDeviceGps(false);
        loadData();
      },
      (err) => {
        setIsStreamingDeviceGps(false);
        setGpsStatusMsg(`Location permission denied or unavailable. Click a Highway Checkpoint below to test!`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSimulateCheckpoint = async (cp: { name: string; lat: number; lng: number; speed: number }) => {
    if (!selectedShipment) return;
    const activeTrackerId = selectedShipment.tracker_id || "test-device-01";
    setUpdating(true);
    try {
      if (!selectedShipment.tracker_id) {
        await fetch(`/api/shipments/${selectedShipment.tracking_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "in_transit",
            tracker_id: activeTrackerId,
          }),
        });
      }

      await fetch("/api/trackers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gps_ping",
          tracker_id: activeTrackerId,
          lat: cp.lat,
          lng: cp.lng,
          speed_kmh: cp.speed,
          source: "manual_rep",
        }),
      });

      setGpsStatusMsg(`✓ Simulated ${activeTrackerId} at ${cp.name} (${cp.speed} km/h)`);
      loadData();
    } finally {
      setUpdating(false);
    }
  };

  const handleLogParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const originCity = rep?.terminal_id.includes("KSI") ? "Kumasi" : "Accra";
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_city: originCity,
          origin_address: rep?.terminal_name,
          destination_city: logDestCity,
          destination_address: `${logDestCity} Central VIP Hub`,
          item_description: logDesc || "Station Parcel",
          quantity: 1,
          weight_category: "medium",
          weight_kg: 3.0,
          sender_name: logSender || "Walk-in Client",
          sender_phone: logSenderPhone || "0240000000",
          recipient_name: logRecipient || "Recipient",
          recipient_phone: logRecipientPhone || "0240000000",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLogModal(false);
        setLogDesc("");
        setLogSender("");
        setLogRecipient("");
        loadData();
      }
    } catch (err) {
      alert("Failed to log parcel");
    } finally {
      setUpdating(false);
    }
  };

  // ── 1. LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!rep) {
    return (
      <main className="min-h-screen bg-paper flex flex-col justify-center px-4 sm:px-6">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/icon-192.png"
              alt="oura"
              className="w-14 h-14 rounded-2xl mx-auto shadow-md border border-line"
            />
            <h1 className="text-xl font-extrabold text-ink tracking-tight">oura terminal rep portal</h1>
            <p className="text-xs text-muted">Accra VIP Circle & Kumasi VIP Asafo Station Desks</p>
          </div>

          <Card className="p-6 bg-white border border-line shadow-card">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink">Rep Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0240000001 (Kweku) or 0240000002 (Ama)"
                  className="w-full px-4 py-3 rounded-card border border-line bg-soft text-xs text-ink focus:outline-none focus:border-accent font-data"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Security PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Default PIN: 1234"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-card border border-line bg-soft text-xs text-ink focus:outline-none focus:border-accent font-data"
                  required
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-status-red-bg text-status-red text-xs">
                  {authError}
                </div>
              )}

              <Button type="submit" disabled={authLoading} size="lg" className="w-full">
                {authLoading ? "Verifying PIN..." : "Sign In to Terminal"}
              </Button>
            </form>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-xs text-muted hover:text-ink font-semibold">
              ← Return to Client Booking App
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── 2. DEDICATED REP PORTAL WORKSPACE (Responsive across Desktop, Tablet & Mobile)
  const filteredShipments = shipments
    .filter((s) => {
      if (filter === "pickup") return s.status === "paid" || s.status === "pickup_scheduled";
      if (filter === "transit") return s.status === "at_terminal" || s.status === "in_transit";
      if (filter === "arrived") return s.status === "arrived" || s.status === "delivered";
      return true;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.tracking_id.toLowerCase().includes(q) ||
        s.sender_name.toLowerCase().includes(q) ||
        s.item_description.toLowerCase().includes(q)
      );
    });

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Station Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-line/70 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img
              src="/icon-192.png"
              alt="oura"
              className="w-9 h-9 rounded-xl object-cover shadow-sm border border-line"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-ink">oura</span>
              <span className="text-[10px] bg-ink text-white font-bold px-2 py-0.5 rounded-pill">
                Rep Workstation
              </span>
            </div>
            <div className="text-[11px] text-muted truncate">
              {rep.name} • <strong className="text-ink">{rep.terminal_name}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Log Parcel</span>
          </Button>
          <button
            onClick={loadData}
            className="p-2 rounded-full border border-line text-muted hover:text-ink"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full border border-line text-status-red hover:bg-status-red-bg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Grid: 2 Columns on Desktop & iPad, 1 Column on Phone */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Queue & Filterable Shipments List (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filter Bar */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter queue by ID or client..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-line rounded-card text-xs text-ink placeholder:text-muted focus:outline-none focus:border-accent font-data shadow-subtle"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex bg-white p-1 rounded-card text-xs font-semibold border border-line shadow-subtle">
                {[
                  { id: "all", label: `All (${shipments.length})` },
                  { id: "pickup", label: "Pickup" },
                  { id: "transit", label: "Transit" },
                  { id: "arrived", label: "Arrived" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                      filter === tab.id
                        ? "bg-ink text-white shadow-sm font-bold"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Shipments */}
            <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredShipments.length === 0 ? (
                <Card className="p-8 text-center text-xs text-muted">
                  No shipments matching current filter.
                </Card>
              ) : (
                filteredShipments.map((s) => {
                  const isSelected = selectedShipment?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedShipment(s)}
                      className={`p-4 rounded-card border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-accent shadow-card ring-1 ring-accent"
                          : "bg-white border-line hover:border-ink/20 shadow-subtle"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold font-data text-ink">
                              {s.tracking_id}
                            </span>
                            {s.tracker_id && (
                              <span className="text-[10px] font-data bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-pill">
                                🏷️ {s.tracker_id}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-ink mt-0.5">
                            {s.item_description} ({s.weight_kg}kg)
                          </div>
                          <div className="text-[11px] text-muted mt-0.5">
                            {s.origin_city} ➔ {s.destination_city} • {s.sender_name}
                          </div>
                        </div>
                        <Badge status={s.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Selected Shipment Workspace (7 cols on Desktop) */}
          <div className="lg:col-span-7">
            {selectedShipment ? (
              <Card className="p-6 bg-white border border-line shadow-card space-y-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line/60 gap-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Active Shipment Action Desk</div>
                    <div className="text-lg font-extrabold font-data text-ink tracking-tight flex items-center gap-2 mt-0.5">
                      <span>{selectedShipment.tracking_id}</span>
                      <Badge status={selectedShipment.status} />
                    </div>
                  </div>

                  <Link
                    href={`/track/${selectedShipment.tracking_id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-line text-xs font-semibold text-ink hover:bg-soft shadow-subtle"
                  >
                    <span>Open Live Customer Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Status Stepper */}
                <div className="p-4 rounded-card bg-soft">
                  <div className="text-[11px] font-bold text-ink mb-1">Route Progress:</div>
                  <StatusStepper status={selectedShipment.status} showEta={true} />
                </div>

                {/* Status Transition Action Buttons */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Update Station Status
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      size="sm"
                      variant={selectedShipment.status === "at_terminal" ? "secondary" : "outline"}
                      onClick={() => handleUpdateStatus(selectedShipment.tracking_id, "at_terminal")}
                    >
                      1. At VIP Station
                    </Button>

                    <Button
                      size="sm"
                      variant={selectedShipment.status === "in_transit" ? "secondary" : "outline"}
                      onClick={() =>
                        handleUpdateStatus(selectedShipment.tracking_id, "in_transit", {
                          tracker_id: selectedShipment.tracker_id || "oura-tag-01",
                        })
                      }
                    >
                      2. Put On Bus
                    </Button>

                    <Button
                      size="sm"
                      variant={selectedShipment.status === "arrived" ? "secondary" : "outline"}
                      onClick={() => handleUpdateStatus(selectedShipment.tracking_id, "arrived")}
                    >
                      3. Arrived Hub
                    </Button>

                    <Button
                      size="sm"
                      variant={selectedShipment.status === "delivered" ? "primary" : "outline"}
                      onClick={() => handleUpdateStatus(selectedShipment.tracking_id, "delivered")}
                    >
                      4. Delivered ✓
                    </Button>
                  </div>
                </div>

                {/* 1-CLICK REGISTERED HARDWARE TAG PICKER (Set Once in Admin, Reuse Forever) */}
                <div className="p-4 rounded-card border border-line bg-soft/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-accent" />
                        <span>1-Click Hardware Tracker Tag (Registered Once)</span>
                      </div>
                      <p className="text-[11px] text-muted">
                        Tap a tag below to clip it onto this bus sack. Automatically unlinks when marked Delivered.
                      </p>
                    </div>
                    <span className="text-[11px] font-data font-bold px-2.5 py-1 rounded-pill bg-white border border-line text-ink">
                      Attached: {selectedShipment.tracker_id || "None"}
                    </span>
                  </div>

                  {/* Pre-registered Hardware Tags Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {trackers.map((t) => {
                      const isCurrent = selectedShipment.tracker_id === t.id;
                      const isBusyOther =
                        t.status === "in_use" &&
                        t.assigned_shipment_id &&
                        t.assigned_shipment_id !== selectedShipment.tracking_id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              selectedShipment.tracking_id,
                              selectedShipment.status === "at_terminal" ? "in_transit" : selectedShipment.status,
                              { tracker_id: t.id }
                            )
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isCurrent
                              ? "bg-ink text-white border-ink shadow-sm"
                              : isBusyOther
                              ? "bg-white/60 text-muted border-line"
                              : "bg-white text-ink border-line hover:border-accent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold font-data">{t.id}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isCurrent
                                  ? "bg-accent"
                                  : isBusyOther
                                  ? "bg-status-amber"
                                  : "bg-status-green"
                              }`}
                            />
                          </div>
                          <div
                            className={`text-[10px] truncate mt-0.5 ${
                              isCurrent ? "text-white/80" : "text-muted"
                            }`}
                          >
                            {t.name}
                          </div>
                          <div
                            className={`text-[9px] font-data mt-1 ${
                              isCurrent ? "text-accent font-bold" : "text-muted"
                            }`}
                          >
                            {isCurrent
                              ? "✓ Active Here"
                              : isBusyOther
                              ? `On ${t.assigned_shipment_id}`
                              : "Available"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LIVE DEVICE GPS & HIGHWAY SIMULATOR (Test Without Physical Tags Right Now) */}
                <div className="p-4 rounded-card border border-accent/30 bg-accent/5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span>Live GPS Test Mode (No Physical Tag Required)</span>
                      </div>
                      <p className="text-[11px] text-muted">
                        Stream your current phone/laptop GPS or click any Highway N6 town to watch the map move live!
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleBroadcastDeviceGps}
                      disabled={isStreamingDeviceGps}
                      className="shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1.5" />
                      {isStreamingDeviceGps ? "Locating..." : "Ping My Device GPS Now"}
                    </Button>
                  </div>

                  {/* 1-Click Highway Checkpoints */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-muted">
                      Or Tap a Highway N6 Bus Checkpoint to Move Live Map Pin:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {HIGHWAY_CHECKPOINTS.map((cp) => (
                        <button
                          key={cp.name}
                          type="button"
                          onClick={() => handleSimulateCheckpoint(cp)}
                          className="px-2.5 py-1.5 rounded-pill bg-white border border-line hover:border-accent text-[11px] font-semibold text-ink transition-all shadow-subtle"
                        >
                          📍 {cp.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {gpsStatusMsg && (
                    <div className="text-[11px] font-data font-semibold text-status-green bg-white px-3 py-2 rounded-lg border border-line">
                      {gpsStatusMsg}
                    </div>
                  )}
                </div>

                {/* Pickup Orchestration: Uber / Ernest */}
                <div className="p-4 rounded-card bg-ink text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-accent">Pickup Orchestration</div>
                    <div className="text-[11px] text-white/60">
                      Address: {selectedShipment.origin_address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(
                        selectedShipment.origin_address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-white text-ink rounded-pill text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/90"
                    >
                      <Truck className="w-4 h-4" /> Order Uber Pickup
                    </a>

                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedShipment.tracking_id, "picked_up", {
                          courier_name: "Ernest Angmler (Car Pickup)",
                        })
                      }
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-pill text-xs font-bold border border-white/20"
                    >
                      Mark: Ernest Pickup
                    </button>
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-lg border border-line bg-soft">
                    <div className="text-[10px] uppercase font-bold text-muted">Sender Details</div>
                    <div className="font-semibold text-ink mt-0.5">{selectedShipment.sender_name}</div>
                    <div className="text-muted font-data">{selectedShipment.sender_phone}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-soft">
                    <div className="text-[10px] uppercase font-bold text-muted">Recipient Details</div>
                    <div className="font-semibold text-ink mt-0.5">{selectedShipment.recipient_name}</div>
                    <div className="text-muted font-data">{selectedShipment.recipient_phone}</div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center text-xs text-muted">
                Select a shipment from the left queue to view details and action buttons.
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Log Parcel Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full space-y-4 p-6 bg-white shadow-2xl">
            <h2 className="text-base font-bold text-ink">Log Walk-In Parcel</h2>

            <form onSubmit={handleLogParcel} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Item Description</label>
                <input
                  type="text"
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="e.g. Carton of shoes, laptop box, documents..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Sender Name</label>
                  <input
                    type="text"
                    value={logSender}
                    onChange={(e) => setLogSender(e.target.value)}
                    placeholder="Sender name"
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Sender Phone</label>
                  <input
                    type="tel"
                    value={logSenderPhone}
                    onChange={(e) => setLogSenderPhone(e.target.value)}
                    placeholder="024XXXXXXX"
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Recipient Name</label>
                  <input
                    type="text"
                    value={logRecipient}
                    onChange={(e) => setLogRecipient(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Recipient Phone</label>
                  <input
                    type="tel"
                    value={logRecipientPhone}
                    onChange={(e) => setLogRecipientPhone(e.target.value)}
                    placeholder="020XXXXXXX"
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Destination City</label>
                <select
                  value={logDestCity}
                  onChange={(e) => setLogDestCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-semibold"
                >
                  <option value="Kumasi">Kumasi (VIP Asafo Station)</option>
                  <option value="Accra">Accra (VIP Circle Station)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="flex-1">
                  Create Station Order
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
