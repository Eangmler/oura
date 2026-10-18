import { createShipment, getShipmentByTrackingId } from "@/lib/db/repos/shipments";
import { getSettings } from "@/lib/db/repos/settings";
import { getLatestPing } from "@/lib/db/repos/tracker-pings";
import { calculateQuote } from "@/lib/pricing/engine";
import { dispatchWhatsAppMessage, sendWhatsAppStatusNotification } from "./notifier";

export { dispatchWhatsAppMessage, sendWhatsAppStatusNotification };

export type BotState =
  | "IDLE"
  | "AWAITING_ROUTE"
  | "AWAITING_ORIGIN_ADDRESS"
  | "AWAITING_DEST_ADDRESS"
  | "AWAITING_RECIPIENT_PHONE"
  | "AWAITING_ITEM_DESC"
  | "AWAITING_CONFIRMATION"
  | "AWAITING_PAYMENT";

export interface BotSession {
  phone: string;
  state: BotState;
  draft: {
    origin_city: string;
    origin_address?: string;
    destination_city: string;
    destination_address?: string;
    recipient_phone?: string;
    item_description?: string;
    weight_category?: "small" | "medium" | "large" | "oversized";
    weight_kg?: number;
    quote_total?: number;
    sender_name?: string;
    tracking_id?: string;
  };
  last_updated: string;
}

const sessions = new Map<string, BotSession>();

export function getSession(phone: string): BotSession {
  const cleanPhone = phone.replace(/\s+/g, "");
  if (!sessions.has(cleanPhone)) {
    sessions.set(cleanPhone, {
      phone: cleanPhone,
      state: "IDLE",
      draft: {
        origin_city: "Accra",
        destination_city: "Kumasi",
      },
      last_updated: new Date().toISOString(),
    });
  }
  return sessions.get(cleanPhone)!;
}

export interface BotResponse {
  message: string;
  session: BotSession;
  delivery_status: "sent_cloud_api" | "logged_sandbox";
}

/**
 * WhatsApp conversational state-machine processor (supports both Booking & Tracking Lookup).
 */
export async function processWhatsAppMessage(
  phone: string,
  userMessage: string
): Promise<BotResponse> {
  const session = getSession(phone);
  const text = userMessage.trim();
  const lower = text.toLowerCase();
  const upper = text.toUpperCase();

  // Log inbound message
  await dispatchWhatsAppMessage(phone, text, "inbound", session.draft.tracking_id);

  const settings = await getSettings();

  // 1. Check if the user typed a Tracking ID directly (e.g., "H314315796", "K37856307", or "TRACK H314315796")
  const trackMatch = upper.match(/\b([HK]\d{7,10})\b/);
  if (trackMatch || lower.startsWith("track ")) {
    const requestedId = trackMatch ? trackMatch[1] : upper.replace("TRACK", "").trim();
    const found = await getShipmentByTrackingId(requestedId);
    if (found) {
      const ping = await getLatestPing(found.tracking_id);
      const reply =
        `🛰️ *oura Live Shipment Status*\n` +
        `──────────────────\n` +
        `📦 Booking ID: *${found.tracking_id}*\n` +
        `📋 Item: *${found.item_description}* (${found.weight_kg}kg)\n` +
        `🚦 Status: *${found.status.replace(/_/g, " ").toUpperCase()}*\n` +
        `📍 Route: *${found.origin_city} ➔ ${found.destination_city}*\n` +
        (found.tracker_id ? `🏷️ Hardware Tag: *${found.tracker_id}*\n` : "") +
        (ping ? `📡 Last GPS Ping: *${ping.lat.toFixed(4)}, ${ping.lng.toFixed(4)}* (${ping.speed_kmh || 0} km/h)\n` : "") +
        `\n🔔 *Note:* We will automatically message you here on WhatsApp whenever your parcel reaches the next station!\n\n` +
        `🗺️ *Open Live Real-Time Map:*\nhttps://oura-psi.vercel.app/track/${found.tracking_id}`;

      const delivery_status = await dispatchWhatsAppMessage(
        phone,
        reply,
        "outbound_reply",
        found.tracking_id
      );
      return { message: reply, session, delivery_status };
    } else if (lower.startsWith("track")) {
      const reply =
        `❌ We couldn't find a shipment with ID *${requestedId}*.\n\n` +
        `Try sending *H314315796* to test a live in-transit shipment, or reply *BOOK* to start a new delivery!`;
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }
  }

  // 2. Reset / Greeting command
  if (
    lower === "restart" ||
    lower === "reset" ||
    lower === "cancel" ||
    lower === "hi" ||
    lower === "hello" ||
    lower === "book" ||
    lower === "menu"
  ) {
    session.state = "AWAITING_ROUTE";
    session.draft = {
      origin_city: "Accra",
      destination_city: "Kumasi",
    };
    const reply =
      "👋 Welcome to *oura* — intercity parcel delivery between *Accra* and *Kumasi* via VIP Express!\n\n" +
      "How can we help you today?\n\n" +
      "1️⃣ Reply *1* to send a parcel *Accra ➔ Kumasi*\n" +
      "2️⃣ Reply *2* to send a parcel *Kumasi ➔ Accra*\n" +
      "🔍 Or type your *Tracking ID* (e.g. *H314315796*) to check live status & map link!";

    const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
    return { message: reply, session, delivery_status };
  }

  // 3. State Machine Steps
  switch (session.state) {
    case "IDLE": {
      session.state = "AWAITING_ROUTE";
      const reply =
        "👋 Welcome to *oura*!\n\n" +
        "1️⃣ Reply *1* to book *Accra ➔ Kumasi*\n" +
        "2️⃣ Reply *2* to book *Kumasi ➔ Accra*\n" +
        "🔍 Or send your *Tracking ID* (e.g. *H314315796*) for live tracking.";
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }

    case "AWAITING_ROUTE": {
      if (lower === "2" || lower.includes("kumasi to accra") || lower.startsWith("kumasi")) {
        session.draft.origin_city = "Kumasi";
        session.draft.destination_city = "Accra";
      } else {
        session.draft.origin_city = "Accra";
        session.draft.destination_city = "Kumasi";
      }
      session.state = "AWAITING_ORIGIN_ADDRESS";
      const reply =
        `✅ Route: *${session.draft.origin_city} ➔ ${session.draft.destination_city}*\n\n` +
        `📍 *Step 1 of 4:* Where in *${session.draft.origin_city}* should our rider pick up the parcel? (e.g. East Legon Shell, Cantonments, or Adum)`;
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }

    case "AWAITING_ORIGIN_ADDRESS": {
      session.draft.origin_address = text;
      session.state = "AWAITING_DEST_ADDRESS";
      const reply =
        `✅ Pickup: *${text}* (${session.draft.origin_city})\n\n` +
        `🏁 *Step 2 of 4:* Where in *${session.draft.destination_city}* should we deliver to? (e.g. Ahodwo Roundabout, KNUST Gate, or Osu Oxford St)`;
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }

    case "AWAITING_DEST_ADDRESS": {
      session.draft.destination_address = text;
      session.state = "AWAITING_RECIPIENT_PHONE";
      const reply =
        `✅ Destination: *${text}* (${session.draft.destination_city})\n\n` +
        `📞 *Step 3 of 4:* What is the *Recipient's Name & Phone Number*? (e.g. Kwame Mensah 0245556677) — we will also send them WhatsApp arrival alerts!`;
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }

    case "AWAITING_RECIPIENT_PHONE": {
      session.draft.recipient_phone = text;
      session.state = "AWAITING_ITEM_DESC";
      const reply =
        `✅ Recipient: *${text}*\n\n` +
        `📦 *Step 4 of 4:* What item are you sending? (e.g. MacBook box, carton of shoes, documents, spare parts)`;
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }

    case "AWAITING_ITEM_DESC": {
      session.draft.item_description = text;

      const quote = await calculateQuote({
        origin_city: session.draft.origin_city,
        destination_city: session.draft.destination_city,
        item_description: text,
      });

      session.draft.weight_category = quote.weight_category;
      session.draft.weight_kg = quote.estimated_kg;
      session.draft.quote_total = quote.pricing.total;
      session.state = "AWAITING_CONFIRMATION";

      const reply =
        `⚡ *oura Instant WhatsApp Quote*\n` +
        `──────────────────\n` +
        `📦 Item: *${text}* (~${quote.estimated_kg}kg, ${quote.weight_category.toUpperCase()})\n` +
        `📍 Pickup: ${session.draft.origin_address} (${session.draft.origin_city})\n` +
        `🏁 Delivery: ${session.draft.destination_address} (${session.draft.destination_city})\n` +
        `👤 Recipient: ${session.draft.recipient_phone}\n\n` +
        `💰 *Total Price: GHS ${quote.pricing.total}.00*\n` +
        `• Pickup: GHS ${quote.pricing.pickup_fee}\n` +
        `• VIP Bus Transit: GHS ${quote.pricing.transit_fee}\n` +
        `• Final Delivery: GHS ${quote.pricing.delivery_fee}\n\n` +
        `Reply *YES* to confirm & get your Tracking ID, or *CANCEL* to restart.`;

      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }

    case "AWAITING_CONFIRMATION": {
      if (lower === "yes" || lower === "y" || lower === "confirm" || lower === "1") {
        const phoneDigits = (session.draft.recipient_phone || "").match(/\d{9,12}/)?.[0] || "0240000000";
        const recipName =
          (session.draft.recipient_phone || "Recipient").replace(/\d+/g, "").trim() || "Recipient";

        const shipment = await createShipment({
          status: "pending_payment",
          origin_city: session.draft.origin_city,
          origin_address: session.draft.origin_address || `${session.draft.origin_city} Central`,
          destination_city: session.draft.destination_city,
          destination_address: session.draft.destination_address || `${session.draft.destination_city} Central`,
          item_description: session.draft.item_description || "Parcel",
          quantity: 1,
          weight_category: session.draft.weight_category || "medium",
          weight_kg: session.draft.weight_kg || 3.5,
          sender_name: `WhatsApp Client (${phone})`,
          sender_phone: phone,
          recipient_name: recipName,
          recipient_phone: phoneDigits,
          pricing: {
            pickup_fee: 30,
            transit_fee: 70,
            delivery_fee: 20,
            total: session.draft.quote_total || 120,
          },
          currency: "GHS",
        });

        session.draft.tracking_id = shipment.tracking_id;
        session.state = "AWAITING_PAYMENT";

        const reply =
          `🎉 *Booking Confirmed! ID: ${shipment.tracking_id}*\n` +
          `──────────────────\n` +
          `Please complete your payment via MTN Mobile Money:\n\n` +
          `💵 *Amount:* GHS ${session.draft.quote_total}.00\n` +
          `📱 *MoMo Number:* *${settings.momo_number}*\n` +
          `👤 *Account Name:* ${settings.momo_name}\n` +
          `🔑 *MoMo Reference:* *${shipment.tracking_id}*\n\n` +
          `Reply *PAID* once you have sent the MoMo transfer so we can dispatch your rider immediately!\n\n` +
          `🗺️ *Real-Time Map Link (Save for later):*\nhttps://oura-psi.vercel.app/track/${shipment.tracking_id}`;

        const delivery_status = await dispatchWhatsAppMessage(
          phone,
          reply,
          "outbound_reply",
          shipment.tracking_id
        );
        return { message: reply, session, delivery_status };
      } else {
        session.state = "IDLE";
        const reply = "Booking cancelled. Reply *HI* anytime to book or track a package.";
        const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
        return { message: reply, session, delivery_status };
      }
    }

    case "AWAITING_PAYMENT": {
      if (lower.includes("paid") || lower.includes("sent") || lower.includes("done")) {
        session.state = "IDLE";
        const reply =
          `🙌 *Thank you!* We've notified our dispatch desk to verify MoMo Reference *${session.draft.tracking_id}*.\n\n` +
          `You will receive automatic *WhatsApp notifications* here as soon as:\n` +
          `1️⃣ Your MoMo payment is verified\n` +
          `2️⃣ Rider picks up your parcel\n` +
          `3️⃣ Parcel boards the VIP Express bus\n` +
          `4️⃣ Parcel arrives & is delivered!\n\n` +
          `🗺️ *External Live Map Link:*\nhttps://oura-psi.vercel.app/track/${session.draft.tracking_id}`;
        const delivery_status = await dispatchWhatsAppMessage(
          phone,
          reply,
          "outbound_reply",
          session.draft.tracking_id
        );
        return { message: reply, session, delivery_status };
      }

      const reply =
        `⏳ Awaiting MoMo payment for Booking ID *${session.draft.tracking_id}*.\n` +
        `Send *GHS ${session.draft.quote_total || 120}.00* to *${settings.momo_number}* (${settings.momo_name}) with reference *${session.draft.tracking_id}* and reply *PAID*.\n\n` +
        `🗺️ Live Map: https://oura-psi.vercel.app/track/${session.draft.tracking_id}`;
      const delivery_status = await dispatchWhatsAppMessage(
        phone,
        reply,
        "outbound_reply",
        session.draft.tracking_id
      );
      return { message: reply, session, delivery_status };
    }

    default: {
      session.state = "IDLE";
      const reply = "Send *HI* to book an intercity delivery or send your *Tracking ID* (e.g. *H314315796*).";
      const delivery_status = await dispatchWhatsAppMessage(phone, reply, "outbound_reply");
      return { message: reply, session, delivery_status };
    }
  }
}
