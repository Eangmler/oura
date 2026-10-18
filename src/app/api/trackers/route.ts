import { NextResponse } from "next/server";
import {
  listTrackers,
  createOrUpdateTracker,
  assignTrackerToShipment,
  releaseTrackerFromShipment,
  updateTrackerLiveGps,
} from "@/lib/db/repos/trackers";

export async function GET() {
  try {
    const trackers = await listTrackers();
    return NextResponse.json({ success: true, trackers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json(
        { success: false, error: "Tracker Tag ID and Name are required" },
        { status: 400 }
      );
    }

    const tracker = await createOrUpdateTracker({
      id: body.id.trim().toLowerCase(),
      name: body.name.trim(),
      type: body.type || "google_find_my_tag",
      share_url: body.share_url || "https://www.google.com/android/find/",
      battery_pct: body.battery_pct ? Number(body.battery_pct) : 100,
      status: body.status,
    });

    return NextResponse.json({ success: true, tracker });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "assign") {
      if (!body.tracker_id || !body.tracking_id) {
        return NextResponse.json(
          { success: false, error: "tracker_id and tracking_id required" },
          { status: 400 }
        );
      }
      const tracker = await assignTrackerToShipment(body.tracker_id, body.tracking_id);
      return NextResponse.json({ success: true, tracker });
    }

    if (action === "release") {
      if (!body.tracking_id) {
        return NextResponse.json({ success: false, error: "tracking_id required" }, { status: 400 });
      }
      await releaseTrackerFromShipment(body.tracking_id);
      return NextResponse.json({ success: true });
    }

    if (action === "gps_ping") {
      if (!body.tracker_id || typeof body.lat !== "number" || typeof body.lng !== "number") {
        return NextResponse.json(
          { success: false, error: "tracker_id, lat, and lng are required" },
          { status: 400 }
        );
      }
      const tracker = await updateTrackerLiveGps(
        body.tracker_id,
        body.lat,
        body.lng,
        body.speed_kmh ?? 65,
        body.source || "manual_rep"
      );
      return NextResponse.json({ success: true, tracker });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
