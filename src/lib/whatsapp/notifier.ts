import { getSettings } from "@/lib/db/repos/settings";
import { getStore } from "@/lib/db/store";
import { Shipment, WhatsAppMessageLog } from "@/types";

/**
 * Helper to send a message via Meta WhatsApp Cloud API (if configured)
 * AND record it in our in-memory WhatsApp message log for live testing.
 */
export async function dispatchWhatsAppMessage(
  toPhone: string,
  text: string,
  direction: "inbound" | "outbound_reply" | "outbound_notification",
  trackingId?: string
): Promise<"sent_cloud_api" | "logged_sandbox"> {
  const store = getStore();
  const settings = await getSettings();
  let deliveryStatus: "sent_cloud_api" | "logged_sandbox" = "logged_sandbox";

  // If real Meta Cloud API token + Phone Number ID are configured, send live over WhatsApp!
  if (
    direction !== "inbound" &&
    settings.whatsapp_enabled &&
    settings.whatsapp_token &&
    settings.whatsapp_phone_number_id
  ) {
    try {
      const normalizedTo = toPhone.startsWith("0")
        ? `233${toPhone.slice(1)}`
        : toPhone.replace(/^\+/, "");
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${settings.whatsapp_phone_number_id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.whatsapp_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: normalizedTo,
            type: "text",
            text: { preview_url: true, body: text },
          }),
        }
      );
      if (res.ok) {
        deliveryStatus = "sent_cloud_api";
      }
    } catch (e) {
      console.error("[Meta Cloud API Send Error]:", e);
    }
  }

  const logEntry: WhatsAppMessageLog = {
    id: `wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    phone: toPhone,
    direction,
    text,
    tracking_id: trackingId,
    timestamp: new Date().toISOString(),
    delivery_status: deliveryStatus,
  };

  store.whatsapp_messages.push(logEntry);
  return deliveryStatus;
}

/**
 * Automatically triggered whenever a shipment status changes (Payment Confirmed, At Station, On Bus, Arrived, Delivered).
 * Sends a proactive WhatsApp notification to the client with an external link to the live map.
 */
export async function sendWhatsAppStatusNotification(shipment: Shipment): Promise<void> {
  const trackUrl = `https://useoura.com/track/${shipment.tracking_id}`;
  let text = "";

  switch (shipment.status) {
    case "paid":
      text =
        `✅ *oura Payment Verified — #${shipment.tracking_id}*\n` +
        `──────────────────\n` +
        `We have confirmed your MoMo payment of *GHS ${shipment.pricing?.total || 120}.00* for *${shipment.item_description}*.\n\n` +
        `🚗 *Next Step:* Our pickup rider is being dispatched to *${shipment.origin_address}* (${shipment.origin_city}).\n\n` +
        `🗺️ *Live Tracking Link:*\n${trackUrl}`;
      break;

    case "picked_up":
      text =
        `🚗 *oura Pickup Complete — #${shipment.tracking_id}*\n` +
        `──────────────────\n` +
        `Your parcel (*${shipment.item_description}*) has been picked up by *${shipment.courier?.name || "Ernest Angmler"}* and is heading to the *${shipment.origin_city} VIP Station*.\n\n` +
        `🗺️ *Follow Live Map:*\n${trackUrl}`;
      break;

    case "at_terminal":
      text =
        `🏢 *oura Terminal Check-In — #${shipment.tracking_id}*\n` +
        `──────────────────\n` +
        `Your parcel has arrived at the *${shipment.origin_city} VIP Express Terminal* and is being loaded onto the next coach to *${shipment.destination_city}*.\n\n` +
        `🗺️ *Follow Live Map:*\n${trackUrl}`;
      break;

    case "in_transit":
      text =
        `🚌 *oura Live Update — Parcel On VIP Bus!*\n` +
        `──────────────────\n` +
        `📦 Booking ID: *${shipment.tracking_id}* (${shipment.item_description})\n` +
        `🏷️ Hardware Tag: *${shipment.tracker_id || "oura-tag-01"}*\n` +
        `📍 Route: *${shipment.origin_city} ➔ ${shipment.destination_city}*\n\n` +
        `Your parcel is now onboard the VIP Express bus! You don't need to keep the app open—we will message you here on WhatsApp as soon as it arrives in *${shipment.destination_city}*.\n\n` +
        `🗺️ *Tap Anytime to View Live Highway Map:*\n${trackUrl}`;
      break;

    case "arrived":
      text =
        `🏁 *oura Arrival Alert — Parcel in ${shipment.destination_city}!*\n` +
        `──────────────────\n` +
        `Great news! Your parcel (*#${shipment.tracking_id} — ${shipment.item_description}*) has safely arrived at the *${shipment.destination_city} VIP Terminal*.\n\n` +
        `🚚 Our local rep is preparing final delivery to *${shipment.destination_address}*.\n\n` +
        `🗺️ *View Arrival Status:*\n${trackUrl}`;
      break;

    case "delivered":
      text =
        `🎉 *oura Delivered — #${shipment.tracking_id}*\n` +
        `──────────────────\n` +
        `Your parcel (*${shipment.item_description}*) has been delivered to *${shipment.recipient_name}* in *${shipment.destination_city}*!\n\n` +
        `Thank you for shipping with *oura*. Reply *HI* anytime to book your next delivery!`;
      break;

    default:
      return;
  }

  await dispatchWhatsAppMessage(
    shipment.sender_phone || "0241112233",
    text,
    "outbound_notification",
    shipment.tracking_id
  );
}
