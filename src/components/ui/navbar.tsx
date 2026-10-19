"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, Shield, Package } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/233599882827?text=Hi";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRep = pathname.startsWith("/rep");
  const isAdmin = pathname.startsWith("/admin");
  const isTrack = pathname.startsWith("/track");

  return (
    <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-line/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/icon-192.png"
            alt="oura"
            className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform border border-line"
          />
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-ink">oura</span>
            {(isAdmin || isRep) && (
              <span className="text-[10px] bg-ink text-white font-bold px-2.5 py-0.5 rounded-pill uppercase tracking-wider">
                {isAdmin ? "Admin Console" : "Rep Portal"}
              </span>
            )}
          </div>
        </Link>

        {/* Center Navigation Links (Public Website) */}
        {!isAdmin && !isRep ? (
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted">
            <a href="/#features" className="hover:text-ink transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-ink transition-colors">
              How it Works
            </a>
            <a href="/#security" className="hover:text-ink transition-colors">
              Live GPS Security
            </a>
            <Link
              href="/track"
              className={`transition-colors ${
                isTrack ? "text-accent font-bold" : "hover:text-ink"
              }`}
            >
              Track Parcel
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-status-green-bg text-status-green font-bold">
              <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
              WhatsApp Live Sync (+233 59 988 2827)
            </span>
          </div>
        )}

        {/* Right Primary CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {isAdmin || isRep ? (
            <Link
              href="/"
              className="px-4 py-2 rounded-pill text-xs font-bold border border-line bg-white text-ink hover:bg-soft transition-colors"
            >
              Public Website
            </Link>
          ) : (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-[#25D366] hover:bg-[#20bd5a] text-ink font-extrabold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-ink/10" />
              <span>Get Started</span>
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          {!isAdmin && !isRep && (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#25D366] text-ink rounded-pill text-xs font-extrabold flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          )}
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
        <div className="sm:hidden border-t border-line bg-white px-5 py-4 space-y-3">
          <div className="flex flex-col gap-2 text-sm font-semibold">
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              How it Works
            </a>
            <a
              href="/#security"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              Live GPS Security
            </a>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-ink hover:text-accent"
            >
              Track Parcel
            </Link>
          </div>
          <div className="pt-2 border-t border-line">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-pill bg-[#25D366] text-ink text-center text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start a chat with oura on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
