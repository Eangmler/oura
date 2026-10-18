"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/ui/bottom-nav";

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
    <main className="min-h-screen bg-paper pb-32">
      <div className="px-5 pt-4 pb-2 max-w-md mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center text-ink shadow-subtle hover:bg-soft"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <div className="text-xs font-bold text-ink">oura</div>
          <div className="text-[11px] text-muted">Track Live Parcel</div>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-md mx-auto px-5 pt-6 space-y-5">
        <Card className="space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h1 className="text-base font-bold text-ink">Enter Tracking ID</h1>
            <p className="text-xs text-muted">
              Find your package's live location along the Accra-Kumasi highway.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. H314315796"
                className="w-full pl-10 pr-4 py-3 bg-soft border border-line rounded-card text-sm font-data font-bold tracking-wider text-ink focus:outline-none focus:border-accent uppercase"
              />
            </div>

            <Button type="submit" className="w-full">
              Track Parcel <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-3 border-t border-line text-center">
            <span className="text-[11px] text-muted">Try sample tracking ID: </span>
            <button
              onClick={() => router.push("/track/H314315796")}
              className="text-xs font-bold text-accent font-data hover:underline"
            >
              H314315796
            </button>
          </div>
        </Card>
      </div>

      <BottomNav />
    </main>
  );
}
