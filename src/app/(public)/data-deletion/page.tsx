import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-6">
        <Card className="p-8 bg-white border border-line shadow-card space-y-4 text-xs text-ink leading-relaxed">
          <h1 className="text-xl font-extrabold text-ink">oura User Data Deletion Instructions</h1>
          <p className="text-muted">Effective Date: October 2026 • Domain: https://useoura.com</p>

          <p>
            In compliance with Meta Platform Terms and Ghana Data Protection Act requirements, users of <strong>oura</strong> (via useoura.com or our WhatsApp Business Bot) can request complete deletion of their personal data, phone number, chat history, and delivery records at any time.
          </p>

          <h2 className="text-sm font-bold text-ink pt-2">How to Delete Your Data</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Option 1 (Instant via WhatsApp):</strong> Send the message <strong>DELETE MY DATA</strong> or <strong>STOP</strong> to our official WhatsApp Business number (<strong>+233 24 814 7952</strong>). Your session and associated records will be purged immediately.
            </li>
            <li>
              <strong>Option 2 (By Email / Phone):</strong> Contact our Data Protection Officer at <strong>ernestangmler144@gmail.com</strong> or call/SMS <strong>+233 24 814 7952</strong> with your phone number or Tracking ID, and all associated records will be permanently deleted within 24 hours.
            </li>
          </ol>

          <h2 className="text-sm font-bold text-ink pt-2">Data Protection Officer (DPO) Contact</h2>
          <div className="p-4 rounded-card bg-soft border border-line space-y-1 font-data">
            <div><strong>Name:</strong> Ernest Angmler</div>
            <div><strong>Email:</strong> ernestangmler144@gmail.com</div>
            <div><strong>Phone:</strong> +233 24 814 7952</div>
            <div><strong>Address:</strong> VIP Circle Terminal Desk, Ring Road Central, Accra, Ghana</div>
          </div>
        </Card>
      </main>
    </div>
  );
}
