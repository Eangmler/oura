import { NextResponse } from "next/server";
import { authenticateRep } from "@/lib/db/repos/reps";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();
    const rep = await authenticateRep(phone, pin);
    if (!rep) {
      return NextResponse.json({ success: false, error: "Invalid Phone Number or PIN" }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      rep,
      token: `rep_token_${rep.id}_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
