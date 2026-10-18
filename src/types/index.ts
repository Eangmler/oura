export type ShipmentStatus =
  | "pending_payment"
  | "paid"
  | "pickup_scheduled"
  | "picked_up"
  | "at_terminal"
  | "in_transit"
  | "arrived"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface CityCoord {
  name: string;
  lat: number;
  lng: number;
  terminalName: string;
}

export const CITY_COORDS: Record<string, CityCoord> = {
  accra: { name: "Accra", lat: 5.6037, lng: -0.187, terminalName: "VIP Bus Terminal, Circle" },
  kumasi: { name: "Kumasi", lat: 6.6885, lng: -1.6244, terminalName: "VIP Bus Terminal, Asafo" },
};

export interface HardwareTracker {
  id: string; // e.g. "oura-tag-01"
  name: string; // e.g. "Smart Tag #01 (Accra-Kumasi)"
  type: "google_find_my" | "google_maps_share" | "live_device_gps" | "google_find_my_tag" | "google_find_my_phone" | "gt06_hardwired";
  share_url: string; // Permanent Google Find My or Google Maps Share URL configured ONCE
  status: "available" | "in_use" | "maintenance";
  current_shipment_id?: string | null;
  battery_pct?: number;
  last_lat?: number;
  last_lng?: number;
  last_speed_kmh?: number;
  last_updated?: string;
}

export interface WhatsAppMessageLog {
  id: string;
  phone: string;
  direction: "inbound" | "outbound_reply" | "outbound_notification";
  text: string;
  tracking_id?: string;
  timestamp: string;
  delivery_status: "sent_cloud_api" | "logged_sandbox";
}

export interface TrackerPing {
  id: string;
  shipment_id: string;
  tracker_id?: string;
  lat: number;
  lng: number;
  timestamp: string;
  speed_kmh?: number;
  source?: "gps_device" | "google_find_my" | "terminal_rep" | "simulation" | "live_browser_gps" | "manual_rep" | "device_browser_gps";
}

export interface CourierInfo {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  type: "manual_ernest" | "uber_courier" | "dispatch_rider";
}

export interface PriceBreakdown {
  pickup_fee: number;
  transit_fee: number;
  delivery_fee: number;
  total: number;
}

export interface Shipment {
  id: string;
  tracking_id: string;
  status: ShipmentStatus;

  origin_city: string;
  origin_address: string;
  destination_city: string;
  destination_address: string;

  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;

  item_description: string;
  quantity: number;
  weight_category: "small" | "medium" | "large" | "oversized";
  weight_kg: number;

  pricing: PriceBreakdown;
  currency: string;
  momo_reference: string;
  payment_confirmed: boolean;

  tracker_id?: string;
  google_maps_share_url?: string;
  courier?: CourierInfo | null;
  assigned_rep_id?: string;

  created_at: string;
  estimated_delivery?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
}

export interface TerminalRep {
  id: string;
  name: string;
  phone: string;
  terminal_id: string;
  terminal_name: string;
  pin_hash: string;
  active: boolean;
  permissions: {
    can_update_status: boolean;
    can_assign_tracker: boolean;
    can_order_uber: boolean;
    can_log_parcel: boolean;
  };
  created_at: string;
}

export interface OuraSettings {
  momo_number: string;
  momo_name: string;
  payment_instructions_template: string;
  whatsapp_number: string;
  whatsapp_phone_number_id?: string;
  whatsapp_token: string;
  whatsapp_enabled: boolean;
  rates: {
    accra_kumasi: {
      small: number;
      medium: number;
      large: number;
      oversized: number;
    };
    kumasi_accra: {
      small: number;
      medium: number;
      large: number;
      oversized: number;
    };
    pickup_zones: {
      zone_a: number;
      zone_b: number;
      zone_c: number;
    };
    delivery_zones: {
      zone_a: number;
      zone_b: number;
      zone_c: number;
    };
  };
  pickup_mode: "ernest_manual" | "uber_dispatch" | "hybrid";
  bot_enabled: boolean;
  company_name: string;
}
