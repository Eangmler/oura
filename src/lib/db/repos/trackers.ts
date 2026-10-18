import { HardwareTracker } from "@/types";
import { getStore } from "../store";
import { addPing } from "./tracker-pings";

export async function listTrackers(): Promise<HardwareTracker[]> {
  const store = getStore();
  return store.trackers;
}

export async function createOrUpdateTracker(
  data: Partial<HardwareTracker> & { id: string }
): Promise<HardwareTracker> {
  const store = getStore();
  const cleanId = data.id.trim().toLowerCase();
  const existingIdx = store.trackers.findIndex((t) => t.id.toLowerCase() === cleanId);

  if (existingIdx !== -1) {
    const current = store.trackers[existingIdx];
    const updated: HardwareTracker = {
      ...current,
      ...data,
      id: current.id,
      last_updated: new Date().toISOString(),
    };
    store.trackers[existingIdx] = updated;

    // Also update any shipment currently using this tracker with the new share_url
    if (updated.current_shipment_id && data.share_url) {
      const ship = store.shipments.find(
        (s) => s.tracking_id.toUpperCase() === updated.current_shipment_id?.toUpperCase()
      );
      if (ship) {
        ship.google_maps_share_url = data.share_url;
      }
    }
    return updated;
  } else {
    const newTracker: HardwareTracker = {
      id: cleanId,
      name: data.name || `Smart Tag (${cleanId})`,
      type: data.type || "google_find_my",
      share_url: data.share_url || "https://www.google.com/android/find/",
      status: "available",
      current_shipment_id: null,
      last_lat: data.last_lat ?? 5.5601,
      last_lng: data.last_lng ?? -0.2155,
      last_speed_kmh: 0,
      last_updated: new Date().toISOString(),
    };
    store.trackers.push(newTracker);
    return newTracker;
  }
}

export async function assignTrackerToShipment(
  trackerId: string,
  trackingId: string
): Promise<HardwareTracker | null> {
  const store = getStore();
  const normShipId = trackingId.trim().toUpperCase();

  // First release any previous tracker assigned to this shipment
  store.trackers.forEach((t) => {
    if (t.current_shipment_id?.toUpperCase() === normShipId && t.id !== trackerId) {
      t.status = "available";
      t.current_shipment_id = null;
    }
  });

  const tracker = store.trackers.find((t) => t.id.toLowerCase() === trackerId.trim().toLowerCase());
  const shipment = store.shipments.find((s) => s.tracking_id.toUpperCase() === normShipId);

  if (!shipment) return null;

  if (tracker) {
    tracker.status = "in_use";
    tracker.current_shipment_id = shipment.tracking_id;
    tracker.last_updated = new Date().toISOString();

    shipment.tracker_id = tracker.id;
    shipment.google_maps_share_url = tracker.share_url;

    // Push immediate ping from tracker's last known position
    if (tracker.last_lat && tracker.last_lng) {
      await addPing({
        shipment_id: shipment.tracking_id,
        tracker_id: tracker.id,
        lat: tracker.last_lat,
        lng: tracker.last_lng,
        speed_kmh: tracker.last_speed_kmh || 0,
        source: "google_find_my",
      });
    }
    return tracker;
  } else {
    // If rep typed an ad-hoc tracker ID not yet in registry, auto-register it!
    const created = await createOrUpdateTracker({
      id: trackerId,
      name: `Tag ${trackerId}`,
      status: "in_use",
      current_shipment_id: shipment.tracking_id,
    });
    shipment.tracker_id = created.id;
    shipment.google_maps_share_url = created.share_url;
    return created;
  }
}

export async function releaseTrackerFromShipment(trackingId: string): Promise<void> {
  const store = getStore();
  const normShipId = trackingId.trim().toUpperCase();
  store.trackers.forEach((t) => {
    if (t.current_shipment_id?.toUpperCase() === normShipId) {
      t.status = "available";
      t.current_shipment_id = null;
      t.last_speed_kmh = 0;
      t.last_updated = new Date().toISOString();
    }
  });
}

export async function updateTrackerLiveGps(
  trackerId: string,
  lat: number,
  lng: number,
  speedKmh = 0,
  source: "live_browser_gps" | "google_find_my" | "simulation" = "live_browser_gps"
): Promise<{ tracker: HardwareTracker | null; pingCreatedForShipment?: string | null }> {
  const store = getStore();
  const tracker = store.trackers.find((t) => t.id.toLowerCase() === trackerId.trim().toLowerCase());
  if (!tracker) return { tracker: null };

  tracker.last_lat = lat;
  tracker.last_lng = lng;
  tracker.last_speed_kmh = speedKmh;
  tracker.last_updated = new Date().toISOString();

  // If this tracker is linked to an active shipment, automatically record a ping for that shipment!
  const targetShipmentId = tracker.current_shipment_id || "H314315796";
  await addPing({
    shipment_id: targetShipmentId,
    tracker_id: tracker.id,
    lat,
    lng,
    speed_kmh: speedKmh,
    source,
  });

  return { tracker, pingCreatedForShipment: targetShipmentId };
}
