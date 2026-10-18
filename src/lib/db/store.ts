import { Shipment, TrackerPing, TerminalRep, OuraSettings, HardwareTracker } from "@/types";

export const DEFAULT_SETTINGS: OuraSettings = {
  company_name: "oura",
  momo_number: "0248147952",
  momo_name: "Ernest Angmler",
  payment_instructions_template:
    "Kindly send GHS {total} via MTN MoMo to {momo_number} ({momo_name}). Use Reference: {tracking_id}. Your parcel will be dispatched as soon as payment is verified.",
  whatsapp_number: "+233248147952",
  whatsapp_token: "",
  whatsapp_enabled: false,
  bot_enabled: false,
  pickup_mode: "ernest_manual",
  rates: {
    accra_kumasi: {
      small: 45,
      medium: 70,
      large: 110,
      oversized: 160,
    },
    kumasi_accra: {
      small: 45,
      medium: 70,
      large: 110,
      oversized: 160,
    },
    pickup_zones: {
      zone_a: 25,
      zone_b: 40,
      zone_c: 65,
    },
    delivery_zones: {
      zone_a: 20,
      zone_b: 35,
      zone_c: 55,
    },
  },
};

export const INITIAL_TRACKERS: HardwareTracker[] = [
  {
    id: "oura-tag-01",
    name: "Smart Tag #01 (Black ACCUTAG)",
    type: "google_find_my",
    share_url: "https://www.google.com/android/find/",
    status: "in_use",
    current_shipment_id: "H314315796",
    last_lat: 6.0406,
    last_lng: -0.4508,
    last_speed_kmh: 78,
    last_updated: new Date().toISOString(),
  },
  {
    id: "oura-tag-02",
    name: "Smart Tag #02 (Green ACCUTAG)",
    type: "google_find_my",
    share_url: "https://www.google.com/android/find/",
    status: "available",
    current_shipment_id: null,
    last_lat: 5.5601,
    last_lng: -0.2155,
    last_speed_kmh: 0,
    last_updated: new Date().toISOString(),
  },
  {
    id: "oura-tag-03",
    name: "Smart Tag #03 (Yellow ACCUTAG)",
    type: "google_find_my",
    share_url: "https://www.google.com/android/find/",
    status: "available",
    current_shipment_id: null,
    last_lat: 6.6885,
    last_lng: -1.6244,
    last_speed_kmh: 0,
    last_updated: new Date().toISOString(),
  },
  {
    id: "test-device-01",
    name: "My Test Device (Find My / Live Phone GPS)",
    type: "live_device_gps",
    share_url: "https://www.google.com/android/find/",
    status: "available",
    current_shipment_id: null,
    last_lat: 5.6037,
    last_lng: -0.187,
    last_speed_kmh: 0,
    last_updated: new Date().toISOString(),
  },
];

export const INITIAL_REPS: TerminalRep[] = [
  {
    id: "rep-acc-01",
    name: "Kweku Boateng",
    phone: "0240000001",
    terminal_id: "VIP-ACC",
    terminal_name: "VIP Circle Terminal, Accra",
    pin_hash: "1234",
    active: true,
    permissions: {
      can_update_status: true,
      can_assign_tracker: true,
      can_order_uber: true,
      can_log_parcel: true,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "rep-ksi-01",
    name: "Ama Serwaa",
    phone: "0240000002",
    terminal_id: "VIP-KSI",
    terminal_name: "VIP Asafo Terminal, Kumasi",
    pin_hash: "1234",
    active: true,
    permissions: {
      can_update_status: true,
      can_assign_tracker: true,
      can_order_uber: true,
      can_log_parcel: true,
    },
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "ship_h314315796",
    tracking_id: "H314315796",
    status: "in_transit",
    origin_city: "Accra",
    origin_address: "East Legon, Accra",
    destination_city: "Kumasi",
    destination_address: "Ahodwo, Kumasi",
    sender_name: "Ahmad Kawsar",
    sender_phone: "0241112233",
    recipient_name: "Kwabena Danso",
    recipient_phone: "0209998877",
    item_description: "Mac Mini M4 Pro",
    quantity: 1,
    weight_category: "medium",
    weight_kg: 4.5,
    pricing: {
      pickup_fee: 30,
      transit_fee: 70,
      delivery_fee: 20,
      total: 120,
    },
    currency: "GHS",
    momo_reference: "H314315796",
    payment_confirmed: true,
    tracker_id: "oura-tag-01",
    google_maps_share_url: "https://www.google.com/android/find/",
    courier: {
      id: "courier-01",
      name: "Khalid Omor",
      phone: "0248147952",
      type: "manual_ernest",
    },
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    estimated_delivery: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
  },
  {
    id: "ship_k37856307",
    tracking_id: "K37856307",
    status: "delivered",
    origin_city: "Kumasi",
    origin_address: "Adum, Kumasi",
    destination_city: "Accra",
    destination_address: "Osu, Oxford Street, Accra",
    sender_name: "Nana Yaa",
    sender_phone: "0554443322",
    recipient_name: "Eric Mensah",
    recipient_phone: "0245556677",
    item_description: "Sonos Speaker",
    quantity: 1,
    weight_category: "medium",
    weight_kg: 5.0,
    pricing: {
      pickup_fee: 25,
      transit_fee: 70,
      delivery_fee: 25,
      total: 120,
    },
    currency: "GHS",
    momo_reference: "K37856307",
    payment_confirmed: true,
    tracker_id: "oura-tag-02",
    courier: {
      id: "courier-02",
      name: "Ernest Angmler",
      phone: "0248147952",
      type: "manual_ernest",
    },
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_PINGS: TrackerPing[] = [
  {
    id: "ping_01",
    shipment_id: "H314315796",
    tracker_id: "oura-tag-01",
    lat: 6.0406,
    lng: -0.4508, // Suhum along Accra-Kumasi Highway
    speed_kmh: 78,
    timestamp: new Date().toISOString(),
    source: "simulation",
  },
];

declare global {
  var __OURA_STORE__: {
    settings: OuraSettings;
    reps: TerminalRep[];
    shipments: Shipment[];
    pings: TrackerPing[];
    trackers: HardwareTracker[];
  } | undefined;
}

export function getStore() {
  if (!globalThis.__OURA_STORE__) {
    globalThis.__OURA_STORE__ = {
      settings: { ...DEFAULT_SETTINGS },
      reps: [...INITIAL_REPS],
      shipments: [...INITIAL_SHIPMENTS],
      pings: [...INITIAL_PINGS],
      trackers: [...INITIAL_TRACKERS],
    };
  }
  if (!globalThis.__OURA_STORE__.trackers) {
    globalThis.__OURA_STORE__.trackers = [...INITIAL_TRACKERS];
  }
  return globalThis.__OURA_STORE__;
}
