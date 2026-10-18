import { createShipment } from "@/lib/db/repos/shipments";
import { getSettings } from "@/lib/db/repos/settings";
import { calculateQuote } from "@/lib/pricing/engine";

export type BotState =
  | "IDLE"
  | "AWAITING_ORIGIN_ADDRESS"
  | "AWAITING_DEST_ADDRESS"
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
    item_description?: string;
    weight_category?: "small" | "medium" | "large" | "oversized";
    weight_kg?: number;
    quote_total?: number;
    sender_name?: string;
    tracking_id?: string;
  };
  last_updated: string;
}

// In-memory sessions store
const sessions = new Map<string, BotSession>();

export function getSession(phone: string): BotSession {
  if (!sessions.has(phone)) {
    sessions.set(phone, {
      phone,
      state: "IDLE",
      draft: {
        origin_city: "Accra",
        destination_city: "Kumasi",
      },
      last_updated: new Date().toISOString(),
    });
  }
  return sessions.get(phone)!;
}

export interface BotResponse {
  message: string;
  session: BotSession;
}

/**
 * WhatsApp state-machine processor.
 */
export async function processWhatsAppMessage(
  phone: string,
  userMessage: string
): Promise<BotResponse> {
  const session = getSession(phone);
  const text = userMessage.trim();
  const lower = text.toLowerCase();

  const settings = await getSettings();

  // Reset command
  if (lower === "restart" || lower === "reset" || lower === "cancel" || lower === "hi" || lower === "hello") {
    session.state = "AWAITING_ORIGIN_ADDRESS";
    session.draft = {
      origin_city: "Accra",
      destination_city: "Kumasi",
    };
    return {
      message:
        "👋 Welcome to *oura* — intercity delivery between Accra and Kumasi via VIP Express!\n\n" +
        "Let's book your delivery in 4 quick steps:\n\n" +
        "📍 *Step 1:* Where in *Accra* should our rider pick up the parcel? (Reply with your street/area address)",
      session,
    };
  }

  switch (session.state) {
    case "IDLE": {
      session.state = "AWAITING_ORIGIN_ADDRESS";
      return {
        message:
          "👋 Welcome to *oura* — fast intercity parcel delivery!\n\n" +
          "📍 *Step 1:* Please type the *pickup address in Accra* (e.g. 14 Cantonments Road or East Legon Shell).",
        session,
      };
    }

    case "AWAITING_ORIGIN_ADDRESS": {
      session.draft.origin_address = text;
      session.state = "AWAITING_DEST_ADDRESS";
      return {
        message:
          `✅ Pickup set to: *${text}*\n\n` +
          `🏁 *Step 2:* Where in *Kumasi* should we deliver to? (e.g. Ahodwo Roundabout or KNUST Gate)`,
        session,
      };
    }

    case "AWAITING_DEST_ADDRESS": {
      session.draft.destination_address = text;
      session.state = "AWAITING_ITEM_DESC";
      return {
        message:
          `✅ Delivery destination set to: *${text}*\n\n` +
          `📦 *Step 3:* What item are you sending? (e.g. MacBook Pro, carton of clothes, documents, shoes)`,
        session,
      };
    }

    case "AWAITING_ITEM_DESC": {
      session.draft.item_description = text;

      // Calculate instant quote
      const quote = await calculateQuote({
        origin_city: session.draft.origin_city,
        destination_city: session.draft.destination_city,
        item_description: text,
      });

      session.draft.weight_category = quote.weight_category;
      session.draft.weight_kg = quote.estimated_kg;
      session.draft.quote_total = quote.pricing.total;
      session.state = "AWAITING_CONFIRMATION";

      return {
        message:
          `⚡ *oura Instant Delivery Quote*\n` +
          `──────────────────\n` +
          `📦 Item: *${text}* (~${quote.estimated_kg}kg, ${quote.weight_category.toUpperCase()})\n` +
          `📍 Pickup: ${session.draft.origin_address}\n` +
          `🏁 Destination: ${session.draft.destination_address}\n` +
          `🚚 Service: Doorstep to Doorstep via VIP Bus\n\n` +
          `💰 *Total Cost: GHS ${quote.pricing.total}.00*\n` +
          `(Pickup GHS ${quote.pricing.pickup_fee} + VIP Transit GHS ${quote.pricing.transit_fee} + Delivery GHS ${quote.pricing.delivery_fee})\n\n` +
          `Reply *YES* to confirm this booking or *CANCEL* to restart.`,
        session,
      };
    }

    case "AWAITING_CONFIRMATION": {
      if (lower === "yes" || lower === "y" || lower === "confirm") {
        // Create actual shipment in database
        const shipment = await createShipment({
          status: "pending_payment",
          origin_city: session.draft.origin_city,
          origin_address: session.draft.origin_address || "Accra Central",
          destination_city: session.draft.destination_city,
          destination_address: session.draft.destination_address || "Kumasi Central",
          item_description: session.draft.item_description || "Parcel",
          quantity: 1,
          weight_category: session.draft.weight_category || "medium",
          weight_kg: session.draft.weight_kg || 3.5,
          sender_name: `WhatsApp (${phone})`,
          sender_phone: phone,
          recipient_name: "Recipient",
          recipient_phone: "0240000000",
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

        return {
          message:
            `🎉 *Order Confirmed! Tracking ID: ${shipment.tracking_id}*\n` +
            `──────────────────\n` +
            `Please complete payment via MTN Mobile Money:\n\n` +
            `📱 *Send GHS ${session.draft.quote_total}.00*\n` +
            `📞 *MoMo Number:* ${settings.momo_number}\n` +
            `👤 *Account Name:* ${settings.momo_name}\n` +
            `🔑 *Reference ID:* *${shipment.tracking_id}*\n\n` +
            `⚠️ *Important:* Use *${shipment.tracking_id}* as your MoMo reference.\n\n` +
            `Once sent, our pickup driver will be dispatched!\n` +
            `🌐 Live Tracking Link: https://oura.vercel.app/track/${shipment.tracking_id}`,
          session,
        };
      } else {
        session.state = "IDLE";
        return {
          message: "Order cancelled. Send *HI* anytime to start a new booking.",
          session,
        };
      }
    }

    case "AWAITING_PAYMENT": {
      return {
        message:
          `We are awaiting payment confirmation for Tracking ID: *${session.draft.tracking_id}*.\n\n` +
          `Track your shipment status here:\n` +
          `https://oura.vercel.app/track/${session.draft.tracking_id}\n\n` +
          `Need help? Call our dispatch support on ${settings.momo_number}.`,
        session,
      };
    }

    default: {
      session.state = "IDLE";
      return {
        message: "Send *HI* to book an intercity delivery with oura.",
        session,
      };
    }
  }
}
