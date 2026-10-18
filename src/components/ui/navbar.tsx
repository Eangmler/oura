"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, MapPin, Shield, Menu, X, ArrowRight } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRep = pathname.startsWith("/rep");
  const isAdmin = pathname.startsWith("/admin");
  const isBook = pathname.startsWith("/book");
  const isTrack = pathname.startsWith("/track");
  const isWhatsApp = pathname.startsWith("/whatsapp");

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-line/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/icon-192.png"
            alt="oura"
            className="w-8 h-8 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform border border-line"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold tracking-tight text-ink">oura</span>
            <span className="hidden sm:inline-block text-[10px] bg-accent/15 text-accent font-semibold px-2 py-0.5 rounded-pill">
              accra ↔ kumasi VIP
            </span>
          </div>
        </Link>

        {/* Center Links (Tablet & Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-soft/80 p-1 rounded-pill border border-line/60 text-xs font-semibold">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-pill transition-all ${
              pathname === "/" ? "bg-white text-ink shadow-sm font-bold" : "text-muted hover:text-ink"
            }`}
          >
            Home
          </Link>
          <Link
            href="/book"
            className={`px-4 py-1.5 rounded-pill transition-all ${
              isBook ? "bg-white text-ink shadow-sm font-bold" : "text-muted hover:text-ink"
            }`}
          >
            Book Delivery
          </Link>
          <Link
            href="/track"
            className={`px-4 py-1.5 rounded-pill transition-all ${
              isTrack ? "bg-white text-ink shadow-sm font-bold" : "text-muted hover:text-ink"
            }`}
          >
            Track Parcel
          </Link>
          <Link
            href="/whatsapp"
            className={`px-4 py-1.5 rounded-pill transition-all flex items-center gap-1.5 ${
              isWhatsApp
                ? "bg-[#25D366] text-ink shadow-sm font-extrabold"
                : "text-status-green hover:text-ink"
            }`}
          >
            <span>💬 WhatsApp Bot</span>
          </Link>
        </div>

        {/* Right Portal Switcher (Clean, distinct 3 apps) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/rep"
            className={`px-3 py-1.5 rounded-pill text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRep
                ? "bg-ink text-white shadow-sm"
                : "text-muted hover:text-ink hover:bg-soft"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Rep Portal</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3.5 py-1.5 rounded-pill text-xs font-bold flex items-center gap-1.5 transition-all ${
              isAdmin
                ? "bg-accent text-white shadow-sm"
                : "border border-line hover:border-ink/20 text-ink bg-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/whatsapp"
            className="px-3 py-1.5 bg-[#25D366]/20 text-status-green rounded-pill text-xs font-extrabold"
          >
            💬 Bot
          </Link>
          <Link
            href="/book"
            className="px-3 py-1.5 bg-accent text-white rounded-pill text-xs font-bold"
          >
            Book
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-ink hover:bg-soft"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-line bg-white px-5 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1 text-sm font-semibold">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              Home
            </Link>
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              Book Delivery
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              Track Package
            </Link>
            <Link
              href="/whatsapp"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-status-green font-bold hover:text-accent"
            >
              💬 WhatsApp Bot & Notifications
            </Link>
          </div>

          <div className="pt-3 border-t border-line grid grid-cols-2 gap-2">
            <Link
              href="/rep"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-card bg-soft text-ink text-center text-xs font-bold"
            >
              Rep Portal
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-card bg-ink text-white text-center text-xs font-bold"
            >
              Admin Console
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
