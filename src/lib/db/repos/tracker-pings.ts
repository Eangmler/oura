import { TrackerPing } from "@/types";
import { getStore } from "../store";

export async function addPing(ping: Omit<TrackerPing, "id" | "timestamp">): Promise<TrackerPing> {
  const store = getStore();
  const newPing: TrackerPing = {
    ...ping,
    id: `ping_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  store.pings.unshift(newPing);
  // Keep last 1000 pings in memory
  if (store.pings.length > 1000) {
    store.pings = store.pings.slice(0, 1000);
  }
  return newPing;
}

export async function getLatestPing(shipmentId: string): Promise<TrackerPing | null> {
  const store = getStore();
  const pings = store.pings.filter(
    (p) => p.shipment_id.toUpperCase() === shipmentId.trim().toUpperCase()
  );
  return pings[0] || null;
}

export async function getPingsForShipment(shipmentId: string, limit = 50): Promise<TrackerPing[]> {
  const store = getStore();
  return store.pings
    .filter((p) => p.shipment_id.toUpperCase() === shipmentId.trim().toUpperCase())
    .slice(0, limit);
}
