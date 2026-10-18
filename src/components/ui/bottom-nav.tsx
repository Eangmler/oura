"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, MapPin, UserCheck, Shield } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isShipments = pathname === "/track";
  const isTrack = pathname.startsWith("/track/");
  const isRep = pathname.startsWith("/rep");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-ink text-white/70 px-5 py-2.5 rounded-pill shadow-float flex items-center justify-between gap-5 sm:gap-8 pointer-events-auto border border-white/10 backdrop-blur-md">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center transition-colors ${
            isHome ? "text-white" : "hover:text-white/90"
          }`}
        >
          <div className={`p-1.5 rounded-full ${isHome ? "bg-white/15" : ""}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Home</span>
        </Link>

        {/* Rep Terminal (Quick access) */}
        <Link
          href="/rep"
          className={`flex flex-col items-center transition-colors ${
            isRep ? "text-white" : "hover:text-white/90"
          }`}
        >
          <div className={`p-1.5 rounded-full ${isRep ? "bg-white/15" : ""}`}>
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Rep</span>
        </Link>

        {/* Center + FAB for New Booking */}
        <Link
          href="/book"
          className="relative -top-5 flex items-center justify-center w-13 h-13 rounded-full bg-accent text-white shadow-lg shadow-accent/40 hover:scale-105 active:scale-95 transition-transform border-4 border-paper"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </Link>

        {/* Tracking */}
        <Link
          href="/track"
          className={`flex flex-col items-center transition-colors ${
            isShipments || isTrack ? "text-white" : "hover:text-white/90"
          }`}
        >
          <div className={`p-1.5 rounded-full ${isShipments || isTrack ? "bg-white/15" : ""}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Track</span>
        </Link>

        {/* Admin Settings */}
        <Link
          href="/admin"
          className={`flex flex-col items-center transition-colors ${
            isAdmin ? "text-white" : "hover:text-white/90"
          }`}
        >
          <div className={`p-1.5 rounded-full ${isAdmin ? "bg-white/15" : ""}`}>
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Admin</span>
        </Link>
      </div>
    </div>
  );
};
