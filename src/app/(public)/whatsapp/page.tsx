"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Send,
  CheckCheck,
  RefreshCw,
  ExternalLink,
  Smartphone,
  DollarSign,
  Bell,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WhatsAppMessageLog } from "@/types";

export default function WhatsAppSimulatorPage() {
  const [phone, setPhone] = useState("0241112233");
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<WhatsAppMessageLog[]>([]);
  const [sending, setSending] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadLogs = () => {
    fetch("/api/webhook/whatsapp?logs=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadLogs();
    const timer = setInterval(loadLogs, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/webhook/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          message: textToSend.trim(),
        }),
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      } else {
        loadLogs();
      }
      setInputMsg("");
    } finally {
      setSending(false);
    }
  };

  const triggerStatusPush = async (newStatus: string) => {
    setSending(true);
    try {
      await fetch("/api/shipments/H314315796", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          tracker_id: "oura-tag-01",
        }),
      });
      loadLogs();
    } finally {
      setSending(false);
    }
  };

  // Format WhatsApp markdown (*bold* and clickable URLs)
  const renderWhatsAppText = (raw: string) => {
    return raw.split("\n").map((line, i) => {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        const url = urlMatch[1];
        const pathOnly = url.replace(/^https?:\/\/[^/]+/, "");
        return (
          <div key={i} className="mt-1">
            <Link
              href={pathOnly || "/track/H314315796"}
              className="text-[#027eb5] underline font-semibold break-all hover:opacity-80 inline-flex items-center gap-1"
            >
              <span>{url}</span>
              <ExternalLink className="w-3 h-3 inline" />
            </Link>
          </div>
        );
      }
      // Replace *text* with bold
      const parts = line.split(/(\*[^*]+\*)/g);
      return (
        <div key={i} className="min-h-[1.1rem]">
          {parts.map((part, idx) =>
            part.startsWith("*") && part.endsWith("*") ? (
              <strong key={idx}>{part.slice(1, -1)}</strong>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Realistic Live WhatsApp Phone Simulator (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-extrabold text-ink flex items-center gap-2">
                  <span>oura WhatsApp Bot & Notification Sandbox</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-pill bg-status-green-bg text-status-green font-bold">
                    LIVE ENGINE
                  </span>
                </h1>
                <p className="text-xs text-muted">
                  Test booking, tracking lookup, and automatic status push alerts right now
                </p>
              </div>
              <button
                onClick={loadLogs}
                className="p-2 rounded-full bg-white border border-line text-muted hover:text-ink"
                title="Refresh Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp Phone Frame */}
            <div className="rounded-2xl overflow-hidden border border-line shadow-card bg-[#EFEAE2] flex flex-col h-[580px]">
              {/* WhatsApp Green Header */}
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/icon-192.png"
                    alt="oura"
                    className="w-9 h-9 rounded-full object-cover border border-white/30"
                  />
                  <div>
                    <div className="text-xs font-extrabold flex items-center gap-1.5">
                      <span>oura VIP Express</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] text-[9px] flex items-center justify-center text-ink font-black">
                        ✓
                      </span>
                    </div>
                    <div className="text-[10px] text-white/80">
                      Official Business Account • Automated 24/7
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px] uppercase text-white/60">Simulating Client</div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-24 px-2 py-0.5 rounded bg-white/15 text-white text-[11px] font-data text-right focus:outline-none"
                  />
                </div>
              </div>

              {/* Chat Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#FFF5C4] text-[#54656F] text-[10px] shadow-sm">
                    🔒 Messages & status notifications are powered by oura WhatsApp Cloud API.
                  </span>
                </div>

                {messages.map((m) => {
                  const isInbound = m.direction === "inbound";
                  const isAutoPush = m.direction === "outbound_notification";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isInbound ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                          isInbound
                            ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-none"
                            : "bg-white text-[#111B21] rounded-tl-none"
                        }`}
                      >
                        {isAutoPush && (
                          <div className="text-[9px] font-extrabold uppercase tracking-wider text-accent mb-1 flex items-center gap-1">
                            <Bell className="w-2.5 h-2.5" />
                            <span>Automatic Status Push Notification</span>
                          </div>
                        )}
                        <div className="text-[11.5px]">{renderWhatsAppText(m.text)}</div>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#667781]">
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isInbound && <CheckCheck className="w-3 h-3 text-[#53BDEB]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Test Chips Bar */}
              <div className="px-3 py-2 bg-[#F0F2F5] border-t border-black/5 flex items-center gap-1.5 overflow-x-auto">
                {[
                  { label: "👋 Say 'HI'", text: "HI" },
                  { label: "1️⃣ Accra ➔ Kumasi", text: "1" },
                  { label: "🔍 Track #H314315796", text: "H314315796" },
                  { label: "✅ Reply 'YES'", text: "YES" },
                  { label: "💸 Reply 'PAID'", text: "PAID" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => sendMessage(chip.text)}
                    className="px-2.5 py-1 rounded-full bg-white border border-line text-[10px] font-bold text-ink whitespace-nowrap hover:border-accent shadow-subtle"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Bottom Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(inputMsg);
                }}
                className="p-2.5 bg-[#F0F2F5] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type a message (e.g. HI, East Legon, H314315796)..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-white text-xs text-ink focus:outline-none shadow-sm"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-10 h-10 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow hover:opacity-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Proactive Notification Tester + SIM Card Setup + Cost Breakdown (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Test Automatic Push Notifications */}
            <Card className="p-5 bg-ink text-white space-y-3">
              <div className="flex items-center gap-2 text-accent text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Test Automatic Status Push Notifications</span>
              </div>
              <p className="text-xs text-white/80">
                Clients don&apos;t have to keep the web app open. Whenever you or a Rep update a parcel&apos;s status in{" "}
                <Link href="/rep" className="underline text-accent font-bold">
                  /rep
                </Link>{" "}
                or{" "}
                <Link href="/admin" className="underline text-accent font-bold">
                  /admin
                </Link>
                , oura automatically pushes a WhatsApp alert with the external live map link. Click below to test:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => triggerStatusPush("at_terminal")}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-accent text-white text-[11px] font-bold transition-all"
                >
                  🏢 1. At Station
                </button>
                <button
                  type="button"
                  onClick={() => triggerStatusPush("in_transit")}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-accent text-white text-[11px] font-bold transition-all"
                >
                  🚌 2. On VIP Bus
                </button>
                <button
                  type="button"
                  onClick={() => triggerStatusPush("arrived")}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-accent text-white text-[11px] font-bold transition-all"
                >
                  🏁 3. Arrived Hub
                </button>
                <button
                  type="button"
                  onClick={() => triggerStatusPush("delivered")}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-accent text-white text-[11px] font-bold transition-all"
                >
                  🎉 4. Delivered
                </button>
              </div>
            </Card>

            {/* 2. How to Connect Your Temporary SIM Card & Swap Later */}
            <Card className="p-5 bg-white border border-line shadow-card space-y-3.5">
              <div className="flex items-center gap-2 text-ink font-extrabold text-sm">
                <Smartphone className="w-4 h-4 text-accent" />
                <span>Connect Your Temporary SIM Card (And Swap Anytime)</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                With <strong>Meta WhatsApp Cloud API</strong>, your webhook and bot logic live on your server—not on the SIM card. You can register your spare SIM card today, and when you get your permanent business SIM later, you simply add the new number in Meta Developer Portal and update the <strong>Phone Number ID</strong> in{" "}
                <Link href="/admin" className="text-accent font-bold hover:underline">
                  Admin Settings
                </Link>
                !
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-soft border border-line space-y-1">
                  <div className="text-[10px] font-bold uppercase text-muted">
                    1. Your Webhook Callback URL (Paste in Meta App Dashboard)
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] font-data font-bold text-ink truncate">
                      https://oura-psi.vercel.app/api/webhook/whatsapp
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/api/webhook/whatsapp`
                        );
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="px-2 py-1 rounded bg-white border border-line text-[10px] font-bold flex items-center gap-1"
                    >
                      {copiedWebhook ? <Check className="w-3 h-3 text-status-green" /> : <Copy className="w-3 h-3" />}
                      {copiedWebhook ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-soft border border-line space-y-1">
                  <div className="text-[10px] font-bold uppercase text-muted">
                    2. Your Webhook Verify Token
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] font-data font-bold text-ink">
                      oura_webhook_verify_token_2025
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("oura_webhook_verify_token_2025");
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="px-2 py-1 rounded bg-white border border-line text-[10px] font-bold flex items-center gap-1"
                    >
                      {copiedToken ? <Check className="w-3 h-3 text-status-green" /> : <Copy className="w-3 h-3" />}
                      {copiedToken ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Transparent Cost Implications of Moving Booking & Tracking to WhatsApp */}
            <Card className="p-5 bg-white border border-line shadow-card space-y-3">
              <div className="flex items-center gap-2 text-ink font-extrabold text-sm">
                <DollarSign className="w-4 h-4 text-status-green" />
                <span>Cost Implications: Booking & Tracking on WhatsApp</span>
              </div>

              <div className="space-y-2.5 text-xs text-ink/90 leading-relaxed">
                <div className="p-3 rounded-lg bg-status-green-bg/60 border border-status-green/20">
                  <div className="font-bold text-status-green">
                    1. Customer-Initiated Booking & Tracking = $0.00 (100% FREE!)
                  </div>
                  <p className="text-[11px] text-ink/80 mt-0.5">
                    As of Meta&apos;s current pricing, <strong>Service Conversations</strong> (when a customer messages your WhatsApp number first saying <em>&quot;HI&quot;</em> to book or sends their Tracking ID) open a <strong>24-hour free reply window</strong>. Every bot message, quote, MoMo instruction, and status update sent inside that 24-hour window costs <strong>$0.00</strong>!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-soft border border-line">
                  <div className="font-bold text-ink">
                    2. Since Accra ↔ Kumasi Takes &lt; 24 Hours, Notifications Stay Inside the Free Window!
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    Because your VIP bus deliveries happen within the same day (under 24 hours from when the client messages you on WhatsApp to book), your automatic status notifications (<em>Paid → At VIP Station → On Bus → Arrived → Delivered</em>) can be sent as regular messages inside their open 24-hour customer service window for <strong>$0.00</strong>!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-soft border border-line">
                  <div className="font-bold text-ink">
                    3. When Do You Pay Anything? (Only Outside 24 Hours or Recipient Alerts)
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    If a client books on the web without messaging you on WhatsApp first, or if a delivery takes longer than 24 hours, sending a proactive Meta <strong>Utility Template</strong> in Ghana (Rest of Africa rate) costs roughly <strong>$0.008 – $0.015 (~GHS 0.12 to GHS 0.22)</strong> per 24-hour utility window.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
