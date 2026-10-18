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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Shipment, TerminalRep } from "@/types";

export default function RepDashboardPage() {
  const [rep, setRep] = useState<TerminalRep | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filter, setFilter] = useState<"all" | "pickup" | "transit" | "arrived">("all");
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);

  // Quick action state
  const [trackerInput, setTrackerInput] = useState("");
  const [updating, setUpdating] = useState(false);

  // New parcel quick logging modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDesc, setLogDesc] = useState("");
  const [logSender, setLogSender] = useState("");
  const [logRecipient, setLogRecipient] = useState("");
  const [logRecipientPhone, setLogRecipientPhone] = useState("");
  const [logDestCity, setLogDestCity] = useState("Kumasi");

  // Check stored auth
  useEffect(() => {
    const saved = localStorage.getItem("oura_rep_session");
    if (saved) {
      try {
        setRep(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const loadShipments = () => {
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {
        if (data.shipments) setShipments(data.shipments);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (rep) {
      loadShipments();
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
    options?: { tracker_id?: string; courier_name?: string }
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
          courier_name: options?.courier_name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadShipments();
      }
    } catch (err) {
      alert("Failed to update status");
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
          sender_name: logSender || "Walk-in Customer",
          sender_phone: "0240000000",
          recipient_name: logRecipient || "Receiver",
          recipient_phone: logRecipientPhone || "0240000000",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLogModal(false);
        setLogDesc("");
        setLogSender("");
        setLogRecipient("");
        loadShipments();
      }
    } catch (err) {
      alert("Failed to log parcel");
    } finally {
      setUpdating(false);
    }
  };

  // LOGIN SCREEN
  if (!rep) {
    return (
      <main className="min-h-screen bg-paper flex flex-col justify-center px-5 pb-24">
        <div className="max-w-sm mx-auto w-full space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-ink text-white flex items-center justify-center mx-auto shadow-md">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-lg font-bold text-ink">oura Terminal Rep</h1>
            <p className="text-xs text-muted">Accra VIP Circle & Kumasi VIP Asafo Stations</p>
          </div>

          <Card>
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Rep Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0240000001 (Kweku) or 0240000002"
                  className="w-full px-3.5 py-3 rounded-card border border-line bg-soft text-xs text-ink focus:outline-none focus:border-accent font-data"
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
                  className="w-full px-3.5 py-3 rounded-card border border-line bg-soft text-xs text-ink focus:outline-none focus:border-accent font-data"
                  required
                />
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-status-red-bg text-status-red text-xs">
                  {authError}
                </div>
              )}

              <Button type="submit" disabled={authLoading} className="w-full mt-2">
                {authLoading ? "Verifying PIN..." : "Sign In to Terminal"}
              </Button>
            </form>
          </Card>
        </div>
        <BottomNav />
      </main>
    );
  }

  const filteredShipments = shipments.filter((s) => {
    if (filter === "pickup") return s.status === "paid" || s.status === "pickup_scheduled";
    if (filter === "transit") return s.status === "at_terminal" || s.status === "in_transit";
    if (filter === "arrived") return s.status === "arrived" || s.status === "delivered";
    return true;
  });

  return (
    <main className="min-h-screen bg-paper pb-32">
      {/* Rep Top Bar */}
      <header className="px-5 pt-4 pb-3 max-w-md mx-auto flex items-center justify-between border-b border-line/60 bg-white shadow-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center font-bold text-xs">
            REP
          </div>
          <div>
            <div className="text-xs font-bold text-ink leading-tight">{rep.name}</div>
            <div className="text-[10px] text-muted truncate max-w-[170px]">
              {rep.terminal_name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadShipments}
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

      <div className="max-w-md mx-auto px-5 pt-4 space-y-4">
        {/* Terminal Action Banner */}
        <div className="flex items-center justify-between p-3.5 bg-ink text-white rounded-card shadow-subtle">
          <div>
            <div className="text-[10px] uppercase font-bold text-accent tracking-wider">Station Dispatch</div>
            <div className="text-xs font-semibold text-white/90">Log walk-in or assign VIP bus driver</div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Log Parcel
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-soft p-1 rounded-card text-xs font-medium border border-line/60">
          {[
            { id: "all", label: `All (${shipments.length})` },
            { id: "pickup", label: "Pickup" },
            { id: "transit", label: "In Transit" },
            { id: "arrived", label: "Arrived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                filter === tab.id ? "bg-white text-ink shadow-sm font-bold" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Shipments List */}
        <div className="space-y-3">
          {filteredShipments.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted">No parcels in this status.</div>
          ) : (
            filteredShipments.map((s) => {
              const isExpanded = activeShipmentId === s.id;
              return (
                <Card key={s.id} className="p-4 space-y-3">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setActiveShipmentId(isExpanded ? null : s.id)}
                  >
                    <div>
                      <div className="text-xs font-extrabold font-data text-ink">
                        {s.tracking_id}
                      </div>
                      <div className="text-[11px] font-semibold text-ink/80 mt-0.5">
                        {s.item_description}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {s.origin_city} ➔ {s.destination_city} • {s.sender_name}
                      </div>
                    </div>
                    <Badge status={s.status} />
                  </div>

                  {/* Expanded Actions Panel for Rep */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-line/60 space-y-3">
                      {/* Uber / Manual Pickup Section */}
                      {(s.status === "pending_payment" || s.status === "paid") && (
                        <div className="p-3 bg-soft rounded-lg space-y-2">
                          <div className="text-[11px] font-bold text-ink flex items-center justify-between">
                            <span>Pickup Orchestration</span>
                            <span className="text-[10px] text-muted font-normal">
                              Address: {s.origin_address}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <a
                              href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(
                                s.origin_address
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-black text-white text-center rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" /> Order Uber
                            </a>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(s.tracking_id, "picked_up", {
                                  courier_name: "Ernest Angmler (Car Pickup)",
                                })
                              }
                            >
                              Ernest Pickup
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Status Transition Buttons */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-ink">Status Transition:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant={s.status === "at_terminal" ? "secondary" : "outline"}
                            onClick={() => handleUpdateStatus(s.tracking_id, "at_terminal")}
                          >
                            Received at VIP
                          </Button>

                          <Button
                            size="sm"
                            variant={s.status === "in_transit" ? "secondary" : "outline"}
                            onClick={() =>
                              handleUpdateStatus(s.tracking_id, "in_transit", {
                                tracker_id: s.tracker_id || "TRK-FINDMY-01",
                              })
                            }
                          >
                            Put On Bus (In Transit)
                          </Button>

                          <Button
                            size="sm"
                            variant={s.status === "arrived" ? "secondary" : "outline"}
                            onClick={() => handleUpdateStatus(s.tracking_id, "arrived")}
                          >
                            Arrived at Terminal
                          </Button>

                          <Button
                            size="sm"
                            variant={s.status === "delivered" ? "primary" : "outline"}
                            onClick={() => handleUpdateStatus(s.tracking_id, "delivered")}
                          >
                            Mark Delivered ✓
                          </Button>
                        </div>
                      </div>

                      {/* Tracker Device ID Assignment */}
                      <div className="pt-2 border-t border-line/60 flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={s.tracker_id || ""}
                          placeholder="Assign Tracker / Find My Tag"
                          id={`tracker-${s.id}`}
                          className="flex-1 px-3 py-1.5 bg-soft rounded-lg text-xs font-data border border-line focus:outline-none"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const val = (
                              document.getElementById(`tracker-${s.id}`) as HTMLInputElement
                            )?.value;
                            if (val) {
                              handleUpdateStatus(s.tracking_id, s.status, { tracker_id: val });
                              alert(`Tracker ${val} linked to shipment!`);
                            }
                          }}
                        >
                          Link Tag
                        </Button>
                      </div>

                      {/* Link to live public tracking */}
                      <div className="text-right">
                        <Link
                          href={`/track/${s.tracking_id}`}
                          target="_blank"
                          className="text-[11px] text-accent font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          View Public Tracking Screen <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Parcel Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full space-y-4">
            <h2 className="text-sm font-bold text-ink">Log Walk-In Parcel</h2>

            <form onSubmit={handleLogParcel} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-ink">Item Description</label>
                <input
                  type="text"
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="e.g. Carton of books / shoe box"
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-ink">Sender</label>
                  <input
                    type="text"
                    value={logSender}
                    onChange={(e) => setLogSender(e.target.value)}
                    placeholder="Sender name"
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink">Recipient Phone</label>
                  <input
                    type="tel"
                    value={logRecipientPhone}
                    onChange={(e) => setLogRecipientPhone(e.target.value)}
                    placeholder="024XXXXXXX"
                    className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink">Destination City</label>
                <select
                  value={logDestCity}
                  onChange={(e) => setLogDestCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-card border border-line bg-soft text-xs text-ink"
                >
                  <option value="Kumasi">Kumasi (VIP Asafo)</option>
                  <option value="Accra">Accra (VIP Circle)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="flex-1">
                  Create Order
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
