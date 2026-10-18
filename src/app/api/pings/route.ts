import { NextResponse } from "next/server";
import { addPing, getLatestPing, getPingsForShipment } from "@/lib/db/repos/tracker-pings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipment_id");
    if (!shipmentId) {
      return NextResponse.json({ success: false, error: "shipment_id required" }, { status: 400 });
    }
    const latest = await getLatestPing(shipmentId);
    const history = await getPingsForShipment(shipmentId, 20);
    return NextResponse.json({ success: true, latest, history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ping = await addPing({
      shipment_id: body.shipment_id,
      tracker_id: body.tracker_id,
      lat: Number(body.lat),
      lng: Number(body.lng),
      speed_kmh: Number(body.speed_kmh) || 0,
      source: body.source || "simulation",
    });
    return NextResponse.json({ success: true, ping });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
