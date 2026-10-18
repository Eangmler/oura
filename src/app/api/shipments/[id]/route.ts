import { NextResponse } from "next/server";
import { getShipmentByTrackingId, updateShipmentStatus } from "@/lib/db/repos/shipments";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await getShipmentByTrackingId(params.id);
    if (!shipment) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, shipment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateShipmentStatus(params.id, body.status, {
      rep_id: body.rep_id,
      tracker_id: body.tracker_id,
      google_maps_share_url: body.google_maps_share_url,
      courier_name: body.courier_name,
      courier_phone: body.courier_phone,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, shipment: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
