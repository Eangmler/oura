"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  Sparkles,
  Check,
  Copy,
  CreditCard,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { estimateWeightFromDescription } from "@/lib/pricing/engine";

export default function BookDeliveryPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [originCity, setOriginCity] = useState("Accra");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationCity, setDestinationCity] = useState("Kumasi");
  const [destinationAddress, setDestinationAddress] = useState("");

  const [itemDescription, setItemDescription] = useState("");
  const [weightCategory, setWeightCategory] = useState<"small" | "medium" | "large" | "oversized">("medium");
  const [customKg, setCustomKg] = useState<number>(3.5);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const [createdTrackingId, setCreatedTrackingId] = useState("");
  const [momoNumber, setMomoNumber] = useState("0248147952");
  const [momoName, setMomoName] = useState("Ernest Angmler");
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Pricing calculations
  const transitFee = weightCategory === "small" ? 45 : weightCategory === "medium" ? 70 : weightCategory === "large" ? 110 : 160;
  const pickupFee = 30;
  const deliveryFee = 20;
  const totalCost = pickupFee + transitFee + deliveryFee;

  // Real-time AI description auto-suggestion
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setItemDescription(val);
    if (val.length > 3) {
      const estimate = estimateWeightFromDescription(val);
      setWeightCategory(estimate.category);
      setCustomKg(estimate.estimated_kg);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_city: originCity,
          origin_address: originAddress || `${originCity} Central`,
          destination_city: destinationCity,
          destination_address: destinationAddress || `${destinationCity} Central`,
          item_description: itemDescription || "Standard Box Package",
          quantity: 1,
          weight_category: weightCategory,
          weight_kg: customKg,
          sender_name: senderName || "Client Sender",
          sender_phone: senderPhone || "0240000000",
          recipient_name: recipientName || "Client Recipient",
          recipient_phone: recipientPhone || "0240000000",
          pricing: {
            pickup_fee: pickupFee,
            transit_fee: transitFee,
            delivery_fee: deliveryFee,
            total: totalCost,
          },
          currency: "GHS",
        }),
      });
      const data = await res.json();
      if (data.shipment) {
        setCreatedTrackingId(data.shipment.tracking_id);
        if (data.settings) {
          if (data.settings.momo_number) setMomoNumber(data.settings.momo_number);
          if (data.settings.momo_name) setMomoName(data.settings.momo_name);
        }
        setStep(5);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit shipment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* Step Progress Bar */}
        <div className="bg-white p-4 rounded-card border border-line shadow-subtle flex items-center justify-between text-xs max-w-2xl mx-auto">
          {[
            { s: 1, label: "Origin" },
            { s: 2, label: "Destination" },
            { s: 3, label: "Package" },
            { s: 4, label: "Quote & Contact" },
            { s: 5, label: "Payment" },
          ].map(({ s, label }, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-accent text-white shadow-sm"
                    : step > s
                    ? "bg-ink text-white"
                    : "bg-soft text-muted"
                }`}
              >
                {step > s ? <Check className="w-4 h-4 stroke-[3]" /> : s}
              </div>
              <span className={`hidden md:inline font-semibold ${step === s ? "text-ink" : "text-muted"}`}>
                {label}
              </span>
              {i < 4 && <div className="w-4 sm:w-8 h-0.5 bg-line" />}
            </div>
          ))}
        </div>

        {/* 2-Column Responsive Layout on Desktop/Tablet */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Main Wizard Form (7 cols) */}
          <div className="lg:col-span-7">
            {/* STEP 1: Origin */}
            {step === 1 && (
              <Card className="p-6 space-y-5 bg-white border border-line shadow-card">
                <div>
                  <h2 className="text-base font-bold text-ink">Step 1: Origin Location</h2>
                  <p className="text-xs text-muted mt-0.5">Where should our courier pick up your parcel?</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["Accra", "Kumasi"].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setOriginCity(city);
                        if (destinationCity === city) {
                          setDestinationCity(city === "Accra" ? "Kumasi" : "Accra");
                        }
                      }}
                      className={`p-4 rounded-card border text-left font-medium text-xs transition-all flex flex-col justify-between h-24 ${
                        originCity === city
                          ? "border-accent bg-accent/5 text-ink shadow-sm"
                          : "border-line bg-white text-muted hover:border-ink/20"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${originCity === city ? "text-accent" : "text-muted"}`} />
                      <div>
                        <div className="font-bold text-sm text-ink">{city}</div>
                        <div className="text-[10px] text-muted">VIP Station Corridor</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-ink">Home / Office Pickup Street Address</label>
                  <input
                    type="text"
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                    placeholder="e.g. 14 Cantonments Road / East Legon near Shell"
                    className="w-full px-4 py-3 rounded-card border border-line bg-soft/50 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => {
                    if (!originAddress) setOriginAddress(`${originCity} Central`);
                    setStep(2);
                  }}
                >
                  Continue to Destination <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            )}

            {/* STEP 2: Destination */}
            {step === 2 && (
              <Card className="p-6 space-y-5 bg-white border border-line shadow-card">
                <div>
                  <h2 className="text-base font-bold text-ink">Step 2: Destination Hub</h2>
                  <p className="text-xs text-muted mt-0.5">Where is the receiving customer located?</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["Kumasi", "Accra"].map((city) => (
                    <button
                      key={city}
                      type="button"
                      disabled={city === originCity}
                      onClick={() => setDestinationCity(city)}
                      className={`p-4 rounded-card border text-left font-medium text-xs transition-all flex flex-col justify-between h-24 ${
                        destinationCity === city
                          ? "border-accent bg-accent/5 text-ink shadow-sm"
                          : city === originCity
                          ? "opacity-40 border-line bg-soft cursor-not-allowed"
                          : "border-line bg-white text-muted hover:border-ink/20"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${destinationCity === city ? "text-accent" : "text-muted"}`} />
                      <div>
                        <div className="font-bold text-sm text-ink">{city}</div>
                        <div className="text-[10px] text-muted">Doorstep Courier Delivery</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-ink">Drop-off Street / Area Address</label>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder="e.g. Ahodwo Roundabout, Kumasi / KNUST Main Gate"
                    className="w-full px-4 py-3 rounded-card border border-line bg-soft/50 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="flex-2"
                    onClick={() => {
                      if (!destinationAddress) setDestinationAddress(`${destinationCity} Central`);
                      setStep(3);
                    }}
                  >
                    Package Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 3: Package Details & AI Weight Tier */}
            {step === 3 && (
              <Card className="p-6 space-y-5 bg-white border border-line shadow-card">
                <div>
                  <h2 className="text-base font-bold text-ink">Step 3: What are you sending?</h2>
                  <p className="text-xs text-muted mt-0.5">Describe the item — our smart engine calculates the tier.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Item Description</label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={handleDescriptionChange}
                    placeholder="e.g. Mac Mini M4 Pro, shoe box, documents, bag of clothes..."
                    className="w-full px-4 py-3 rounded-card border border-line bg-soft/50 text-xs text-ink focus:outline-none focus:border-accent font-data"
                  />
                </div>

                {itemDescription.length > 2 && (
                  <div className="p-3.5 rounded-card bg-accent/10 border border-accent/20 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <div className="text-xs text-ink leading-tight">
                      <span className="font-bold text-accent uppercase">AI Estimated Tier: </span>
                      {weightCategory.toUpperCase()} (~{customKg} kg)
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-ink">Select or Confirm Size Tier</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "small", label: "Small (< 1kg)", desc: "Docs, phone, perfume", fee: "GHS 45" },
                      { id: "medium", label: "Medium (1-5kg)", desc: "Laptop, shoe box", fee: "GHS 70" },
                      { id: "large", label: "Large (5-20kg)", desc: "Carton, speaker", fee: "GHS 110" },
                      { id: "oversized", label: "Oversized (20kg+)", desc: "Machine, bulky cargo", fee: "GHS 160" },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setWeightCategory(tier.id as any)}
                        className={`p-3.5 rounded-card border text-left transition-all ${
                          weightCategory === tier.id
                            ? "border-accent bg-accent/5 text-ink shadow-sm"
                            : "border-line bg-white text-muted hover:border-ink/20"
                        }`}
                      >
                        <div className="text-xs font-bold text-ink">{tier.label}</div>
                        <div className="text-[10px] text-muted truncate">{tier.desc}</div>
                        <div className="text-xs font-bold text-accent mt-1">{tier.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="lg" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="flex-2"
                    onClick={() => {
                      if (!itemDescription) setItemDescription("Standard Parcel");
                      setStep(4);
                    }}
                  >
                    Review Quote <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 4: Review Quote & Contact Details */}
            {step === 4 && (
              <Card className="p-6 space-y-5 bg-white border border-line shadow-card">
                <div>
                  <h2 className="text-base font-bold text-ink">Step 4: Contact Details & Confirmation</h2>
                  <p className="text-xs text-muted mt-0.5">Please provide phone numbers for pickup and delivery.</p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-ink">Sender Full Name</label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink">Sender Phone (MoMo)</label>
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="024XXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink font-data"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-ink">Recipient Name</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Recipient's name"
                        className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink">Recipient Phone</label>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="020XXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink font-data"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button variant="outline" size="lg" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="flex-2"
                    disabled={submitting}
                    onClick={handleConfirmBooking}
                  >
                    {submitting ? "Generating Order..." : "Confirm & Get Payment Details"}
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 5: Accrue-style Payment Instructions */}
            {step === 5 && (
              <Card className="p-6 space-y-5 bg-white border border-line shadow-card text-center">
                <div className="w-14 h-14 rounded-full bg-status-green-bg text-status-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-ink">Booking Confirmed!</h2>
                  <p className="text-xs text-muted mt-1">Complete your Mobile Money transfer to dispatch your courier.</p>
                </div>

                {/* Tracking Reference ID Pill */}
                <div className="p-4 rounded-card bg-soft border border-line flex items-center justify-between text-left">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Tracking Reference ID</div>
                    <div className="text-lg font-extrabold font-data text-ink tracking-tight mt-0.5">
                      {createdTrackingId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdTrackingId, "tracking_id")}
                    className="px-3 py-1.5 rounded-lg bg-white border border-line text-ink hover:bg-soft shadow-subtle flex items-center gap-1.5 text-xs font-bold"
                  >
                    {copiedField === "tracking_id" ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "tracking_id" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Dark MoMo Details Box */}
                <div className="p-5 rounded-card bg-ink text-white text-left space-y-3">
                  <div className="flex items-center gap-2 text-accent text-xs font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>MTN Mobile Money Payment Instructions</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                      <span className="text-white/60">Pay Amount</span>
                      <span className="font-bold font-data text-accent text-base">GHS {totalCost}.00</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                      <span className="text-white/60">MoMo Phone</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-data">{momoNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(momoNumber, "momo_num")}
                          className="text-[11px] text-accent underline"
                        >
                          {copiedField === "momo_num" ? "copied" : "copy"}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                      <span className="text-white/60">Account Name</span>
                      <span className="font-bold">{momoName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-white/60">Reference Code</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-data text-accent">{createdTrackingId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(createdTrackingId, "ref")}
                          className="text-[11px] text-accent underline"
                        >
                          {copiedField === "ref" ? "copied" : "copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/70 italic bg-white/10 p-3 rounded-lg leading-relaxed">
                    Note: Enter <strong className="text-white">{createdTrackingId}</strong> as your MoMo reference so your payment is automatically verified.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => router.push(`/track/${createdTrackingId}`)}
                  >
                    Open Live Tracking View <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Live Order Summary Card (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-white border border-line shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line/60">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Order Summary</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent font-data">
                  Accra ↔ Kumasi VIP
                </span>
              </div>

              {/* Route Display */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-ink mt-1 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Pickup Origin</div>
                    <div className="font-semibold text-ink">
                      {originCity} ({originAddress || "Doorstep Address"})
                    </div>
                  </div>
                </div>

                <div className="ml-1 w-0.5 h-5 bg-dashed border-l border-line" />

                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Destination Hub</div>
                    <div className="font-semibold text-ink">
                      {destinationCity} ({destinationAddress || "Doorstep Drop-off"})
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-card bg-soft space-y-2 text-xs font-data">
                <div className="flex justify-between text-muted">
                  <span>Local Pickup Fee</span>
                  <span className="font-semibold text-ink">GHS {pickupFee}.00</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>VIP Transit Fee ({weightCategory})</span>
                  <span className="font-semibold text-ink">GHS {transitFee}.00</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Destination Drop-off</span>
                  <span className="font-semibold text-ink">GHS {deliveryFee}.00</span>
                </div>
                <div className="pt-2 border-t border-line flex justify-between items-center text-sm">
                  <span className="font-bold text-ink">Total Estimate</span>
                  <span className="font-extrabold text-accent text-base">GHS {totalCost}.00</span>
                </div>
              </div>

              {/* Value assurances */}
              <div className="space-y-2 pt-2 text-[11px] text-muted">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span>Hardware GPS tracked intercity trip</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>Estimated delivery within 24 hours</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
