import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    // Default admin PIN is 1234 or ERNEST2025
    if (pin === "1234" || pin === "0000" || pin === "oura2025") {
      return NextResponse.json({
        success: true,
        admin: { name: "Ernest Angmler", role: "superadmin" },
        token: `admin_token_${Date.now()}`,
      });
    }
    return NextResponse.json({ success: false, error: "Incorrect Admin PIN" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
