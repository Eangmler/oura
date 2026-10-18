/**
 * Shipment status lifecycle — ordered by progression.
 */
export type ShipmentStatus =
  | "pending_payment"
  | "paid"
  | "pickup_scheduled"
  | "picked_up"
  | "at_terminal"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "cancelled";

/** Known cities with fixed coordinates. */
export interface CityCoord {
  name: string;
  lat: number;
  lng: number;
}

export const CITY_COORDS: Record<string, CityCoord> = {
  accra: { name: "Accra", lat: 5.6037, lng: -0.187 },
  kumasi: { name: "Kumasi", lat: 6.6885, lng: -1.6244 },
};

/** A single GPS ping from a tracker / driver device. */
export interface TrackerPing {
  id: string;
  shipment_id: string;
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy_m?: number;
}

/** Assigned courier / pickup representative. */
export interface CourierInfo {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
}

/** Full shipment document shape (mirrors Firestore). */
export interface Shipment {
  id: string;
  tracking_id: string;
  status: ShipmentStatus;

  origin_city: string;
  destination_city: string;

  sender_name: string;
  sender_phone: string;

  recipient_name: string;
  recipient_phone: string;

  /** Package details */
  item_description: string;
  quantity: number;
  weight_kg: number;
  order_cost: number;
  currency: string;

  /** Courier / rider assigned for pickup */
  courier?: CourierInfo | null;

  /** Timestamps */
  created_at: Date;
  estimated_delivery?: Date | null;
  picked_up_at?: Date | null;
  delivered_at?: Date | null;

  /** User who booked */
  user_id?: string;
}
