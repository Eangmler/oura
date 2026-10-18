import { Shipment, ShipmentStatus } from "@/types";
import { getStore } from "../store";

export function generateTrackingId(originCity: string, destCity: string): string {
  const originCode = originCity.toLowerCase().includes("acc") ? "ACC" : "KSI";
  const destCode = destCity.toLowerCase().includes("ksi") ? "KSI" : "ACC";
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `H${randomNum}`; // Matches screenshot style: H314315796
}

export async function createShipment(
  data: Omit<Shipment, "id" | "tracking_id" | "created_at" | "momo_reference" | "payment_confirmed">
): Promise<Shipment> {
  const store = getStore();
  const tracking_id = generateTrackingId(data.origin_city, data.destination_city);
  const now = new Date().toISOString();

  const shipment: Shipment = {
    ...data,
    id: `ship_${tracking_id.toLowerCase()}`,
    tracking_id,
    created_at: now,
    momo_reference: tracking_id,
    payment_confirmed: false,
    estimated_delivery: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };

  store.shipments.unshift(shipment);
  return shipment;
}

export async function getShipmentByTrackingId(trackingId: string): Promise<Shipment | null> {
  const store = getStore();
  const normalized = trackingId.trim().toUpperCase();
  const found = store.shipments.find((s) => s.tracking_id.toUpperCase() === normalized);
  return found || null;
}

export async function listShipments(filters?: {
  status?: ShipmentStatus;
  city?: string;
  search?: string;
}): Promise<Shipment[]> {
  const store = getStore();
  let list = [...store.shipments];

  if (filters?.status) {
    list = list.filter((s) => s.status === filters.status);
  }
  if (filters?.city) {
    const q = filters.city.toLowerCase();
    list = list.filter(
      (s) => s.origin_city.toLowerCase().includes(q) || s.destination_city.toLowerCase().includes(q)
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.tracking_id.toLowerCase().includes(q) ||
        s.sender_name.toLowerCase().includes(q) ||
        s.recipient_name.toLowerCase().includes(q) ||
        s.item_description.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function updateShipmentStatus(
  trackingId: string,
  status: ShipmentStatus,
  options?: {
    rep_id?: string;
    tracker_id?: string;
    courier_name?: string;
    courier_phone?: string;
  }
): Promise<Shipment | null> {
  const store = getStore();
  const index = store.shipments.findIndex(
    (s) => s.tracking_id.toUpperCase() === trackingId.trim().toUpperCase()
  );
  if (index === -1) return null;

  const current = store.shipments[index];
  const updated: Shipment = {
    ...current,
    status,
    tracker_id: options?.tracker_id ?? current.tracker_id,
    assigned_rep_id: options?.rep_id ?? current.assigned_rep_id,
    picked_up_at: status === "picked_up" ? new Date().toISOString() : current.picked_up_at,
    delivered_at: status === "delivered" ? new Date().toISOString() : current.delivered_at,
  };

  if (options?.courier_name) {
    updated.courier = {
      id: "courier-assigned",
      name: options.courier_name,
      phone: options.courier_phone || "0248147952",
      type: "manual_ernest",
    };
  }

  store.shipments[index] = updated;
  return updated;
}

export async function confirmShipmentPayment(trackingId: string): Promise<Shipment | null> {
  const store = getStore();
  const index = store.shipments.findIndex(
    (s) => s.tracking_id.toUpperCase() === trackingId.trim().toUpperCase()
  );
  if (index === -1) return null;

  const current = store.shipments[index];
  const updated: Shipment = {
    ...current,
    payment_confirmed: true,
    status: current.status === "pending_payment" ? "paid" : current.status,
  };

  store.shipments[index] = updated;
  return updated;
}
