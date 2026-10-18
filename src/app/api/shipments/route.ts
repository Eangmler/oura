import { NextResponse } from "next/server";
import { createShipment, listShipments } from "@/lib/db/repos/shipments";
import { getSettings } from "@/lib/db/repos/settings";
import { ShipmentStatus } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ShipmentStatus | null;
    const city = searchParams.get("city") || undefined;
    const search = searchParams.get("search") || undefined;

    const shipments = await listShipments({
      status: status || undefined,
      city,
      search,
    });

    return NextResponse.json({ success: true, shipments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const shipment = await createShipment({
      status: "pending_payment",
      origin_city: body.origin_city,
      origin_address: body.origin_address,
      destination_city: body.destination_city,
      destination_address: body.destination_address,
      sender_name: body.sender_name,
      sender_phone: body.sender_phone,
      recipient_name: body.recipient_name,
      recipient_phone: body.recipient_phone,
      item_description: body.item_description,
      quantity: Number(body.quantity) || 1,
      weight_category: body.weight_category || "medium",
      weight_kg: Number(body.weight_kg) || 3.5,
      pricing: body.pricing || {
        pickup_fee: 30,
        transit_fee: 70,
        delivery_fee: 20,
        total: 120,
      },
      currency: "GHS",
    });

    const settings = await getSettings();

    return NextResponse.json({ success: true, shipment, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
