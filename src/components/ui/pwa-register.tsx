"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export const PwaRegister = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[oura PWA] Service worker registered:", reg.scope))
        .catch((err) => console.warn("[oura PWA] SW registration failed:", err));
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt if not previously dismissed
      const dismissed = localStorage.getItem("oura_pwa_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[oura PWA] Install outcome:", outcome);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("oura_pwa_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-3 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-ink text-white p-3.5 rounded-card shadow-float border border-white/10 flex items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
            oura
          </div>
          <div className="text-xs">
            <div className="font-bold text-white leading-tight">Install oura App</div>
            <div className="text-[10px] text-white/60 leading-tight mt-0.5">
              Add to home screen for instant tracking
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[11px] font-bold rounded-pill shadow-sm transition-all flex items-center gap-1"
          >
            <Download className="w-3 h-3 stroke-[2.5]" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-white/50 hover:text-white rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
