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
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shipment, TerminalRep, OuraSettings, TrackerPing } from "@/types";

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

export default function AdminDashboardPage() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "map" | "shipments" | "reps" | "settings">("overview");

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [reps, setReps] = useState<TerminalRep[]>([]);
  const [settings, setSettings] = useState<OuraSettings | null>(null);
  const [latestPing, setLatestPing] = useState<TrackerPing | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Rep addition modal
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [newRepName, setNewRepName] = useState("");
  const [newRepPhone, setNewRepPhone] = useState("");
  const [newRepTerminal, setNewRepTerminal] = useState("VIP-ACC");
  const [newRepPin, setNewRepPin] = useState("1234");

  useEffect(() => {
    const isAuth = sessionStorage.getItem("oura_admin_auth");
    if (isAuth === "true") {
      setAdminAuth(true);
    }
  }, []);

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/shipments").then((r) => r.json()),
      fetch("/api/reps").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([shipData, repData, setData]) => {
        if (shipData.shipments) setShipments(shipData.shipments);
        if (repData.reps) setReps(repData.reps);
        if (setData.settings) setSettings(setData.settings);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    fetch("/api/pings?shipment_id=H314315796")
      .then((r) => r.json())
      .then((p) => {
        if (p.latest) setLatestPing(p.latest);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (adminAuth) {
      loadAllData();
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
            { id: "map", label: "Live Highway Map" },
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
                  <span className="text-xs text-muted">Check Ernest's MoMo SMS (`0248147952`)</span>
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
                            Customer: <strong>{s.sender_name}</strong> ({s.sender_phone}) ➔ Amount: <strong className="text-accent font-data">GHS {s.pricing?.total || 120}.00</strong>
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

        {/* ── TAB 2: LIVE HIGHWAY MAP (Dedicated Substantial Operations View) ─ */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <span>Corridor Real-Time Tracking Operations</span>
                  <span className="text-xs bg-status-green-bg text-status-green font-semibold px-2 py-0.5 rounded-full">
                    GPS Connected
                  </span>
                </h2>
                <p className="text-xs text-muted">
                  Interactive location mappings of all active VIP buses along Accra, Suhum, Nkawkaw, Konongo and Kumasi
                </p>
              </div>
            </div>

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

        {/* ── TAB 3: SHIPMENTS LEDGER ───────────────────────────────────────── */}
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
                    <th className="py-3 px-4">Item</th>
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
                        <td className="py-3.5 px-4 text-ink font-medium">
                          {s.item_description} ({s.weight_kg}kg)
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

        {/* ── TAB 4: REPS MANAGEMENT ────────────────────────────────────────── */}
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

        {/* ── TAB 5: SYSTEM SETTINGS (No-Code Operations Console) ──────────── */}
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">WhatsApp Cloud Bot Module</div>
                  <div className="text-xs text-muted">
                    When you register your business number, enable bot here
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsapp_enabled}
                  onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                  className="w-5 h-5 accent-accent"
                />
              </div>

              {settings.whatsapp_enabled && (
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-ink">WhatsApp Bot Number</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      placeholder="+233248147952"
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
