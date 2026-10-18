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
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { estimateWeightFromDescription } from "@/lib/pricing/engine";
import { BottomNav } from "@/components/ui/bottom-nav";

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
    <main className="min-h-screen bg-paper pb-32">
      {/* Top Header */}
      <div className="px-5 pt-4 pb-2 max-w-md mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center text-ink shadow-subtle hover:bg-soft"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <div className="text-xs font-bold text-ink">oura</div>
          <div className="text-[11px] text-muted">New Delivery Order</div>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-md mx-auto px-5 pt-3 space-y-5">
        {/* Step Progress Bar */}
        <div className="bg-white p-3 rounded-card border border-line/60 shadow-subtle flex items-center justify-between text-xs">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  step === s
                    ? "bg-accent text-white"
                    : step > s
                    ? "bg-ink text-white"
                    : "bg-soft text-muted"
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s}
              </div>
              {s < 5 && <div className="w-4 sm:w-8 h-0.5 bg-line" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Origin */}
        {step === 1 && (
          <Card className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-ink">Where are we picking up from?</h2>
              <p className="text-xs text-muted mt-0.5">Select origin city and specify pickup address.</p>
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
                  className={`p-3.5 rounded-card border text-left font-medium text-xs transition-all flex flex-col justify-between h-20 ${
                    originCity === city
                      ? "border-accent bg-accent/5 text-ink shadow-sm"
                      : "border-line bg-white text-muted hover:border-ink/20"
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${originCity === city ? "text-accent" : "text-muted"}`} />
                  <div>
                    <div className="font-bold text-sm text-ink">{city}</div>
                    <div className="text-[10px] text-muted">VIP Station Route</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-ink">Home / Office Pickup Address</label>
              <input
                type="text"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                placeholder="e.g. 14 Cantonments Road / East Legon near Shell"
                className="w-full px-3.5 py-3 rounded-card border border-line bg-soft/50 text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => {
                if (!originAddress) setOriginAddress(`${originCity} Central`);
                setStep(2);
              }}
            >
              Continue to Destination <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Card>
        )}

        {/* STEP 2: Destination */}
        {step === 2 && (
          <Card className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-ink">Where should we deliver?</h2>
              <p className="text-xs text-muted mt-0.5">Delivery city and recipient's doorstep location.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Kumasi", "Accra"].map((city) => (
                <button
                  key={city}
                  type="button"
                  disabled={city === originCity}
                  onClick={() => setDestinationCity(city)}
                  className={`p-3.5 rounded-card border text-left font-medium text-xs transition-all flex flex-col justify-between h-20 ${
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
                    <div className="text-[10px] text-muted">Doorstep VIP Courier</div>
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
                placeholder="e.g. Ahodwo Roundabout, Kumasi / KNUST Gate"
                className="w-full px-3.5 py-3 rounded-card border border-line bg-soft/50 text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-2"
                onClick={() => {
                  if (!destinationAddress) setDestinationAddress(`${destinationCity} Central`);
                  setStep(3);
                }}
              >
                Package Details <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Item Description & AI Weight Tier */}
        {step === 3 && (
          <Card className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-ink">What are you sending?</h2>
              <p className="text-xs text-muted mt-0.5">Describe the item — our smart engine calculates the tier.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Item Description</label>
              <input
                type="text"
                value={itemDescription}
                onChange={handleDescriptionChange}
                placeholder="e.g. Mac Mini M4 Pro, clothes bag, shoe box, documents..."
                className="w-full px-3.5 py-3 rounded-card border border-line bg-soft/50 text-xs text-ink focus:outline-none focus:border-accent font-data"
              />
            </div>

            {/* AI Estimation Badge */}
            {itemDescription.length > 2 && (
              <div className="p-3 rounded-card bg-accent/10 border border-accent/20 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <div className="text-[11px] text-ink leading-tight">
                  <span className="font-semibold text-accent uppercase">AI Estimated Tier: </span>
                  {weightCategory.toUpperCase()} (~{customKg} kg)
                </div>
              </div>
            )}

            {/* Tier Buttons */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-ink">Confirm Size / Weight Tier</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "small", label: "Small (< 1kg)", desc: "Docs, phone, perfume", fee: "GHS 45" },
                  { id: "medium", label: "Medium (1-5kg)", desc: "Laptop, shoe box", fee: "GHS 70" },
                  { id: "large", label: "Large (5-20kg)", desc: "Carton, speaker", fee: "GHS 110" },
                  { id: "oversized", label: "Oversized (20kg+)", desc: "Machine, bulky", fee: "GHS 160" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setWeightCategory(tier.id as any)}
                    className={`p-3 rounded-card border text-left transition-all ${
                      weightCategory === tier.id
                        ? "border-accent bg-accent/5 text-ink shadow-sm"
                        : "border-line bg-white text-muted hover:border-ink/20"
                    }`}
                  >
                    <div className="text-xs font-bold text-ink">{tier.label}</div>
                    <div className="text-[10px] text-muted truncate">{tier.desc}</div>
                    <div className="text-xs font-semibold text-accent mt-1">{tier.fee}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-2"
                onClick={() => {
                  if (!itemDescription) setItemDescription("Standard Package");
                  setStep(4);
                }}
              >
                Review Quote <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: Review Quote & Contact Info */}
        {step === 4 && (
          <Card className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-ink">Review Quote & Contact Details</h2>
              <p className="text-xs text-muted mt-0.5">Zero hidden charges. Doorstep pickup to doorstep delivery.</p>
            </div>

            {/* Price Breakdown Card */}
            <div className="p-4 rounded-card bg-ink text-white space-y-2.5">
              <div className="text-xs text-white/70 flex justify-between">
                <span>Local Pickup ({originCity} home)</span>
                <span className="font-data font-semibold">GHS {pickupFee}.00</span>
              </div>
              <div className="text-xs text-white/70 flex justify-between">
                <span>VIP Transit ({originCity} ➔ {destinationCity})</span>
                <span className="font-data font-semibold">GHS {transitFee}.00</span>
              </div>
              <div className="text-xs text-white/70 flex justify-between">
                <span>Doorstep Drop-off ({destinationCity})</span>
                <span className="font-data font-semibold">GHS {deliveryFee}.00</span>
              </div>
              <div className="pt-2 border-t border-white/20 flex justify-between items-center">
                <span className="text-sm font-bold">Total Delivery Cost</span>
                <span className="text-lg font-bold text-accent font-data">GHS {totalCost}.00</span>
              </div>
            </div>

            {/* Sender & Recipient fields */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-ink">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink">Sender Phone (MoMo)</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="024XXXXXXX"
                    className="w-full px-3 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink font-data"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-ink">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full px-3 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink">Recipient Phone</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="020XXXXXXX"
                    className="w-full px-3 py-2.5 rounded-card border border-line bg-soft/50 text-xs text-ink font-data"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-2"
                disabled={submitting}
                onClick={handleConfirmBooking}
              >
                {submitting ? "Generating Order..." : "Confirm & Get MoMo Details"}
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: MoMo Payment Instructions & Tracking ID (Like Accrue) */}
        {step === 5 && (
          <Card className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-status-green-bg text-status-green flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-ink">Order Generated!</h2>
              <p className="text-xs text-muted">Complete payment to dispatch your courier.</p>
            </div>

            {/* Prominent Tracking ID Card */}
            <div className="p-4 rounded-card bg-soft border border-line flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">Tracking Reference ID</div>
                <div className="text-lg font-bold font-data text-ink tracking-tight mt-0.5">
                  {createdTrackingId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(createdTrackingId, "tracking_id")}
                className="p-2 rounded-lg bg-white border border-line text-ink hover:bg-soft shadow-subtle flex items-center gap-1 text-xs font-semibold"
              >
                {copiedField === "tracking_id" ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "tracking_id" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Dark MoMo Instructions Box (Accrue Style) */}
            <div className="p-4.5 rounded-card bg-ink text-white space-y-3.5">
              <div className="flex items-center gap-2 text-accent text-xs font-bold">
                <CreditCard className="w-4 h-4" />
                <span>MTN Mobile Money Payment</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-white/60">Pay Amount</span>
                  <span className="font-bold font-data text-accent text-sm">GHS {totalCost}.00</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-white/60">MoMo Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-data">{momoNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(momoNumber, "momo_num")}
                      className="text-[10px] text-accent underline"
                    >
                      {copiedField === "momo_num" ? "copied" : "copy"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-white/60">Account Name</span>
                  <span className="font-bold">{momoName}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-white/60">Reference Code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-data text-accent">{createdTrackingId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdTrackingId, "ref")}
                      className="text-[10px] text-accent underline"
                    >
                      {copiedField === "ref" ? "copied" : "copy"}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-white/70 italic bg-white/10 p-2.5 rounded-lg leading-relaxed">
                Important: Enter the Tracking ID <strong className="text-white">{createdTrackingId}</strong> as the MoMo reference so your payment is automatically verified.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                className="w-full"
                onClick={() => router.push(`/track/${createdTrackingId}`)}
              >
                Track Live Shipment <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Link
                href="/"
                className="block text-center text-xs text-muted hover:text-ink font-medium py-1"
              >
                Return to Home
              </Link>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
