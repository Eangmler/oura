import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db/repos/settings";
import { syncShipmentsFromGreenApi } from "@/lib/whatsapp/green-sync";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp/notifier";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await syncShipmentsFromGreenApi();
    const settings = await getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateSettings(body);

    // Persist Admin rate & MoMo updates to Green-API's outgoing journal so all Vercel serverless instances
    // (including the public website & WhatsApp chatbot) immediately sync the new pricing across cold starts.
    const selfPhone = (updated.whatsapp_number || "+233599882827").replace(/\D/g, "");
    if (selfPhone) {
      const configMsg =
        `⚙️ *oura Rate Card Sync*\n` +
        `RATE_CONFIG_JSON:${JSON.stringify(updated.rates)}\n` +
        `MOMO_JSON:${JSON.stringify({ momo_number: updated.momo_number, momo_name: updated.momo_name })}`;
      await dispatchWhatsAppMessage(selfPhone, configMsg, "outbound_status");
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
