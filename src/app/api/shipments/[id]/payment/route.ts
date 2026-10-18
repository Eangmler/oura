import { NextResponse } from "next/server";
import { confirmShipmentPayment } from "@/lib/db/repos/shipments";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await confirmShipmentPayment(params.id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, shipment: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
