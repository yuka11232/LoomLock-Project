import type { AppState } from "../types";
import { createSeedState, SEED_VERSION } from "./seed";

/**
 * The storage boundary.
 *
 * Everything above this file talks to `repository`, never to localStorage
 * directly. Swapping the demo for a real backend means writing a second object
 * with the same three methods and choosing between them here — no component or
 * reducer changes. See docs/ARCHITECTURE.md for the Supabase plan.
 */
export interface StateRepository {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}

export const STORAGE_KEY = "loomlock.demo.v1";

/** Thrown when the browser refuses a write because the quota is full. */
export class StorageFullError extends Error {
  constructor() {
    super("localStorage quota exceeded");
    this.name = "StorageFullError";
  }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    // Safari private mode reports a plain error with this message
    error.message.toLowerCase().includes("quota")
  );
}

/**
 * Demo persistence: this browser only. No account, no network, no cookies.
 *
 * Reads are defensive because a saved state can be from an older seed shape,
 * hand-edited, or truncated. Anything unreadable falls back to a fresh seed
 * rather than leaving the app in a broken state.
 */
export const localStorageRepository: StateRepository = {
  async load() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (!parsed || typeof parsed !== "object") return null;
      // A seed shape change invalidates old saves rather than half-migrating.
      if (parsed.version !== SEED_VERSION) return null;
      if (!parsed.business || !Array.isArray(parsed.members) || !parsed.settings) {
        return null;
      }
      return parsed as AppState;
    } catch {
      return null;
    }
  },

  async save(state) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      if (isQuotaError(error)) throw new StorageFullError();
      // Storage disabled entirely (private mode, blocked cookies): the app still
      // works for this session, changes just will not survive a refresh.
    }
  },

  async clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do — a failed clear leaves the previous state in place.
    }
  },
};

/**
 * The repository the app uses. When Supabase is added this becomes a choice
 * driven by NEXT_PUBLIC_LOOMLOCK_DATA_SOURCE, defaulting to the demo so a
 * missing environment variable can never break the prototype.
 */
export const repository: StateRepository = localStorageRepository;

/** A fresh copy of the demo business. */
export function freshState(): AppState {
  return createSeedState();
}
