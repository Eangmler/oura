import { OuraSettings, PriceBreakdown } from "@/types";
import { getSettings } from "../db/repos/settings";

export interface QuoteRequest {
  origin_city: string;
  origin_address?: string;
  destination_city: string;
  destination_address?: string;
  item_description: string;
  user_selected_category?: "small" | "medium" | "large" | "oversized";
}

export interface QuoteResult {
  weight_category: "small" | "medium" | "large" | "oversized";
  estimated_kg: number;
  ai_reasoning: string;
  pricing: PriceBreakdown;
  currency: string;
}

/**
 * Intelligent perceived weight estimator.
 * Matches keywords and items to typical shipping dimensions in Ghana.
 */
export function estimateWeightFromDescription(description: string): {
  category: "small" | "medium" | "large" | "oversized";
  estimated_kg: number;
  reasoning: string;
} {
  const text = description.toLowerCase();

  // Small (< 1kg): documents, phone, jewelry, keys, watch, charger, clothes (single)
  if (
    text.includes("document") ||
    text.includes("passport") ||
    text.includes("phone") ||
    text.includes("iphone") ||
    text.includes("samsung") ||
    text.includes("keys") ||
    text.includes("watch") ||
    text.includes("ring") ||
    text.includes("certificate") ||
    text.includes("envelope") ||
    text.includes("perfume")
  ) {
    return {
      category: "small",
      estimated_kg: 0.8,
      reasoning: "Detected small item / electronics / documents (under 1 kg).",
    };
  }

  // Oversized (20kg+): engine, machine, fridge, generator, commercial sack, furniture
  if (
    text.includes("generator") ||
    text.includes("fridge") ||
    text.includes("refrigerator") ||
    text.includes("engine") ||
    text.includes("machine") ||
    text.includes("furniture") ||
    text.includes("mattress") ||
    text.includes("tire") ||
    text.includes("tyre") ||
    text.includes("barrel")
  ) {
    return {
      category: "oversized",
      estimated_kg: 25.0,
      reasoning: "Heavy equipment / bulk commodity (> 20 kg).",
    };
  }

  // Large (5-20kg): desktop pc, monitor, big carton, speakers, microwave, heavy luggage
  if (
    text.includes("desktop") ||
    text.includes("speaker") ||
    text.includes("subwoofer") ||
    text.includes("monitor") ||
    text.includes("microwave") ||
    text.includes("carton") ||
    text.includes("bale") ||
    text.includes("suitcase") ||
    text.includes("luggage") ||
    text.includes("bag of rice")
  ) {
    return {
      category: "large",
      estimated_kg: 12.0,
      reasoning: "Standard medium-heavy carton / audio or kitchen appliances (5 - 20 kg).",
    };
  }

  // Medium (1-5kg, default for laptops, macbook, shoe box, cosmetics bundle, clothes bag)
  return {
    category: "medium",
    estimated_kg: 3.5,
    reasoning: "Standard parcel / laptop / shoe box / parcel package (1 - 5 kg).",
  };
}

/**
 * Calculates end-to-end quote based on settings rate card.
 */
export async function calculateQuote(req: QuoteRequest, customSettings?: OuraSettings): Promise<QuoteResult> {
  const settings = customSettings || (await getSettings());

  // Determine weight category
  let category: "small" | "medium" | "large" | "oversized";
  let estimated_kg: number;
  let ai_reasoning: string;

  if (req.user_selected_category) {
    category = req.user_selected_category;
    estimated_kg = category === "small" ? 0.8 : category === "medium" ? 3.5 : category === "large" ? 12.0 : 25.0;
    ai_reasoning = "Customer confirmed size category.";
  } else {
    const aiEstimate = estimateWeightFromDescription(req.item_description);
    category = aiEstimate.category;
    estimated_kg = aiEstimate.estimated_kg;
    ai_reasoning = aiEstimate.reasoning;
  }

  // Transit fee from route rates
  const isAccraToKumasi = req.origin_city.toLowerCase().includes("acc");
  const rateTable = isAccraToKumasi ? settings.rates.accra_kumasi : settings.rates.kumasi_accra;
  const transit_fee = rateTable[category] || 70;

  // Pickup fee (Zone B average standard by default)
  const pickup_fee = settings.rates.pickup_zones.zone_b || 30;

  // Delivery fee (Zone A/B average standard)
  const delivery_fee = settings.rates.delivery_zones.zone_a || 20;

  const total = pickup_fee + transit_fee + delivery_fee;

  return {
    weight_category: category,
    estimated_kg,
    ai_reasoning,
    pricing: {
      pickup_fee,
      transit_fee,
      delivery_fee,
      total,
    },
    currency: "GHS",
  };
}
