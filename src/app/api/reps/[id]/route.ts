import { NextResponse } from "next/server";
import { toggleRepActive, resetRepPin } from "@/lib/db/repos/reps";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (typeof body.active === "boolean") {
      const rep = await toggleRepActive(params.id, body.active);
      return NextResponse.json({ success: true, rep });
    }
    if (body.new_pin) {
      const rep = await resetRepPin(params.id, body.new_pin);
      return NextResponse.json({ success: true, rep });
    }
    return NextResponse.json({ success: false, error: "No valid action provided" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
