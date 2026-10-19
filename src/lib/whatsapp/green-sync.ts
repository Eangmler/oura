import { getStore } from "@/lib/db/store";
import { getSettings } from "@/lib/db/repos/settings";
import { Shipment, ShipmentStatus, WhatsAppMessageLog } from "@/types";
import type { BotSession } from "./bot";

let lastSyncTimestamp = 0;
const SYNC_TTL_MS = 2500;

interface GreenIncomingMsg {
  type: "incoming";
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  chatId: string;
  textMessage?: string;
  extendedTextMessage?: { text?: string };
  senderId?: string;
  senderName?: string;
  senderContactName?: string;
}

interface GreenOutgoingMsg {
  type: "outgoing";
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  chatId: string;
  textMessage?: string;
  extendedTextMessage?: { text?: string };
  statusMessage?: string;
}

function getMsgText(m: { textMessage?: string; extendedTextMessage?: { text?: string } }): string {
  return (m.textMessage || m.extendedTextMessage?.text || "").trim();
}

function formatReadablePhone(chatId: string, fallbackTextPhone?: string): string {
  if (fallbackTextPhone) return fallbackTextPhone;
  if (chatId.endsWith("@c.us")) {
    const digits = chatId.replace("@c.us", "");
    if (digits.startsWith("233") && digits.length === 12) {
      return `0${digits.slice(3)}`;
    }
    return `+${digits}`;
  }
  return chatId;
}

function parseQuoteDetails(quoteText: string) {
  // Matches:
  // 📦 Item: *Laptop* (~3.5kg, MEDIUM)
  // 📍 Pickup: Dansoman (Accra)
  // 🏁 Delivery: Atonsu (Kumasi)
  // 👤 Recipient: Yaw 0244078555
  // 💰 *Total Price: GHS 130.00*
  // • Pickup: GHS 40
  // • VIP Bus Transit: GHS 70
  // • Final Delivery: GHS 20
  const itemMatch = quoteText.match(/📦\s*Item:\s*\*([^*]+)\*\s*(?:\(~?([\d.]+)kg,\s*([A-Z]+)\))?/i);
  const pickupMatch = quoteText.match(/📍\s*Pickup:\s*([^\n(]+)(?:\(([^)]+)\))?/i);
  const deliveryMatch = quoteText.match(/🏁\s*Delivery:\s*([^\n(]+)(?:\(([^)]+)\))?/i);
  const recipientMatch = quoteText.match(/👤\s*Recipient:\s*([^\n]+)/i);
  const totalMatch = quoteText.match(/Total Price:\s*GHS\s*([\d.]+)/i) || quoteText.match(/Amount:\*\s*GHS\s*([\d.]+)/i);
  const pickupFeeMatch = quoteText.match(/Pickup:\s*GHS\s*([\d.]+)/i);
  const transitFeeMatch = quoteText.match(/Transit:\s*GHS\s*([\d.]+)/i);
  const deliveryFeeMatch = quoteText.match(/Delivery:\s*GHS\s*([\d.]+)/i);

  const item_description = itemMatch?.[1]?.trim() || "Parcel Package";
  const weight_kg = itemMatch?.[2] ? parseFloat(itemMatch[2]) : 3.5;
  const rawCat = (itemMatch?.[3] || "medium").toLowerCase();
  const weight_category = (
    ["small", "medium", "large", "oversized"].includes(rawCat) ? rawCat : "medium"
  ) as "small" | "medium" | "large" | "oversized";

  const origin_address = pickupMatch?.[1]?.trim() || "Accra";
  const origin_city = pickupMatch?.[2]?.trim() || (origin_address.toLowerCase().includes("kumasi") ? "Kumasi" : "Accra");

  const destination_address = deliveryMatch?.[1]?.trim() || "Kumasi";
  const destination_city =
    deliveryMatch?.[2]?.trim() || (origin_city === "Accra" ? "Kumasi" : "Accra");

  const recipientRaw = recipientMatch?.[1]?.trim() || "Recipient";
  const phoneMatch = recipientRaw.match(/(\+?233\d{9}|0\d{9})/);
  const recipient_phone = phoneMatch ? phoneMatch[1] : recipientRaw;
  const recipient_name = recipientRaw.replace(recipient_phone, "").replace(/[-(),]/g, "").trim() || "Recipient";

  const total = totalMatch?.[1] ? parseFloat(totalMatch[1]) : 130;
  const pickup_fee = pickupFeeMatch?.[1] ? parseFloat(pickupFeeMatch[1]) : 40;
  const transit_fee = transitFeeMatch?.[1] ? parseFloat(transitFeeMatch[1]) : 70;
  const delivery_fee = deliveryFeeMatch?.[1] ? parseFloat(deliveryFeeMatch[1]) : 20;

  return {
    item_description,
    weight_kg,
    weight_category,
    origin_city,
    origin_address: `${origin_address} (${origin_city})`,
    destination_city,
    destination_address: `${destination_address} (${destination_city})`,
    recipient_name,
    recipient_phone,
    pricing: {
      pickup_fee,
      transit_fee,
      delivery_fee,
      total,
    },
  };
}

/**
 * Fetches live incoming & outgoing WhatsApp messages from Green-API and synchronizes:
 * 1) All confirmed WhatsApp bookings into `store.shipments` so `/admin` and `/rep` always display them
 * 2) Status updates & hardware tracker assignments sent via WhatsApp
 * 3) `store.whatsapp_messages` log for live inspection
 */
export async function syncShipmentsFromGreenApi(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastSyncTimestamp < SYNC_TTL_MS) {
    return;
  }
  lastSyncTimestamp = now;

  try {
    const settings = await getSettings();
    const instanceId = (
      process.env.GREEN_API_INSTANCE_ID ||
      settings.whatsapp_phone_number_id ||
      "710722772425"
    ).trim();
    const apiToken = (
      process.env.GREEN_API_TOKEN ||
      settings.whatsapp_token ||
      "887a97caa0744429982eb43ff901bde27b590081b8bc4c9aa9"
    ).trim();

    if (!instanceId || !apiToken) return;

    const apiHost =
      instanceId.length >= 4 && /^\d{4}/.test(instanceId)
        ? `https://${instanceId.slice(0, 4)}.api.greenapi.com`
        : `https://api.green-api.com`;

    const [inRes, outRes] = await Promise.all([
      fetch(`${apiHost}/waInstance${instanceId}/lastIncomingMessages/${apiToken}?minutes=10080`, {
        cache: "no-store",
      }),
      fetch(`${apiHost}/waInstance${instanceId}/lastOutgoingMessages/${apiToken}?minutes=10080`, {
        cache: "no-store",
      }),
    ]);

    if (!inRes.ok || !outRes.ok) return;

    const incoming: GreenIncomingMsg[] = await inRes.json();
    const outgoing: GreenOutgoingMsg[] = await outRes.json();

    if (!Array.isArray(incoming) || !Array.isArray(outgoing)) return;

    const store = getStore();

    // Map chatId -> senderName and any phone number mentioned by sender
    const senderNames = new Map<string, string>();
    const senderPhones = new Map<string, string>();

    // Sort chronologically (oldest first)
    const sortedIn = [...incoming].sort((a, b) => a.timestamp - b.timestamp);
    const sortedOut = [...outgoing].sort((a, b) => a.timestamp - b.timestamp);

    for (const msg of sortedIn) {
      if (msg.chatId && (msg.senderName || msg.senderContactName)) {
        senderNames.set(msg.chatId, (msg.senderName || msg.senderContactName || "").trim());
      }
      const txt = getMsgText(msg);
      const phoneInTxt = txt.match(/\b(0\d{9}|\+?233\d{9})\b/);
      if (msg.chatId && phoneInTxt && !senderPhones.has(msg.chatId)) {
        senderPhones.set(msg.chatId, phoneInTxt[1]);
      }
    }

    // Group all messages by chatId in chronological order
    type CombinedMsg =
      | ({ dir: "in"; text: string } & GreenIncomingMsg)
      | ({ dir: "out"; text: string } & GreenOutgoingMsg);

    const byChat = new Map<string, CombinedMsg[]>();
    for (const m of sortedIn) {
      const text = getMsgText(m);
      if (!text || !m.chatId) continue;
      if (!byChat.has(m.chatId)) byChat.set(m.chatId, []);
      byChat.get(m.chatId)!.push({ ...m, dir: "in", text });
    }
    for (const m of sortedOut) {
      const text = getMsgText(m);
      if (!text || !m.chatId) continue;
      if (!byChat.has(m.chatId)) byChat.set(m.chatId, []);
      byChat.get(m.chatId)!.push({ ...m, dir: "out", text });
    }

    for (const [chatId, msgs] of byChat.entries()) {
      msgs.sort((a, b) => a.timestamp - b.timestamp);

      let lastQuoteMsg: CombinedMsg | null = null;
      let lastQuoteConfirmed = false;

      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];

        if (m.dir === "out" && m.text.includes("oura Instant WhatsApp Quote")) {
          lastQuoteMsg = m;
          lastQuoteConfirmed = false;
        }

        // Case 1: Explicit "Booking Confirmed! ID: H..." outgoing message
        if (m.dir === "out" && m.text.includes("Booking Confirmed! ID:")) {
          const idMatch = m.text.match(/Booking Confirmed!\s*ID:\s*\*?([HK]\d{7,10})\*?/i);
          if (idMatch) {
            const tracking_id = idMatch[1].toUpperCase();
            lastQuoteConfirmed = true;

            const detailsSource =
              m.text.includes("📦 Item:") ? m.text : lastQuoteMsg ? lastQuoteMsg.text : m.text;
            const parsed = parseQuoteDetails(detailsSource);

            const existingIdx = store.shipments.findIndex(
              (s) => s.tracking_id.toUpperCase() === tracking_id
            );

            // Check if customer replied PAID after this confirmation
            const paidAfter = msgs
              .slice(i + 1)
              .some((later) => later.dir === "in" && /\bpaid\b/i.test(later.text));

            const senderName = senderNames.get(chatId) || "WhatsApp Client";
            const readablePhone = formatReadablePhone(chatId, senderPhones.get(chatId));

            const syncedShipment: Shipment = {
              id: `ship_${tracking_id.toLowerCase()}`,
              tracking_id,
              status: existingIdx >= 0 ? store.shipments[existingIdx].status : "pending_payment",
              origin_city: parsed.origin_city,
              origin_address: parsed.origin_address,
              destination_city: parsed.destination_city,
              destination_address: parsed.destination_address,
              sender_name: senderName,
              sender_phone: chatId.includes("@lid") ? `${readablePhone} (${chatId})` : readablePhone,
              recipient_name: parsed.recipient_name,
              recipient_phone: parsed.recipient_phone,
              item_description: parsed.item_description,
              quantity: 1,
              weight_category: parsed.weight_category,
              weight_kg: parsed.weight_kg,
              pricing: parsed.pricing,
              currency: "GHS",
              payment_confirmed:
                existingIdx >= 0 ? store.shipments[existingIdx].payment_confirmed : paidAfter,
              momo_reference: tracking_id,
              created_at: new Date(m.timestamp * 1000).toISOString(),
              estimated_delivery: new Date((m.timestamp + 86400) * 1000).toISOString(),
              tracker_id: existingIdx >= 0 ? store.shipments[existingIdx].tracker_id : undefined,
              google_maps_share_url:
                existingIdx >= 0 ? store.shipments[existingIdx].google_maps_share_url : undefined,
            };

            if (existingIdx === -1) {
              store.shipments.unshift(syncedShipment);
            }
          }
        }

        // Case 2: User replied "YES" after a Quote, even if a serverless cold-start missed generating the confirmation
        if (
          m.dir === "in" &&
          lastQuoteMsg &&
          !lastQuoteConfirmed &&
          /^(yes|y|confirm|proceed|ok|1)$/i.test(m.text.trim())
        ) {
          // Check if the next outgoing message already had "Booking Confirmed! ID:"
          const nextOut = msgs.slice(i + 1).find((x) => x.dir === "out");
          if (!nextOut || !nextOut.text.includes("Booking Confirmed! ID:")) {
            const deterministicId = `H${String(lastQuoteMsg.timestamp).slice(-8)}`;
            lastQuoteConfirmed = true;

            const parsed = parseQuoteDetails(lastQuoteMsg.text);
            const senderName = senderNames.get(chatId) || "WhatsApp Client";
            const readablePhone = formatReadablePhone(chatId, senderPhones.get(chatId));

            const existingIdx = store.shipments.findIndex(
              (s) => s.tracking_id.toUpperCase() === deterministicId
            );

            if (existingIdx === -1) {
              store.shipments.unshift({
                id: `ship_${deterministicId.toLowerCase()}`,
                tracking_id: deterministicId,
                status: "pending_payment",
                origin_city: parsed.origin_city,
                origin_address: parsed.origin_address,
                destination_city: parsed.destination_city,
                destination_address: parsed.destination_address,
                sender_name: senderName,
                sender_phone: chatId.includes("@lid") ? `${readablePhone} (${chatId})` : readablePhone,
                recipient_name: parsed.recipient_name,
                recipient_phone: parsed.recipient_phone,
                item_description: parsed.item_description,
                quantity: 1,
                weight_category: parsed.weight_category,
                weight_kg: parsed.weight_kg,
                pricing: parsed.pricing,
                currency: "GHS",
                payment_confirmed: false,
                momo_reference: deterministicId,
                created_at: new Date(m.timestamp * 1000).toISOString(),
                estimated_delivery: new Date((m.timestamp + 86400) * 1000).toISOString(),
              });
            }
          }
        }
      }
    }

    // Apply any status updates recorded in outgoing WhatsApp notification messages
    for (const outMsg of sortedOut) {
      const text = getMsgText(outMsg);
      const bookIdMatch = text.match(/📦\s*Booking ID:\s*\*([HK]\d{7,10})\*/i);
      if (!bookIdMatch) continue;

      const trackingId = bookIdMatch[1].toUpperCase();
      const idx = store.shipments.findIndex((s) => s.tracking_id.toUpperCase() === trackingId);
      if (idx === -1) continue;

      const tagMatch = text.match(/🏷️\s*Hardware Tag:\s*\*([^*]+)\*/i);
      if (tagMatch) {
        store.shipments[idx].tracker_id = tagMatch[1].trim();
      }

      if (text.includes("Payment Verified") || text.includes("Payment Received")) {
        store.shipments[idx].payment_confirmed = true;
        if (store.shipments[idx].status === "pending_payment") {
          store.shipments[idx].status = "paid";
        }
      } else if (text.includes("Pickup Complete") || text.includes("Parcel Picked Up")) {
        store.shipments[idx].status = "picked_up";
        store.shipments[idx].payment_confirmed = true;
      } else if (text.includes("Terminal Check-In") || text.includes("Parcel At VIP Terminal")) {
        store.shipments[idx].status = "at_terminal";
        store.shipments[idx].payment_confirmed = true;
      } else if (text.includes("Parcel On VIP Bus")) {
        store.shipments[idx].status = "in_transit";
        store.shipments[idx].payment_confirmed = true;
      } else if (text.includes("Arrival Alert") || text.includes("Parcel Arrived in")) {
        store.shipments[idx].status = "arrived";
        store.shipments[idx].payment_confirmed = true;
      } else if (text.includes("oura Delivered") || text.includes("Parcel Delivered")) {
        store.shipments[idx].status = "delivered";
        store.shipments[idx].payment_confirmed = true;
      }
    }

    // Sort shipments newest first (keeping any newly created ones at the top)
    store.shipments.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err) {
    console.error("[Green-API Sync Error]:", err);
  }
}

/**
 * Restores a user's conversational BotSession from Green-API's message history
 * if a Vercel serverless cold-start reset in-memory sessions mid-conversation.
 */
export async function restoreSessionFromGreenApi(
  phone: string,
  session: BotSession
): Promise<void> {
  if (session.state !== "IDLE") return;

  try {
    const settings = await getSettings();
    const instanceId = (
      process.env.GREEN_API_INSTANCE_ID ||
      settings.whatsapp_phone_number_id ||
      "710722772425"
    ).trim();
    const apiToken = (
      process.env.GREEN_API_TOKEN ||
      settings.whatsapp_token ||
      "887a97caa0744429982eb43ff901bde27b590081b8bc4c9aa9"
    ).trim();

    if (!instanceId || !apiToken) return;

    const apiHost =
      instanceId.length >= 4 && /^\d{4}/.test(instanceId)
        ? `https://${instanceId.slice(0, 4)}.api.greenapi.com`
        : `https://api.green-api.com`;

    const outRes = await fetch(
      `${apiHost}/waInstance${instanceId}/lastOutgoingMessages/${apiToken}?minutes=1440`,
      { cache: "no-store" }
    );
    if (!outRes.ok) return;

    const outgoing: GreenOutgoingMsg[] = await outRes.json();
    if (!Array.isArray(outgoing)) return;

    // Normalize phone to match Green-API chatId
    const chatMsgs = outgoing
      .filter((m) => m.chatId === phone || m.chatId.startsWith(phone.replace(/\D/g, "")))
      .sort((a, b) => b.timestamp - a.timestamp); // newest first

    if (chatMsgs.length === 0) return;

    const latestBotText = getMsgText(chatMsgs[0]);

    // Determine route from recent bot messages in this chat
    for (const m of chatMsgs) {
      const t = getMsgText(m);
      if (t.includes("Route: *Kumasi ➔ Accra*")) {
        session.draft.origin_city = "Kumasi";
        session.draft.destination_city = "Accra";
        break;
      } else if (t.includes("Route: *Accra ➔ Kumasi*")) {
        session.draft.origin_city = "Accra";
        session.draft.destination_city = "Kumasi";
        break;
      }
    }

    // Extract prior step answers from recent bot confirmations in this chat
    for (const m of chatMsgs) {
      const t = getMsgText(m);
      const pMatch = t.match(/✅\s*Pickup:\s*\*([^*]+)\*/);
      if (pMatch && !session.draft.origin_address) {
        session.draft.origin_address = pMatch[1].trim();
      }
      const dMatch = t.match(/✅\s*Destination:\s*\*([^*]+)\*/);
      if (dMatch && !session.draft.destination_address) {
        session.draft.destination_address = dMatch[1].trim();
      }
      const rMatch = t.match(/✅\s*Recipient:\s*\*([^*]+)\*/);
      if (rMatch && !session.draft.recipient_phone) {
        session.draft.recipient_phone = rMatch[1].trim();
      }
    }

    if (latestBotText.includes("Step 1 of 4:")) {
      session.state = "AWAITING_ORIGIN_ADDRESS";
    } else if (latestBotText.includes("Step 2 of 4:")) {
      session.state = "AWAITING_DEST_ADDRESS";
    } else if (latestBotText.includes("Step 3 of 4:")) {
      session.state = "AWAITING_RECIPIENT_PHONE";
    } else if (latestBotText.includes("Step 4 of 4:")) {
      session.state = "AWAITING_ITEM_DESC";
    } else if (latestBotText.includes("oura Instant WhatsApp Quote")) {
      const parsed = parseQuoteDetails(latestBotText);
      session.state = "AWAITING_CONFIRMATION";
      session.draft.origin_city = parsed.origin_city;
      session.draft.origin_address = parsed.origin_address.replace(/\s*\([^)]+\)$/, "");
      session.draft.destination_city = parsed.destination_city;
      session.draft.destination_address = parsed.destination_address.replace(/\s*\([^)]+\)$/, "");
      session.draft.recipient_phone = `${parsed.recipient_name} ${parsed.recipient_phone}`.trim();
      session.draft.item_description = parsed.item_description;
      session.draft.weight_kg = parsed.weight_kg;
      session.draft.weight_category = parsed.weight_category;
      session.draft.quote_total = parsed.pricing.total;
    } else if (latestBotText.includes("Booking Confirmed! ID:")) {
      const idMatch = latestBotText.match(/Booking Confirmed!\s*ID:\s*\*?([HK]\d{7,10})\*?/i);
      if (idMatch) {
        session.state = "AWAITING_PAYMENT";
        session.draft.tracking_id = idMatch[1].toUpperCase();
      }
    }
  } catch (e) {
    console.error("[Restore Session Error]:", e);
  }
}
