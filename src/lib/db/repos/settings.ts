import { OuraSettings } from "@/types";
import { getStore } from "../store";

export async function getSettings(): Promise<OuraSettings> {
  const store = getStore();
  return store.settings;
}

export async function updateSettings(partial: Partial<OuraSettings>): Promise<OuraSettings> {
  const store = getStore();
  store.settings = {
    ...store.settings,
    ...partial,
    rates: {
      ...store.settings.rates,
      ...(partial.rates || {}),
    },
  };
  return store.settings;
}
