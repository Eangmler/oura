"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Shipment, TerminalRep, OuraSettings } from "@/types";

export default function AdminDashboardPage() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "shipments" | "reps" | "settings">("overview");

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [reps, setReps] = useState<TerminalRep[]>([]);
  const [settings, setSettings] = useState<OuraSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Rep addition modal
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [newRepName, setNewRepName] = useState("");
  const [newRepPhone, setNewRepPhone] = useState("");
  const [newRepTerminal, setNewRepTerminal] = useState("VIP-ACC");
  const [newRepPin, setNewRepPin] = useState("1234");

  // Check stored admin session
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

  // ADMIN LOGIN SCREEN
  if (!adminAuth) {
    return (
      <main className="min-h-screen bg-paper flex flex-col justify-center px-5 pb-24">
        <div className="max-w-sm mx-auto w-full space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-ink text-accent flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-ink">oura Master Admin</h1>
            <p className="text-xs text-muted">Operations, Rates & Configuration Console</p>
          </div>

          <Card>
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Admin PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full px-3.5 py-3 rounded-card border border-line bg-soft text-xs text-ink focus:outline-none focus:border-accent font-data"
                  required
                />
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-status-red-bg text-status-red text-xs">
                  {authError}
                </div>
              )}

              <Button type="submit" className="w-full mt-2">
                Access Admin Portal
              </Button>
            </form>
          </Card>
        </div>
        <BottomNav />
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
    <main className="min-h-screen bg-paper pb-32">
      {/* Admin Top Header */}
      <header className="px-5 pt-4 pb-3 max-w-4xl mx-auto flex items-center justify-between border-b border-line/60 bg-white shadow-subtle">
        <div className="flex items-center gap-2.5">
          <img
            src="/icon-192.png"
            alt="oura"
            className="w-9 h-9 rounded-xl object-cover shadow-sm border border-line"
          />
          <div>
            <div className="text-xs font-bold text-ink leading-tight">oura Admin Operations</div>
            <div className="text-[10px] text-muted">Accra ↔ Kumasi Live Console</div>
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

      <div className="max-w-4xl mx-auto px-5 pt-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-card text-xs font-semibold border border-line shadow-subtle">
          {[
            { id: "overview", label: "Overview & Stats" },
            { id: "shipments", label: `Shipments (${shipments.length})` },
            { id: "reps", label: `Terminal Reps (${reps.length})` },
            { id: "settings", label: "Admin Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                activeTab === tab.id
                  ? "bg-ink text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">Total Parcels</div>
                <div className="text-xl font-bold font-data text-ink">{totalShipments}</div>
                <div className="text-[10px] text-status-green font-medium">+100% test demand</div>
              </Card>

              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">Verified MoMo</div>
                <div className="text-xl font-bold font-data text-accent">GHS {totalRevenue}.00</div>
                <div className="text-[10px] text-muted">Cash received</div>
              </Card>

              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">In Transit</div>
                <div className="text-xl font-bold font-data text-ink">{inTransitCount}</div>
                <div className="text-[10px] text-muted">On VIP Highway</div>
              </Card>

              <Card className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted">Pending MoMo</div>
                <div className="text-xl font-bold font-data text-status-amber">
                  {pendingPaymentCount}
                </div>
                <div className="text-[10px] text-status-amber font-medium">Awaiting confirm</div>
              </Card>
            </div>

            {/* Quick Actions / Pending MoMo Approvals Card */}
            {pendingPaymentCount > 0 && (
              <Card className="p-4 space-y-3 border-accent/40 bg-accent/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-ink">
                      {pendingPaymentCount} Shipment(s) Awaiting MoMo Verification
                    </span>
                  </div>
                  <span className="text-[11px] text-muted">Check Ernest's MoMo SMS</span>
                </div>

                <div className="space-y-2">
                  {shipments
                    .filter((s) => s.status === "pending_payment")
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 bg-white rounded-card border border-line text-xs"
                      >
                        <div>
                          <div className="font-bold font-data text-ink">ID: {s.tracking_id}</div>
                          <div className="text-[11px] text-muted">
                            {s.sender_name} ({s.sender_phone}) • Amount: GHS {s.pricing?.total || 120}.00
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleConfirmPayment(s.tracking_id)}
                          className="text-xs"
                        >
                          Confirm Paid ✓
                        </Button>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* Route Volume Split */}
            <Card className="p-4 space-y-2">
              <h3 className="text-xs font-bold text-ink">Route Volume Activity</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-soft rounded-lg">
                  <div className="text-[11px] font-semibold text-ink">Accra ➔ Kumasi VIP</div>
                  <div className="text-lg font-bold font-data text-ink mt-1">
                    {shipments.filter((s) => s.origin_city === "Accra").length} parcels
                  </div>
                </div>
                <div className="p-3 bg-soft rounded-lg">
                  <div className="text-[11px] font-semibold text-ink">Kumasi ➔ Accra VIP</div>
                  <div className="text-lg font-bold font-data text-ink mt-1">
                    {shipments.filter((s) => s.origin_city === "Kumasi").length} parcels
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SHIPMENTS TAB */}
        {activeTab === "shipments" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">All Intercity Shipments</h2>
              <span className="text-xs text-muted">Real-time status controls</span>
            </div>

            <div className="space-y-2.5">
              {shipments.map((s) => (
                <Card key={s.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-data text-ink">{s.tracking_id}</span>
                        <Badge status={s.status} />
                      </div>
                      <div className="text-xs font-semibold text-ink mt-1">
                        {s.item_description} ({s.weight_kg}kg)
                      </div>
                      <div className="text-[11px] text-muted">
                        Route: {s.origin_city} ({s.origin_address}) ➔ {s.destination_city} ({s.destination_address})
                      </div>
                      <div className="text-[11px] text-muted">
                        Customer: {s.sender_name} ({s.sender_phone}) ➔ Recipient: {s.recipient_name} ({s.recipient_phone})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-data text-accent">
                        GHS {s.pricing?.total || 120}.00
                      </div>
                      <div className="text-[10px] text-muted">
                        {s.payment_confirmed ? "Paid ✓" : "Unpaid"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-muted font-data text-[10px]">
                      Tracker Tag: {s.tracker_id || "Not assigned"}
                    </span>
                    <div className="flex gap-2">
                      {!s.payment_confirmed && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleConfirmPayment(s.tracking_id)}
                        >
                          Confirm MoMo
                        </Button>
                      )}
                      <Link
                        href={`/track/${s.tracking_id}`}
                        target="_blank"
                        className="px-3 py-1.5 border border-line rounded-pill text-[11px] font-semibold text-ink hover:bg-soft inline-flex items-center gap-1"
                      >
                        Live Map <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TERMINAL REPS TAB */}
        {activeTab === "reps" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">Terminal Representatives</h2>
                <p className="text-xs text-muted">Manage station reps at Accra and Kumasi bus terminals</p>
              </div>
              <Button size="sm" onClick={() => setShowAddRepModal(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Rep
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {reps.map((rep) => (
                <Card key={rep.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">{rep.name}</div>
                      <div className="text-[11px] text-muted">{rep.terminal_name}</div>
                      <div className="text-[11px] font-data text-ink mt-0.5">Phone: {rep.phone}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.active ? "bg-status-green-bg text-status-green" : "bg-status-red-bg text-status-red"
                      }`}
                    >
                      {rep.active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted bg-soft p-2 rounded-lg">
                    Login PIN: <strong className="text-ink font-data">{rep.pin_hash}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleRep(rep.id, rep.active)}
                      className="text-xs font-semibold text-accent hover:underline"
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

        {/* SETTINGS TAB (The critical feature requested by user) */}
        {activeTab === "settings" && settings && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">oura System Configuration</h2>
                <p className="text-xs text-muted">
                  Make updates without editing code — applies across customer, rep, and bot interfaces
                </p>
              </div>
              <Button type="submit" disabled={savingSettings} size="sm" className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {savingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </div>

            {saveToast && (
              <div className="p-3 rounded-card bg-status-green-bg text-status-green text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Settings saved successfully to oura central database!
              </div>
            )}

            {/* MoMo Payment Settings Card */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-ink font-bold text-xs">
                <CreditCard className="w-4 h-4 text-accent" />
                <span>Mobile Money Payment Details</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-ink">MoMo Phone Number</label>
                  <input
                    type="text"
                    value={settings.momo_number}
                    onChange={(e) => setSettings({ ...settings, momo_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink">MoMo Account Name</label>
                  <input
                    type="text"
                    value={settings.momo_name}
                    onChange={(e) => setSettings({ ...settings, momo_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink">Payment Instructions Template</label>
                <textarea
                  rows={2}
                  value={settings.payment_instructions_template}
                  onChange={(e) =>
                    setSettings({ ...settings, payment_instructions_template: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                />
              </div>
            </Card>

            {/* Pricing Rates Table */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-ink font-bold text-xs">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Accra ↔ Kumasi Route Transit Rates (GHS)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-muted">Small (&lt;1kg)</label>
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-soft text-xs font-data"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted">Medium (1-5kg)</label>
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-soft text-xs font-data"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted">Large (5-20kg)</label>
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-soft text-xs font-data"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted">Oversized (20kg+)</label>
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-soft text-xs font-data"
                  />
                </div>
              </div>

              {/* Local pickup and delivery zone fees */}
              <div className="pt-2 border-t border-line grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-ink">Average Pickup Fee (GHS)</label>
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
                    className="w-full px-3 py-1.5 rounded-lg border border-line bg-soft text-xs font-data"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink">Average Delivery Fee (GHS)</label>
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
                    className="w-full px-3 py-1.5 rounded-lg border border-line bg-soft text-xs font-data"
                  />
                </div>
              </div>
            </Card>

            {/* WhatsApp Integration Toggle */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-ink">WhatsApp Cloud Bot Module</div>
                  <div className="text-[11px] text-muted">
                    When you register your business number, enable bot here
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsapp_enabled}
                  onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
              </div>

              {settings.whatsapp_enabled && (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-ink">WhatsApp Bot Number</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      placeholder="+233248147952"
                      className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink">Meta Cloud API Token</label>
                    <input
                      type="password"
                      value={settings.whatsapp_token}
                      onChange={(e) => setSettings({ ...settings, whatsapp_token: e.target.value })}
                      placeholder="EAAG..."
                      className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                    />
                  </div>
                </div>
              )}
            </Card>

            <div className="text-right pt-2">
              <Button type="submit" disabled={savingSettings} className="px-8">
                {savingSettings ? "Saving Settings..." : "Save All Configuration Changes"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Add Rep Modal */}
      {showAddRepModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full space-y-4">
            <h2 className="text-sm font-bold text-ink">Add Terminal Representative</h2>

            <form onSubmit={handleCreateRep} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-ink">Full Name</label>
                <input
                  type="text"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  placeholder="e.g. Samuel Osei"
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink">Phone Number</label>
                <input
                  type="tel"
                  value={newRepPhone}
                  onChange={(e) => setNewRepPhone(e.target.value)}
                  placeholder="024XXXXXXX"
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink">Assigned Terminal</label>
                <select
                  value={newRepTerminal}
                  onChange={(e) => setNewRepTerminal(e.target.value)}
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                >
                  <option value="VIP-ACC">VIP Circle Terminal, Accra</option>
                  <option value="VIP-KSI">VIP Asafo Terminal, Kumasi</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink">Initial Security PIN</label>
                <input
                  type="text"
                  value={newRepPin}
                  onChange={(e) => setNewRepPin(e.target.value)}
                  placeholder="e.g. 1234"
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink font-data"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
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

      <BottomNav />
    </main>
  );
}
