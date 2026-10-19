"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  ArrowRight,
  Package,
  MapPin,
  ShieldCheck,
  Smartphone,
  Truck,
  BellRing,
  CheckCircle2,
  Search,
  Radio,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";

const WHATSAPP_URL = "https://wa.me/233599882827?text=Hi";

export default function HomePage() {
  const [trackingQuery, setTrackingQuery] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingQuery.trim()) {
      window.location.href = `/track/${trackingQuery.trim().toUpperCase()}`;
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col scroll-smooth">
      <Navbar />

      {/* 1. HERO SECTION (Inspired by uselebe.com) */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-line/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Description, 2 Primary CTA Buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-white border border-line shadow-subtle text-xs font-bold text-ink">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span>Built for WhatsApp · Accra ↔ Kumasi Intercity Delivery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-ink leading-[1.1]">
                Your Intercity{" "}
                <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-8">
                  Parcel Delivery
                </span>{" "}
                Assistant on WhatsApp
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Use <strong className="text-ink font-extrabold">oura</strong> to book door-to-door parcel pickups, ship packages between{" "}
                <strong className="text-ink font-semibold">Accra</strong> and{" "}
                <strong className="text-ink font-semibold">Kumasi</strong> via VIP Express coaches, pay with Mobile Money, and follow live GPS hardware tags — all without leaving WhatsApp.
              </p>

              {/* THE 2 PRIMARY BUTTONS (Just like uselebe.com) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-pill bg-[#25D366] hover:bg-[#20bd5a] text-ink font-extrabold text-sm sm:text-base shadow-card transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5 fill-ink/10" />
                  <span>Start a chat with oura on WhatsApp</span>
                </a>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-pill bg-ink hover:bg-ink/90 text-white font-bold text-sm sm:text-base transition-all"
                >
                  <span>Learn how oura works</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Sub-caption like Lebe ("Beta in Ghana · Mobile money only...") */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-muted">
                <span className="text-ink font-bold">Live in Ghana</span>
                <span>·</span>
                <span>Accra ↔ Kumasi VIP Express</span>
                <span>·</span>
                <span>Mobile Money & Real-Time GPS Tags</span>
              </div>

              {/* Optional Live Tracking Lookup Bar for existing parcels */}
              <form
                onSubmit={handleTrackSubmit}
                className="pt-3 max-w-md mx-auto lg:mx-0"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Already have a Booking ID? Open live GPS map:
                </div>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={trackingQuery}
                    onChange={(e) => setTrackingQuery(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. H314315796)..."
                    className="w-full pl-10 pr-28 py-3 bg-white border border-line rounded-pill text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent shadow-subtle font-data"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-2 bg-accent text-white rounded-pill text-xs font-bold hover:bg-accent-dark transition-colors"
                  >
                    Track Live
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Interactive WhatsApp Chat Preview */}
            <div className="lg:col-span-5">
              <div className="bg-[#0F0F0F] rounded-[28px] p-3.5 shadow-float border border-ink/10 max-w-md mx-auto">
                {/* WhatsApp Top Bar */}
                <div className="bg-[#075E54] text-white px-4 py-3 rounded-t-[20px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-extrabold text-sm">
                      oura
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span>oura</span>
                        <span className="inline-block w-3.5 h-3.5 rounded-full bg-[#25D366] text-[9px] text-ink font-black flex items-center justify-center">
                          ✓
                        </span>
                      </div>
                      <div className="text-[10px] text-white/80">+233 59 988 2827 · Online</div>
                    </div>
                  </div>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold bg-[#25D366] text-ink px-2.5 py-1 rounded-pill"
                  >
                    Open Chat
                  </a>
                </div>

                {/* WhatsApp Chat Wallpaper & Messages */}
                <div className="bg-[#ECE5DD] p-3.5 space-y-2.5 text-[11px] leading-relaxed rounded-b-[20px]">
                  {/* Customer msg */}
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] text-ink px-3 py-2 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                      <div className="font-medium">Hi, I want to send a laptop from Dansoman to Kumasi</div>
                      <div className="text-[9px] text-muted text-right mt-0.5">10:14 AM ✓✓</div>
                    </div>
                  </div>

                  {/* Bot Quote reply */}
                  <div className="flex justify-start">
                    <div className="bg-white text-ink px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] space-y-1">
                      <div className="font-extrabold text-[#075E54]">⚡ oura Instant WhatsApp Quote</div>
                      <div className="text-[11px] space-y-0.5">
                        <div>📦 Item: <strong>Laptop</strong> (~3.5kg, MEDIUM)</div>
                        <div>📍 Pickup: Dansoman (Accra)</div>
                        <div>🏁 Delivery: Atonsu (Kumasi)</div>
                        <div>💰 <strong>Total: GHS 130.00</strong> (Pickup + VIP Bus + Delivery)</div>
                      </div>
                      <div className="text-[10px] text-muted pt-1">
                        Reply <strong>YES</strong> to confirm & get your Tracking ID.
                      </div>
                    </div>
                  </div>

                  {/* Customer YES */}
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] text-ink px-3 py-1.5 rounded-2xl rounded-tr-none shadow-sm">
                      <span className="font-bold">YES</span>
                      <span className="text-[9px] text-muted ml-2">10:15 AM ✓✓</span>
                    </div>
                  </div>

                  {/* Bot Confirmed + Live Map Link */}
                  <div className="flex justify-start">
                    <div className="bg-white text-ink px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[92%] space-y-1">
                      <div className="font-extrabold text-accent">🎉 Booking Confirmed! ID: H76730685</div>
                      <div className="text-[10px] text-ink/90">
                        🚌 We will message you here on WhatsApp at every station!
                      </div>
                      <div className="pt-1">
                        <Link
                          href="/track/H314315796"
                          className="block bg-soft border border-line rounded-lg p-2 text-[10px] font-bold text-accent hover:underline"
                        >
                          🗺️ useoura.com/track/H314315796 →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA inside phone */}
                  <div className="pt-1">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-ink font-extrabold text-xs rounded-pill flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Tap to Chat with oura (+233 59 988 2827)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SCROLLING FEATURE TICKER BAR (Like uselebe.com marquee) */}
      <div className="bg-ink text-white py-3.5 border-b border-line overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold tracking-wide uppercase">
          <span className="text-[#25D366]">book on whatsapp</span>
          <span className="text-white/30">•</span>
          <span>door-to-door pickup</span>
          <span className="text-white/30">•</span>
          <span className="text-accent">vip express transit</span>
          <span className="text-white/30">•</span>
          <span>live gps hardware tags</span>
          <span className="text-white/30">•</span>
          <span>mobile money payment</span>
          <span className="text-white/30">•</span>
          <span className="text-[#25D366]">instant whatsapp alerts</span>
        </div>
      </div>

      {/* 3. HOW IT WORKS SECTION (#how-it-works — "How oura fits into your delivery life") */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-line/60 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/10 text-accent text-xs font-extrabold uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              How oura fits into your delivery life
            </h2>
            <p className="text-sm sm:text-base text-muted">
              No app downloads, no paper waybills, and no waiting in line at the bus terminal. Everything happens inside the WhatsApp chat you already use every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="p-6 bg-paper border border-line/80 space-y-4 relative">
              <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-ink font-black text-base flex items-center justify-center shadow-sm">
                1
              </div>
              <h3 className="text-base font-extrabold text-ink">Start a chat</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Tap <strong>“Start a chat with oura on WhatsApp”</strong> and say <strong>“Hi”</strong> to{" "}
                <span className="font-data font-bold text-ink">+233 59 988 2827</span>. Choose Accra ➔ Kumasi or Kumasi ➔ Accra in one tap.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 bg-paper border border-line/80 space-y-4 relative">
              <div className="w-11 h-11 rounded-2xl bg-ink text-white font-black text-base flex items-center justify-center shadow-sm">
                2
              </div>
              <h3 className="text-base font-extrabold text-ink">Get an instant quote</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Share your pickup neighborhood, destination address, recipient phone number, and item description. <strong>oura</strong> calculates your all-inclusive fare immediately.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 bg-paper border border-line/80 space-y-4 relative">
              <div className="w-11 h-11 rounded-2xl bg-accent text-white font-black text-base flex items-center justify-center shadow-sm">
                3
              </div>
              <h3 className="text-base font-extrabold text-ink">Approve with Mobile Money</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Reply <strong>“YES”</strong> to receive your unique Booking ID and pay via MTN Mobile Money. Our dispatch desk verifies your transfer and sends a pickup rider to your door.
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 bg-paper border border-line/80 space-y-4 relative">
              <div className="w-11 h-11 rounded-2xl bg-status-green text-white font-black text-base flex items-center justify-center shadow-sm">
                4
              </div>
              <h3 className="text-base font-extrabold text-ink">Track live on WhatsApp</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Receive automatic WhatsApp alerts when your parcel is picked up, paired with a live GPS Smart Tag at the VIP station, onboard the coach, and delivered.
              </p>
            </Card>
          </div>

          <div className="text-center pt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-pill bg-[#25D366] hover:bg-[#20bd5a] text-ink font-extrabold text-sm shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Try booking on WhatsApp now</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. WHAT OURA CAN DO (#features — Inspired by uselebe.com's 4 feature boxes) */}
      <section id="features" className="py-16 sm:py-24 bg-paper border-b border-line/60 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white border border-line text-ink text-xs font-extrabold">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Built for WhatsApp</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              What oura Can Do
            </h2>
            <p className="text-sm sm:text-base text-muted">
              <strong>oura</strong> works the way you already chat on WhatsApp — combining doorstep rider dispatch, VIP Express coaches, and live hardware GPS telemetry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-7 bg-white border border-line/80 space-y-3 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-status-green flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-ink">Book intercity deliveries in chat</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Send laptops, documents, fashion packages, spare parts, or cartons between Accra and Kumasi in 4 quick replies. <strong>oura</strong> confirms all details in chat before dispatch.
              </p>
            </Card>

            <Card className="p-7 bg-white border border-line/80 space-y-3 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-ink">Door-to-door rider pickup & drop-off</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Skip the heavy traffic to Circle or Asafo VIP stations. Our local riders collect your package from your home or office and deliver directly to the recipient in the destination city.
              </p>
            </Card>

            <Card className="p-7 bg-white border border-line/80 space-y-3 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-ink/10 text-ink flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-ink">Real-time GPS hardware tracking</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                At the VIP terminal, our reps attach a pre-registered <strong>oura Smart Tracker</strong> to the transit batch. Click your tracking link anytime to watch your parcel move live along the N6 highway.
              </p>
            </Card>

            <Card className="p-7 bg-white border border-line/80 space-y-3 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-status-amber-bg text-status-amber flex items-center justify-center">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-ink">Proactive WhatsApp status notifications</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                You never have to guess where your package is. <strong>oura</strong> automatically sends WhatsApp updates when payment is verified, at terminal check-in, when the VIP coach departs, and upon arrival.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. BUILT FOR GHANA SECTION (#security — Inspired by uselebe.com's "Built for Ghana, growing with you") */}
      <section id="security" className="py-16 sm:py-24 bg-ink text-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Built for Ghana, growing with you
            </h2>
            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
              <strong>oura</strong> makes intercity parcel logistics between Accra and Kumasi effortless, transparent, and trackable directly from WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card bg-white/5 border border-white/10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#25D366] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live today</span>
              </div>
              <h3 className="text-lg font-bold text-white">Accra ↔ Kumasi Corridor</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Instant WhatsApp booking, doorstep pickup & delivery, MTN Mobile Money checkout, VIP Express coach transit, and live GPS Smart Tag tracking.
              </p>
            </div>

            <div className="p-6 rounded-card bg-white/5 border border-white/10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-accent uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>In beta</span>
              </div>
              <h3 className="text-lg font-bold text-white">Automated Hardware Telemetry</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Dedicated Find Hub GPS tags paired with every VIP coach shipment batch for continuous highway checkpoints (Circle, Nsawam, Suhum, Nkawkaw, Konongo, Asafo).
              </p>
            </div>

            <div className="p-6 rounded-card bg-white/5 border border-white/10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white/60 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Coming soon</span>
              </div>
              <h3 className="text-lg font-bold text-white">Nationwide Corridors</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Expanding WhatsApp-first intercity parcel delivery to Takoradi, Tamale, Sunyani, and Cape Coast terminals.
              </p>
            </div>
          </div>

          {/* Bottom Call-To-Action Box */}
          <div className="p-8 sm:p-10 rounded-[24px] bg-white/10 border border-white/15 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Start using your WhatsApp delivery assistant
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Ready to send or track a parcel where you already chat? Start a chat with <strong>oura</strong> on WhatsApp today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-pill bg-[#25D366] hover:bg-[#20bd5a] text-ink font-extrabold text-sm shadow-md transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start a chat with oura on WhatsApp</span>
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-pill bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all"
              >
                <span>How it Works</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER WITH PRIVACY POLICY & TERMS AND CONDITIONS (Like uselebe.com) */}
      <footer className="bg-white border-t border-line py-12 text-xs text-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <img src="/icon-192.png" alt="oura" className="w-7 h-7 rounded-lg object-cover border border-line" />
                <span className="text-lg font-extrabold text-ink tracking-tight">oura</span>
              </div>
              <p className="text-xs text-muted max-w-sm leading-relaxed">
                Your WhatsApp-first intercity parcel delivery assistant between Accra and Kumasi via VIP Express, powered by live GPS hardware tracking.
              </p>
              <div className="pt-1 font-data text-xs font-bold text-ink">
                WhatsApp Concierge: +233 59 988 2827
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink">Learn</div>
              <ul className="space-y-2 font-medium">
                <li>
                  <a href="#how-it-works" className="hover:text-ink transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-ink transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/track" className="hover:text-ink transition-colors">
                    Track a Parcel
                  </Link>
                </li>
                <li>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-status-green font-bold hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance Links */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink">
                Legal & Privacy
              </div>
              <ul className="space-y-2 font-medium">
                <li>
                  <Link href="/privacy" className="hover:text-ink transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-ink transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/data-deletion" className="hover:text-ink transition-colors">
                    Data Deletion Instructions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-line/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © {new Date().getFullYear()} All Rights Reserved –{" "}
              <strong className="text-ink font-extrabold">oura</strong>
            </div>
            <div className="flex items-center gap-5 font-semibold">
              <Link href="/privacy" className="hover:text-ink transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-ink transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/data-deletion" className="hover:text-ink transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
