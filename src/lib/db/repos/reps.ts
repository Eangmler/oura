import { TerminalRep } from "@/types";
import { getStore } from "../store";

export async function listReps(): Promise<TerminalRep[]> {
  const store = getStore();
  return store.reps;
}

export async function authenticateRep(phone: string, pin: string): Promise<TerminalRep | null> {
  const store = getStore();
  const cleanPhone = phone.replace(/\D/g, "");
  const found = store.reps.find(
    (r) => r.phone.replace(/\D/g, "").endsWith(cleanPhone.slice(-9)) && r.pin_hash === pin && r.active
  );
  return found || null;
}

export async function createRep(data: Omit<TerminalRep, "id" | "created_at">): Promise<TerminalRep> {
  const store = getStore();
  const newRep: TerminalRep = {
    ...data,
    id: `rep_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  store.reps.push(newRep);
  return newRep;
}

export async function toggleRepActive(repId: string, active: boolean): Promise<TerminalRep | null> {
  const store = getStore();
  const rep = store.reps.find((r) => r.id === repId);
  if (!rep) return null;
  rep.active = active;
  return rep;
}

export async function resetRepPin(repId: string, newPin: string): Promise<TerminalRep | null> {
  const store = getStore();
  const rep = store.reps.find((r) => r.id === repId);
  if (!rep) return null;
  rep.pin_hash = newPin;
  return rep;
}
