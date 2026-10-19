import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-6">
        <Card className="p-8 bg-white border border-line shadow-card space-y-4 text-xs text-ink leading-relaxed">
          <h1 className="text-xl font-extrabold text-ink">oura Terms of Service</h1>
          <p className="text-muted">Effective Date: October 2026 • Domain: https://useoura.com</p>

          <h2 className="text-sm font-bold text-ink pt-2">1. Intercity Delivery Service</h2>
          <p>
            <strong>oura</strong> provides doorstep-to-doorstep and station-to-station parcel logistics between Accra and Kumasi via VIP Express bus corridors.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">2. Bookings & Mobile Money Payments</h2>
          <p>
            Quotes provided via useoura.com or the oura WhatsApp Bot are based on item weight and pickup/delivery zones. Dispatch is initiated upon verification of Mobile Money transfer using your unique Tracking ID as reference.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">3. Prohibited Items</h2>
          <p>
            Senders may not ship illegal goods, hazardous materials, or unsealed perishables.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">4. Support</h2>
          <p>
            For inquiries or claims, contact oura dispatch support at <strong>+233 24 814 7952</strong>.
          </p>
        </Card>
      </main>
    </div>
  );
}
