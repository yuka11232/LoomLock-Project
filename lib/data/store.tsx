"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { AppState, Locale, Member } from "../types";
import { reducer, type Action } from "./reducer";
import { freshState, repository, StorageFullError } from "./storage";
import { activeMember } from "./selectors";

/**
 * The workspace store.
 *
 * Hydration order matters: the server and the first client render must agree,
 * so we render from the seed and swap in the saved state inside an effect.
 * `hydrated` lets screens show a loading state instead of flashing seed data
 * over the visitor's real changes.
 */

interface StoreValue {
  state: AppState;
  dispatch: (action: Action) => void;
  hydrated: boolean;
  /** The member whose role the visitor is currently using. */
  me: Member;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Set when a write failed because the browser's storage is full. */
  storageError: boolean;
  dismissStorageError: () => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, freshState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  // Skip the very first save: hydrating is not a change worth persisting.
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    repository
      .load()
      .then((saved) => {
        if (cancelled) return;
        if (saved) rawDispatch({ type: "hydrate", state: saved });
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !dirty.current) return;
    repository.save(state).catch((error) => {
      if (error instanceof StorageFullError) setStorageError(true);
    });
  }, [state, hydrated]);

  const dispatch = useCallback((action: Action) => {
    dirty.current = true;
    rawDispatch(action);
  }, []);

  const setLocale = useCallback(
    (locale: Locale) => {
      dispatch({ type: "setLocale", locale });
      if (typeof document !== "undefined") document.documentElement.lang = locale;
    },
    [dispatch],
  );

  const resetDemo = useCallback(() => {
    dirty.current = true;
    repository.clear().finally(() => {
      rawDispatch({ type: "reset" });
      setStorageError(false);
    });
  }, []);

  // Keep <html lang> honest for screen readers when the language changes.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = state.settings.locale;
    }
  }, [state.settings.locale]);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      dispatch,
      hydrated,
      me: activeMember(state),
      locale: state.settings.locale,
      setLocale,
      storageError,
      dismissStorageError: () => setStorageError(false),
      resetDemo,
    }),
    [state, dispatch, hydrated, setLocale, storageError, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
  return ctx;
}

/** Convenience: the active member's role. */
export function useRole() {
  return useStore().me.role;
}
