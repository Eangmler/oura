"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Shield,
  CreditCard,
  Settings,
  Users,
  MapPin,
  TrendingUp,
  Package,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  Save,
  Plus,
  ExternalLink,
  Search,
  Check,
  Radio,
  Navigation,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shipment, TerminalRep, OuraSettings, TrackerPing, HardwareTracker } from "@/types";

// Dynamic import for Leaflet map to guarantee SSR safety
const LiveLeafletMap = dynamic(
  () => import("@/components/map/live-leaflet-map").then((mod) => mod.LiveLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] bg-soft rounded-card flex items-center justify-center text-xs text-muted">
        Loading live operations map...
      </div>
    ),
  }
);

const HIGHWAY_CHECKPOINTS = [
  { name: "Accra VIP Circle", lat: 5.5698, lng: -0.2141, speed: 0 },
  { name: "Nsawam Bypass", lat: 5.8089, lng: -0.3522, speed: 68 },
  { name: "Suhum Junction", lat: 6.0409, lng: -0.4505, speed: 75 },
  { name: "Nkawkaw Bypass", lat: 6.5512, lng: -0.7681, speed: 72 },
  { name: "Konongo Odumasi", lat: 6.6184, lng: -1.2179, speed: 64 },
  { name: "Kumasi VIP Asafo", lat: 6.6885, lng: -1.6163, speed: 0 },
];

export default function AdminDashboardPage() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "pricing" | "map" | "trackers" | "shipments" | "reps" | "settings"
  >("overview");

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [reps, setReps] = useState<TerminalRep[]>([]);
  const [trackers, setTrackers] = useState<HardwareTracker[]>([]);
  const [settings, setSettings] = useState<OuraSettings | null>(null);
  const [latestPing, setLatestPing] = useState<TrackerPing | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [simStatusMsg, setSimStatusMsg] = useState("");

  // Rep addition modal
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [newRepName, setNewRepName] = useState("");
  const [newRepPhone, setNewRepPhone] = useState("");
  const [newRepTerminal, setNewRepTerminal] = useState("VIP-ACC");
  const [newRepPin, setNewRepPin] = useState("1234");

  // Hardware Tracker addition/edit modal
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [tagId, setTagId] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagType, setTagType] = useState<"google_find_my_tag" | "google_find_my_phone" | "gt06_hardwired">(
    "google_find_my_tag"
  );
  const [tagShareUrl, setTagShareUrl] = useState("https://www.google.com/android/find/");

  useEffect(() => {
    const isAuth = sessionStorage.getItem("oura_admin_auth");
    if (isAuth === "true") {
      setAdminAuth(true);
    }
  }, []);

  const loadAllData = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([
      fetch("/api/shipments", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/reps", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/trackers", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([shipData, repData, setData, trkData]) => {
        if (shipData.shipments) setShipments(shipData.shipments);
        if (repData.reps) setReps(repData.reps);
        if (setData.settings) setSettings(setData.settings);
        if (trkData.trackers) setTrackers(trkData.trackers);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (!silent) setLoading(false);
      });

    fetch("/api/pings?shipment_id=H314315796", { cache: "no-store" })
      .then((r) => r.json())
      .then((p) => {
        if (p.latest) setLatestPing(p.latest);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (adminAuth) {
      loadAllData();
      const timer = setInterval(() => loadAllData(true), 6000);
      return () => clearInterval(timer);
    }
  }, [adminAuth]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminAuth(true);
        sessionStorage.setItem("oura_admin_auth", "true");
      } else {
        setAuthError(data.error || "Incorrect Admin PIN");
      }
    } catch (err) {
      setAuthError("Network error");
    }
  };

  const handleConfirmPayment = async (trackingId: string) => {
    try {
      const res = await fetch(`/api/shipments/${trackingId}/payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (e) {
      alert("Error confirming payment");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 3000);
      }
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleRep = async (repId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/reps/${repId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (e) {
      alert("Failed to toggle rep");
    }
  };

  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRepName,
          phone: newRepPhone,
          terminal_id: newRepTerminal,
          terminal_name:
            newRepTerminal === "VIP-ACC"
              ? "VIP Circle Terminal, Accra"
              : "VIP Asafo Terminal, Kumasi",
          pin: newRepPin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddRepModal(false);
        setNewRepName("");
        setNewRepPhone("");
        loadAllData();
      }
    } catch (e) {
      alert("Failed to add rep");
    }
  };

  const handleSaveTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tagId,
          name: tagName,
          type: tagType,
          share_url: tagShareUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowTrackerModal(false);
        setTagId("");
        setTagName("");
        loadAllData();
      }
    } catch (e) {
      alert("Failed to save hardware tracker");
    }
  };

  const handlePingMyDeviceGps = (trackerId: string = "oura-tag-01") => {
    if (!("geolocation" in navigator)) {
      setSimStatusMsg("Browser geolocation not available. Use a Highway Checkpoint button!");
      return;
    }
    setSimStatusMsg("Reading your live device GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 50;

        await fetch("/api/trackers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "gps_ping",
            tracker_id: trackerId,
            lat,
            lng,
            speed_kmh: speed,
            source: "device_browser_gps",
          }),
        });

        setSimStatusMsg(`✓ Broadcasted your real GPS (${lat}, ${lng}) to ${trackerId}!`);
        loadAllData();
      },
      () => {
        setSimStatusMsg("Location permission blocked. Click any Highway Checkpoint button to test!");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSimulateCheckpoint = async (
    cp: { name: string; lat: number; lng: number; speed: number },
    trackerId: string = "oura-tag-01"
  ) => {
    await fetch("/api/trackers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "gps_ping",
        tracker_id: trackerId,
        lat: cp.lat,
        lng: cp.lng,
        speed_kmh: cp.speed,
        source: "manual_rep",
      }),
    });
    setSimStatusMsg(`✓ Moved ${trackerId} (Shipment #H314315796) to ${cp.name} (${cp.speed} km/h)`);
    loadAllData();
  };

  // ── 1. ADMIN LOGIN SCREEN ───────────────────────────────────────────────────
  if (!adminAuth) {
    return (
      <main className="min-h-screen bg-paper flex flex-col justify-center px-4 sm:px-6">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/icon-192.png"
              alt="oura"
              className="w-14 h-14 rounded-2xl mx-auto shadow-md border border-line"
            />
            <h1 className="text-xl font-extrabold text-ink tracking-tight">oura master admin console</h1>
            <p className="text-xs text-muted">Operations, Rates & Configuration Console</p>
          </div>

          <Card className="p-6 bg-white border border-line shadow-card">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink">Admin PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full px-4 py-3 rounded-card border border-line bg-soft text-xs text-ink focus:outline-none focus:border-accent font-data"
                  required
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-status-red-bg text-status-red text-xs">
                  {authError}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full">
                Access Admin Portal
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

  // Stats
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter((s) => s.status === "in_transit").length;
  const pendingPaymentCount = shipments.filter((s) => s.status === "pending_payment").length;
  const totalRevenue = shipments
    .filter((s) => s.payment_confirmed)
    .reduce((sum, s) => sum + (s.pricing?.total || 120), 0);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Admin Header */}
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
              <span className="text-[10px] bg-accent text-white font-bold px-2 py-0.5 rounded-pill">
                Master Admin
              </span>
            </div>
            <div className="text-[11px] text-muted">Accra ↔ Kumasi Central Command</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2 rounded-full border border-line text-muted hover:text-ink"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("oura_admin_auth");
              setAdminAuth(false);
            }}
            className="p-2 rounded-full border border-line text-status-red hover:bg-status-red-bg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs (Responsive across Mac, Windows, iPad & Phones) */}
        <div className="flex bg-white p-1.5 rounded-card text-xs font-semibold border border-line shadow-subtle overflow-x-auto">
          {[
            { id: "overview", label: "KPI Overview" },
            { id: "pricing", label: "💰 Pricing & Rates" },
            { id: "map", label: "Live Highway Map" },
            { id: "trackers", label: `Hardware Trackers (${trackers.length})` },
            { id: "shipments", label: `Shipments Ledger (${shipments.length})` },
            { id: "reps", label: `Terminal Reps (${reps.length})` },
            { id: "settings", label: "System Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-center whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-ink text-white shadow-sm font-bold"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: KPI OVERVIEW ────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 bg-white border border-line shadow-card space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">Total Intercity Orders</div>
                <div className="text-2xl font-extrabold font-data text-ink">{totalShipments}</div>
                <div className="text-[11px] text-status-green font-semibold">Active Demand Corridor</div>
              </Card>

              <Card className="p-5 bg-white border border-line shadow-card space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">Verified MoMo Revenue</div>
                <div className="text-2xl font-extrabold font-data text-accent">GHS {totalRevenue}.00</div>
                <div className="text-[11px] text-muted">Direct Mobile Money</div>
              </Card>

              <Card className="p-5 bg-white border border-line shadow-card space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">In Transit on N6</div>
                <div className="text-2xl font-extrabold font-data text-ink">{inTransitCount}</div>
                <div className="text-[11px] text-muted">On VIP Highway Buses</div>
              </Card>

              <Card className="p-5 bg-white border border-line shadow-card space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">Pending MoMo Verification</div>
                <div className="text-2xl font-extrabold font-data text-status-amber">{pendingPaymentCount}</div>
                <div className="text-[11px] text-status-amber font-semibold">Awaiting your approval</div>
              </Card>
            </div>

            {/* Quick Action Pending Approvals */}
            {pendingPaymentCount > 0 && (
              <Card className="p-6 bg-accent/5 border border-accent/30 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    <h3 className="text-sm font-bold text-ink">
                      {pendingPaymentCount} Payment(s) Awaiting Mobile Money Verification
                    </h3>
                  </div>
                  <span className="text-xs text-muted">Check Ernest&apos;s MoMo SMS (`0248147952`)</span>
                </div>

                <div className="space-y-2">
                  {shipments
                    .filter((s) => s.status === "pending_payment")
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-card border border-line text-xs gap-3"
                      >
                        <div>
                          <div className="font-extrabold font-data text-ink">Reference: {s.tracking_id}</div>
                          <div className="text-muted mt-0.5">
                            Customer: <strong>{s.sender_name}</strong> ({s.sender_phone}) ➔ Amount:{" "}
                            <strong className="text-accent font-data">GHS {s.pricing?.total || 120}.00</strong>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleConfirmPayment(s.tracking_id)}
                          className="flex items-center gap-1 self-start sm:self-auto"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Paid
                        </Button>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* Quick Route Breakdown */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-5 bg-white border border-line shadow-card space-y-2">
                <div className="text-xs font-bold text-ink">Accra ➔ Kumasi Route Volume</div>
                <div className="text-xl font-bold font-data text-ink">
                  {shipments.filter((s) => s.origin_city === "Accra").length} parcels
                </div>
                <p className="text-[11px] text-muted">Dispatched from VIP Circle Terminal</p>
              </Card>

              <Card className="p-5 bg-white border border-line shadow-card space-y-2">
                <div className="text-xs font-bold text-ink">Kumasi ➔ Accra Route Volume</div>
                <div className="text-xl font-bold font-data text-ink">
                  {shipments.filter((s) => s.origin_city === "Kumasi").length} parcels
                </div>
                <p className="text-[11px] text-muted">Dispatched from VIP Asafo Terminal</p>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB 1B: DEDICATED PRICING & RATE CARD (Accountant & Admin Console) ─ */}
        {activeTab === "pricing" && settings && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span>Live Rate Card &amp; Pricing Engine (Accountant Console)</span>
                </h2>
                <p className="text-xs text-muted">
                  Changes saved here sync immediately to the public website (<strong>useoura.com</strong>) and the live <strong>WhatsApp Chatbot</strong> (+233 59 988 2827).
                </p>
              </div>
              <Button type="submit" disabled={savingSettings} size="md" className="flex items-center gap-2 shrink-0">
                <Save className="w-4 h-4" />
                {savingSettings ? "Publishing Live Rates..." : "Save & Publish Live Rates"}
              </Button>
            </div>

            {saveToast && (
              <div className="p-4 rounded-card bg-status-green-bg text-status-green text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Live Rate Card published! Both useoura.com and the WhatsApp Chatbot are now quoting your updated prices.
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Accra -> Kumasi Transit Tiers */}
              <Card className="p-6 bg-white border border-line shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-ink">Accra ➔ Kumasi VIP Transit Fee (GHS)</div>
                    <div className="text-[11px] text-muted">Line-haul coach fee by parcel weight category</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          kumasi_accra: { ...settings.rates.accra_kumasi },
                        },
                      })
                    }
                    className="text-[11px] font-bold text-accent hover:underline"
                  >
                    Copy to Kumasi ➔ Accra
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {(
                    [
                      { key: "small", label: "Small (< 1 kg)", desc: "Phones, documents, keys, envelopes" },
                      { key: "medium", label: "Medium (1 – 5 kg)", desc: "Laptops, shoe boxes, clothes bundle" },
                      { key: "large", label: "Large (5 – 20 kg)", desc: "Monitors, cartons, microwaves, luggage" },
                      { key: "oversized", label: "Oversized (20 kg+)", desc: "Appliances, engines, bulk sacks" },
                    ] as const
                  ).map((tier) => (
                    <div key={tier.key} className="p-3 rounded-lg bg-soft border border-line space-y-1">
                      <label className="text-xs font-bold text-ink block">{tier.label}</label>
                      <div className="text-[10px] text-muted">{tier.desc}</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-bold text-muted">GHS</span>
                        <input
                          type="number"
                          min={0}
                          value={settings.rates.accra_kumasi[tier.key]}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettings({
                              ...settings,
                              rates: {
                                ...settings.rates,
                                accra_kumasi: {
                                  ...settings.rates.accra_kumasi,
                                  [tier.key]: val,
                                },
                                kumasi_accra: {
                                  ...settings.rates.kumasi_accra,
                                  [tier.key]: val,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm font-extrabold font-data text-ink"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Kumasi -> Accra Transit Tiers + Doorstep Pickup/Delivery */}
              <div className="space-y-6">
                <Card className="p-6 bg-white border border-line shadow-card space-y-4">
                  <div>
                    <div className="text-sm font-extrabold text-ink">Doorstep Rider Pickup &amp; Delivery Fees (GHS)</div>
                    <div className="text-[11px] text-muted">
                      Added to the VIP transit fee to form the customer&apos;s all-inclusive door-to-door quote
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-soft border border-line space-y-1">
                      <label className="text-xs font-bold text-ink block">Origin Doorstep Pickup Fee</label>
                      <div className="text-[10px] text-muted">Rider collection from sender&apos;s location to VIP terminal</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-bold text-muted">GHS</span>
                        <input
                          type="number"
                          min={0}
                          value={settings.rates.pickup_zones.zone_b}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              rates: {
                                ...settings.rates,
                                pickup_zones: {
                                  ...settings.rates.pickup_zones,
                                  zone_b: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm font-extrabold font-data text-ink"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-soft border border-line space-y-1">
                      <label className="text-xs font-bold text-ink block">Destination Doorstep Delivery Fee</label>
                      <div className="text-[10px] text-muted">Rider drop-off from VIP terminal to recipient&apos;s address</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-bold text-muted">GHS</span>
                        <input
                          type="number"
                          min={0}
                          value={settings.rates.delivery_zones.zone_a}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              rates: {
                                ...settings.rates,
                                delivery_zones: {
                                  ...settings.rates.delivery_zones,
                                  zone_a: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm font-extrabold font-data text-ink"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Kumasi -> Accra Specific Overrides */}
                <Card className="p-6 bg-white border border-line shadow-card space-y-3">
                  <div>
                    <div className="text-sm font-extrabold text-ink">Kumasi ➔ Accra VIP Transit Fee (GHS)</div>
                    <div className="text-[11px] text-muted">
                      Automatically mirrors Accra ➔ Kumasi unless you set a custom return rate below
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {(["small", "medium", "large", "oversized"] as const).map((tier) => (
                      <div key={tier}>
                        <label className="text-[11px] font-semibold text-muted capitalize">{tier}</label>
                        <input
                          type="number"
                          min={0}
                          value={settings.rates.kumasi_accra[tier]}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              rates: {
                                ...settings.rates,
                                kumasi_accra: {
                                  ...settings.rates.kumasi_accra,
                                  [tier]: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-line bg-soft text-xs font-bold font-data mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Live End-to-End Customer Quote Preview */}
            <Card className="p-6 bg-ink text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-accent">
                    Live Customer Quote Preview (Website + WhatsApp Bot)
                  </div>
                  <p className="text-xs text-white/75">
                    This is the exact all-inclusive total (Pickup + VIP Transit + Delivery) your customers see on{" "}
                    <strong>useoura.com</strong> and inside <strong>WhatsApp</strong>:
                  </p>
                </div>
                <Button type="submit" disabled={savingSettings} size="sm" className="bg-accent hover:bg-accent-dark text-white">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {savingSettings ? "Saving..." : "Publish Changes Now"}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                {(
                  [
                    { key: "small", label: "Small (<1kg)" },
                    { key: "medium", label: "Medium (1-5kg)" },
                    { key: "large", label: "Large (5-20kg)" },
                    { key: "oversized", label: "Oversized (20kg+)" },
                  ] as const
                ).map((t) => {
                  const pFee = settings.rates.pickup_zones.zone_b || 0;
                  const tFee = settings.rates.accra_kumasi[t.key] || 0;
                  const dFee = settings.rates.delivery_zones.zone_a || 0;
                  const tot = pFee + tFee + dFee;
                  return (
                    <div key={t.key} className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                      <div className="text-xs font-bold text-white/70">{t.label}</div>
                      <div className="text-xl font-extrabold font-data text-white">GHS {tot}.00</div>
                      <div className="text-[10px] text-white/60 font-data">
                        Pickup {pFee} + VIP {tFee} + Delivery {dFee}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </form>
        )}

        {/* ── TAB 2: LIVE HIGHWAY MAP (Dedicated Substantial Operations View) ─ */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <span>Corridor Real-Time Tracking Operations</span>
                  <span className="text-xs bg-status-green-bg text-status-green font-semibold px-2 py-0.5 rounded-full">
                    OpenStreetMap Live (Zero API Key)
                  </span>
                </h2>
                <p className="text-xs text-muted">
                  Interactive location mappings of all active VIP buses along Accra, Suhum, Nkawkaw, Konongo and Kumasi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handlePingMyDeviceGps("oura-tag-01")}>
                  <Navigation className="w-3.5 h-3.5 mr-1.5" />
                  Use My Device GPS Live
                </Button>
                <a
                  href="https://www.google.com/android/find/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-pill bg-ink text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-ink/90"
                >
                  <span>Open Google Find Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 1-Click Highway Bus Movement Simulator Bar */}
            <Card className="p-3.5 bg-white border border-line shadow-subtle flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Test Live Bus Movement (Click any N6 town):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HIGHWAY_CHECKPOINTS.map((cp) => (
                  <button
                    key={cp.name}
                    onClick={() => handleSimulateCheckpoint(cp, "oura-tag-01")}
                    className="px-2.5 py-1 rounded-pill bg-soft hover:bg-ink hover:text-white text-[11px] font-semibold text-ink border border-line transition-all"
                  >
                    📍 {cp.name}
                  </button>
                ))}
              </div>
            </Card>

            {simStatusMsg && (
              <div className="p-3 rounded-card bg-status-green-bg text-status-green text-xs font-bold font-data">
                {simStatusMsg}
              </div>
            )}

            <div className="h-[550px] w-full rounded-card overflow-hidden border border-line shadow-card">
              <LiveLeafletMap
                originCity="Accra"
                destinationCity="Kumasi"
                latestPing={latestPing}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* ── TAB 3: HARDWARE TRACKERS (Google Find My Smart Tags & Devices) ── */}
        {activeTab === "trackers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">
                  Hardware Tracker Registry (Register Once, Reuse Forever)
                </h2>
                <p className="text-xs text-muted">
                  Pair your Smart Tags or Google Find My devices to your business Google account once. Reps assign tags with 1 click—no need to generate new links every trip!
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setTagId(`oura-tag-0${trackers.length + 1}`);
                  setTagName(`Smart Tag #0${trackers.length + 1}`);
                  setTagShareUrl("https://www.google.com/android/find/");
                  setShowTrackerModal(true);
                }}
                className="flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Register New Tag / Device
              </Button>
            </div>

            {/* Live Testing Box for Ernest (Before Physical Tags Arrive) */}
            <Card className="p-5 bg-ink text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Testing Without Physical Tags</span>
                  </div>
                  <p className="text-xs text-white/80 max-w-2xl">
                    Since you don&apos;t have the physical Smart Tags yet, you can test right now using any device in your{" "}
                    <a
                      href="https://www.google.com/android/find/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-accent font-semibold"
                    >
                      Google Find My Hub
                    </a>{" "}
                    or by streaming your current phone/laptop GPS directly to{" "}
                    <strong className="font-data text-white">oura-tag-01</strong>!
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handlePingMyDeviceGps("oura-tag-01")}
                    className="bg-accent hover:bg-accent-dark text-white"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5" />
                    Broadcast My Device GPS
                  </Button>
                  <Link
                    href="/track/H314315796"
                    target="_blank"
                    className="px-3.5 py-2 rounded-pill bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>View Client Map (#H314315796)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-white/60 font-semibold">
                  Simulate Highway N6 Checkpoints on #H314315796:
                </span>
                {HIGHWAY_CHECKPOINTS.map((cp) => (
                  <button
                    key={cp.name}
                    onClick={() => handleSimulateCheckpoint(cp, "oura-tag-01")}
                    className="px-2.5 py-1 rounded-pill bg-white/10 hover:bg-accent text-[11px] font-semibold text-white transition-all"
                  >
                    📍 {cp.name}
                  </button>
                ))}
              </div>

              {simStatusMsg && (
                <div className="text-xs font-data font-bold text-status-green bg-white/10 px-3 py-2 rounded-lg">
                  {simStatusMsg}
                </div>
              )}
            </Card>

            {/* Registered Trackers Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {trackers.map((t) => (
                <Card key={t.id} className="p-5 bg-white border border-line shadow-card space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold font-data text-ink">{t.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-pill bg-soft border border-line font-semibold text-muted">
                          {t.type === "google_find_my_tag"
                            ? "Google Find My Tag"
                            : t.type === "google_find_my_phone"
                            ? "Google Find My Device"
                            : "Hardwired GT06"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-ink mt-1">{t.name}</div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        t.status === "in_use"
                          ? "bg-accent/15 text-accent"
                          : "bg-status-green-bg text-status-green"
                      }`}
                    >
                      {t.status === "in_use"
                        ? `ON BUS (${t.current_shipment_id || "Assigned"})`
                        : "AVAILABLE AT DESK"}
                    </span>
                  </div>

                  {/* Permanent Share Link (Set Once) */}
                  <div className="p-3 rounded-lg bg-soft border border-line space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted">
                      <span>Permanent Google Find My / Maps Link (Set Once)</span>
                      <a
                        href={t.share_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline inline-flex items-center gap-1"
                      >
                        Open Pin <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        defaultValue={t.share_url}
                        id={`share-url-${t.id}`}
                        className="flex-1 px-2.5 py-1.5 bg-white rounded border border-line text-xs font-data text-ink"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const el = document.getElementById(`share-url-${t.id}`) as HTMLInputElement;
                          if (el?.value) {
                            await fetch("/api/trackers", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: t.id,
                                name: t.name,
                                type: t.type,
                                share_url: el.value,
                              }),
                            });
                            setSimStatusMsg(`✓ Saved permanent link for ${t.id}`);
                            loadAllData();
                          }
                        }}
                        className="px-3 py-1.5 rounded bg-ink text-white text-[11px] font-bold hover:bg-ink/85"
                      >
                        Save Link
                      </button>
                    </div>
                  </div>

                  {/* Last Known GPS Coordinates & Quick Actions */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-line">
                    <div className="text-[11px] text-muted font-data">
                      {t.last_lat && t.last_lng ? (
                        <span>
                          GPS: <strong className="text-ink">{t.last_lat.toFixed(4)}, {t.last_lng.toFixed(4)}</strong> • Battery: {t.battery_pct}%
                        </span>
                      ) : (
                        <span>Battery: {t.battery_pct}% • Ready for bus assignment</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePingMyDeviceGps(t.id)}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Ping My GPS Here
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: SHIPMENTS LEDGER ───────────────────────────────────────── */}
        {activeTab === "shipments" && (
          <Card className="p-6 bg-white border border-line shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">Shipments Master Ledger</h2>
                <p className="text-xs text-muted">Full audit log of all intercity parcel movements</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search ledger..."
                  className="w-full pl-9 pr-3 py-2 bg-soft border border-line rounded-lg text-xs text-ink focus:outline-none"
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line bg-soft/50 text-muted font-bold">
                    <th className="py-3 px-4">Tracking ID</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Hardware Tag</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {shipments
                    .filter((s) => {
                      if (!searchFilter.trim()) return true;
                      const q = searchFilter.toLowerCase();
                      return (
                        s.tracking_id.toLowerCase().includes(q) ||
                        s.sender_name.toLowerCase().includes(q) ||
                        s.item_description.toLowerCase().includes(q)
                      );
                    })
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-soft/30 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold font-data text-ink">
                          {s.tracking_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-ink">{s.sender_name}</div>
                          <div className="text-[11px] text-muted font-data">{s.sender_phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-muted">
                          {s.origin_city} ➔ {s.destination_city}
                        </td>
                        <td className="py-3.5 px-4 font-data text-xs">
                          {s.tracker_id ? (
                            <span className="px-2 py-0.5 rounded-pill bg-accent/10 text-accent font-bold">
                              🏷️ {s.tracker_id}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold font-data text-accent">
                          GHS {s.pricing?.total || 120}.00
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={s.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {!s.payment_confirmed && (
                            <button
                              onClick={() => handleConfirmPayment(s.tracking_id)}
                              className="px-2.5 py-1 bg-ink text-white rounded text-[11px] font-bold hover:bg-ink/80"
                            >
                              Verify MoMo
                            </button>
                          )}
                          <Link
                            href={`/track/${s.tracking_id}`}
                            target="_blank"
                            className="px-2.5 py-1 border border-line rounded text-[11px] font-semibold text-ink hover:bg-soft inline-flex items-center gap-1"
                          >
                            Track <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── TAB 5: REPS MANAGEMENT ────────────────────────────────────────── */}
        {activeTab === "reps" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Terminal Reps & Station Staff</h2>
                <p className="text-xs text-muted">Manage access for VIP Circle (Accra) and VIP Asafo (Kumasi)</p>
              </div>
              <Button size="sm" onClick={() => setShowAddRepModal(true)} className="flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Terminal Rep
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {reps.map((rep) => (
                <Card key={rep.id} className="p-5 bg-white border border-line shadow-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-ink">{rep.name}</div>
                      <div className="text-xs text-muted mt-0.5">{rep.terminal_name}</div>
                      <div className="text-xs font-data text-ink mt-1">Phone: {rep.phone}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        rep.active ? "bg-status-green-bg text-status-green" : "bg-status-red-bg text-status-red"
                      }`}
                    >
                      {rep.active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-soft text-xs text-muted">
                    Login PIN: <strong className="text-ink font-data text-sm">{rep.pin_hash}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    <button
                      onClick={() => handleToggleRep(rep.id, rep.active)}
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      {rep.active ? "Deactivate Rep" : "Activate Rep"}
                    </button>
                    <span className="text-[10px] text-muted font-data">ID: {rep.id}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: SYSTEM SETTINGS (No-Code Operations Console) ──────────── */}
        {activeTab === "settings" && settings && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Central System Configuration</h2>
                <p className="text-xs text-muted">
                  Update live payment details, route rate cards, and bot toggles with zero code editing
                </p>
              </div>
              <Button type="submit" disabled={savingSettings} size="md" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {savingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </div>

            {saveToast && (
              <div className="p-4 rounded-card bg-status-green-bg text-status-green text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Configuration saved successfully! All updates are live across customer, rep, and bot apps.
              </div>
            )}

            {/* MoMo Payment Configuration */}
            <Card className="p-6 bg-white border border-line shadow-card space-y-4">
              <div className="flex items-center gap-2 text-ink font-bold text-sm">
                <CreditCard className="w-5 h-5 text-accent" />
                <span>Mobile Money Payment Details</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink">MoMo Phone Number</label>
                  <input
                    type="text"
                    value={settings.momo_number}
                    onChange={(e) => setSettings({ ...settings, momo_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">MoMo Account Name</label>
                  <input
                    type="text"
                    value={settings.momo_name}
                    onChange={(e) => setSettings({ ...settings, momo_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Payment Instructions SMS Template</label>
                <textarea
                  rows={2}
                  value={settings.payment_instructions_template}
                  onChange={(e) =>
                    setSettings({ ...settings, payment_instructions_template: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink"
                />
              </div>
            </Card>

            {/* Pricing Rate Tables */}
            <Card className="p-6 bg-white border border-line shadow-card space-y-4">
              <div className="flex items-center gap-2 text-ink font-bold text-sm">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span>Accra ↔ Kumasi Rate Card (GHS)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-muted">Small (&lt; 1kg)</label>
                  <input
                    type="number"
                    value={settings.rates.accra_kumasi.small}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          accra_kumasi: {
                            ...settings.rates.accra_kumasi,
                            small: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-line bg-soft text-xs font-data mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted">Medium (1-5kg)</label>
                  <input
                    type="number"
                    value={settings.rates.accra_kumasi.medium}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          accra_kumasi: {
                            ...settings.rates.accra_kumasi,
                            medium: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-line bg-soft text-xs font-data mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted">Large (5-20kg)</label>
                  <input
                    type="number"
                    value={settings.rates.accra_kumasi.large}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          accra_kumasi: {
                            ...settings.rates.accra_kumasi,
                            large: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-line bg-soft text-xs font-data mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted">Oversized (20kg+)</label>
                  <input
                    type="number"
                    value={settings.rates.accra_kumasi.oversized}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          accra_kumasi: {
                            ...settings.rates.accra_kumasi,
                            oversized: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-line bg-soft text-xs font-data mt-1"
                  />
                </div>
              </div>

              {/* Local pickup & delivery fee settings */}
              <div className="pt-3 border-t border-line grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs font-semibold text-ink">Average Doorstep Pickup Fee (GHS)</label>
                  <input
                    type="number"
                    value={settings.rates.pickup_zones.zone_b}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          pickup_zones: {
                            ...settings.rates.pickup_zones,
                            zone_b: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-line bg-soft text-xs font-data mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Average Doorstep Delivery Fee (GHS)</label>
                  <input
                    type="number"
                    value={settings.rates.delivery_zones.zone_a}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rates: {
                          ...settings.rates,
                          delivery_zones: {
                            ...settings.rates.delivery_zones,
                            zone_a: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-line bg-soft text-xs font-data mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* WhatsApp Integration Toggle */}
            <Card className="p-6 bg-white border border-line shadow-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-ink">WhatsApp Cloud Bot & Auto-Notification Module</div>
                  <div className="text-xs text-muted">
                    Connect your temporary or permanent SIM card via Meta Cloud API. You can swap numbers anytime here without losing data.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/whatsapp"
                    className="px-3 py-1.5 rounded-pill bg-status-green-bg text-status-green text-xs font-bold hover:opacity-90"
                  >
                    Open Live WhatsApp Simulator ➔
                  </Link>
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_enabled}
                    onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                    className="w-5 h-5 accent-accent"
                  />
                </div>
              </div>

              {settings.whatsapp_enabled && (
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-ink">WhatsApp Business Number (SIM)</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      placeholder="+233248147952"
                      className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink">Meta Phone Number ID</label>
                    <input
                      type="text"
                      value={settings.whatsapp_phone_number_id || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp_phone_number_id: e.target.value })
                      }
                      placeholder="e.g. 104928192839102"
                      className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink">Meta Cloud API Token</label>
                    <input
                      type="password"
                      value={settings.whatsapp_token}
                      onChange={(e) => setSettings({ ...settings, whatsapp_token: e.target.value })}
                      placeholder="EAAG..."
                      className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data mt-1"
                    />
                  </div>
                </div>
              )}
            </Card>

            <div className="text-right">
              <Button type="submit" disabled={savingSettings} size="lg" className="px-10">
                {savingSettings ? "Saving Settings..." : "Save All Configuration Changes"}
              </Button>
            </div>
          </form>
        )}
      </main>

      {/* Register Hardware Tracker Modal */}
      {showTrackerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full space-y-4 p-6 bg-white shadow-2xl">
            <h2 className="text-base font-bold text-ink">Register Hardware Tag / Find My Device</h2>
            <p className="text-xs text-muted">
              Set this up once per tag. Reps will see it in their 1-click dropdown.
            </p>

            <form onSubmit={handleSaveTracker} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Tag Short ID (Printed on Tag)</label>
                <input
                  type="text"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  placeholder="e.g. oura-tag-04 or my-pixel-phone"
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Friendly Name</label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="e.g. VIP Sack Tag #04 (Accra-Kumasi)"
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Hardware Type</label>
                <select
                  value={tagType}
                  onChange={(e) => setTagType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-semibold"
                >
                  <option value="google_find_my_tag">Google Find My Smart Tag (ACCUTAG / Moto / Chipolo)</option>
                  <option value="google_find_my_phone">Existing Device in Google Find My Hub</option>
                  <option value="gt06_hardwired">Hardwired 4G Bus GPS (GT06N)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">
                  Permanent Google Find My / Google Maps Link
                </label>
                <input
                  type="url"
                  value={tagShareUrl}
                  onChange={(e) => setTagShareUrl(e.target.value)}
                  placeholder="https://www.google.com/android/find/"
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTrackerModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Tag to Registry
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Rep Modal */}
      {showAddRepModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full space-y-4 p-6 bg-white shadow-2xl">
            <h2 className="text-base font-bold text-ink">Add Terminal Representative</h2>

            <form onSubmit={handleCreateRep} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Full Name</label>
                <input
                  type="text"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  placeholder="e.g. Samuel Osei"
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Phone Number</label>
                <input
                  type="tel"
                  value={newRepPhone}
                  onChange={(e) => setNewRepPhone(e.target.value)}
                  placeholder="024XXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Assigned Terminal</label>
                <select
                  value={newRepTerminal}
                  onChange={(e) => setNewRepTerminal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-semibold"
                >
                  <option value="VIP-ACC">VIP Circle Terminal, Accra</option>
                  <option value="VIP-KSI">VIP Asafo Terminal, Kumasi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Initial Security PIN</label>
                <input
                  type="text"
                  value={newRepPin}
                  onChange={(e) => setNewRepPin(e.target.value)}
                  placeholder="e.g. 1234"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddRepModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Rep
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
