import { NextResponse } from "next/server";
import { processWhatsAppMessage } from "@/lib/whatsapp/bot";
import { getStore } from "@/lib/db/store";
import { updateSettings, getSettings } from "@/lib/db/repos/settings";

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

  if (searchParams.get("test_phone")) {
    const testPhone = searchParams.get("test_phone")!;
    const testMsg = searchParams.get("test_msg") || "Hi";
    const botReply = await processWhatsAppMessage(testPhone, testMsg);
    return NextResponse.json({
      success: true,
      reply: botReply.message,
      delivery_status: botReply.delivery_status,
    });
  }

  if (searchParams.get("logs") === "true") {
    const store = getStore();
    const settings = await getSettings();
    return NextResponse.json({
      success: true,
      has_instance_id: Boolean(settings.whatsapp_phone_number_id),
      has_token: Boolean(settings.whatsapp_token),
      instance_id_preview: settings.whatsapp_phone_number_id || null,
      messages: store.whatsapp_messages || [],
    });
  }

  return new Response("oura WhatsApp Webhook Active", { status: 200 });
}

// POST for incoming user messages:
// Supports (1) Meta Cloud API, (2) Green-API Instant QR-Code Bridge, and (3) Built-in Web Simulator
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlToken = searchParams.get("token");
    const urlInstanceId = searchParams.get("instanceId");

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
      // Auto-capture idInstance from Green-API's payload and optional ?token=... from URL
      const greenInstanceId = String(body.instanceData?.idInstance || urlInstanceId || "").trim();
      const authHeader = request.headers.get("authorization") || "";
      const headerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
      const effectiveToken = (urlToken || headerToken || "").trim();

      if (greenInstanceId || effectiveToken) {
        const current = await getSettings();
        await updateSettings({
          whatsapp_phone_number_id: greenInstanceId || current.whatsapp_phone_number_id,
          whatsapp_token: effectiveToken || current.whatsapp_token,
          whatsapp_enabled: true,
        });
      }

      // IMPORTANT: Keep @lid or @c.us intact so Green-API can reply to Linked-ID (@lid) and regular (@c.us) chats!
      const senderChatId: string = body.senderData?.chatId || body.senderData?.sender || "";
      const senderName: string =
        body.senderData?.senderName || body.senderData?.senderContactName || "";
      const text =
        body.messageData?.textMessageData?.textMessage ||
        body.messageData?.extendedTextMessageData?.text ||
        "";

      if (senderChatId && text) {
        const botReply = await processWhatsAppMessage(senderChatId, text, senderName);
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
