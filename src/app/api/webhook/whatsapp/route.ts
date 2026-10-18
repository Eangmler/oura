import { NextResponse } from "next/server";
import { processWhatsAppMessage } from "@/lib/whatsapp/bot";

// GET for Meta webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "oura_webhook_verify_token_2025";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST for incoming user messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Parse WhatsApp Cloud API payload format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageObj = value?.messages?.[0];

    if (messageObj && messageObj.type === "text") {
      const from = messageObj.from;
      const text = messageObj.text.body;

      const botReply = await processWhatsAppMessage(from, text);

      // In production with token configured, sends HTTP POST to Meta Graph API:
      // https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
      console.log(`[WhatsApp Bot Reply to ${from}]:\n${botReply.message}`);

      return NextResponse.json({ success: true, reply: botReply.message });
    }

    // Direct testing payload support: { phone, message }
    if (body.phone && body.message) {
      const botReply = await processWhatsAppMessage(body.phone, body.message);
      return NextResponse.json({ success: true, reply: botReply.message });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
