"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TrackSearchPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/track/${searchId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <Card className="p-8 space-y-6 bg-white border border-line shadow-card text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-ink tracking-tight">Track Your Delivery</h1>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Monitor your package's live location and status along the Accra-Kumasi VIP highway corridor.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Tracking ID (e.g. H314315796)"
                className="w-full pl-11 pr-4 py-3.5 bg-soft border border-line rounded-card text-sm font-data font-bold tracking-wider text-ink focus:outline-none focus:border-accent uppercase text-center"
              />
            </div>

            <Button type="submit" size="lg" className="w-full shadow-md">
              Track Live Parcel <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="pt-4 border-t border-line text-xs text-muted">
            <span>Sample live shipment ID: </span>
            <button
              onClick={() => router.push("/track/H314315796")}
              className="font-bold text-accent font-data hover:underline"
            >
              H314315796
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
}
