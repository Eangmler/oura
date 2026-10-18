# oura — Intercity Delivery Platform

> **oura** (always lowercase) is a lightweight, zero-budget-first intercity delivery application connecting local dispatch in Accra and Kumasi via VIP bus transit with physical hardware and Google Find My tracking.

---

## 📱 What is Built & Included

1. **Customer Demand & Booking App (`/` and `/book`)**
   - Matches the design reference: Warm `#F6F4F1` surface, dark `#0F0F0F` ink, vibrant `#E85D26` orange accents, card radius `14px`, pill-shaped elements.
   - Interactive 5-step booking wizard with smart **AI Perceived Weight Tier estimation** (Small <1kg, Medium 1-5kg, Large 5-20kg, Oversized 20kg+).
   - Accrue-style manual **MTN Mobile Money Payment Instructions** with unique Tracking Reference ID.
   - Direct redirect to live tracking.

2. **Location Tracking Screen (`/track/[id]`)**
   - Matches the design reference screenshot:
     - Upper viewport: Route highway path from Accra to Kumasi with live pulsating GPS waypoint pin.
     - Lower sliding drawer (`#0F0F0F` dark theme): Booking ID (`H314315796`), Status badge (`Transit`), 4-node status stepper, origin/destination timestamps, detail grid (Customer, Order Cost, Quantity, Weight), visual 3D box graphic, and courier card with instant Call and WhatsApp chat buttons.

3. **Terminal Rep Mobile Dashboard (`/rep`)**
   - Mobile-optimized for station reps at VIP Circle (Accra) and VIP Asafo (Kumasi).
   - Authenticated with phone number + 4-digit PIN (seeded: `0240000001` / PIN: `1234`).
   - One-tap status transitions: `Received at VIP` ➔ `In Transit` ➔ `Arrived` ➔ `Delivered`.
   - Hardware Tracker ID / Google Find My tag assignment.
   - Quick "Order Uber" or "Ernest Car Pickup" orchestration.
   - Walk-in parcel quick-logging modal.

4. **Master Admin Operations & Settings Console (`/admin`)**
   - Authenticated with master PIN (Default: `1234` or `oura2025`).
   - KPI metrics: Total Parcels, Verified MoMo Revenue, In Transit on Highway, Pending Confirmations.
   - One-click MoMo Payment Verification for pending orders.
   - **No-Code Admin Settings Panel**:
     - Change MoMo Number (`0248147952`) & Account Name (`Ernest Angmler`) on the fly.
     - Custom payment SMS template.
     - Route rate tables (Small, Medium, Large, Oversized) and zone pickup/delivery charges.
     - Add/Deactivate Terminal Reps and reset security PINs.
     - WhatsApp Cloud API toggle and token configuration.

5. **WhatsApp Bot Conversational State Machine (`src/lib/whatsapp/bot.ts`)**
   - Complete state machine handling: Greeting ➔ Accra pickup address ➔ Kumasi dropoff address ➔ Item description ➔ Instant price quote ➔ Order generation ➔ MoMo instructions ➔ Live tracking link.
   - Webhook route: `/api/webhook/whatsapp`.

6. **Hardware GPS Ingestion Service & Test (`backend/src/ingestion.js`)**
   - TCP listener (port 5001) for commercial GSM/GPS tracker strings (`DEVICE_ID,LAT,LNG,SPEED,TIMESTAMP`).
   - HTTP ingestion webhook (port 5002) for cloud tracker webhooks (Ruhavik, Traccar, Google Find My).
   - Rapid in-memory coordinate cache for 0ms frontend map polling.
   - Terminal verification script: `backend/scripts/simulate-gps.js` (passes 4/4 tests).

---

## 🚀 Running the App Locally

Ensure your Node environment is loaded:
```bash
export PATH="/Users/ernestangmler/.gemini/antigravity/scratch/bin:$PATH"
cd /Users/ernestangmler/.gemini/antigravity/scratch/oura
```

### 1. Start the Next.js Web App
```bash
npm run dev
# or for production:
npm run build && npm start
```
Visit:
- Home & Customer: `http://localhost:3000`
- Book Parcel: `http://localhost:3000/book`
- Tracking: `http://localhost:3000/track/H314315796`
- Terminal Rep: `http://localhost:3000/rep` (PIN: `1234`)
- Master Admin: `http://localhost:3000/admin` (PIN: `1234`)

### 2. Run the GPS Tracker Simulation Test
```bash
npm run test:gps
```
Simulates a live VIP bus streaming GPS packets along the 8 waypoints of the Accra-Kumasi N6 highway!

---

## ☁️ Zero-Cost Deployment Guide

1. **Deploy Frontend to Vercel (Free)**
   - Push this workspace to your GitHub.
   - Connect repository in [Vercel](https://vercel.com).
   - Set Root Directory to `oura`.
   - Instant deployment to `oura.vercel.app`!

2. **Deploy GPS TCP Ingestion Service to Railway (Free)**
   - Connect the same repository in [Railway.app](https://railway.app).
   - Set start command to `node backend/src/ingestion.js`.
   - Expose port `5001` (TCP) and `5002` (HTTP).
