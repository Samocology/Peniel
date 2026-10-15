import { useSyncExternalStore } from "react";

export type Plan = "starter" | "growth" | "business";

type State = {
  plan: Plan;
  /** chosen template per vendor slug */
  choices: Record<string, string>;
  /** how many times each vendor has picked a storefront */
  picks: Record<string, number>;
};

const KEY = "vendra-storefront-v1";
const initial: State = { plan: "starter", choices: {}, picks: {} };

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function set(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Free (Starter) vendors may pick a storefront once; paid plans can switch any time. */
export function canPickStorefront(plan: Plan, picksSoFar: number) {
  return plan !== "starter" || picksSoFar < 1;
}

export const storefrontStore = {
  get: () => {
    load();
    return state;
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  choose(slug: string, templateId: string): boolean {
    load();
    const picks = state.picks[slug] ?? 0;
    if (state.choices[slug] === templateId) return true;
    if (!canPickStorefront(state.plan, picks)) return false;
    set({ ...state, choices: { ...state.choices, [slug]: templateId }, picks: { ...state.picks, [slug]: picks + 1 } });
    return true;
  },
  setPlan(plan: Plan) {
    load();
    set({ ...state, plan });
  },
};

export function useStorefront() {
  return useSyncExternalStore(storefrontStore.subscribe, storefrontStore.get, () => initial);
}
