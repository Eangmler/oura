"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Minus, Package } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/233599882827?text=Hi";

const FAQ_ITEMS = [
  {
    q: "How does oura work?",
    a: "Tap 'Chat on WhatsApp', take a photo of your parcel (or type what you're sending), and drop your pickup and delivery locations. oura replies with an instant price, you approve via Mobile Money, and our rider picks it up from your door.",
  },
  {
    q: "How do we deliver between Accra & Kumasi?",
    a: "Our local rider collects your parcel from your doorstep, checks it into the VIP Express terminal, and places it on the next coach. Once it arrives in Kumasi or Accra, our destination rider delivers it straight to your recipient.",
  },
  {
    q: "How does live GPS tracking work?",
    a: "Every parcel batch is paired with a pre-registered oura GPS hardware tag at the terminal. You receive automatic WhatsApp status alerts at each checkpoint along the highway, plus an external link to view the live map anytime.",
  },
  {
    q: "How do I pay for my delivery?",
    a: "You pay seamlessly with MTN Mobile Money using your unique Booking ID as the reference. As soon as payment is confirmed, your rider is dispatched immediately.",
  },
  {
    q: "How do I track an existing parcel?",
    a: "Simply reply with your Booking ID (e.g. H21191059) inside the oura WhatsApp chat, or enter it in the live tracking field above to open the real-time highway map.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(2);
  const [mode, setMode] = useState<"track" | "quote">("track");
  const [trackingId, setTrackingId] = useState("");
  const [fromCity, setFromCity] = useState("Accra");
  const [toCity, setToCity] = useState("Kumasi");
  const [weightTier, setWeightTier] = useState<"small" | "medium" | "large">("medium");

  const estimatedTotal =
    weightTier === "small" ? 105 : weightTier === "medium" ? 130 : 170;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      window.location.href = `/track/${trackingId.trim().toUpperCase()}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#DFDFE1] text-[#0F0F0F] flex flex-col font-body selection:bg-[#0F0F0F] selection:text-white scroll-smooth">
      {/* MINIMALIST TOP BAR (Matches Cargo.Town top-left mark) */}
      <header className="max-w-5xl w-full mx-auto px-6 sm:px-10 pt-7 pb-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Package className="w-4 h-4 text-[#0F0F0F] stroke-[2.2]" />
          <span className="text-sm font-bold tracking-tight text-[#0F0F0F]">oura</span>
        </Link>

        <div className="flex items-center gap-6 text-xs font-semibold text-[#0F0F0F]/70">
          <a href="#how-it-works" className="hover:text-[#0F0F0F] transition-colors hidden sm:inline">
            How it works
          </a>
          <Link href="/track" className="hover:text-[#0F0F0F] transition-colors">
            Track
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0F0F0F]/20 bg-[#0F0F0F]/5 hover:bg-[#0F0F0F] hover:text-white text-[#0F0F0F] font-semibold transition-all"
          >
            <span>Chat on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* MAIN EDITORIAL CANVAS */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 pt-6 pb-20 space-y-20">
        {/* 1. HERO SECTION */}
        <section className="relative space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Headline & 2 Minimalist Buttons */}
            <div className="lg:col-span-8 space-y-7 z-10">
              <h1 className="text-[44px] sm:text-[64px] lg:text-[72px] font-bold tracking-[-0.04em] leading-[1.02]">
                <span className="block text-[#0F0F0F]">Parcel. Delivery.</span>
                <span className="block text-white">On WhatsApp.</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                {/* Button 1: Start a chat with oura on WhatsApp */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between gap-6 px-6 py-3.5 rounded-full bg-[#0F0F0F] text-white hover:bg-[#0F0F0F]/85 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                >
                  <span>Chat with oura</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {/* Button 2: How it works */}
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-between gap-5 px-6 py-3.5 rounded-full border border-[#0F0F0F]/20 bg-white/30 hover:bg-white/60 text-[#0F0F0F] text-xs sm:text-sm font-semibold transition-all"
                >
                  <span>How it works</span>
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </a>

                <p className="text-[11px] sm:text-xs text-[#0F0F0F]/65 max-w-[230px] leading-snug pl-1">
                  Snap a photo of your parcel in WhatsApp. Door-to-door between Accra &amp; Kumasi.
                </p>
              </div>
            </div>

            {/* Right Minimalist White Wireframe Parcel Illustration (Matches Cargo.Town wireframe art) */}
            <div className="hidden lg:flex lg:col-span-4 justify-end items-start pt-2 pointer-events-none select-none">
              <svg
                viewBox="0 0 260 200"
                className="w-64 h-48 stroke-white fill-none"
                strokeWidth="1.5"
              >
                {/* Isometric Parcel Box Wireframe */}
                <polygon points="130,20 230,65 130,110 30,65" />
                <polygon points="30,65 130,110 130,185 30,140" />
                <polygon points="230,65 130,110 130,185 230,140" />
                {/* Tape strip & shipping label lines */}
                <line x1="80" y1="42.5" x2="180" y2="87.5" />
                <line x1="180" y1="87.5" x2="180" y2="122" />
                <polygon points="65,98 110,118 110,148 65,128" strokeOpacity="0.7" />
                <line x1="72" y1="110" x2="102" y2="123" strokeOpacity="0.7" />
                <line x1="72" y1="118" x2="95" y2="128" strokeOpacity="0.7" />
                {/* Inner structural grid lines */}
                <line x1="130" y1="20" x2="130" y2="65" strokeDasharray="3 3" strokeOpacity="0.45" />
                <line x1="55" y1="53" x2="155" y2="98" strokeOpacity="0.35" />
              </svg>
            </div>
          </div>

          {/* HERO PHOTOGRAPH MOCKUP: Holding phone taking picture of parcel in WhatsApp */}
          <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-card border border-black/10 bg-[#141414]">
            <img
              src="/hero-whatsapp-parcel.jpg"
              alt="Taking a photo of a parcel inside WhatsApp with oura"
              className="w-full h-[280px] sm:h-[420px] lg:h-[460px] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-medium border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                <span>Snap parcel in WhatsApp · Instant quote &amp; rider pickup</span>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-[#0F0F0F] text-[11px] font-bold hover:bg-white/90 transition-colors"
              >
                <span>Open WhatsApp</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* 2. MINIMALIST 3-COLUMN TIER CARDS (Matches "Customized solutions / By Land, By Air, By Sea") */}
        <section className="space-y-8">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.12] text-[#0F0F0F]">
            Door-to-door delivery <br />
            between Accra &amp; Kumasi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Tier 1 */}
            <div className="rounded-[20px] border border-[#0F0F0F]/12 bg-white/15 p-6 space-y-5">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Small
              </div>
              <div className="space-y-3 pt-1 border-t border-[#0F0F0F]/10">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#0F0F0F]/45">
                    Transit Cost
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0F0F0F] mt-0.5">
                    From GHS 45
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#0F0F0F]/45">
                    Weight
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0F0F0F] mt-0.5">
                    Up to 1 kg
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="rounded-[20px] border border-[#0F0F0F]/12 bg-white/15 p-6 space-y-5">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Medium
              </div>
              <div className="space-y-3 pt-1 border-t border-[#0F0F0F]/10">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#0F0F0F]/45">
                    Transit Cost
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0F0F0F] mt-0.5">
                    From GHS 70
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#0F0F0F]/45">
                    Weight
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0F0F0F] mt-0.5">
                    Up to 5 kg
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="rounded-[20px] border border-[#0F0F0F]/12 bg-white/15 p-6 space-y-5">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Large
              </div>
              <div className="space-y-3 pt-1 border-t border-[#0F0F0F]/10">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#0F0F0F]/45">
                    Transit Cost
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0F0F0F] mt-0.5">
                    From GHS 110
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#0F0F0F]/45">
                    Weight
                  </div>
                  <div className="text-lg font-bold text-[#0F0F0F] leading-none mt-1">
                    ∞
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TRACK OR ESTIMATE RIGHT NOW (Matches "Find out the price right now — use our shipping cost calculator") */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          <div className="lg:col-span-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.15]">
              <span className="text-[#0F0F0F]">Track or estimate </span>
              <span className="text-[#0F0F0F] block">right now —</span>
              <span className="text-white block">live GPS map &amp;</span>
              <span className="text-white block">instant calculator</span>
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {/* Pill switcher */}
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#0F0F0F]/50 mb-2">
                Select Action
              </div>
              <div className="grid grid-cols-2 rounded-full border border-[#0F0F0F]/15 p-1 bg-white/20 max-w-md">
                <button
                  type="button"
                  onClick={() => setMode("track")}
                  className={`py-2 rounded-full text-xs font-semibold transition-all ${
                    mode === "track"
                      ? "bg-[#0F0F0F] text-white"
                      : "text-[#0F0F0F]/70 hover:text-[#0F0F0F]"
                  }`}
                >
                  Track Live Parcel
                </button>
                <button
                  type="button"
                  onClick={() => setMode("quote")}
                  className={`py-2 rounded-full text-xs font-semibold transition-all ${
                    mode === "quote"
                      ? "bg-[#0F0F0F] text-white"
                      : "text-[#0F0F0F]/70 hover:text-[#0F0F0F]"
                  }`}
                >
                  Cost Calculator
                </button>
              </div>
            </div>

            {mode === "track" ? (
              <form onSubmit={handleTrack} className="space-y-4 max-w-md">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#0F0F0F]/50 mb-1.5">
                    Booking ID
                  </div>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter ID (e.g. H21191059 or H314315796)"
                    className="w-full px-4 py-3 rounded-full bg-transparent border border-[#0F0F0F]/20 text-xs font-semibold text-[#0F0F0F] placeholder:text-[#0F0F0F]/40 focus:outline-none focus:border-[#0F0F0F]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-between gap-8 px-6 py-3 rounded-full bg-[#0F0F0F]/10 hover:bg-[#0F0F0F] hover:text-white border border-[#0F0F0F]/15 text-xs font-semibold transition-all"
                >
                  <span>Open Live Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#0F0F0F]/50 mb-1.5">
                      From
                    </div>
                    <select
                      value={fromCity}
                      onChange={(e) => {
                        setFromCity(e.target.value);
                        setToCity(e.target.value === "Accra" ? "Kumasi" : "Accra");
                      }}
                      className="w-full px-4 py-2.5 rounded-full bg-transparent border border-[#0F0F0F]/20 text-xs font-semibold text-[#0F0F0F] focus:outline-none"
                    >
                      <option value="Accra">Accra</option>
                      <option value="Kumasi">Kumasi</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#0F0F0F]/50 mb-1.5">
                      To
                    </div>
                    <select
                      value={toCity}
                      onChange={(e) => {
                        setToCity(e.target.value);
                        setFromCity(e.target.value === "Accra" ? "Kumasi" : "Accra");
                      }}
                      className="w-full px-4 py-2.5 rounded-full bg-transparent border border-[#0F0F0F]/20 text-xs font-semibold text-[#0F0F0F] focus:outline-none"
                    >
                      <option value="Kumasi">Kumasi</option>
                      <option value="Accra">Accra</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["small", "medium", "large"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setWeightTier(tier)}
                      className={`py-2 rounded-full text-xs font-semibold border capitalize transition-all ${
                        weightTier === tier
                          ? "bg-[#0F0F0F] text-white border-[#0F0F0F]"
                          : "border-[#0F0F0F]/20 text-[#0F0F0F]/70 hover:text-[#0F0F0F]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#0F0F0F]/50">
                      Estimated Total (Pickup + VIP + Delivery)
                    </div>
                    <div className="text-xl font-extrabold text-[#0F0F0F]">
                      GHS {estimatedTotal}.00
                    </div>
                  </div>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-[#0F0F0F] text-white text-xs font-semibold hover:bg-[#0F0F0F]/85 transition-all"
                  >
                    <span>Book on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. HOW IT WORKS — MINIMALIST ACCORDION (Matches Right Page of Reference Image) */}
        <section id="how-it-works" className="pt-4 scroll-mt-16">
          <div className="border-t border-[#0F0F0F]/15">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-[#0F0F0F]/15">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 flex items-center justify-between text-left gap-4 group"
                  >
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#0F0F0F] group-hover:opacity-75 transition-opacity">
                      {item.q}
                    </span>
                    <span className="text-[#0F0F0F]/70 shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-6 pr-8 text-xs sm:text-sm text-[#0F0F0F]/70 leading-relaxed max-w-2xl">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 5. STARK BLACK MINIMALIST FOOTER (Matches Bottom-Right of Cargo.Town Reference) */}
      <footer className="bg-[#0F0F0F] text-white py-14 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-10 text-xs">
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
              oura for
            </div>
            <ul className="space-y-2 text-white/80">
              <li>Accra ↔ Kumasi</li>
              <li>Personal Parcels</li>
              <li>E-Commerce Packages</li>
              <li>Same-Day VIP Transit</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
              Company
            </div>
            <ul className="space-y-2 text-white/80">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Track Parcel
                </Link>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp (+233 59 988 2827)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
              Terms &amp; Legal
            </div>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-white transition-colors">
                  Data Deletion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <div>© {new Date().getFullYear()} oura. All rights reserved.</div>
          <div>Accra · Kumasi</div>
        </div>
      </footer>
    </div>
  );
}
