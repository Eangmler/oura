import { NextResponse } from "next/server";
import { processWhatsAppMessage } from "@/lib/whatsapp/bot";
import { getStore } from "@/lib/db/store";

// GET for Meta webhook verification OR fetching live WhatsApp message logs for the simulator
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "oura_webhook_verify_token_2025";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  if (searchParams.get("logs") === "true") {
    const store = getStore();
    return NextResponse.json({
      success: true,
      messages: store.whatsapp_messages || [],
    });
  }

  return new Response("oura WhatsApp Webhook Active", { status: 200 });
}

// POST for incoming user messages:
// Supports (1) Meta Cloud API, (2) Green-API Instant QR-Code Bridge, and (3) Built-in Web Simulator
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Parse standard Meta WhatsApp Cloud API payload format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageObj = value?.messages?.[0];

    if (messageObj && messageObj.type === "text") {
      const from = messageObj.from;
      const text = messageObj.text.body;

      const botReply = await processWhatsAppMessage(from, text);
      return NextResponse.json({
        success: true,
        reply: botReply.message,
        delivery_status: botReply.delivery_status,
      });
    }

    // 2. Parse Green-API Instant QR-Code Bridge payload (bypasses Meta 5-day review!)
    if (body.typeWebhook === "incomingMessageReceived") {
      const senderChatId: string = body.senderData?.chatId || "";
      const fromPhone = senderChatId.replace("@c.us", "");
      const text =
        body.messageData?.textMessageData?.textMessage ||
        body.messageData?.extendedTextMessageData?.text ||
        "";

      if (fromPhone && text) {
        const botReply = await processWhatsAppMessage(fromPhone, text);
        return NextResponse.json({
          success: true,
          reply: botReply.message,
          delivery_status: botReply.delivery_status,
        });
      }
    }

    // 3. Direct testing / simulator payload support: { phone, message }
    if (body.phone && body.message) {
      const botReply = await processWhatsAppMessage(body.phone, body.message);
      const store = getStore();
      return NextResponse.json({
        success: true,
        reply: botReply.message,
        delivery_status: botReply.delivery_status,
        messages: store.whatsapp_messages,
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
