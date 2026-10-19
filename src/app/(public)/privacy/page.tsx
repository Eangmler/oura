import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-6">
        <Card className="p-8 bg-white border border-line shadow-card space-y-4 text-xs text-ink leading-relaxed">
          <h1 className="text-xl font-extrabold text-ink">oura Privacy Policy</h1>
          <p className="text-muted">Effective Date: October 2026 • Domain: https://useoura.com</p>

          <h2 className="text-sm font-bold text-ink pt-2">1. Information We Collect</h2>
          <p>
            When you book or track an intercity parcel delivery with <strong>oura</strong> via our web application (useoura.com) or via WhatsApp Business Cloud API, we collect your name, phone number, pickup address, destination address, and parcel description solely to fulfill your delivery between Accra and Kumasi.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">2. How We Use WhatsApp & Location Data</h2>
          <p>
            We use your phone number to send automated WhatsApp booking confirmations, Mobile Money payment instructions, and real-time transit status notifications. Location telemetry from our hardware trackers is used strictly to track parcels in transit on intercity coaches.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">3. Data Sharing & Security</h2>
          <p>
            We do not sell or rent your personal data to third parties. Delivery details are shared only with authorized oura station representatives and dispatch riders handling your shipment.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">4. Contact & Data Deletion Requests</h2>
          <p>
            To request deletion of your booking history or contact information, reply <strong>STOP</strong> on WhatsApp or contact our operations desk at <strong>+233 24 814 7952</strong> (Ernest Angmler).
          </p>
        </Card>
      </main>
    </div>
  );
}
