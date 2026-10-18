import { NextResponse } from "next/server";
import { listReps, createRep } from "@/lib/db/repos/reps";

export async function GET() {
  try {
    const reps = await listReps();
    return NextResponse.json({ success: true, reps });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rep = await createRep({
      name: body.name,
      phone: body.phone,
      terminal_id: body.terminal_id || "VIP-ACC",
      terminal_name: body.terminal_name || "VIP Circle Terminal, Accra",
      pin_hash: body.pin || "1234",
      active: true,
      permissions: body.permissions || {
        can_update_status: true,
        can_assign_tracker: true,
        can_order_uber: true,
        can_log_parcel: true,
      },
    });
    return NextResponse.json({ success: true, rep });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
