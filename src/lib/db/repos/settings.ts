import fs from "fs";
import { OuraSettings } from "@/types";
import { getStore } from "../store";

const TMP_SETTINGS_PATH = "/tmp/oura_settings.json";

export async function getSettings(): Promise<OuraSettings> {
  const store = getStore();
  try {
    if (fs.existsSync(TMP_SETTINGS_PATH)) {
      const raw = fs.readFileSync(TMP_SETTINGS_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      store.settings = { ...store.settings, ...parsed };
    }
  } catch (e) {
    // Ignore file read errors in restricted environments
  }
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
  try {
    fs.writeFileSync(TMP_SETTINGS_PATH, JSON.stringify(store.settings), "utf-8");
  } catch (e) {
    // Ignore file write errors
  }
  return store.settings;
}
