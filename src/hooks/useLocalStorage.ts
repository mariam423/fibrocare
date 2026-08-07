"use client";

import { useCallback, useSyncExternalStore } from "react";

type Store<T> = {
  value: T;
  listeners: Set<() => void>;
};

const stores = new Map<string, Store<unknown>>();

function getStore<T>(key: string, initialValue: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = { value: initialValue, listeners: new Set() };
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) store.value = JSON.parse(raw) as T;
      } catch {
        // Ignore malformed stored values
      }
    }
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

function subscribe(key: string, listener: () => void) {
  const store = stores.get(key);
  if (!store) return () => undefined;
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const store = getStore(key, initialValue);

  const value = useSyncExternalStore(
    useCallback((listener: () => void) => subscribe(key, listener), [key]),
    () => store.value,
    () => initialValue
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const nextStore = stores.get(key);
      if (!nextStore) return;
      const prev = nextStore.value as T;
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      nextStore.value = resolved;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage unavailable (e.g. private mode); keep in-memory state
      }
      nextStore.listeners.forEach((listener) => listener());
    },
    [key]
  );

  return [value, setValue] as const;
}
